from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
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


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Include router after all endpoints are defined
app.include_router(api_router)

logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()