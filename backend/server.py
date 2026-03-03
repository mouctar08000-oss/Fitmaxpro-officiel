from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from passlib.context import CryptContext
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import resend

# Web Push Notifications
try:
    from pywebpush import webpush, WebPushException
    WEBPUSH_AVAILABLE = True
except ImportError:
    WEBPUSH_AVAILABLE = False
    print("Warning: pywebpush not available")

# VAPID Keys for Push Notifications (replace with your own in production)
VAPID_PRIVATE_KEY = "Bmw7bEZI0X6QZkQQJ1Y9TWFU7h_sA_Tz5t8mKlkMfms"
VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"
VAPID_CLAIMS = {"sub": "mailto:admin@fitmaxpro.com"}

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend Email setup
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
APP_URL = os.environ.get('APP_URL', 'https://fitmax-gains.preview.emergentagent.com')

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
    role: Optional[str] = None
    subscription: Optional[dict] = None
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

# Model for recipe
class Recipe(BaseModel):
    ingredients: List[str] = []
    steps: List[str] = []
    prep_time: Optional[str] = None
    cook_time: Optional[str] = None
    servings: Optional[int] = None

class MealRecipeUpdate(BaseModel):
    recipe: Recipe

class CheckoutRequest(BaseModel):
    tier: str
    billing_cycle: str
    origin_url: str

# Model for tracking workout sessions
class WorkoutSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_id: str
    user_id: str
    workout_id: str
    workout_title: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: int = 0
    completed: bool = False

# Model for admin subscription management
class SubscriptionUpdate(BaseModel):
    user_id: str
    subscription_tier: str
    subscription_status: str

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
        stripe.api_key = stripe_api_key
        webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
        
        # Verify webhook signature if secret is configured
        if webhook_secret:
            event = stripe.Webhook.construct_event(body, signature, webhook_secret)
        else:
            event = stripe.Event.construct_from(
                json.loads(body.decode('utf-8')), stripe.api_key
            )
        
        # Handle different event types
        if event['type'] == 'customer.subscription.trial_will_end':
            # Trial ending soon - could send notification email
            subscription = event['data']['object']
            logging.info(f"Trial ending soon for subscription: {subscription['id']}")
            
        elif event['type'] == 'customer.subscription.updated':
            subscription = event['data']['object']
            user_id = subscription.get('metadata', {}).get('user_id')
            
            if user_id:
                new_status = "active" if subscription['status'] == 'active' else subscription['status']
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"subscription_status": new_status}}
                )
                
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            user_id = subscription.get('metadata', {}).get('user_id')
            
            if user_id:
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {
                        "subscription_tier": "free",
                        "subscription_status": "cancelled"
                    }}
                )
        
        elif event['type'] == 'invoice.payment_succeeded':
            # Payment successful after trial
            invoice = event['data']['object']
            subscription_id = invoice.get('subscription')
            
            if subscription_id:
                await db.user_subscriptions.update_one(
                    {"stripe_subscription_id": subscription_id},
                    {"$set": {"status": "active"}}
                )
        
        elif event['type'] == 'invoice.payment_failed':
            # Payment failed
            invoice = event['data']['object']
            subscription_id = invoice.get('subscription')
            
            if subscription_id:
                await db.user_subscriptions.update_one(
                    {"stripe_subscription_id": subscription_id},
                    {"$set": {"status": "past_due"}}
                )
        
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

# Router will be included after all endpoints are defined

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# ADMIN ENDPOINTS - Gestion des médias
# ==========================================

class ExerciseUpdate(BaseModel):
    name: str
    sets: int
    reps: str
    rest: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None

class WorkoutUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    exercises: Optional[List[ExerciseUpdate]] = None

class NutrientUpdate(BaseModel):
    name: str
    dosage: str
    timing: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None

class MealUpdate(BaseModel):
    name: str
    description: str
    calories: int
    proteins: int
    carbs: int
    fats: int
    image_url: Optional[str] = None
    video_url: Optional[str] = None

class SupplementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    nutrients: Optional[List[NutrientUpdate]] = None
    meals: Optional[List[MealUpdate]] = None

async def verify_admin(current_user: User = Depends(get_current_user)):
    """Vérifie que l'utilisateur est admin (VIP)"""
    if current_user.subscription_tier != "vip":
        raise HTTPException(status_code=403, detail="Admin access required (VIP)")
    return current_user

# --- WORKOUTS ADMIN ---

@api_router.get("/admin/workouts")
async def admin_get_all_workouts(admin: User = Depends(verify_admin)):
    """Liste tous les workouts pour l'admin"""
    workouts = await db.workouts.find({}, {"_id": 0}).to_list(1000)
    return workouts

@api_router.get("/admin/workouts/{workout_id}")
async def admin_get_workout(workout_id: str, language: str = "fr", admin: User = Depends(verify_admin)):
    """Récupère un workout spécifique"""
    workout = await db.workouts.find_one(
        {"workout_id": workout_id, "language": language}, 
        {"_id": 0}
    )
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout

@api_router.put("/admin/workouts/{workout_id}")
async def admin_update_workout(
    workout_id: str, 
    update: WorkoutUpdate, 
    language: str = "fr",
    admin: User = Depends(verify_admin)
):
    """Met à jour un workout (titre, description, image, exercices)"""
    update_data = {}
    
    if update.title is not None:
        update_data["title"] = update.title
    if update.description is not None:
        update_data["description"] = update.description
    if update.image_url is not None:
        update_data["image_url"] = update.image_url
    if update.exercises is not None:
        update_data["exercises"] = [ex.model_dump() for ex in update.exercises]
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.workouts.update_one(
        {"workout_id": workout_id, "language": language},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    return {"message": "Workout updated successfully", "modified": result.modified_count}

@api_router.put("/admin/workouts/{workout_id}/exercise/{exercise_index}")
async def admin_update_exercise(
    workout_id: str,
    exercise_index: int,
    exercise: ExerciseUpdate,
    language: str = "fr",
    admin: User = Depends(verify_admin)
):
    """Met à jour un exercice spécifique dans un workout"""
    workout = await db.workouts.find_one(
        {"workout_id": workout_id, "language": language}
    )
    
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    exercises = workout.get("exercises", [])
    if exercise_index < 0 or exercise_index >= len(exercises):
        raise HTTPException(status_code=400, detail="Invalid exercise index")
    
    exercises[exercise_index] = exercise.model_dump()
    
    await db.workouts.update_one(
        {"workout_id": workout_id, "language": language},
        {"$set": {"exercises": exercises}}
    )
    
    return {"message": "Exercise updated successfully"}

# --- CRÉATION ET GESTION COMPLÈTE DES WORKOUTS ---

class NewWorkout(BaseModel):
    title: str
    description: str
    level: str  # beginner, intermediate, advanced
    program_type: str  # mass_gain, weight_loss, legs_glutes
    duration: int
    language: str
    image_url: Optional[str] = None
    exercises: List[Dict] = []

class NewExercise(BaseModel):
    name: str
    description: str
    sets: int
    reps: str
    rest: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None

@api_router.post("/admin/workouts")
async def admin_create_workout(workout: NewWorkout, admin: User = Depends(verify_admin)):
    """Créer une nouvelle séance d'entraînement"""
    workout_data = workout.model_dump()
    workout_data["workout_id"] = f"workout_{uuid.uuid4().hex[:12]}"
    
    await db.workouts.insert_one(workout_data)
    
    return {"message": "Workout created successfully", "workout_id": workout_data["workout_id"]}

@api_router.put("/admin/workouts/{workout_id}/full")
async def admin_update_workout_full(workout_id: str, workout: NewWorkout, admin: User = Depends(verify_admin)):
    """Mettre à jour une séance complète"""
    result = await db.workouts.update_one(
        {"workout_id": workout_id},
        {"$set": workout.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    return {"message": "Workout updated successfully"}

@api_router.delete("/admin/workouts/{workout_id}")
async def admin_delete_workout(workout_id: str, admin: User = Depends(verify_admin)):
    """Supprimer une séance"""
    result = await db.workouts.delete_one({"workout_id": workout_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    return {"message": "Workout deleted successfully"}

@api_router.post("/admin/workouts/{workout_id}/exercises")
async def admin_add_exercise(workout_id: str, exercise: NewExercise, admin: User = Depends(verify_admin)):
    """Ajouter un exercice à une séance"""
    workout = await db.workouts.find_one({"workout_id": workout_id})
    
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    exercises = workout.get("exercises", [])
    exercises.append(exercise.model_dump())
    
    await db.workouts.update_one(
        {"workout_id": workout_id},
        {"$set": {"exercises": exercises}}
    )
    
    return {"message": "Exercise added successfully", "exercise_index": len(exercises) - 1}

@api_router.delete("/admin/workouts/{workout_id}/exercises/{exercise_index}")
async def admin_delete_exercise(workout_id: str, exercise_index: int, admin: User = Depends(verify_admin)):
    """Supprimer un exercice d'une séance"""
    workout = await db.workouts.find_one({"workout_id": workout_id})
    
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    exercises = workout.get("exercises", [])
    
    if exercise_index < 0 or exercise_index >= len(exercises):
        raise HTTPException(status_code=400, detail="Invalid exercise index")
    
    exercises.pop(exercise_index)
    
    await db.workouts.update_one(
        {"workout_id": workout_id},
        {"$set": {"exercises": exercises}}
    )
    
    return {"message": "Exercise deleted successfully"}

# --- SUPPLEMENTS ADMIN ---

@api_router.get("/admin/supplements")
async def admin_get_all_supplements(admin: User = Depends(verify_admin)):
    """Liste tous les suppléments pour l'admin"""
    supplements = await db.supplements.find({}, {"_id": 0}).to_list(100)
    return supplements

@api_router.get("/admin/supplements/{supplement_id}")
async def admin_get_supplement(supplement_id: str, admin: User = Depends(verify_admin)):
    """Récupère un supplément spécifique"""
    supplement = await db.supplements.find_one(
        {"supplement_id": supplement_id}, 
        {"_id": 0}
    )
    if not supplement:
        raise HTTPException(status_code=404, detail="Supplement not found")
    return supplement

@api_router.put("/admin/supplements/{supplement_id}")
async def admin_update_supplement(
    supplement_id: str, 
    update: SupplementUpdate,
    admin: User = Depends(verify_admin)
):
    """Met à jour un supplément (titre, description, image, nutrients, meals)"""
    update_data = {}
    
    if update.title is not None:
        update_data["title"] = update.title
    if update.description is not None:
        update_data["description"] = update.description
    if update.image_url is not None:
        update_data["image_url"] = update.image_url
    if update.video_url is not None:
        update_data["video_url"] = update.video_url
    if update.nutrients is not None:
        update_data["nutrients"] = [n.model_dump() for n in update.nutrients]
    if update.meals is not None:
        update_data["meals"] = [m.model_dump() for m in update.meals]
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.supplements.update_one(
        {"supplement_id": supplement_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Supplement not found")
    
    return {"message": "Supplement updated successfully", "modified": result.modified_count}

@api_router.put("/admin/supplements/{supplement_id}/nutrient/{nutrient_index}")
async def admin_update_nutrient(
    supplement_id: str,
    nutrient_index: int,
    nutrient: NutrientUpdate,
    admin: User = Depends(verify_admin)
):
    """Met à jour un nutriment spécifique"""
    supplement = await db.supplements.find_one({"supplement_id": supplement_id})
    
    if not supplement:
        raise HTTPException(status_code=404, detail="Supplement not found")
    
    nutrients = supplement.get("nutrients", [])
    if nutrient_index < 0 or nutrient_index >= len(nutrients):
        raise HTTPException(status_code=400, detail="Invalid nutrient index")
    
    nutrients[nutrient_index] = nutrient.model_dump()
    
    await db.supplements.update_one(
        {"supplement_id": supplement_id},
        {"$set": {"nutrients": nutrients}}
    )
    
    return {"message": "Nutrient updated successfully"}

@api_router.put("/admin/supplements/{supplement_id}/meal/{meal_index}")
async def admin_update_meal(
    supplement_id: str,
    meal_index: int,
    meal: MealUpdate,
    admin: User = Depends(verify_admin)
):
    """Met à jour un repas spécifique"""
    supplement = await db.supplements.find_one({"supplement_id": supplement_id})
    
    if not supplement:
        raise HTTPException(status_code=404, detail="Supplement not found")
    
    meals = supplement.get("meals", [])
    if meal_index < 0 or meal_index >= len(meals):
        raise HTTPException(status_code=400, detail="Invalid meal index")
    
    meals[meal_index] = meal.model_dump()
    
    await db.supplements.update_one(
        {"supplement_id": supplement_id},
        {"$set": {"meals": meals}}
    )
    
    return {"message": "Meal updated successfully"}

@api_router.put("/admin/supplements/{supplement_id}/meal/{meal_index}/recipe")
async def admin_update_meal_recipe(
    supplement_id: str,
    meal_index: int,
    recipe_data: MealRecipeUpdate,
    admin: User = Depends(verify_admin)
):
    """Met à jour la recette d'un repas spécifique"""
    supplement = await db.supplements.find_one({"supplement_id": supplement_id})
    
    if not supplement:
        raise HTTPException(status_code=404, detail="Supplement not found")
    
    meals = supplement.get("meals", [])
    if meal_index < 0 or meal_index >= len(meals):
        raise HTTPException(status_code=400, detail="Invalid meal index")
    
    # Add recipe to the meal
    meals[meal_index]["recipe"] = recipe_data.recipe.model_dump()
    
    await db.supplements.update_one(
        {"supplement_id": supplement_id},
        {"$set": {"meals": meals}}
    )
    
    return {"message": "Recipe updated successfully"}

@api_router.post("/admin/supplements/{supplement_id}/meals")
async def admin_add_meal(
    supplement_id: str,
    meal: MealUpdate,
    admin: User = Depends(verify_admin)
):
    """Ajoute un nouveau repas à un plan nutritionnel"""
    supplement = await db.supplements.find_one({"supplement_id": supplement_id})
    if not supplement:
        raise HTTPException(status_code=404, detail="Supplement not found")
    
    meals = supplement.get("meals", [])
    meals.append(meal.model_dump())
    
    await db.supplements.update_one(
        {"supplement_id": supplement_id},
        {"$set": {"meals": meals}}
    )
    
    return {"message": "Meal added successfully", "meal_index": len(meals) - 1}

@api_router.delete("/admin/supplements/{supplement_id}/meals/{meal_index}")
async def admin_delete_meal(
    supplement_id: str,
    meal_index: int,
    admin: User = Depends(verify_admin)
):
    """Supprime un repas d'un plan nutritionnel"""
    supplement = await db.supplements.find_one({"supplement_id": supplement_id})
    if not supplement:
        raise HTTPException(status_code=404, detail="Supplement not found")
    
    meals = supplement.get("meals", [])
    if meal_index < 0 or meal_index >= len(meals):
        raise HTTPException(status_code=400, detail="Invalid meal index")
    
    meals.pop(meal_index)
    
    await db.supplements.update_one(
        {"supplement_id": supplement_id},
        {"$set": {"meals": meals}}
    )
    
    return {"message": "Meal deleted successfully"}

# --- STATS ADMIN ---

@api_router.get("/admin/stats")
async def admin_get_stats(admin: User = Depends(verify_admin)):
    """Statistiques pour l'admin"""
    users_count = await db.users.count_documents({})
    workouts_count = await db.workouts.count_documents({})
    supplements_count = await db.supplements.count_documents({})
    subscriptions_count = await db.user_subscriptions.count_documents({})
    
    # Compter par tier
    vip_count = await db.users.count_documents({"subscription_tier": "vip"})
    standard_count = await db.users.count_documents({"subscription_tier": "standard"})
    supplements_tier_count = await db.users.count_documents({"subscription_tier": "supplements"})
    
    # Statistiques des séances
    total_sessions = await db.workout_sessions.count_documents({})
    completed_sessions = await db.workout_sessions.count_documents({"completed": True})
    
    # Temps total passé sur les séances
    pipeline = [
        {"$group": {"_id": None, "total_duration": {"$sum": "$duration_seconds"}}}
    ]
    duration_result = await db.workout_sessions.aggregate(pipeline).to_list(1)
    total_duration = duration_result[0]["total_duration"] if duration_result else 0
    
    return {
        "total_users": users_count,
        "total_workouts": workouts_count,
        "total_supplements": supplements_count,
        "total_subscriptions": subscriptions_count,
        "vip_users": vip_count,
        "standard_users": standard_count,
        "supplements_users": supplements_tier_count,
        "total_workout_sessions": total_sessions,
        "completed_workout_sessions": completed_sessions,
        "total_workout_duration_seconds": total_duration
    }

# ==================== ADMIN - GESTION DES ABONNÉS ====================

@api_router.get("/admin/subscribers")
async def admin_get_subscribers(admin: User = Depends(verify_admin)):
    """Récupérer la liste complète des abonnés avec leurs détails"""
    users = await db.users.find(
        {},
        {"_id": 0, "password": 0}
    ).to_list(1000)
    
    # Enrichir avec les statistiques de séances pour chaque utilisateur
    for user in users:
        user_id = user.get("user_id")
        
        # Nombre de séances effectuées
        sessions_count = await db.workout_sessions.count_documents({"user_id": user_id})
        completed_count = await db.workout_sessions.count_documents({"user_id": user_id, "completed": True})
        
        # Temps total passé
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": None, "total_duration": {"$sum": "$duration_seconds"}}}
        ]
        duration_result = await db.workout_sessions.aggregate(pipeline).to_list(1)
        total_duration = duration_result[0]["total_duration"] if duration_result else 0
        
        user["stats"] = {
            "total_sessions": sessions_count,
            "completed_sessions": completed_count,
            "total_duration_seconds": total_duration,
            "total_duration_formatted": f"{total_duration // 3600}h {(total_duration % 3600) // 60}m"
        }
    
    return {"subscribers": users, "total": len(users)}

@api_router.get("/admin/subscriber/{user_id}")
async def admin_get_subscriber_detail(user_id: str, admin: User = Depends(verify_admin)):
    """Récupérer les détails complets d'un abonné"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Récupérer toutes les séances de l'utilisateur
    sessions = await db.workout_sessions.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("started_at", -1).to_list(100)
    
    # Statistiques détaillées
    total_sessions = len(sessions)
    completed_sessions = sum(1 for s in sessions if s.get("completed"))
    total_duration = sum(s.get("duration_seconds", 0) for s in sessions)
    
    # Séances par workout
    workout_stats = {}
    for session in sessions:
        wid = session.get("workout_id")
        if wid not in workout_stats:
            workout_stats[wid] = {
                "workout_title": session.get("workout_title", "Unknown"),
                "launches": 0,
                "completed": 0,
                "total_duration": 0
            }
        workout_stats[wid]["launches"] += 1
        if session.get("completed"):
            workout_stats[wid]["completed"] += 1
        workout_stats[wid]["total_duration"] += session.get("duration_seconds", 0)
    
    return {
        "user": user,
        "stats": {
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "total_duration_seconds": total_duration,
            "total_duration_formatted": f"{total_duration // 3600}h {(total_duration % 3600) // 60}m"
        },
        "workout_stats": list(workout_stats.values()),
        "recent_sessions": sessions[:20]
    }

@api_router.put("/admin/subscriber/{user_id}/subscription")
async def admin_update_subscription(user_id: str, update: SubscriptionUpdate, admin: User = Depends(verify_admin)):
    """Modifier l'abonnement d'un utilisateur (Admin seulement)"""
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "subscription_tier": update.subscription_tier,
            "subscription_status": update.subscription_status
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": f"Subscription updated for user {user_id}"}

@api_router.delete("/admin/subscriber/{user_id}")
async def admin_delete_subscriber(user_id: str, admin: User = Depends(verify_admin)):
    """Supprimer un abonné (Admin seulement)"""
    # Vérifier que ce n'est pas l'admin lui-même
    if user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = await db.users.delete_one({"user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Supprimer aussi les sessions et données associées
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.workout_sessions.delete_many({"user_id": user_id})
    await db.user_subscriptions.delete_many({"user_id": user_id})
    
    return {"success": True, "message": f"User {user_id} deleted successfully"}

# ==================== TRACKING DES SÉANCES ====================

@api_router.post("/workout/start")
async def start_workout_session(workout_id: str, user: User = Depends(get_current_user)):
    """Démarrer une séance d'entraînement"""
    # Récupérer le workout pour avoir le titre
    workout = await db.workouts.find_one({"workout_id": workout_id}, {"_id": 0})
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    session_id = str(uuid.uuid4())
    session_data = {
        "session_id": session_id,
        "user_id": user.user_id,
        "workout_id": workout_id,
        "workout_title": workout.get("title", "Unknown"),
        "started_at": datetime.now(timezone.utc).isoformat(),
        "ended_at": None,
        "duration_seconds": 0,
        "completed": False
    }
    
    await db.workout_sessions.insert_one(session_data)
    
    return {"session_id": session_id, "message": "Workout session started"}

@api_router.post("/workout/end")
async def end_workout_session(session_id: str, completed: bool = True, user: User = Depends(get_current_user)):
    """Terminer une séance d'entraînement"""
    session = await db.workout_sessions.find_one(
        {"session_id": session_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    started_at = session.get("started_at")
    if isinstance(started_at, str):
        started_at = datetime.fromisoformat(started_at.replace('Z', '+00:00'))
    
    ended_at = datetime.now(timezone.utc)
    duration_seconds = int((ended_at - started_at).total_seconds())
    
    await db.workout_sessions.update_one(
        {"session_id": session_id},
        {"$set": {
            "ended_at": ended_at.isoformat(),
            "duration_seconds": duration_seconds,
            "completed": completed
        }}
    )
    
    return {
        "message": "Workout session ended",
        "duration_seconds": duration_seconds,
        "duration_formatted": f"{duration_seconds // 60}m {duration_seconds % 60}s",
        "completed": completed
    }

@api_router.get("/workout/my-sessions")
async def get_my_sessions(user: User = Depends(get_current_user)):
    """Récupérer l'historique de mes séances"""
    sessions = await db.workout_sessions.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("started_at", -1).to_list(50)
    
    total_duration = sum(s.get("duration_seconds", 0) for s in sessions)
    completed_count = sum(1 for s in sessions if s.get("completed"))
    
    return {
        "sessions": sessions,
        "stats": {
            "total_sessions": len(sessions),
            "completed_sessions": completed_count,
            "total_duration_seconds": total_duration,
            "total_duration_formatted": f"{total_duration // 3600}h {(total_duration % 3600) // 60}m"
        }
    }

@api_router.post("/workout/pause/start")
async def start_pause(session_id: str, user: User = Depends(get_current_user)):
    """Démarrer une pause dans la séance"""
    session = await db.workout_sessions.find_one(
        {"session_id": session_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    pause_id = str(uuid.uuid4())
    pause_data = {
        "pause_id": pause_id,
        "started_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Ajouter la pause au tableau des pauses
    await db.workout_sessions.update_one(
        {"session_id": session_id},
        {
            "$push": {"pauses": pause_data},
            "$set": {"is_paused": True, "current_pause_id": pause_id}
        }
    )
    
    return {"pause_id": pause_id, "message": "Pause started"}

@api_router.post("/workout/pause/end")
async def end_pause(session_id: str, pause_id: str, user: User = Depends(get_current_user)):
    """Terminer une pause dans la séance"""
    session = await db.workout_sessions.find_one(
        {"session_id": session_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    pauses = session.get("pauses", [])
    pause_found = None
    pause_index = -1
    
    for i, pause in enumerate(pauses):
        if pause.get("pause_id") == pause_id:
            pause_found = pause
            pause_index = i
            break
    
    if not pause_found:
        raise HTTPException(status_code=404, detail="Pause not found")
    
    started_at = pause_found.get("started_at")
    if isinstance(started_at, str):
        started_at = datetime.fromisoformat(started_at.replace('Z', '+00:00'))
    
    ended_at = datetime.now(timezone.utc)
    duration_seconds = int((ended_at - started_at).total_seconds())
    
    # Mettre à jour la pause
    await db.workout_sessions.update_one(
        {"session_id": session_id},
        {
            "$set": {
                f"pauses.{pause_index}.ended_at": ended_at.isoformat(),
                f"pauses.{pause_index}.duration_seconds": duration_seconds,
                "is_paused": False,
                "current_pause_id": None
            },
            "$inc": {"total_pause_seconds": duration_seconds}
        }
    )
    
    return {
        "message": "Pause ended",
        "pause_duration_seconds": duration_seconds,
        "pause_duration_formatted": f"{duration_seconds // 60}m {duration_seconds % 60}s"
    }

@api_router.get("/workout/session/{session_id}")
async def get_session_details(session_id: str, user: User = Depends(get_current_user)):
    """Récupérer les détails d'une séance en cours ou terminée"""
    session = await db.workout_sessions.find_one(
        {"session_id": session_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return session

# ==================== ADMIN - STATISTIQUES AVANCÉES ====================

@api_router.get("/admin/workout-analytics")
async def admin_get_workout_analytics(admin: User = Depends(verify_admin)):
    """Statistiques détaillées sur les séances par workout"""
    pipeline = [
        {"$group": {
            "_id": "$workout_id",
            "workout_title": {"$first": "$workout_title"},
            "total_launches": {"$sum": 1},
            "completed_count": {"$sum": {"$cond": ["$completed", 1, 0]}},
            "total_duration": {"$sum": "$duration_seconds"},
            "avg_duration": {"$avg": "$duration_seconds"}
        }},
        {"$sort": {"total_launches": -1}}
    ]
    
    results = await db.workout_sessions.aggregate(pipeline).to_list(100)
    
    for r in results:
        r["workout_id"] = r.pop("_id")
        r["avg_duration_formatted"] = f"{int(r['avg_duration'] // 60)}m {int(r['avg_duration'] % 60)}s" if r['avg_duration'] else "0m"
        r["total_duration_formatted"] = f"{r['total_duration'] // 3600}h {(r['total_duration'] % 3600) // 60}m"
        r["completion_rate"] = f"{(r['completed_count'] / r['total_launches'] * 100):.1f}%" if r['total_launches'] > 0 else "0%"
    
    return {"workout_analytics": results}

@api_router.get("/admin/daily-activity")
async def admin_get_daily_activity(days: int = 30, admin: User = Depends(verify_admin)):
    """Activité quotidienne des 30 derniers jours"""
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    pipeline = [
        {"$match": {"started_at": {"$gte": start_date.isoformat()}}},
        {"$group": {
            "_id": {"$substr": ["$started_at", 0, 10]},
            "sessions_count": {"$sum": 1},
            "unique_users": {"$addToSet": "$user_id"},
            "total_duration": {"$sum": "$duration_seconds"}
        }},
        {"$project": {
            "date": "$_id",
            "sessions_count": 1,
            "unique_users_count": {"$size": "$unique_users"},
            "total_duration": 1
        }},
        {"$sort": {"_id": -1}}
    ]
    
    results = await db.workout_sessions.aggregate(pipeline).to_list(days)
    
    return {"daily_activity": results}

# ==================== ADMIN - STATISTIQUES PAR UTILISATEUR ====================

@api_router.get("/admin/user/{user_id}/sessions")
async def admin_get_user_sessions(user_id: str, admin: User = Depends(verify_admin)):
    """Récupérer toutes les séances d'un utilisateur spécifique"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    sessions = await db.workout_sessions.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("started_at", -1).to_list(100)
    
    total_duration = sum(s.get("duration_seconds", 0) for s in sessions)
    completed_count = sum(1 for s in sessions if s.get("completed"))
    total_pause = sum(s.get("total_pause_seconds", 0) for s in sessions)
    
    # Calculate average session duration
    avg_duration = total_duration / len(sessions) if sessions else 0
    
    return {
        "user": {
            "user_id": user.get("user_id"),
            "name": user.get("name"),
            "email": user.get("email"),
            "subscription_tier": user.get("subscription_tier")
        },
        "sessions": sessions,
        "stats": {
            "total_sessions": len(sessions),
            "completed_sessions": completed_count,
            "completion_rate": f"{(completed_count / len(sessions) * 100):.1f}%" if sessions else "0%",
            "total_duration_seconds": total_duration,
            "total_duration_formatted": f"{total_duration // 3600}h {(total_duration % 3600) // 60}m",
            "avg_session_duration": f"{int(avg_duration // 60)}m {int(avg_duration % 60)}s",
            "total_pause_time": f"{total_pause // 60}m {total_pause % 60}s"
        }
    }

@api_router.get("/admin/all-user-progress")
async def admin_get_all_user_progress(admin: User = Depends(verify_admin)):
    """Récupérer les statistiques de progression de tous les utilisateurs"""
    pipeline = [
        {"$group": {
            "_id": "$user_id",
            "total_sessions": {"$sum": 1},
            "completed_sessions": {"$sum": {"$cond": ["$completed", 1, 0]}},
            "total_duration": {"$sum": "$duration_seconds"},
            "total_pause": {"$sum": {"$ifNull": ["$total_pause_seconds", 0]}},
            "avg_duration": {"$avg": "$duration_seconds"},
            "last_session": {"$max": "$started_at"}
        }},
        {"$sort": {"total_sessions": -1}}
    ]
    
    results = await db.workout_sessions.aggregate(pipeline).to_list(100)
    
    # Enrichir avec les infos utilisateur
    for r in results:
        user = await db.users.find_one({"user_id": r["_id"]}, {"_id": 0})
        if user:
            r["user_name"] = user.get("name", "Unknown")
            r["user_email"] = user.get("email", "")
            r["subscription_tier"] = user.get("subscription_tier", "free")
        else:
            r["user_name"] = "Unknown"
            r["user_email"] = ""
            r["subscription_tier"] = "free"
        
        r["user_id"] = r.pop("_id")
        r["avg_duration_formatted"] = f"{int(r['avg_duration'] // 60)}m {int(r['avg_duration'] % 60)}s" if r['avg_duration'] else "0m"
        r["total_duration_formatted"] = f"{r['total_duration'] // 3600}h {(r['total_duration'] % 3600) // 60}m"
        r["completion_rate"] = f"{(r['completed_sessions'] / r['total_sessions'] * 100):.1f}%" if r['total_sessions'] > 0 else "0%"
    
    return {"user_progress": results}

# ==================== MESSAGERIE ====================

class MessageCreate(BaseModel):
    content: str
    recipient_id: Optional[str] = None  # None = message to admin

@api_router.post("/messages/send")
async def send_message(message: MessageCreate, user: User = Depends(get_current_user)):
    """Envoyer un message (utilisateur -> admin ou admin -> utilisateur)"""
    message_id = str(uuid.uuid4())
    
    # Déterminer si c'est un admin qui envoie
    is_admin = user.subscription_tier == 'vip'
    
    message_data = {
        "message_id": message_id,
        "sender_id": user.user_id,
        "sender_name": user.name,
        "sender_email": user.email,
        "recipient_id": message.recipient_id if is_admin else "admin",
        "content": message.content,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read": False,
        "is_from_admin": is_admin
    }
    
    await db.messages.insert_one(message_data)
    
    return {"message_id": message_id, "status": "sent"}

@api_router.get("/messages/inbox")
async def get_inbox(user: User = Depends(get_current_user)):
    """Récupérer mes messages (inbox)"""
    is_admin = user.subscription_tier == 'vip'
    
    if is_admin:
        # Admin voit tous les messages envoyés à "admin"
        messages = await db.messages.find(
            {"recipient_id": "admin"},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
    else:
        # Utilisateur voit ses messages avec l'admin
        messages = await db.messages.find(
            {"$or": [
                {"sender_id": user.user_id},
                {"recipient_id": user.user_id}
            ]},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
    
    unread_count = sum(1 for m in messages if not m.get("read") and m.get("recipient_id") == user.user_id)
    
    return {"messages": messages, "unread_count": unread_count}

@api_router.get("/messages/conversation/{user_id}")
async def get_conversation(user_id: str, admin: User = Depends(verify_admin)):
    """Admin: Récupérer la conversation avec un utilisateur spécifique"""
    messages = await db.messages.find(
        {"$or": [
            {"sender_id": user_id, "recipient_id": "admin"},
            {"sender_id": admin.user_id, "recipient_id": user_id}
        ]},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    
    # Marquer comme lus
    await db.messages.update_many(
        {"sender_id": user_id, "recipient_id": "admin", "read": False},
        {"$set": {"read": True}}
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    return {
        "user": {
            "user_id": user_id,
            "name": user.get("name") if user else "Unknown",
            "email": user.get("email") if user else ""
        },
        "messages": messages
    }

@api_router.post("/messages/mark-read/{message_id}")
async def mark_message_read(message_id: str, user: User = Depends(get_current_user)):
    """Marquer un message comme lu"""
    await db.messages.update_one(
        {"message_id": message_id},
        {"$set": {"read": True}}
    )
    return {"status": "marked as read"}

@api_router.get("/admin/messages/unread-count")
async def admin_get_unread_count(admin: User = Depends(verify_admin)):
    """Admin: Compter les messages non lus"""
    count = await db.messages.count_documents({"recipient_id": "admin", "read": False})
    return {"unread_count": count}

@api_router.get("/admin/messages/users-with-messages")
async def admin_get_users_with_messages(admin: User = Depends(verify_admin)):
    """Admin: Liste des utilisateurs qui ont envoyé des messages"""
    pipeline = [
        {"$match": {"recipient_id": "admin"}},
        {"$group": {
            "_id": "$sender_id",
            "sender_name": {"$first": "$sender_name"},
            "sender_email": {"$first": "$sender_email"},
            "message_count": {"$sum": 1},
            "unread_count": {"$sum": {"$cond": ["$read", 0, 1]}},
            "last_message": {"$max": "$created_at"},
            "last_content": {"$last": "$content"}
        }},
        {"$sort": {"last_message": -1}}
    ]
    
    results = await db.messages.aggregate(pipeline).to_list(50)
    
    for r in results:
        r["user_id"] = r.pop("_id")
    
    return {"users": results}


# ==================== RAPPELS D'ENTRAINEMENT ====================

class ReminderCreate(BaseModel):
    workout_id: str
    workout_title: str
    day_of_week: int  # 0=Lundi, 1=Mardi, etc.
    time: str  # Format "HH:MM"
    repeat_weekly: bool = True
    notes: Optional[str] = None

class ReminderUpdate(BaseModel):
    day_of_week: Optional[int] = None
    time: Optional[str] = None
    repeat_weekly: Optional[bool] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

@api_router.post("/reminders")
async def create_reminder(reminder: ReminderCreate, user: User = Depends(get_current_user)):
    """Créer un nouveau rappel d'entraînement"""
    reminder_id = str(uuid.uuid4())
    
    reminder_data = {
        "reminder_id": reminder_id,
        "user_id": user.user_id,
        "workout_id": reminder.workout_id,
        "workout_title": reminder.workout_title,
        "day_of_week": reminder.day_of_week,
        "time": reminder.time,
        "repeat_weekly": reminder.repeat_weekly,
        "is_active": True,
        "notes": reminder.notes,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_triggered": None
    }
    
    await db.reminders.insert_one(reminder_data)
    
    return {"reminder_id": reminder_id, "message": "Reminder created successfully"}

@api_router.get("/reminders")
async def get_my_reminders(user: User = Depends(get_current_user)):
    """Récupérer tous mes rappels"""
    reminders = await db.reminders.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("day_of_week", 1).to_list(50)
    
    # Calculer le prochain rappel pour chaque entrée
    days_fr = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    days_en = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    for r in reminders:
        r["day_name_fr"] = days_fr[r["day_of_week"]]
        r["day_name_en"] = days_en[r["day_of_week"]]
    
    active_count = sum(1 for r in reminders if r.get("is_active"))
    
    return {
        "reminders": reminders,
        "total_count": len(reminders),
        "active_count": active_count
    }

@api_router.put("/reminders/{reminder_id}")
async def update_reminder(
    reminder_id: str, 
    update: ReminderUpdate, 
    user: User = Depends(get_current_user)
):
    """Mettre à jour un rappel"""
    reminder = await db.reminders.find_one(
        {"reminder_id": reminder_id, "user_id": user.user_id}
    )
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if update_data:
        await db.reminders.update_one(
            {"reminder_id": reminder_id},
            {"$set": update_data}
        )
    
    return {"message": "Reminder updated successfully"}

@api_router.delete("/reminders/{reminder_id}")
async def delete_reminder(reminder_id: str, user: User = Depends(get_current_user)):
    """Supprimer un rappel"""
    result = await db.reminders.delete_one(
        {"reminder_id": reminder_id, "user_id": user.user_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    return {"message": "Reminder deleted successfully"}

@api_router.get("/reminders/today")
async def get_today_reminders(user: User = Depends(get_current_user)):
    """Récupérer les rappels d'aujourd'hui"""
    today = datetime.now(timezone.utc).weekday()  # 0=Lundi
    
    reminders = await db.reminders.find(
        {"user_id": user.user_id, "day_of_week": today, "is_active": True},
        {"_id": 0}
    ).to_list(10)
    
    return {"reminders": reminders, "count": len(reminders)}

@api_router.get("/reminders/upcoming")
async def get_upcoming_reminders(user: User = Depends(get_current_user)):
    """Récupérer les 7 prochains jours de rappels"""
    now = datetime.now(timezone.utc)
    current_day = now.weekday()
    current_time = now.strftime("%H:%M")
    
    reminders = await db.reminders.find(
        {"user_id": user.user_id, "is_active": True},
        {"_id": 0}
    ).to_list(50)
    
    days_fr = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    days_en = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    upcoming = []
    for r in reminders:
        days_until = (r["day_of_week"] - current_day) % 7
        # Si c'est aujourd'hui mais l'heure est passée, c'est dans 7 jours
        if days_until == 0 and r["time"] < current_time:
            days_until = 7
        
        r["days_until"] = days_until
        r["day_name_fr"] = days_fr[r["day_of_week"]]
        r["day_name_en"] = days_en[r["day_of_week"]]
        upcoming.append(r)
    
    # Trier par jours restants puis par heure
    upcoming.sort(key=lambda x: (x["days_until"], x["time"]))
    
    return {"upcoming": upcoming[:10]}

@api_router.post("/reminders/{reminder_id}/toggle")
async def toggle_reminder(reminder_id: str, user: User = Depends(get_current_user)):
    """Activer/Désactiver un rappel"""
    reminder = await db.reminders.find_one(
        {"reminder_id": reminder_id, "user_id": user.user_id}
    )
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    new_status = not reminder.get("is_active", True)
    
    await db.reminders.update_one(
        {"reminder_id": reminder_id},
        {"$set": {"is_active": new_status}}
    )
    
    return {"is_active": new_status, "message": f"Reminder {'activated' if new_status else 'deactivated'}"}


# ==================== ROUTINES (ÉCHAUFFEMENT & ÉTIREMENTS) ====================

@api_router.get("/routines/{routine_type}")
async def get_routine(routine_type: str, language: str = "en"):
    """Récupérer une routine (warmup ou stretching)"""
    if routine_type not in ["warmup", "stretching"]:
        raise HTTPException(status_code=400, detail="Invalid routine type. Use 'warmup' or 'stretching'")
    
    routine_id = f"{routine_type}_{language}"
    routine = await db.routines.find_one({"routine_id": routine_id}, {"_id": 0})
    
    if not routine:
        # Fallback to English if not found
        routine = await db.routines.find_one({"routine_id": f"{routine_type}_en"}, {"_id": 0})
    
    return routine if routine else {"exercises": [], "title": routine_type.capitalize()}

@api_router.get("/admin/routines")
async def admin_get_all_routines(admin: User = Depends(verify_admin)):
    """Admin: Récupérer toutes les routines"""
    routines = await db.routines.find({}, {"_id": 0}).to_list(10)
    return {"routines": routines}

class RoutineExerciseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None

@api_router.put("/admin/routines/{routine_id}/exercises/{exercise_index}")
async def admin_update_routine_exercise(
    routine_id: str,
    exercise_index: int,
    update: RoutineExerciseUpdate,
    admin: User = Depends(verify_admin)
):
    """Admin: Mettre à jour un exercice d'une routine"""
    routine = await db.routines.find_one({"routine_id": routine_id})
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    
    exercises = routine.get("exercises", [])
    if exercise_index < 0 or exercise_index >= len(exercises):
        raise HTTPException(status_code=400, detail="Invalid exercise index")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    for key, value in update_data.items():
        exercises[exercise_index][key] = value
    
    await db.routines.update_one(
        {"routine_id": routine_id},
        {"$set": {"exercises": exercises}}
    )
    
    return {"message": "Exercise updated successfully"}

class NewRoutineExercise(BaseModel):
    name: str
    description: str
    duration: str
    image_url: Optional[str] = ""
    video_url: Optional[str] = ""

@api_router.post("/admin/routines/{routine_id}/exercises")
async def admin_add_routine_exercise(
    routine_id: str,
    exercise: NewRoutineExercise,
    admin: User = Depends(verify_admin)
):
    """Admin: Ajouter un exercice à une routine"""
    routine = await db.routines.find_one({"routine_id": routine_id})
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    
    new_exercise = {
        "name": exercise.name,
        "description": exercise.description,
        "duration": exercise.duration,
        "sets": 1,
        "image_url": exercise.image_url or "",
        "video_url": exercise.video_url or ""
    }
    
    await db.routines.update_one(
        {"routine_id": routine_id},
        {"$push": {"exercises": new_exercise}}
    )
    
    return {"message": "Exercise added successfully"}

@api_router.delete("/admin/routines/{routine_id}/exercises/{exercise_index}")
async def admin_delete_routine_exercise(
    routine_id: str,
    exercise_index: int,
    admin: User = Depends(verify_admin)
):
    """Admin: Supprimer un exercice d'une routine"""
    routine = await db.routines.find_one({"routine_id": routine_id})
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    
    exercises = routine.get("exercises", [])
    if exercise_index < 0 or exercise_index >= len(exercises):
        raise HTTPException(status_code=400, detail="Invalid exercise index")
    
    exercises.pop(exercise_index)
    
    await db.routines.update_one(
        {"routine_id": routine_id},
        {"$set": {"exercises": exercises}}
    )
    
    return {"message": "Exercise deleted successfully"}

# ==================== ROUTINE SESSION TRACKING ====================

@api_router.post("/routine/start")
async def start_routine_session(
    routine_type: str, 
    workout_session_id: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """Démarrer une session de routine (échauffement ou étirement)"""
    if routine_type not in ["warmup", "stretching"]:
        raise HTTPException(status_code=400, detail="Invalid routine type")
    
    session_id = str(uuid.uuid4())
    
    session_data = {
        "session_id": session_id,
        "user_id": user.user_id,
        "routine_type": routine_type,
        "workout_session_id": workout_session_id,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "ended_at": None,
        "completed": False,
        "duration_seconds": 0
    }
    
    await db.routine_sessions.insert_one(session_data)
    
    return {
        "session_id": session_id,
        "routine_type": routine_type,
        "message": f"{routine_type.capitalize()} session started"
    }

@api_router.post("/routine/end")
async def end_routine_session(
    session_id: str,
    completed: bool = True,
    user: User = Depends(get_current_user)
):
    """Terminer une session de routine"""
    session = await db.routine_sessions.find_one(
        {"session_id": session_id, "user_id": user.user_id}
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Routine session not found")
    
    started_at = session.get("started_at")
    if isinstance(started_at, str):
        started_at = datetime.fromisoformat(started_at.replace('Z', '+00:00'))
    
    ended_at = datetime.now(timezone.utc)
    duration_seconds = int((ended_at - started_at).total_seconds())
    
    await db.routine_sessions.update_one(
        {"session_id": session_id},
        {"$set": {
            "ended_at": ended_at.isoformat(),
            "completed": completed,
            "duration_seconds": duration_seconds
        }}
    )
    
    return {
        "session_id": session_id,
        "duration_seconds": duration_seconds,
        "duration_formatted": f"{duration_seconds // 60}m {duration_seconds % 60}s",
        "completed": completed
    }

# ==================== EMAIL REMINDERS ====================

async def send_reminder_email(user_email: str, user_name: str, workout_title: str, reminder_time: str, day_name: str):
    """Envoyer un email de rappel"""
    try:
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #09090b; color: white; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #121212; border-radius: 10px; padding: 30px;">
                <h1 style="color: #EF4444; text-align: center;">FitMaxPro</h1>
                <h2 style="text-align: center;">Rappel d'Entraînement</h2>
                
                <p style="font-size: 18px;">Bonjour {user_name},</p>
                
                <p>C'est l'heure de votre séance !</p>
                
                <div style="background-color: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #EF4444;">
                    <h3 style="margin: 0 0 10px 0; color: #EF4444;">{workout_title}</h3>
                    <p style="margin: 5px 0; color: #888;">📅 {day_name}</p>
                    <p style="margin: 5px 0; color: #888;">⏰ {reminder_time}</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="{APP_URL}/workouts" style="background-color: #EF4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        COMMENCER LA SÉANCE
                    </a>
                </div>
                
                <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
                    FitMaxPro - Transformez votre corps<br>
                    Pour désactiver ces rappels, rendez-vous dans l'application.
                </p>
            </div>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [user_email],
            "subject": f"⏰ Rappel: {workout_title} - {day_name} {reminder_time}",
            "html": html_content
        }
        
        email = resend.Emails.send(params)
        return {"success": True, "email_id": email.get("id")}
    except Exception as e:
        logging.error(f"Error sending email: {e}")
        return {"success": False, "error": str(e)}

@api_router.post("/reminders/{reminder_id}/send-email")
async def send_reminder_email_now(reminder_id: str, user: User = Depends(get_current_user)):
    """Envoyer un email de rappel maintenant (test)"""
    reminder = await db.reminders.find_one(
        {"reminder_id": reminder_id, "user_id": user.user_id}
    )
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    days_en = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_name = days_en[reminder.get("day_of_week", 0)]
    
    result = await send_reminder_email(
        user_email=user.email,
        user_name=user.name,
        workout_title=reminder.get("workout_title", "Workout"),
        reminder_time=reminder.get("time", "08:00"),
        day_name=day_name
    )
    
    if result.get("success"):
        return {"message": "Email sent successfully", "email_id": result.get("email_id")}
    else:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {result.get('error')}")

@api_router.put("/reminders/{reminder_id}/email-settings")
async def update_reminder_email_settings(
    reminder_id: str, 
    send_email: bool,
    user: User = Depends(get_current_user)
):
    """Activer/Désactiver les emails pour un rappel"""
    reminder = await db.reminders.find_one(
        {"reminder_id": reminder_id, "user_id": user.user_id}
    )
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    await db.reminders.update_one(
        {"reminder_id": reminder_id},
        {"$set": {"send_email": send_email}}
    )
    
    return {"message": f"Email notifications {'enabled' if send_email else 'disabled'}"}


# ==================== ADMIN ROUTINE SESSIONS TRACKING ====================

@api_router.get("/admin/routine-sessions")
async def admin_get_all_routine_sessions(admin: User = Depends(verify_admin)):
    """Admin: Récupérer toutes les sessions d'échauffement et d'étirements"""
    sessions = await db.routine_sessions.find({}, {"_id": 0}).sort("started_at", -1).to_list(500)
    
    # Enrichir avec les informations utilisateur
    enriched_sessions = []
    for session in sessions:
        user = await db.users.find_one({"user_id": session.get("user_id")}, {"_id": 0, "name": 1, "email": 1})
        enriched_sessions.append({
            **session,
            "user_name": user.get("name", "Unknown") if user else "Unknown",
            "user_email": user.get("email", "") if user else ""
        })
    
    return {"routine_sessions": enriched_sessions}

@api_router.get("/admin/routine-sessions/stats")
async def admin_get_routine_stats(admin: User = Depends(verify_admin)):
    """Admin: Statistiques globales des échauffements et étirements"""
    # Total sessions
    total_warmup = await db.routine_sessions.count_documents({"routine_type": "warmup"})
    total_stretching = await db.routine_sessions.count_documents({"routine_type": "stretching"})
    
    # Completed sessions
    completed_warmup = await db.routine_sessions.count_documents({"routine_type": "warmup", "completed": True})
    completed_stretching = await db.routine_sessions.count_documents({"routine_type": "stretching", "completed": True})
    
    # Average duration
    warmup_pipeline = [
        {"$match": {"routine_type": "warmup", "completed": True, "duration_seconds": {"$gt": 0}}},
        {"$group": {"_id": None, "avg_duration": {"$avg": "$duration_seconds"}}}
    ]
    stretching_pipeline = [
        {"$match": {"routine_type": "stretching", "completed": True, "duration_seconds": {"$gt": 0}}},
        {"$group": {"_id": None, "avg_duration": {"$avg": "$duration_seconds"}}}
    ]
    
    warmup_avg = await db.routine_sessions.aggregate(warmup_pipeline).to_list(1)
    stretching_avg = await db.routine_sessions.aggregate(stretching_pipeline).to_list(1)
    
    # Users with most completed routines (discipline score)
    discipline_pipeline = [
        {"$match": {"completed": True}},
        {"$group": {
            "_id": "$user_id",
            "total_completed": {"$sum": 1},
            "warmup_count": {"$sum": {"$cond": [{"$eq": ["$routine_type", "warmup"]}, 1, 0]}},
            "stretching_count": {"$sum": {"$cond": [{"$eq": ["$routine_type", "stretching"]}, 1, 0]}},
            "total_time": {"$sum": "$duration_seconds"}
        }},
        {"$sort": {"total_completed": -1}},
        {"$limit": 10}
    ]
    
    top_disciplined = await db.routine_sessions.aggregate(discipline_pipeline).to_list(10)
    
    # Enrich with user names
    for entry in top_disciplined:
        user = await db.users.find_one({"user_id": entry["_id"]}, {"name": 1, "email": 1})
        entry["user_name"] = user.get("name", "Unknown") if user else "Unknown"
        entry["user_email"] = user.get("email", "") if user else ""
    
    return {
        "warmup": {
            "total": total_warmup,
            "completed": completed_warmup,
            "completion_rate": round((completed_warmup / total_warmup * 100), 1) if total_warmup > 0 else 0,
            "avg_duration_seconds": round(warmup_avg[0]["avg_duration"], 0) if warmup_avg else 0
        },
        "stretching": {
            "total": total_stretching,
            "completed": completed_stretching,
            "completion_rate": round((completed_stretching / total_stretching * 100), 1) if total_stretching > 0 else 0,
            "avg_duration_seconds": round(stretching_avg[0]["avg_duration"], 0) if stretching_avg else 0
        },
        "top_disciplined_users": top_disciplined
    }

@api_router.get("/admin/user/{user_id}/routine-sessions")
async def admin_get_user_routine_sessions(user_id: str, admin: User = Depends(verify_admin)):
    """Admin: Récupérer les sessions d'échauffement et d'étirements d'un utilisateur"""
    sessions = await db.routine_sessions.find(
        {"user_id": user_id}, 
        {"_id": 0}
    ).sort("started_at", -1).to_list(100)
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "name": 1, "email": 1})
    
    # Calculer les statistiques
    warmup_sessions = [s for s in sessions if s.get("routine_type") == "warmup"]
    stretching_sessions = [s for s in sessions if s.get("routine_type") == "stretching"]
    
    warmup_completed = len([s for s in warmup_sessions if s.get("completed")])
    stretching_completed = len([s for s in stretching_sessions if s.get("completed")])
    
    total_warmup_time = sum(s.get("duration_seconds", 0) for s in warmup_sessions if s.get("completed"))
    total_stretching_time = sum(s.get("duration_seconds", 0) for s in stretching_sessions if s.get("completed"))
    
    # Score de discipline (% de séances complétées avec échauffement ET étirements)
    workout_sessions = await db.workout_sessions.find({"user_id": user_id, "completed": True}).to_list(100)
    total_workouts = len(workout_sessions)
    
    discipline_score = 0
    if total_workouts > 0:
        # Un utilisateur discipliné fait échauffement + étirements pour chaque séance
        discipline_score = min(100, round((warmup_completed + stretching_completed) / (total_workouts * 2) * 100, 1))
    
    return {
        "user": user,
        "sessions": sessions,
        "stats": {
            "warmup": {
                "total": len(warmup_sessions),
                "completed": warmup_completed,
                "total_time_seconds": total_warmup_time
            },
            "stretching": {
                "total": len(stretching_sessions),
                "completed": stretching_completed,
                "total_time_seconds": total_stretching_time
            },
            "discipline_score": discipline_score,
            "total_workouts": total_workouts
        }
    }

@api_router.get("/admin/analytics/evolution")
async def admin_get_evolution_data(admin: User = Depends(verify_admin)):
    """Admin: Données d'évolution pour les graphiques (7 derniers jours)"""
    from datetime import timedelta
    
    # Get last 7 days
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=7)
    
    # Aggregate workout sessions by day
    workout_pipeline = [
        {"$match": {"started_at": {"$gte": start_date.isoformat()}}},
        {"$addFields": {
            "date": {"$dateToString": {"format": "%Y-%m-%d", "date": {"$dateFromString": {"dateString": "$started_at"}}}}
        }},
        {"$group": {
            "_id": "$date",
            "total_sessions": {"$sum": 1},
            "completed_sessions": {"$sum": {"$cond": ["$completed", 1, 0]}},
            "total_duration": {"$sum": "$duration_seconds"}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    workout_data = await db.workout_sessions.aggregate(workout_pipeline).to_list(30)
    
    # Aggregate routine sessions by day
    routine_pipeline = [
        {"$match": {"started_at": {"$gte": start_date.isoformat()}}},
        {"$addFields": {
            "date": {"$dateToString": {"format": "%Y-%m-%d", "date": {"$dateFromString": {"dateString": "$started_at"}}}}
        }},
        {"$group": {
            "_id": {"date": "$date", "type": "$routine_type"},
            "total": {"$sum": 1},
            "completed": {"$sum": {"$cond": ["$completed", 1, 0]}}
        }},
        {"$sort": {"_id.date": 1}}
    ]
    
    routine_data = await db.routine_sessions.aggregate(routine_pipeline).to_list(60)
    
    # Format data for charts
    days = []
    for i in range(7):
        day = (start_date + timedelta(days=i+1)).strftime("%Y-%m-%d")
        day_name = (start_date + timedelta(days=i+1)).strftime("%a")
        
        workout_day = next((w for w in workout_data if w["_id"] == day), None)
        warmup_day = next((r for r in routine_data if r["_id"]["date"] == day and r["_id"]["type"] == "warmup"), None)
        stretching_day = next((r for r in routine_data if r["_id"]["date"] == day and r["_id"]["type"] == "stretching"), None)
        
        days.append({
            "date": day,
            "day": day_name,
            "workouts": workout_day["total_sessions"] if workout_day else 0,
            "workouts_completed": workout_day["completed_sessions"] if workout_day else 0,
            "warmups": warmup_day["total"] if warmup_day else 0,
            "warmups_completed": warmup_day["completed"] if warmup_day else 0,
            "stretching": stretching_day["total"] if stretching_day else 0,
            "stretching_completed": stretching_day["completed"] if stretching_day else 0,
            "duration_minutes": round(workout_day["total_duration"] / 60, 1) if workout_day else 0
        })
    
    return {"evolution": days}

@api_router.get("/admin/user/{user_id}/evolution")
async def admin_get_user_evolution(user_id: str, admin: User = Depends(verify_admin)):
    """Admin: Données d'évolution d'un utilisateur spécifique"""
    from datetime import timedelta
    
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=30)
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "name": 1, "email": 1})
    
    # Get all workout sessions for this user
    workout_sessions = await db.workout_sessions.find({
        "user_id": user_id,
        "started_at": {"$gte": start_date.isoformat()}
    }, {"_id": 0}).sort("started_at", 1).to_list(100)
    
    # Get all routine sessions for this user
    routine_sessions = await db.routine_sessions.find({
        "user_id": user_id,
        "started_at": {"$gte": start_date.isoformat()}
    }, {"_id": 0}).sort("started_at", 1).to_list(200)
    
    # Aggregate by week
    weeks_data = {}
    for session in workout_sessions:
        date = datetime.fromisoformat(session["started_at"].replace('Z', '+00:00'))
        week_start = (date - timedelta(days=date.weekday())).strftime("%Y-%m-%d")
        
        if week_start not in weeks_data:
            weeks_data[week_start] = {
                "week": week_start,
                "workouts": 0,
                "workouts_completed": 0,
                "warmups": 0,
                "warmups_completed": 0,
                "stretching": 0,
                "stretching_completed": 0,
                "total_duration": 0,
                "discipline_score": 0
            }
        
        weeks_data[week_start]["workouts"] += 1
        if session.get("completed"):
            weeks_data[week_start]["workouts_completed"] += 1
            weeks_data[week_start]["total_duration"] += session.get("duration_seconds", 0)
    
    for session in routine_sessions:
        date = datetime.fromisoformat(session["started_at"].replace('Z', '+00:00'))
        week_start = (date - timedelta(days=date.weekday())).strftime("%Y-%m-%d")
        
        if week_start not in weeks_data:
            weeks_data[week_start] = {
                "week": week_start,
                "workouts": 0,
                "workouts_completed": 0,
                "warmups": 0,
                "warmups_completed": 0,
                "stretching": 0,
                "stretching_completed": 0,
                "total_duration": 0,
                "discipline_score": 0
            }
        
        if session.get("routine_type") == "warmup":
            weeks_data[week_start]["warmups"] += 1
            if session.get("completed"):
                weeks_data[week_start]["warmups_completed"] += 1
        else:
            weeks_data[week_start]["stretching"] += 1
            if session.get("completed"):
                weeks_data[week_start]["stretching_completed"] += 1
    
    # Calculate discipline score per week
    for week in weeks_data.values():
        if week["workouts_completed"] > 0:
            week["discipline_score"] = min(100, round(
                (week["warmups_completed"] + week["stretching_completed"]) / (week["workouts_completed"] * 2) * 100, 1
            ))
        week["total_duration"] = round(week["total_duration"] / 60, 1)  # Convert to minutes
    
    return {
        "user": user,
        "evolution": sorted(weeks_data.values(), key=lambda x: x["week"])
    }

@api_router.get("/admin/workout/{workout_id}/analytics")
async def admin_get_workout_analytics(workout_id: str, admin: User = Depends(verify_admin)):
    """Admin: Analytiques détaillées d'une séance spécifique"""
    workout = await db.workouts.find_one({"workout_id": workout_id}, {"_id": 0})
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    # Get all sessions for this workout
    sessions = await db.workout_sessions.find(
        {"workout_id": workout_id}, 
        {"_id": 0}
    ).sort("started_at", -1).to_list(200)
    
    # Aggregate stats
    total_sessions = len(sessions)
    completed_sessions = len([s for s in sessions if s.get("completed")])
    total_duration = sum(s.get("duration_seconds", 0) for s in sessions if s.get("completed"))
    avg_duration = round(total_duration / completed_sessions, 0) if completed_sessions > 0 else 0
    
    # Users who did this workout
    user_ids = list(set(s.get("user_id") for s in sessions))
    users_stats = []
    
    for uid in user_ids[:20]:  # Limit to 20 users
        user = await db.users.find_one({"user_id": uid}, {"_id": 0, "name": 1, "email": 1})
        user_sessions = [s for s in sessions if s.get("user_id") == uid]
        user_completed = len([s for s in user_sessions if s.get("completed")])
        user_duration = sum(s.get("duration_seconds", 0) for s in user_sessions if s.get("completed"))
        
        users_stats.append({
            "user_id": uid,
            "name": user.get("name", "Unknown") if user else "Unknown",
            "email": user.get("email", "") if user else "",
            "total_sessions": len(user_sessions),
            "completed": user_completed,
            "total_duration_minutes": round(user_duration / 60, 1)
        })
    
    # Sort by completed sessions
    users_stats.sort(key=lambda x: x["completed"], reverse=True)
    
    return {
        "workout": {
            "workout_id": workout_id,
            "title": workout.get("title", ""),
            "level": workout.get("level", ""),
            "duration": workout.get("duration", 0)
        },
        "stats": {
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "completion_rate": round(completed_sessions / total_sessions * 100, 1) if total_sessions > 0 else 0,
            "avg_duration_seconds": avg_duration,
            "total_duration_minutes": round(total_duration / 60, 1)
        },
        "users": users_stats,
        "recent_sessions": sessions[:20]
    }


# ==================== USER EVOLUTION (FOR SUBSCRIBERS) ====================

@api_router.get("/user/evolution")
async def get_user_evolution(current_user: User = Depends(get_current_user)):
    """Get current user's evolution data for personal dashboard"""
    from datetime import timedelta
    
    user_id = current_user.user_id
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=30)
    
    # Get workout sessions
    workout_sessions = await db.workout_sessions.find({
        "user_id": user_id,
        "started_at": {"$gte": start_date.isoformat()}
    }, {"_id": 0}).sort("started_at", 1).to_list(100)
    
    # Get routine sessions
    routine_sessions = await db.routine_sessions.find({
        "user_id": user_id,
        "started_at": {"$gte": start_date.isoformat()}
    }, {"_id": 0}).sort("started_at", 1).to_list(200)
    
    # Daily data for last 7 days
    daily_data = []
    for i in range(7):
        day = (end_date - timedelta(days=6-i)).strftime("%Y-%m-%d")
        day_name = (end_date - timedelta(days=6-i)).strftime("%a")
        
        day_workouts = [s for s in workout_sessions if s.get("started_at", "").startswith(day)]
        day_warmups = [s for s in routine_sessions if s.get("started_at", "").startswith(day) and s.get("routine_type") == "warmup"]
        day_stretching = [s for s in routine_sessions if s.get("started_at", "").startswith(day) and s.get("routine_type") == "stretching"]
        
        daily_data.append({
            "date": day,
            "day": day_name,
            "workouts": len([s for s in day_workouts if s.get("completed")]),
            "warmups": len([s for s in day_warmups if s.get("completed")]),
            "stretching": len([s for s in day_stretching if s.get("completed")]),
            "duration_minutes": round(sum(s.get("duration_seconds", 0) for s in day_workouts if s.get("completed")) / 60, 1)
        })
    
    # Weekly data for last 4 weeks
    weekly_data = []
    for week_num in range(4):
        week_start = end_date - timedelta(days=(3-week_num)*7 + end_date.weekday())
        week_end = week_start + timedelta(days=7)
        week_label = f"Sem {week_num + 1}"
        
        week_workouts = [s for s in workout_sessions 
                        if week_start.strftime("%Y-%m-%d") <= s.get("started_at", "")[:10] < week_end.strftime("%Y-%m-%d")]
        week_warmups = [s for s in routine_sessions 
                       if week_start.strftime("%Y-%m-%d") <= s.get("started_at", "")[:10] < week_end.strftime("%Y-%m-%d") 
                       and s.get("routine_type") == "warmup"]
        week_stretching = [s for s in routine_sessions 
                          if week_start.strftime("%Y-%m-%d") <= s.get("started_at", "")[:10] < week_end.strftime("%Y-%m-%d")
                          and s.get("routine_type") == "stretching"]
        
        completed_workouts = len([s for s in week_workouts if s.get("completed")])
        completed_warmups = len([s for s in week_warmups if s.get("completed")])
        completed_stretching = len([s for s in week_stretching if s.get("completed")])
        
        discipline_score = 0
        if completed_workouts > 0:
            discipline_score = min(100, round((completed_warmups + completed_stretching) / (completed_workouts * 2) * 100, 1))
        
        weekly_data.append({
            "week": week_label,
            "workouts": completed_workouts,
            "warmups": completed_warmups,
            "stretching": completed_stretching,
            "discipline_score": discipline_score,
            "duration_minutes": round(sum(s.get("duration_seconds", 0) for s in week_workouts if s.get("completed")) / 60, 1)
        })
    
    # Overall stats
    total_workouts = len([s for s in workout_sessions if s.get("completed")])
    total_warmups = len([s for s in routine_sessions if s.get("completed") and s.get("routine_type") == "warmup"])
    total_stretching = len([s for s in routine_sessions if s.get("completed") and s.get("routine_type") == "stretching"])
    total_duration = sum(s.get("duration_seconds", 0) for s in workout_sessions if s.get("completed"))
    
    overall_discipline = 0
    if total_workouts > 0:
        overall_discipline = min(100, round((total_warmups + total_stretching) / (total_workouts * 2) * 100, 1))
    
    # Streak calculation
    streak = 0
    for i in range(30):
        day = (end_date - timedelta(days=i)).strftime("%Y-%m-%d")
        day_has_workout = any(s.get("started_at", "").startswith(day) and s.get("completed") for s in workout_sessions)
        if day_has_workout:
            streak += 1
        else:
            break
    
    return {
        "daily": daily_data,
        "weekly": weekly_data,
        "stats": {
            "total_workouts": total_workouts,
            "total_warmups": total_warmups,
            "total_stretching": total_stretching,
            "total_duration_minutes": round(total_duration / 60, 1),
            "discipline_score": overall_discipline,
            "current_streak": streak
        }
    }


# ==================== ADMIN: ALL SUBSCRIBERS EVOLUTION ====================

@api_router.get("/admin/all-subscribers-evolution")
async def admin_get_all_subscribers_evolution(admin: User = Depends(verify_admin)):
    """Admin: Get evolution data for all subscribers"""
    from datetime import timedelta
    
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=30)
    
    # Get all users with subscription
    users = await db.users.find(
        {"subscription": {"$exists": True, "$ne": None}},
        {"_id": 0, "user_id": 1, "name": 1, "email": 1, "subscription": 1}
    ).to_list(100)
    
    subscribers_data = []
    
    for user in users:
        user_id = user.get("user_id")
        
        # Get last activity
        last_workout = await db.workout_sessions.find_one(
            {"user_id": user_id},
            {"_id": 0, "started_at": 1}
        , sort=[("started_at", -1)])
        
        # Count sessions
        workout_count = await db.workout_sessions.count_documents({
            "user_id": user_id,
            "completed": True,
            "started_at": {"$gte": start_date.isoformat()}
        })
        
        warmup_count = await db.routine_sessions.count_documents({
            "user_id": user_id,
            "routine_type": "warmup",
            "completed": True,
            "started_at": {"$gte": start_date.isoformat()}
        })
        
        stretching_count = await db.routine_sessions.count_documents({
            "user_id": user_id,
            "routine_type": "stretching",
            "completed": True,
            "started_at": {"$gte": start_date.isoformat()}
        })
        
        # Calculate discipline score
        discipline_score = 0
        if workout_count > 0:
            discipline_score = min(100, round((warmup_count + stretching_count) / (workout_count * 2) * 100, 1))
        
        # Calculate days since last activity
        days_inactive = 999
        if last_workout:
            last_date = datetime.fromisoformat(last_workout["started_at"].replace('Z', '+00:00'))
            days_inactive = (end_date - last_date).days
        
        subscribers_data.append({
            "user_id": user_id,
            "name": user.get("name", "Unknown"),
            "email": user.get("email", ""),
            "subscription": user.get("subscription", {}).get("plan", "none"),
            "workouts_30d": workout_count,
            "warmups_30d": warmup_count,
            "stretching_30d": stretching_count,
            "discipline_score": discipline_score,
            "days_inactive": days_inactive,
            "last_activity": last_workout.get("started_at") if last_workout else None,
            "status": "active" if days_inactive <= 3 else "warning" if days_inactive <= 7 else "inactive"
        })
    
    # Sort by days inactive (most inactive first)
    subscribers_data.sort(key=lambda x: (-x["days_inactive"] if x["days_inactive"] < 999 else 0, -x["discipline_score"]))
    
    return {"subscribers": subscribers_data}


# ==================== AUTOMATIC INACTIVITY ALERTS ====================

@api_router.post("/admin/send-inactivity-alerts")
async def admin_send_inactivity_alerts(
    days_threshold: int = 3,
    admin: User = Depends(verify_admin)
):
    """Admin: Send email alerts to inactive subscribers"""
    from datetime import timedelta
    
    end_date = datetime.now(timezone.utc)
    threshold_date = end_date - timedelta(days=days_threshold)
    
    # Get all active subscribers
    users = await db.users.find(
        {"subscription": {"$exists": True, "$ne": None}},
        {"_id": 0, "user_id": 1, "name": 1, "email": 1}
    ).to_list(100)
    
    sent_count = 0
    failed_count = 0
    already_sent = 0
    
    for user in users:
        user_id = user.get("user_id")
        user_email = user.get("email")
        user_name = user.get("name", "Membre")
        
        # Check last workout
        last_workout = await db.workout_sessions.find_one(
            {"user_id": user_id},
            {"_id": 0, "started_at": 1}
        , sort=[("started_at", -1)])
        
        # If no workout or last workout is older than threshold
        should_alert = False
        days_inactive = 0
        
        if not last_workout:
            should_alert = True
            days_inactive = 30  # Assume very inactive
        else:
            last_date = datetime.fromisoformat(last_workout["started_at"].replace('Z', '+00:00'))
            days_inactive = (end_date - last_date).days
            if days_inactive >= days_threshold:
                should_alert = True
        
        if should_alert:
            # Check if we already sent an alert recently (within 3 days)
            recent_alert = await db.inactivity_alerts.find_one({
                "user_id": user_id,
                "sent_at": {"$gte": (end_date - timedelta(days=3)).isoformat()}
            })
            
            if recent_alert:
                already_sent += 1
                continue
            
            # Send email
            try:
                email_html = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; background-color: #09090b; color: #ffffff; padding: 20px; }}
                        .container {{ max-width: 600px; margin: 0 auto; background: #121212; border-radius: 12px; padding: 30px; }}
                        .header {{ text-align: center; margin-bottom: 30px; }}
                        .logo {{ font-size: 28px; font-weight: bold; color: #EF4444; }}
                        .message {{ font-size: 16px; line-height: 1.6; color: #d1d5db; }}
                        .highlight {{ color: #EF4444; font-weight: bold; }}
                        .cta-button {{ display: inline-block; background: linear-gradient(to right, #EF4444, #DC2626); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }}
                        .stats {{ background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                        .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">FITMAXPRO</div>
                        </div>
                        <div class="message">
                            <p>Salut <strong>{user_name}</strong> 👋</p>
                            <p>Nous avons remarqué que tu n'as pas fait d'entraînement depuis <span class="highlight">{days_inactive} jours</span>.</p>
                            <p>Ton corps a besoin de bouger ! Même 15 minutes d'exercice peuvent faire une grande différence. 💪</p>
                            <div class="stats">
                                <p>🔥 <strong>Rappel :</strong> La régularité est la clé du succès !</p>
                                <p>📈 Ne laisse pas ta progression s'arrêter maintenant.</p>
                            </div>
                            <p style="text-align: center;">
                                <a href="{BACKEND_URL.replace('/api', '')}/workouts" class="cta-button">
                                    Reprendre l'entraînement
                                </a>
                            </p>
                            <p>Ton coach est là pour t'aider. N'hésite pas à lui envoyer un message si tu as besoin de conseils !</p>
                        </div>
                        <div class="footer">
                            <p>© 2026 FitMaxPro - Ton partenaire fitness</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                
                email_response = resend.Emails.send({
                    "from": f"FitMaxPro <{os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')}>",
                    "to": [user_email],
                    "subject": f"💪 {user_name}, tu nous manques ! Reprends ton entraînement",
                    "html": email_html
                })
                
                # Log the alert
                await db.inactivity_alerts.insert_one({
                    "user_id": user_id,
                    "user_email": user_email,
                    "days_inactive": days_inactive,
                    "sent_at": end_date.isoformat(),
                    "email_id": email_response.get("id")
                })
                
                sent_count += 1
                
            except Exception as e:
                print(f"Failed to send alert to {user_email}: {e}")
                failed_count += 1
    
    return {
        "message": f"Alertes envoyées",
        "sent": sent_count,
        "failed": failed_count,
        "already_sent_recently": already_sent,
        "threshold_days": days_threshold
    }

@api_router.get("/admin/inactivity-alerts")
async def admin_get_inactivity_alerts(admin: User = Depends(verify_admin)):
    """Admin: Get history of inactivity alerts sent"""
    alerts = await db.inactivity_alerts.find(
        {},
        {"_id": 0}
    ).sort("sent_at", -1).to_list(100)
    
    return {"alerts": alerts}


# ==================== REVIEWS/AVIS SYSTEM ====================

class ReviewCreate(BaseModel):
    rating: int  # 1-5 stars
    title: str
    content: str
    is_public: bool = True

@api_router.post("/reviews")
async def create_review(review: ReviewCreate, current_user: User = Depends(get_current_user)):
    """Create a new review"""
    review_data = {
        "review_id": str(uuid.uuid4()),
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "rating": min(5, max(1, review.rating)),
        "title": review.title,
        "content": review.content,
        "is_public": review.is_public,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "admin_response": None,
        "admin_response_at": None
    }
    await db.reviews.insert_one(review_data)
    return {"message": "Review created", "review_id": review_data["review_id"]}

@api_router.get("/reviews")
async def get_public_reviews():
    """Get all public reviews"""
    reviews = await db.reviews.find(
        {"is_public": True},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Calculate average rating
    all_reviews = await db.reviews.find({}, {"rating": 1}).to_list(1000)
    avg_rating = sum(r.get("rating", 0) for r in all_reviews) / len(all_reviews) if all_reviews else 0
    
    return {
        "reviews": reviews,
        "total_reviews": len(all_reviews),
        "average_rating": round(avg_rating, 1)
    }

@api_router.get("/user/reviews")
async def get_user_reviews(current_user: User = Depends(get_current_user)):
    """Get current user's reviews"""
    reviews = await db.reviews.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {"reviews": reviews}

@api_router.get("/admin/reviews")
async def admin_get_all_reviews(admin: User = Depends(verify_admin)):
    """Admin: Get all reviews"""
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    
    # Calculate stats
    total = len(reviews)
    avg_rating = sum(r.get("rating", 0) for r in reviews) / total if total else 0
    rating_distribution = {i: len([r for r in reviews if r.get("rating") == i]) for i in range(1, 6)}
    
    return {
        "reviews": reviews,
        "stats": {
            "total": total,
            "average_rating": round(avg_rating, 1),
            "distribution": rating_distribution
        }
    }

@api_router.put("/admin/reviews/{review_id}/respond")
async def admin_respond_to_review(review_id: str, response: str, admin: User = Depends(verify_admin)):
    """Admin: Respond to a review"""
    await db.reviews.update_one(
        {"review_id": review_id},
        {"$set": {
            "admin_response": response,
            "admin_response_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Response added"}

@api_router.delete("/admin/reviews/{review_id}")
async def admin_delete_review(review_id: str, admin: User = Depends(verify_admin)):
    """Admin: Delete a review"""
    await db.reviews.delete_one({"review_id": review_id})
    return {"message": "Review deleted"}


# ==================== SOCIAL MEDIA LINKS ====================

@api_router.get("/social-links")
async def get_social_links():
    """Get social media links"""
    links = await db.settings.find_one({"type": "social_links"}, {"_id": 0})
    return links or {"type": "social_links", "links": {}}

@api_router.put("/admin/social-links")
async def admin_update_social_links(links: dict, admin: User = Depends(verify_admin)):
    """Admin: Update social media links"""
    await db.settings.update_one(
        {"type": "social_links"},
        {"$set": {"type": "social_links", "links": links}},
        upsert=True
    )
    return {"message": "Social links updated"}


# ==================== PROGRESS PHOTOS (BEFORE/AFTER) ====================

class ProgressPhotoCreate(BaseModel):
    photo_type: str  # "before" or "after"
    photo_url: str
    weight_kg: Optional[float] = None
    notes: Optional[str] = None

@api_router.post("/progress-photos")
async def create_progress_photo(photo: ProgressPhotoCreate, current_user: User = Depends(get_current_user)):
    """Upload a progress photo"""
    photo_data = {
        "photo_id": str(uuid.uuid4()),
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "photo_type": photo.photo_type,
        "photo_url": photo.photo_url,
        "weight_kg": photo.weight_kg,
        "notes": photo.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.progress_photos.insert_one(photo_data)
    return {"message": "Photo saved", "photo_id": photo_data["photo_id"]}

@api_router.get("/progress-photos")
async def get_user_progress_photos(current_user: User = Depends(get_current_user)):
    """Get current user's progress photos"""
    photos = await db.progress_photos.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {"photos": photos}

@api_router.delete("/progress-photos/{photo_id}")
async def delete_progress_photo(photo_id: str, current_user: User = Depends(get_current_user)):
    """Delete a progress photo"""
    await db.progress_photos.delete_one({
        "photo_id": photo_id,
        "user_id": current_user.user_id
    })
    return {"message": "Photo deleted"}

@api_router.get("/admin/progress-photos")
async def admin_get_all_progress_photos(admin: User = Depends(verify_admin)):
    """Admin: Get all users' progress photos"""
    photos = await db.progress_photos.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    
    # Group by user
    users_photos = {}
    for photo in photos:
        user_id = photo.get("user_id")
        if user_id not in users_photos:
            users_photos[user_id] = {
                "user_id": user_id,
                "user_name": photo.get("user_name", "Unknown"),
                "before_photos": [],
                "after_photos": []
            }
        if photo.get("photo_type") == "before":
            users_photos[user_id]["before_photos"].append(photo)
        else:
            users_photos[user_id]["after_photos"].append(photo)
    
    return {"users": list(users_photos.values())}

@api_router.get("/admin/user/{user_id}/progress-photos")
async def admin_get_user_progress_photos(user_id: str, admin: User = Depends(verify_admin)):
    """Admin: Get specific user's progress photos"""
    photos = await db.progress_photos.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(50)
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "name": 1, "email": 1})
    
    before_photos = [p for p in photos if p.get("photo_type") == "before"]
    after_photos = [p for p in photos if p.get("photo_type") == "after"]
    
    return {
        "user": user,
        "before_photos": before_photos,
        "after_photos": after_photos
    }


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# ==================== LIVE STREAMING ENDPOINTS ====================

class LiveCreate(BaseModel):
    title: str
    description: str = ""
    vip_only: bool = False

class LiveChat(BaseModel):
    message: str

@api_router.get("/lives")
async def get_active_lives(current_user: User = Depends(get_current_user)):
    """Get all active live sessions"""
    lives = await db.lives.find({"status": "active"}).to_list(100)
    for live in lives:
        live['live_id'] = str(live.get('live_id', live.get('_id')))
        live.pop('_id', None)
    return lives

@api_router.post("/lives")
async def create_live(live: LiveCreate, current_user: User = Depends(get_current_user)):
    """Create a new live session (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admin can start lives")
    
    live_id = f"live_{uuid.uuid4().hex[:12]}"
    live_doc = {
        "live_id": live_id,
        "title": live.title,
        "description": live.description,
        "vip_only": live.vip_only,
        "host_id": current_user.user_id,
        "host_name": current_user.name,
        "status": "active",
        "viewer_count": 0,
        "viewers": [],
        "chat_messages": [],
        "created_at": datetime.utcnow().isoformat(),
        "started_at": datetime.utcnow().isoformat()
    }
    
    await db.lives.insert_one(live_doc)
    live_doc.pop('_id', None)
    return live_doc

@api_router.post("/lives/{live_id}/join")
async def join_live(live_id: str, current_user: User = Depends(get_current_user)):
    """Join a live session as viewer"""
    live = await db.lives.find_one({"live_id": live_id, "status": "active"})
    if not live:
        raise HTTPException(status_code=404, detail="Live session not found")
    
    # Check VIP access
    if live.get('vip_only'):
        user_sub = current_user.subscription or {}
        if user_sub.get('type') != 'vip' and current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="This session is VIP only")
    
    # Add viewer
    await db.lives.update_one(
        {"live_id": live_id},
        {
            "$addToSet": {"viewers": current_user.user_id},
            "$inc": {"viewer_count": 1}
        }
    )
    
    return {"success": True, "token": f"viewer_{uuid.uuid4().hex[:8]}"}

@api_router.post("/lives/{live_id}/leave")
async def leave_live(live_id: str, current_user: User = Depends(get_current_user)):
    """Leave a live session"""
    await db.lives.update_one(
        {"live_id": live_id},
        {
            "$pull": {"viewers": current_user.user_id},
            "$inc": {"viewer_count": -1}
        }
    )
    return {"success": True}

@api_router.post("/lives/{live_id}/end")
async def end_live(live_id: str, current_user: User = Depends(get_current_user)):
    """End a live session (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admin can end lives")
    
    result = await db.lives.update_one(
        {"live_id": live_id},
        {
            "$set": {
                "status": "ended",
                "ended_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Live not found")
    
    return {"success": True}

@api_router.post("/lives/{live_id}/chat")
async def send_chat_message(live_id: str, chat: LiveChat, current_user: User = Depends(get_current_user)):
    """Send a chat message in a live session"""
    message_doc = {
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "message": chat.message,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await db.lives.update_one(
        {"live_id": live_id},
        {"$push": {"chat_messages": message_doc}}
    )
    
    return {"success": True}

@api_router.get("/lives/{live_id}/chat")
async def get_chat_messages(live_id: str, current_user: User = Depends(get_current_user)):
    """Get chat messages for a live session"""
    live = await db.lives.find_one({"live_id": live_id}, {"chat_messages": 1})
    if not live:
        raise HTTPException(status_code=404, detail="Live not found")
    return live.get('chat_messages', [])

@api_router.get("/admin/lives/history")
async def get_live_history(current_user: User = Depends(get_current_user)):
    """Get live session history (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    lives = await db.lives.find().sort("created_at", -1).to_list(50)
    for live in lives:
        live['live_id'] = str(live.get('live_id', live.get('_id')))
        live.pop('_id', None)
    return lives

# ==================== CALL LOGGING ENDPOINTS ====================

class CallLog(BaseModel):
    call_type: str  # 'audio' or 'video'
    duration: int
    callee_id: str

@api_router.post("/calls/log")
async def log_call(call: CallLog, current_user: User = Depends(get_current_user)):
    """Log a call for analytics"""
    call_doc = {
        "call_id": f"call_{uuid.uuid4().hex[:12]}",
        "caller_id": current_user.user_id,
        "caller_name": current_user.name,
        "callee_id": call.callee_id,
        "call_type": call.call_type,
        "duration": call.duration,
        "status": "completed",
        "created_at": datetime.utcnow().isoformat()
    }
    
    await db.calls.insert_one(call_doc)
    call_doc.pop('_id', None)
    return {"success": True, "call_id": call_doc["call_id"]}

@api_router.get("/admin/calls/history")
async def get_call_history(current_user: User = Depends(get_current_user)):
    """Get call history (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    calls = await db.calls.find().sort("created_at", -1).to_list(100)
    for call in calls:
        call['call_id'] = str(call.get('call_id', call.get('_id')))
        call.pop('_id', None)
    return calls


# ==================== RUNNING / COURSE À PIED ====================

class RunningSession(BaseModel):
    distance: float  # en km
    duration: int  # en secondes
    pace: Optional[float] = None  # min/km
    calories: Optional[int] = None
    route_points: Optional[List[Dict]] = None  # [{lat, lng}]
    notes: Optional[str] = None

@api_router.post("/running/log")
async def log_running_session(run: RunningSession, current_user: User = Depends(get_current_user)):
    """Enregistrer une session de course"""
    run_id = f"run_{uuid.uuid4().hex[:12]}"
    
    # Calculer l'allure si non fournie
    pace = run.pace
    if not pace and run.distance > 0:
        pace = (run.duration / 60) / run.distance  # min/km
    
    # Calculer les calories si non fournies (estimation: ~60 cal/km)
    calories = run.calories
    if not calories:
        calories = int(run.distance * 60)
    
    run_doc = {
        "run_id": run_id,
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "distance": run.distance,
        "duration": run.duration,
        "pace": pace,
        "calories": calories,
        "route_points": run.route_points or [],
        "notes": run.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.running_sessions.insert_one(run_doc)
    
    # Trigger notifications in background
    try:
        # Calculate weekly stats for challenge notifications
        today = datetime.now(timezone.utc)
        start_of_week = today - timedelta(days=today.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        
        week_runs = await db.running_sessions.find({
            "user_id": current_user.user_id,
            "created_at": {"$gte": start_of_week.isoformat()}
        }).to_list(100)
        
        weekly_stats = {
            "distance": sum(r.get("distance", 0) for r in week_runs),
            "runs": len(week_runs),
            "calories": sum(r.get("calories", 0) for r in week_runs)
        }
        
        # Check challenge progress notifications
        asyncio.create_task(check_and_notify_challenges(current_user.user_id, weekly_stats))
        
        # Check leaderboard changes
        total_distance = sum(r.get("distance", 0) for r in await db.running_sessions.find({"user_id": current_user.user_id}).to_list(500))
        asyncio.create_task(check_leaderboard_changes(current_user.user_id, current_user.name, total_distance))
    except Exception as e:
        print(f"Notification check error: {e}")
    
    return {
        "success": True,
        "run_id": run_id,
        "distance": run.distance,
        "duration": run.duration,
        "pace": pace,
        "calories": calories
    }

@api_router.get("/running/history")
async def get_running_history(current_user: User = Depends(get_current_user)):
    """Récupérer l'historique des courses de l'utilisateur"""
    runs = await db.running_sessions.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return runs

@api_router.get("/running/stats")
async def get_running_stats(current_user: User = Depends(get_current_user)):
    """Récupérer les statistiques de course de l'utilisateur"""
    runs = await db.running_sessions.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).to_list(500)
    
    if not runs:
        return {
            "total_runs": 0,
            "total_distance": 0,
            "total_time": 0,
            "total_calories": 0,
            "avg_pace": None,
            "best_pace": None,
            "best_distance": 0,
            "avg_distance": 0
        }
    
    total_runs = len(runs)
    total_distance = sum(r.get("distance", 0) for r in runs)
    total_time = sum(r.get("duration", 0) for r in runs)
    total_calories = sum(r.get("calories", 0) for r in runs)
    
    # Meilleures performances
    paces = [r.get("pace") for r in runs if r.get("pace") and r.get("pace") > 0]
    best_pace = min(paces) if paces else None
    avg_pace = sum(paces) / len(paces) if paces else None
    
    distances = [r.get("distance", 0) for r in runs]
    best_distance = max(distances) if distances else 0
    avg_distance = sum(distances) / len(distances) if distances else 0
    
    # Stats par semaine (7 derniers jours)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    week_runs = [r for r in runs if datetime.fromisoformat(r.get("created_at", "2000-01-01").replace('Z', '+00:00')) > week_ago]
    weekly_distance = sum(r.get("distance", 0) for r in week_runs)
    weekly_runs = len(week_runs)
    
    return {
        "total_runs": total_runs,
        "total_distance": round(total_distance, 2),
        "total_time": total_time,
        "total_calories": total_calories,
        "avg_pace": round(avg_pace, 2) if avg_pace else None,
        "best_pace": round(best_pace, 2) if best_pace else None,
        "best_distance": round(best_distance, 2),
        "avg_distance": round(avg_distance, 2),
        "weekly_distance": round(weekly_distance, 2),
        "weekly_runs": weekly_runs
    }


# ==================== LEADERBOARD & CHALLENGES ====================

# Définition des défis hebdomadaires
WEEKLY_CHALLENGES = [
    {"id": "distance_5k", "name_fr": "5 km cette semaine", "name_en": "5 km this week", "type": "distance", "target": 5, "badge": "🏃", "points": 50},
    {"id": "distance_10k", "name_fr": "10 km cette semaine", "name_en": "10 km this week", "type": "distance", "target": 10, "badge": "🏅", "points": 100},
    {"id": "distance_20k", "name_fr": "20 km cette semaine", "name_en": "20 km this week", "type": "distance", "target": 20, "badge": "🏆", "points": 200},
    {"id": "runs_3", "name_fr": "3 courses cette semaine", "name_en": "3 runs this week", "type": "runs", "target": 3, "badge": "⭐", "points": 75},
    {"id": "runs_5", "name_fr": "5 courses cette semaine", "name_en": "5 runs this week", "type": "runs", "target": 5, "badge": "🌟", "points": 150},
    {"id": "calories_500", "name_fr": "500 calories brûlées", "name_en": "500 calories burned", "type": "calories", "target": 500, "badge": "🔥", "points": 60},
    {"id": "calories_1000", "name_fr": "1000 calories brûlées", "name_en": "1000 calories burned", "type": "calories", "target": 1000, "badge": "💪", "points": 120},
]

# Badges permanents
ACHIEVEMENT_BADGES = [
    {"id": "first_run", "name_fr": "Première course", "name_en": "First Run", "badge": "🎯", "description_fr": "Complétez votre première course", "description_en": "Complete your first run", "requirement": {"type": "total_runs", "value": 1}},
    {"id": "marathon_total", "name_fr": "Marathon", "name_en": "Marathon", "badge": "🏃‍♂️", "description_fr": "42 km cumulés", "description_en": "42 km total", "requirement": {"type": "total_distance", "value": 42}},
    {"id": "century", "name_fr": "Centenaire", "name_en": "Century", "badge": "💯", "description_fr": "100 km cumulés", "description_en": "100 km total", "requirement": {"type": "total_distance", "value": 100}},
    {"id": "dedicated", "name_fr": "Assidu", "name_en": "Dedicated", "badge": "📅", "description_fr": "10 courses complétées", "description_en": "10 runs completed", "requirement": {"type": "total_runs", "value": 10}},
    {"id": "speed_demon", "name_fr": "Éclair", "name_en": "Speed Demon", "badge": "⚡", "description_fr": "Allure sous 5 min/km", "description_en": "Pace under 5 min/km", "requirement": {"type": "best_pace", "value": 5}},
    {"id": "long_runner", "name_fr": "Endurant", "name_en": "Long Runner", "badge": "🦵", "description_fr": "Course de 10+ km", "description_en": "10+ km run", "requirement": {"type": "single_run_distance", "value": 10}},
    {"id": "calorie_burner", "name_fr": "Brûleur", "name_en": "Calorie Burner", "badge": "🔥", "description_fr": "5000 calories brûlées", "description_en": "5000 calories burned", "requirement": {"type": "total_calories", "value": 5000}},
]

@api_router.get("/running/leaderboard")
async def get_leaderboard(current_user: User = Depends(get_current_user)):
    """Classement public des coureurs"""
    pipeline = [
        {"$group": {
            "_id": "$user_id",
            "user_name": {"$first": "$user_name"},
            "total_distance": {"$sum": "$distance"},
            "total_runs": {"$sum": 1},
            "total_calories": {"$sum": "$calories"},
            "avg_pace": {"$avg": "$pace"},
            "best_pace": {"$min": "$pace"}
        }},
        {"$sort": {"total_distance": -1}},
        {"$limit": 50}
    ]
    
    leaderboard = await db.running_sessions.aggregate(pipeline).to_list(50)
    
    result = []
    for idx, runner in enumerate(leaderboard):
        result.append({
            "rank": idx + 1,
            "user_id": runner["_id"],
            "user_name": runner["user_name"],
            "total_distance": round(runner.get("total_distance", 0), 2),
            "total_runs": runner.get("total_runs", 0),
            "total_calories": runner.get("total_calories", 0),
            "avg_pace": round(runner.get("avg_pace", 0), 2) if runner.get("avg_pace") else None,
            "best_pace": round(runner.get("best_pace", 0), 2) if runner.get("best_pace") else None,
            "is_current_user": runner["_id"] == current_user.user_id
        })
    
    current_user_rank = None
    current_user_in_list = any(r["is_current_user"] for r in result)
    
    if not current_user_in_list:
        user_stats = await db.running_sessions.aggregate([
            {"$match": {"user_id": current_user.user_id}},
            {"$group": {"_id": None, "total_distance": {"$sum": "$distance"}}}
        ]).to_list(1)
        
        if user_stats:
            user_distance = user_stats[0].get("total_distance", 0)
            rank = await db.running_sessions.aggregate([
                {"$group": {"_id": "$user_id", "total_distance": {"$sum": "$distance"}}},
                {"$match": {"total_distance": {"$gt": user_distance}}},
                {"$count": "count"}
            ]).to_list(1)
            current_user_rank = (rank[0]["count"] if rank else 0) + 1
    
    return {
        "leaderboard": result,
        "current_user_rank": current_user_rank,
        "total_runners": await db.running_sessions.aggregate([{"$group": {"_id": "$user_id"}}, {"$count": "count"}]).to_list(1)
    }

@api_router.get("/running/challenges")
async def get_challenges(current_user: User = Depends(get_current_user)):
    """Récupérer les défis hebdomadaires et la progression"""
    today = datetime.now(timezone.utc)
    start_of_week = today - timedelta(days=today.weekday())
    start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
    
    week_runs = await db.running_sessions.find({
        "user_id": current_user.user_id,
        "created_at": {"$gte": start_of_week.isoformat()}
    }).to_list(100)
    
    weekly_distance = sum(r.get("distance", 0) for r in week_runs)
    weekly_runs = len(week_runs)
    weekly_calories = sum(r.get("calories", 0) for r in week_runs)
    
    challenges_progress = []
    for challenge in WEEKLY_CHALLENGES:
        if challenge["type"] == "distance":
            progress = weekly_distance
        elif challenge["type"] == "runs":
            progress = weekly_runs
        elif challenge["type"] == "calories":
            progress = weekly_calories
        else:
            progress = 0
        
        completed = progress >= challenge["target"]
        percentage = min(100, int((progress / challenge["target"]) * 100))
        
        challenges_progress.append({
            "id": challenge["id"],
            "name_fr": challenge["name_fr"],
            "name_en": challenge["name_en"],
            "badge": challenge["badge"],
            "points": challenge["points"],
            "target": challenge["target"],
            "progress": round(progress, 2),
            "percentage": percentage,
            "completed": completed,
            "type": challenge["type"]
        })
    
    challenges_progress.sort(key=lambda x: (x["completed"], -x["points"]))
    
    return {
        "challenges": challenges_progress,
        "weekly_stats": {
            "distance": round(weekly_distance, 2),
            "runs": weekly_runs,
            "calories": weekly_calories
        },
        "week_start": start_of_week.isoformat(),
        "week_end": (start_of_week + timedelta(days=6, hours=23, minutes=59, seconds=59)).isoformat()
    }

@api_router.get("/running/badges")
async def get_user_badges(current_user: User = Depends(get_current_user)):
    """Récupérer les badges de l'utilisateur"""
    pipeline = [
        {"$match": {"user_id": current_user.user_id}},
        {"$group": {
            "_id": None,
            "total_distance": {"$sum": "$distance"},
            "total_runs": {"$sum": 1},
            "total_calories": {"$sum": "$calories"},
            "best_pace": {"$min": "$pace"},
            "max_single_distance": {"$max": "$distance"}
        }}
    ]
    
    user_stats = await db.running_sessions.aggregate(pipeline).to_list(1)
    stats = user_stats[0] if user_stats else {
        "total_distance": 0,
        "total_runs": 0,
        "total_calories": 0,
        "best_pace": None,
        "max_single_distance": 0
    }
    
    badges = []
    for badge in ACHIEVEMENT_BADGES:
        req = badge["requirement"]
        unlocked = False
        progress = 0
        
        if req["type"] == "total_distance":
            progress = stats.get("total_distance", 0)
            unlocked = progress >= req["value"]
        elif req["type"] == "total_runs":
            progress = stats.get("total_runs", 0)
            unlocked = progress >= req["value"]
        elif req["type"] == "total_calories":
            progress = stats.get("total_calories", 0)
            unlocked = progress >= req["value"]
        elif req["type"] == "best_pace":
            progress = stats.get("best_pace") or 999
            unlocked = progress <= req["value"] and stats.get("total_runs", 0) > 0
        elif req["type"] == "single_run_distance":
            progress = stats.get("max_single_distance", 0)
            unlocked = progress >= req["value"]
        
        badges.append({
            "id": badge["id"],
            "name_fr": badge["name_fr"],
            "name_en": badge["name_en"],
            "badge": badge["badge"],
            "description_fr": badge["description_fr"],
            "description_en": badge["description_en"],
            "unlocked": unlocked,
            "progress": round(progress, 2) if isinstance(progress, float) else progress,
            "target": req["value"]
        })
    
    badges.sort(key=lambda x: (not x["unlocked"], x["id"]))
    unlocked_count = sum(1 for b in badges if b["unlocked"])
    
    return {
        "badges": badges,
        "unlocked_count": unlocked_count,
        "total_badges": len(badges),
        "user_stats": {
            "total_distance": round(stats.get("total_distance", 0), 2),
            "total_runs": stats.get("total_runs", 0),
            "total_calories": stats.get("total_calories", 0),
            "best_pace": round(stats.get("best_pace", 0), 2) if stats.get("best_pace") else None
        }
    }


# Routes with path parameters must come AFTER static routes
@api_router.get("/running/{run_id}")
async def get_running_session(run_id: str, current_user: User = Depends(get_current_user)):
    """Récupérer les détails d'une course spécifique"""
    run = await db.running_sessions.find_one(
        {"run_id": run_id, "user_id": current_user.user_id},
        {"_id": 0}
    )
    
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    return run

@api_router.delete("/running/{run_id}")
async def delete_running_session(run_id: str, current_user: User = Depends(get_current_user)):
    """Supprimer une course"""
    result = await db.running_sessions.delete_one(
        {"run_id": run_id, "user_id": current_user.user_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Run not found")
    
    return {"success": True, "message": "Run deleted"}

# ==================== ADMIN - RUNNING ANALYTICS ====================

@api_router.get("/admin/running/all")
async def admin_get_all_running(admin: User = Depends(verify_admin)):
    """Admin: Récupérer toutes les courses de tous les utilisateurs"""
    runs = await db.running_sessions.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    
    return {"runs": runs, "total": len(runs)}

@api_router.get("/admin/running/stats")
async def admin_get_running_stats(admin: User = Depends(verify_admin)):
    """Admin: Statistiques globales de course"""
    # Stats globales
    total_runs = await db.running_sessions.count_documents({})
    
    pipeline = [
        {"$group": {
            "_id": None,
            "total_distance": {"$sum": "$distance"},
            "total_time": {"$sum": "$duration"},
            "total_calories": {"$sum": "$calories"},
            "avg_distance": {"$avg": "$distance"},
            "avg_duration": {"$avg": "$duration"}
        }}
    ]
    
    global_stats = await db.running_sessions.aggregate(pipeline).to_list(1)
    
    if global_stats:
        stats = global_stats[0]
        stats.pop("_id", None)
        stats["total_runs"] = total_runs
        stats["total_distance"] = round(stats.get("total_distance", 0), 2)
        stats["avg_distance"] = round(stats.get("avg_distance", 0), 2)
    else:
        stats = {
            "total_runs": 0,
            "total_distance": 0,
            "total_time": 0,
            "total_calories": 0,
            "avg_distance": 0,
            "avg_duration": 0
        }
    
    # Top runners
    top_runners_pipeline = [
        {"$group": {
            "_id": "$user_id",
            "user_name": {"$first": "$user_name"},
            "total_distance": {"$sum": "$distance"},
            "total_runs": {"$sum": 1},
            "avg_pace": {"$avg": "$pace"}
        }},
        {"$sort": {"total_distance": -1}},
        {"$limit": 10}
    ]
    
    top_runners = await db.running_sessions.aggregate(top_runners_pipeline).to_list(10)
    
    for runner in top_runners:
        runner["user_id"] = runner.pop("_id")
        runner["total_distance"] = round(runner.get("total_distance", 0), 2)
        if runner.get("avg_pace"):
            runner["avg_pace"] = round(runner["avg_pace"], 2)
    
    return {
        "global_stats": stats,
        "top_runners": top_runners
    }

@api_router.get("/admin/running/user/{user_id}")
async def admin_get_user_running(user_id: str, admin: User = Depends(verify_admin)):
    """Admin: Historique de course d'un utilisateur spécifique"""
    runs = await db.running_sessions.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    
    # Stats de l'utilisateur
    total_distance = sum(r.get("distance", 0) for r in runs)
    total_time = sum(r.get("duration", 0) for r in runs)
    total_calories = sum(r.get("calories", 0) for r in runs)
    
    return {
        "user": {
            "user_id": user_id,
            "name": user.get("name") if user else "Unknown",
            "email": user.get("email") if user else ""
        },
        "runs": runs,
        "stats": {
            "total_runs": len(runs),
            "total_distance": round(total_distance, 2),
            "total_time": total_time,
            "total_calories": total_calories
        }
    }


# ==================== PUSH NOTIFICATIONS ====================

class PushSubscription(BaseModel):
    subscription: Dict

@api_router.post("/notifications/subscribe")
async def subscribe_notifications(data: PushSubscription, current_user: User = Depends(get_current_user)):
    """Subscribe user to push notifications"""
    subscription = data.subscription
    
    # Store subscription in database
    await db.push_subscriptions.update_one(
        {"user_id": current_user.user_id},
        {
            "$set": {
                "user_id": current_user.user_id,
                "subscription": subscription,
                "enabled": True,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    return {"success": True, "message": "Subscribed to notifications"}

@api_router.post("/notifications/unsubscribe")
async def unsubscribe_notifications(current_user: User = Depends(get_current_user)):
    """Unsubscribe user from push notifications"""
    await db.push_subscriptions.update_one(
        {"user_id": current_user.user_id},
        {"$set": {"enabled": False}}
    )
    
    return {"success": True, "message": "Unsubscribed from notifications"}

@api_router.get("/notifications/status")
async def get_notification_status(current_user: User = Depends(get_current_user)):
    """Get user's notification subscription status"""
    sub = await db.push_subscriptions.find_one(
        {"user_id": current_user.user_id},
        {"_id": 0}
    )
    
    return {
        "subscribed": sub is not None and sub.get("enabled", False),
        "subscription": sub.get("subscription") if sub else None
    }

async def send_push_notification(user_id: str, title: str, body: str, data: dict = None):
    """Send push notification to a specific user"""
    if not WEBPUSH_AVAILABLE:
        print(f"[Notification] Would send to {user_id}: {title} - {body}")
        return False
    
    sub = await db.push_subscriptions.find_one({"user_id": user_id, "enabled": True})
    if not sub:
        return False
    
    try:
        subscription_info = sub.get("subscription")
        payload = json.dumps({
            "title": title,
            "body": body,
            "icon": "/logo192.png",
            "badge": "/logo192.png",
            "data": data or {},
            "tag": f"fitmaxpro-{uuid.uuid4().hex[:8]}"
        })
        
        webpush(
            subscription_info=subscription_info,
            data=payload,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS
        )
        
        # Log notification
        await db.notification_logs.insert_one({
            "user_id": user_id,
            "title": title,
            "body": body,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "success": True
        })
        
        return True
    except WebPushException as e:
        print(f"Push notification failed: {e}")
        if e.response and e.response.status_code in [404, 410]:
            # Subscription expired, remove it
            await db.push_subscriptions.delete_one({"user_id": user_id})
        return False
    except Exception as e:
        print(f"Push notification error: {e}")
        return False

async def check_and_notify_challenges(user_id: str, weekly_stats: dict):
    """Check if user is close to completing challenges and send notifications"""
    challenges = [
        {"name": "5 km", "type": "distance", "target": 5, "threshold": 4},
        {"name": "10 km", "type": "distance", "target": 10, "threshold": 8},
        {"name": "20 km", "type": "distance", "target": 20, "threshold": 18},
        {"name": "3 courses", "type": "runs", "target": 3, "threshold": 2},
        {"name": "5 courses", "type": "runs", "target": 5, "threshold": 4},
        {"name": "500 calories", "type": "calories", "target": 500, "threshold": 400},
        {"name": "1000 calories", "type": "calories", "target": 1000, "threshold": 900},
    ]
    
    for challenge in challenges:
        progress = weekly_stats.get(challenge["type"], 0)
        
        # Check if close to completing (at threshold but not yet complete)
        if challenge["threshold"] <= progress < challenge["target"]:
            remaining = challenge["target"] - progress
            
            # Check if we already sent this notification
            recent_notif = await db.notification_logs.find_one({
                "user_id": user_id,
                "title": {"$regex": challenge["name"]},
                "sent_at": {"$gte": (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()}
            })
            
            if not recent_notif:
                if challenge["type"] == "distance":
                    body = f"Plus que {remaining:.1f} km pour compléter le défi '{challenge['name']}' ! 🏃"
                elif challenge["type"] == "runs":
                    body = f"Plus qu'1 course pour compléter le défi '{challenge['name']}' ! 💪"
                else:
                    body = f"Plus que {int(remaining)} calories pour le défi '{challenge['name']}' ! 🔥"
                
                await send_push_notification(
                    user_id,
                    f"🎯 Défi presque complété !",
                    body,
                    {"url": "/running", "type": "challenge_progress"}
                )

async def check_leaderboard_changes(user_id: str, user_name: str, new_distance: float):
    """Check if user passed someone in the leaderboard and notify them"""
    # Get users who were just passed
    passed_users = await db.running_sessions.aggregate([
        {"$group": {
            "_id": "$user_id",
            "user_name": {"$first": "$user_name"},
            "total_distance": {"$sum": "$distance"}
        }},
        {"$match": {
            "_id": {"$ne": user_id},
            "total_distance": {"$lt": new_distance, "$gt": new_distance - 10}  # Recently passed
        }}
    ]).to_list(10)
    
    for passed in passed_users:
        passed_id = passed["_id"]
        
        # Check if already notified recently
        recent = await db.notification_logs.find_one({
            "user_id": passed_id,
            "title": {"$regex": "classement"},
            "sent_at": {"$gte": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat()}
        })
        
        if not recent:
            await send_push_notification(
                passed_id,
                "📊 Changement au classement !",
                f"{user_name} vient de vous dépasser ! Courez pour reprendre votre place ! 🏃",
                {"url": "/running", "type": "leaderboard_change"}
            )

# Test notification endpoint
@api_router.post("/notifications/test")
async def test_notification(current_user: User = Depends(get_current_user)):
    """Send a test notification to the current user"""
    success = await send_push_notification(
        current_user.user_id,
        "🎉 Test de notification FitMaxPro",
        "Les notifications fonctionnent parfaitement ! Continuez à vous dépasser !",
        {"url": "/running", "type": "test"}
    )
    
    return {"success": success, "message": "Test notification sent" if success else "Failed to send"}

# Admin: Send notification to all users
class BroadcastNotification(BaseModel):
    title: str
    body: str
    url: Optional[str] = "/running"

@api_router.post("/admin/notifications/broadcast")
async def broadcast_notification(notif: BroadcastNotification, admin: User = Depends(verify_admin)):
    """Admin: Broadcast notification to all subscribed users"""
    subs = await db.push_subscriptions.find({"enabled": True}).to_list(1000)
    
    sent_count = 0
    for sub in subs:
        success = await send_push_notification(
            sub["user_id"],
            notif.title,
            notif.body,
            {"url": notif.url, "type": "broadcast"}
        )
        if success:
            sent_count += 1
    
    return {
        "success": True,
        "sent": sent_count,
        "total_subscribed": len(subs)
    }


# ==================== REWARDS SYSTEM ====================

# Available rewards
REWARDS_CATALOG = [
    {
        "id": "vip_1_day",
        "name_fr": "Accès VIP 1 jour",
        "name_en": "VIP Access 1 day",
        "description_fr": "Accédez à tous les contenus VIP pendant 24h",
        "description_en": "Access all VIP content for 24h",
        "points_cost": 200,
        "icon": "👑",
        "type": "vip_access",
        "duration_hours": 24
    },
    {
        "id": "vip_7_days",
        "name_fr": "Accès VIP 7 jours",
        "name_en": "VIP Access 7 days",
        "description_fr": "Accédez à tous les contenus VIP pendant 1 semaine",
        "description_en": "Access all VIP content for 1 week",
        "points_cost": 1000,
        "icon": "🏆",
        "type": "vip_access",
        "duration_hours": 168
    },
    {
        "id": "coaching_session",
        "name_fr": "Session coaching gratuite",
        "name_en": "Free coaching session",
        "description_fr": "15 minutes de coaching personnalisé avec le coach",
        "description_en": "15 minutes of personalized coaching",
        "points_cost": 500,
        "icon": "💪",
        "type": "coaching",
        "duration_minutes": 15
    },
    {
        "id": "nutrition_plan",
        "name_fr": "Plan nutrition personnalisé",
        "name_en": "Personalized nutrition plan",
        "description_fr": "Un plan alimentaire adapté à vos objectifs",
        "description_en": "A meal plan tailored to your goals",
        "points_cost": 750,
        "icon": "🥗",
        "type": "nutrition"
    },
    {
        "id": "badge_gold",
        "name_fr": "Badge Or Exclusif",
        "name_en": "Exclusive Gold Badge",
        "description_fr": "Affichez un badge Or à côté de votre nom",
        "description_en": "Display a Gold badge next to your name",
        "points_cost": 300,
        "icon": "🥇",
        "type": "badge"
    },
    {
        "id": "priority_live",
        "name_fr": "Priorité Live",
        "name_en": "Live Priority",
        "description_fr": "Vos questions seront traitées en priorité pendant les lives",
        "description_en": "Your questions will be prioritized during lives",
        "points_cost": 150,
        "icon": "⭐",
        "type": "live_priority",
        "duration_hours": 168
    }
]

@api_router.get("/rewards/catalog")
async def get_rewards_catalog(current_user: User = Depends(get_current_user)):
    """Get available rewards catalog"""
    return {"rewards": REWARDS_CATALOG}

@api_router.get("/rewards/points")
async def get_user_points(current_user: User = Depends(get_current_user)):
    """Get user's current points balance and history"""
    user_data = await db.user_points.find_one({"user_id": current_user.user_id})
    
    if not user_data:
        # Initialize user points
        user_data = {
            "user_id": current_user.user_id,
            "total_points": 0,
            "lifetime_points": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.user_points.insert_one(user_data)
    
    # Get recent transactions
    transactions = await db.points_transactions.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    # Get active rewards
    active_rewards = await db.user_rewards.find({
        "user_id": current_user.user_id,
        "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}
    }, {"_id": 0}).to_list(10)
    
    return {
        "total_points": user_data.get("total_points", 0),
        "lifetime_points": user_data.get("lifetime_points", 0),
        "transactions": transactions,
        "active_rewards": active_rewards
    }

async def add_points(user_id: str, points: int, reason: str, reason_id: str = None):
    """Add points to user's balance"""
    # Update or create user points
    result = await db.user_points.update_one(
        {"user_id": user_id},
        {
            "$inc": {"total_points": points, "lifetime_points": max(0, points)},
            "$setOnInsert": {"created_at": datetime.now(timezone.utc).isoformat()}
        },
        upsert=True
    )
    
    # Log transaction
    await db.points_transactions.insert_one({
        "user_id": user_id,
        "points": points,
        "reason": reason,
        "reason_id": reason_id,
        "type": "earned" if points > 0 else "spent",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return True

@api_router.post("/rewards/redeem/{reward_id}")
async def redeem_reward(reward_id: str, current_user: User = Depends(get_current_user)):
    """Redeem a reward using points"""
    # Find reward in catalog
    reward = next((r for r in REWARDS_CATALOG if r["id"] == reward_id), None)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    # Check user points
    user_data = await db.user_points.find_one({"user_id": current_user.user_id})
    current_points = user_data.get("total_points", 0) if user_data else 0
    
    if current_points < reward["points_cost"]:
        raise HTTPException(status_code=400, detail="Not enough points")
    
    # Deduct points
    await add_points(current_user.user_id, -reward["points_cost"], f"Redeemed: {reward['name_en']}", reward_id)
    
    # Calculate expiration if applicable
    expires_at = None
    if reward.get("duration_hours"):
        expires_at = (datetime.now(timezone.utc) + timedelta(hours=reward["duration_hours"])).isoformat()
    
    # Create user reward
    user_reward = {
        "reward_id": f"ur_{uuid.uuid4().hex[:12]}",
        "user_id": current_user.user_id,
        "catalog_id": reward_id,
        "name": reward["name_en"],
        "type": reward["type"],
        "status": "active",
        "expires_at": expires_at,
        "redeemed_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_rewards.insert_one(user_reward)
    
    # Send notification
    await send_push_notification(
        current_user.user_id,
        f"🎁 Récompense débloquée !",
        f"Vous avez échangé {reward['points_cost']} points contre : {reward['name_fr']}",
        {"url": "/rewards", "type": "reward_redeemed"}
    )
    
    return {
        "success": True,
        "reward": reward,
        "remaining_points": current_points - reward["points_cost"]
    }

@api_router.get("/rewards/my-rewards")
async def get_my_rewards(current_user: User = Depends(get_current_user)):
    """Get user's redeemed rewards"""
    rewards = await db.user_rewards.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("redeemed_at", -1).to_list(50)
    
    return {"rewards": rewards}

# Admin: Give points to user
class GivePointsRequest(BaseModel):
    user_id: str
    points: int
    reason: str

@api_router.post("/admin/rewards/give-points")
async def admin_give_points(data: GivePointsRequest, admin: User = Depends(verify_admin)):
    """Admin: Give points to a user"""
    await add_points(data.user_id, data.points, f"Admin gift: {data.reason}")
    
    # Notify user
    await send_push_notification(
        data.user_id,
        "🎉 Bonus de points !",
        f"Vous avez reçu {data.points} points ! Raison: {data.reason}",
        {"url": "/rewards", "type": "points_gift"}
    )
    
    return {"success": True, "message": f"Gave {data.points} points to user"}

@api_router.get("/admin/rewards/stats")
async def admin_rewards_stats(admin: User = Depends(verify_admin)):
    """Admin: Get rewards statistics"""
    total_points_issued = await db.points_transactions.aggregate([
        {"$match": {"points": {"$gt": 0}}},
        {"$group": {"_id": None, "total": {"$sum": "$points"}}}
    ]).to_list(1)
    
    total_points_spent = await db.points_transactions.aggregate([
        {"$match": {"points": {"$lt": 0}}},
        {"$group": {"_id": None, "total": {"$sum": "$points"}}}
    ]).to_list(1)
    
    rewards_redeemed = await db.user_rewards.count_documents({})
    
    top_earners = await db.user_points.find(
        {},
        {"_id": 0, "user_id": 1, "total_points": 1, "lifetime_points": 1}
    ).sort("lifetime_points", -1).limit(10).to_list(10)
    
    # Get user names
    for earner in top_earners:
        user = await db.users.find_one({"user_id": earner["user_id"]}, {"name": 1})
        earner["name"] = user.get("name", "Unknown") if user else "Unknown"
    
    return {
        "total_points_issued": total_points_issued[0]["total"] if total_points_issued else 0,
        "total_points_spent": abs(total_points_spent[0]["total"]) if total_points_spent else 0,
        "rewards_redeemed": rewards_redeemed,
        "top_earners": top_earners
    }


# ==================== LIVE STREAMING IMPROVEMENTS ====================

class LiveRequest(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None

@api_router.post("/live/request")
async def request_live_session(data: LiveRequest, current_user: User = Depends(get_current_user)):
    """Subscriber requests a live session from admin"""
    request_id = f"lr_{uuid.uuid4().hex[:12]}"
    
    live_request = {
        "request_id": request_id,
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "title": data.title or "Demande de Live",
        "message": data.message or "Je souhaiterais une session live avec le coach",
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.live_requests.insert_one(live_request)
    
    # Notify admin
    admins = await db.users.find({"role": "admin"}).to_list(10)
    for admin in admins:
        await send_push_notification(
            admin.get("user_id"),
            "📺 Demande de Live !",
            f"{current_user.name} demande une session live : {data.title or 'Coaching'}",
            {"url": "/admin", "type": "live_request"}
        )
    
    return {"success": True, "request_id": request_id}

@api_router.get("/live/requests")
async def get_live_requests(current_user: User = Depends(get_current_user)):
    """Get live session requests (admin sees all, user sees own)"""
    if current_user.role == "admin":
        requests = await db.live_requests.find(
            {},
            {"_id": 0}
        ).sort("created_at", -1).to_list(50)
    else:
        requests = await db.live_requests.find(
            {"user_id": current_user.user_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(20)
    
    return {"requests": requests}

@api_router.post("/live/requests/{request_id}/respond")
async def respond_to_live_request(
    request_id: str, 
    response: str,  # accepted, declined, scheduled
    scheduled_time: Optional[str] = None,
    admin: User = Depends(verify_admin)
):
    """Admin responds to a live request"""
    request = await db.live_requests.find_one({"request_id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    await db.live_requests.update_one(
        {"request_id": request_id},
        {"$set": {
            "status": response,
            "scheduled_time": scheduled_time,
            "responded_at": datetime.now(timezone.utc).isoformat(),
            "responded_by": admin.user_id
        }}
    )
    
    # Notify requester
    if response == "accepted":
        message = "Votre demande de live a été acceptée ! Le coach sera bientôt en ligne."
    elif response == "scheduled":
        message = f"Votre live est programmé pour : {scheduled_time}"
    else:
        message = "Votre demande de live n'a pas pu être acceptée pour le moment."
    
    await send_push_notification(
        request["user_id"],
        "📺 Réponse à votre demande de Live",
        message,
        {"url": "/live", "type": "live_response"}
    )
    
    return {"success": True}

@api_router.get("/live/schedule")
async def get_live_schedule(current_user: User = Depends(get_current_user)):
    """Get upcoming scheduled lives"""
    now = datetime.now(timezone.utc).isoformat()
    
    # Get scheduled lives
    scheduled = await db.lives.find({
        "status": "scheduled",
        "scheduled_time": {"$gte": now}
    }, {"_id": 0}).sort("scheduled_time", 1).to_list(10)
    
    # Get active lives
    active = await db.lives.find({
        "status": "active"
    }, {"_id": 0}).to_list(5)
    
    return {
        "active_lives": active,
        "scheduled_lives": scheduled
    }

# Modify create live to support scheduling
class CreateScheduledLive(BaseModel):
    title: str
    description: Optional[str] = None
    is_vip: bool = False
    scheduled_time: Optional[str] = None  # ISO format

@api_router.post("/live/schedule")
async def schedule_live(data: CreateScheduledLive, admin: User = Depends(verify_admin)):
    """Admin: Schedule a live session"""
    live_id = f"live_{uuid.uuid4().hex[:12]}"
    
    live = {
        "live_id": live_id,
        "title": data.title,
        "description": data.description,
        "created_by": admin.user_id,
        "creator_name": admin.name,
        "is_vip": data.is_vip,
        "status": "scheduled" if data.scheduled_time else "active",
        "scheduled_time": data.scheduled_time,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "viewer_count": 0,
        "chat_messages": []
    }
    
    await db.lives.insert_one(live)
    
    # Notify all subscribers if scheduled
    if data.scheduled_time:
        subs = await db.push_subscriptions.find({"enabled": True}).to_list(1000)
        for sub in subs:
            await send_push_notification(
                sub["user_id"],
                "📺 Live programmé !",
                f"'{data.title}' prévu le {data.scheduled_time}. Ne le manquez pas !",
                {"url": "/live", "type": "live_scheduled"}
            )
    
    return {"success": True, "live_id": live_id, "status": live["status"]}


# Include router after all endpoints are defined
app.include_router(api_router)

logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()