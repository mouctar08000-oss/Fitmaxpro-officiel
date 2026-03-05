"""
FitMaxPro - Pydantic Models
"""
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
from datetime import datetime

# User Models
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

# Auth Models
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

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# Workout Models
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

class NewWorkout(BaseModel):
    title: str
    description: str
    level: str
    program_type: str
    exercises: List[Dict] = []
    duration: int = 30
    language: str = "fr"
    image_url: Optional[str] = None

class NewExercise(BaseModel):
    name: str
    sets: int
    reps: str
    rest: int
    video_url: Optional[str] = None
    tips: Optional[str] = None

# Supplement Models
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

class Recipe(BaseModel):
    ingredients: List[str] = []
    steps: List[str] = []
    prep_time: Optional[str] = None
    cook_time: Optional[str] = None
    servings: Optional[int] = None

class MealRecipeUpdate(BaseModel):
    recipe: Recipe

# Subscription Models
class CheckoutRequest(BaseModel):
    tier: str
    billing_cycle: str
    origin_url: str

class SubscriptionUpdate(BaseModel):
    user_id: str
    subscription_tier: str
    subscription_status: str

# Message Models
class MessageCreate(BaseModel):
    recipient_id: str
    content: str

# Reminder Models
class ReminderCreate(BaseModel):
    day: str
    time: str
    workout_id: Optional[str] = None
    workout_title: Optional[str] = None
    message: Optional[str] = None

class ReminderUpdate(BaseModel):
    day: Optional[str] = None
    time: Optional[str] = None
    workout_id: Optional[str] = None
    workout_title: Optional[str] = None
    message: Optional[str] = None
    enabled: Optional[bool] = None

# Review Models
class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str
    program_type: Optional[str] = None

# Live Stream Models
class LiveCreate(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    vip_only: bool = False

class LiveJoinRequest(BaseModel):
    live_id: str

class LiveKitRoomRequest(BaseModel):
    room_name: str
    participant_name: str

# Running Models
class RunningSessionCreate(BaseModel):
    distance: float
    duration_seconds: int
    route_data: Optional[List[Dict]] = None
    average_pace: Optional[float] = None
    calories_burned: Optional[int] = None

# Points Models
class GivePointsRequest(BaseModel):
    user_id: str
    points: int
    reason: str

class RedeemRewardRequest(BaseModel):
    reward_id: str

# Call Models
class CallRequest(BaseModel):
    callee_id: str
    is_video: bool = True

# Push Notification Models
class PushSubscription(BaseModel):
    endpoint: str
    keys: Dict[str, str]

# Alert Settings Models
class InactiveAlertSettings(BaseModel):
    enabled: bool = True
    days_threshold: int = 7
    auto_send: bool = False
    template_fr: Optional[str] = None
    template_en: Optional[str] = None

# Live Request Models
class LiveRequestCreate(BaseModel):
    requested_program: str
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    message: Optional[str] = None

# In-App Purchase Models
class IAPVerifyRequest(BaseModel):
    receipt: str
    product_id: str
    platform: str  # 'ios' or 'android'

# Cancellation Request Models
class CancellationRequestCreate(BaseModel):
    reason: str
    feedback: Optional[str] = None
