from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from passlib.context import CryptContext
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

stripe_api_key = os.environ.get('STRIPE_API_KEY')

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    subscription_tier: str = "none"
    subscription_status: str = "inactive"
    created_at: datetime

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime

class SessionRequest(BaseModel):
    session_id: str

class SessionResponse(BaseModel):
    user: User
    session_token: str

class Workout(BaseModel):
    model_config = ConfigDict(extra="ignore")
    workout_id: str
    title: str
    description: str
    level: str
    program_type: str
    exercises: List[Dict]
    duration: int
    language: str
    image_url: Optional[str] = None

class Supplement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    supplement_id: str
    title: str
    description: str
    program_type: str
    nutrients: List[Dict]
    language: str

class CheckoutRequest(BaseModel):
    tier: str
    billing_cycle: str
    origin_url: str

# Auth Helper
async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> User:
    session_token = request.cookies.get("session_token")
    
    if not session_token and authorization:
        if authorization.startswith("Bearer "):
            session_token = authorization.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        await db.user_sessions.delete_one({"session_token": session_token})
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc["created_at"], str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    return User(**user_doc)

# Auth Endpoints
@api_router.post("/auth/session", response_model=SessionResponse)
async def create_session(request: SessionRequest, response: Response):
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": request.session_id}
            )
            resp.raise_for_status()
            data = resp.json()
        
        existing_user = await db.users.find_one({"email": data["email"]}, {"_id": 0})
        
        if existing_user:
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": data["name"],
                    "picture": data.get("picture")
                }}
            )
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            user_doc = {
                "user_id": user_id,
                "email": data["email"],
                "name": data["name"],
                "picture": data.get("picture"),
                "subscription_tier": "none",
                "subscription_status": "inactive",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
        
        session_token = data["session_token"]
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.user_sessions.insert_one(session_doc)
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7*24*60*60
        )
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if isinstance(user["created_at"], str):
            user["created_at"] = datetime.fromisoformat(user["created_at"])
        
        return SessionResponse(user=User(**user), session_token=session_token)
    except Exception as e:
        logging.error(f"Session creation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/logout")
async def logout(response: Response, current_user: User = Depends(get_current_user)):
    session_token = None
    await db.user_sessions.delete_many({"user_id": current_user.user_id})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# Payment Endpoints
PACKAGES = {
    "standard_monthly": {"amount": 6.99, "tier": "standard", "billing": "monthly"},
    "standard_annual": {"amount": 69.99, "tier": "standard", "billing": "annual"},
    "vip_monthly": {"amount": 9.99, "tier": "vip", "billing": "monthly"},
    "vip_annual": {"amount": 99.99, "tier": "vip", "billing": "annual"},
    "supplements": {"amount": 4.99, "tier": "supplements", "billing": "monthly"}
}

@api_router.post("/payments/checkout")
async def create_checkout(checkout_req: CheckoutRequest, current_user: User = Depends(get_current_user)):
    package_key = f"{checkout_req.tier}_{checkout_req.billing_cycle}"
    
    if package_key not in PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package")
    
    package = PACKAGES[package_key]
    amount = package["amount"]
    
    success_url = f"{checkout_req.origin_url}/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_req.origin_url}/pricing"
    
    try:
        host_url = checkout_req.origin_url
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        checkout_request = CheckoutSessionRequest(
            amount=amount,
            currency="eur",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": current_user.user_id,
                "tier": package["tier"],
                "billing_cycle": package["billing"]
            }
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        payment_doc = {
            "session_id": session.session_id,
            "user_id": current_user.user_id,
            "amount": amount,
            "currency": "eur",
            "tier": package["tier"],
            "billing_cycle": package["billing"],
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.payment_transactions.insert_one(payment_doc)
        
        return {"url": session.url, "session_id": session.session_id}
    except Exception as e:
        logging.error(f"Checkout error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, current_user: User = Depends(get_current_user)):
    try:
        host_url = os.environ.get('APP_URL', 'http://localhost:3000')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        payment_doc = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if not payment_doc:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        if status.payment_status == "paid" and payment_doc["payment_status"] != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid"}}
            )
            
            tier = payment_doc["tier"]
            billing_cycle = payment_doc["billing_cycle"]
            
            await db.users.update_one(
                {"user_id": current_user.user_id},
                {"$set": {
                    "subscription_tier": tier,
                    "subscription_status": "active"
                }}
            )
            
            subscription_doc = {
                "user_id": current_user.user_id,
                "tier": tier,
                "billing_cycle": billing_cycle,
                "status": "active",
                "started_at": datetime.now(timezone.utc).isoformat(),
                "auto_renew": billing_cycle == "monthly",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.user_subscriptions.insert_one(subscription_doc)
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency
        }
    except Exception as e:
        logging.error(f"Payment status error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        host_url = os.environ.get('APP_URL', 'http://localhost:3000')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Workouts Endpoints
@api_router.get("/workouts", response_model=List[Workout])
async def get_workouts(level: Optional[str] = None, program_type: Optional[str] = None, language: str = "fr"):
    query = {"language": language}
    if level:
        query["level"] = level
    if program_type:
        query["program_type"] = program_type
    
    workouts = await db.workouts.find(query, {"_id": 0}).to_list(100)
    return [Workout(**w) for w in workouts]

@api_router.get("/workouts/{workout_id}", response_model=Workout)
async def get_workout(workout_id: str, language: str = "fr"):
    workout = await db.workouts.find_one({"workout_id": workout_id, "language": language}, {"_id": 0})
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return Workout(**workout)

# Supplements Endpoints
@api_router.get("/supplements", response_model=List[Supplement])
async def get_supplements(program_type: Optional[str] = None, language: str = "fr"):
    query = {"language": language}
    if program_type:
        query["program_type"] = program_type
    
    supplements = await db.supplements.find(query, {"_id": 0}).to_list(100)
    return [Supplement(**s) for s in supplements]

# User Subscription Endpoints
@api_router.get("/user/subscription")
async def get_user_subscription(current_user: User = Depends(get_current_user)):
    subscription = await db.user_subscriptions.find_one({"user_id": current_user.user_id, "status": "active"}, {"_id": 0})
    return subscription or {"tier": "none", "status": "inactive"}

@api_router.post("/user/subscription/cancel")
async def cancel_subscription(current_user: User = Depends(get_current_user)):
    result = await db.user_subscriptions.update_many(
        {"user_id": current_user.user_id, "status": "active", "billing_cycle": "monthly"},
        {"$set": {"status": "cancelled", "auto_renew": False}}
    )
    
    if result.modified_count > 0:
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": {"subscription_status": "cancelled"}}
        )
        return {"message": "Subscription cancelled successfully"}
    else:
        raise HTTPException(status_code=400, detail="No active monthly subscription found")

# Health check endpoint (required for deployment)
@app.get("/health")
async def health_check():
    try:
        # Test MongoDB connection
        await db.command('ping')
        return {
            "status": "healthy",
            "service": "fitmaxpro-backend",
            "database": "connected"
        }
    except Exception as e:
        logging.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "fitmaxpro-backend",
            "error": str(e)
        }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()