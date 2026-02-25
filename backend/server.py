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

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

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
    meals: Optional[List[Dict]] = None
    language: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None

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

# Email/Password Auth Endpoints
@api_router.post("/auth/register", response_model=SessionResponse)
async def register(request: RegisterRequest, response: Response):
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": request.email}, {"_id": 0})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = pwd_context.hash(request.password)
        
        # Create user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": request.email,
            "name": request.name,
            "password": hashed_password,
            "picture": None,
            "subscription_tier": "none",
            "subscription_status": "inactive",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        
        # Create session
        session_token = f"session_{uuid.uuid4().hex}"
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.user_sessions.insert_one(session_doc)
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7*24*60*60
        )
        
        # Return user (without password)
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
        if isinstance(user["created_at"], str):
            user["created_at"] = datetime.fromisoformat(user["created_at"])
        
        return SessionResponse(user=User(**user), session_token=session_token)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Registration error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/auth/login", response_model=SessionResponse)
async def login(request: LoginRequest, response: Response):
    try:
        # Find user
        user_doc = await db.users.find_one({"email": request.email}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Check if user has password (OAuth users don't have password)
        if "password" not in user_doc:
            raise HTTPException(status_code=401, detail="Please login with Google")
        
        # Verify password
        if not pwd_context.verify(request.password, user_doc["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user_id = user_doc["user_id"]
        
        # Create session
        session_token = f"session_{uuid.uuid4().hex}"
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.user_sessions.insert_one(session_doc)
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7*24*60*60
        )
        
        # Return user (without password)
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
        if isinstance(user["created_at"], str):
            user["created_at"] = datetime.fromisoformat(user["created_at"])
        
        return SessionResponse(user=User(**user), session_token=session_token)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Login error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Payment Endpoints
import stripe

# Configuration des prix Stripe (à créer dans le dashboard Stripe ou dynamiquement)
PACKAGES = {
    "standard_monthly": {"amount": 699, "tier": "standard", "billing": "monthly", "interval": "month"},
    "standard_annual": {"amount": 6999, "tier": "standard", "billing": "annual", "interval": "year"},
    "vip_monthly": {"amount": 999, "tier": "vip", "billing": "monthly", "interval": "month"},
    "vip_annual": {"amount": 9999, "tier": "vip", "billing": "annual", "interval": "year"},
    "supplements_monthly": {"amount": 499, "tier": "supplements", "billing": "monthly", "interval": "month"}
}

# Durée de l'essai gratuit en jours
FREE_TRIAL_DAYS = 7

@api_router.post("/payments/checkout")
async def create_checkout(checkout_req: CheckoutRequest, current_user: User = Depends(get_current_user)):
    # Handle supplements as a special case
    if checkout_req.tier == "supplements":
        package_key = "supplements_monthly"
    else:
        package_key = f"{checkout_req.tier}_{checkout_req.billing_cycle}"
    
    if package_key not in PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package")
    
    package = PACKAGES[package_key]
    
    success_url = f"{checkout_req.origin_url}/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_req.origin_url}/pricing"
    
    try:
        # Configure Stripe
        stripe.api_key = stripe_api_key
        
        # Create a Stripe Checkout Session with subscription mode and free trial
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='subscription',
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': f"FitMaxPro - {checkout_req.tier.upper()} ({checkout_req.billing_cycle})",
                        'description': f"Abonnement {checkout_req.tier} avec 7 jours d'essai gratuit"
                    },
                    'unit_amount': package["amount"],  # Amount in cents
                    'recurring': {
                        'interval': package["interval"]
                    }
                },
                'quantity': 1,
            }],
            subscription_data={
                'trial_period_days': FREE_TRIAL_DAYS,
                'metadata': {
                    'user_id': current_user.user_id,
                    'tier': package["tier"],
                    'billing_cycle': package["billing"]
                }
            },
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'user_id': current_user.user_id,
                'tier': package["tier"],
                'billing_cycle': package["billing"]
            },
            customer_email=current_user.email
        )
        
        payment_doc = {
            "session_id": session.id,
            "user_id": current_user.user_id,
            "amount": package["amount"] / 100,  # Convert to euros
            "currency": "eur",
            "tier": package["tier"],
            "billing_cycle": package["billing"],
            "payment_status": "pending",
            "has_trial": True,
            "trial_days": FREE_TRIAL_DAYS,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.payment_transactions.insert_one(payment_doc)
        
        return {"url": session.url, "session_id": session.id}
    except Exception as e:
        logging.error(f"Checkout error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, current_user: User = Depends(get_current_user)):
    try:
        stripe.api_key = stripe_api_key
        
        # Retrieve the checkout session from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        payment_doc = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if not payment_doc:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        # Check if session is complete (subscription started with trial)
        if session.status == "complete" and payment_doc["payment_status"] != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "subscription_id": session.subscription}}
            )
            
            tier = payment_doc["tier"]
            billing_cycle = payment_doc["billing_cycle"]
            
            # Calculate trial end date
            trial_end = datetime.now(timezone.utc) + timedelta(days=FREE_TRIAL_DAYS)
            
            await db.users.update_one(
                {"user_id": current_user.user_id},
                {"$set": {
                    "subscription_tier": tier,
                    "subscription_status": "trialing",
                    "trial_ends_at": trial_end.isoformat()
                }}
            )
            
            subscription_doc = {
                "user_id": current_user.user_id,
                "tier": tier,
                "billing_cycle": billing_cycle,
                "status": "trialing",
                "trial_ends_at": trial_end.isoformat(),
                "started_at": datetime.now(timezone.utc).isoformat(),
                "stripe_subscription_id": session.subscription,
                "auto_renew": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.user_subscriptions.insert_one(subscription_doc)
        
        return {
            "status": session.status,
            "payment_status": session.payment_status or "trialing",
            "amount_total": session.amount_total,
            "currency": session.currency,
            "trial_days": FREE_TRIAL_DAYS
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
    # First try to find with exact language match
    workout = await db.workouts.find_one({"workout_id": workout_id, "language": language}, {"_id": 0})
    if not workout:
        # If not found, try to find by ID only (fallback to any language version)
        workout = await db.workouts.find_one({"workout_id": workout_id}, {"_id": 0})
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