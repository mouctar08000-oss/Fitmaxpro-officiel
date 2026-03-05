"""
FitMaxPro - Routes Package
All API routes are organized by domain.
"""
from .auth import router as auth_router, get_current_user, verify_admin
from .payments import router as payments_router, webhook_router
from .workouts import router as workouts_router, workout_session_router
from .supplements import router as supplements_router
from .messages import router as messages_router
from .reminders import router as reminders_router
from .user import router as user_router
from .social import router as social_router
from .lives import router as lives_router
from .livekit import router as livekit_router
from .running import router as running_router
from .rewards import router as rewards_router
from .reviews import router as reviews_router

__all__ = [
    'auth_router',
    'payments_router',
    'webhook_router',
    'workouts_router',
    'workout_session_router',
    'supplements_router',
    'messages_router',
    'reminders_router',
    'user_router',
    'social_router',
    'lives_router',
    'livekit_router',
    'running_router',
    'rewards_router',
    'reviews_router',
    'get_current_user',
    'verify_admin',
]
