"""
FitMaxPro - Warmup & Stretching Routines Routes
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timezone
import uuid

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db
from models.schemas import User
from routes.auth import get_current_user

router = APIRouter(prefix="/routines", tags=["Routines"])


@router.get("/warmup")
async def get_warmup_routine(language: str = "fr"):
    """Get warmup routine exercises"""
    routine = await db.routines.find_one(
        {"routine_type": "warmup", "language": language},
        {"_id": 0}
    )
    
    if not routine:
        # Try without language filter
        routine = await db.routines.find_one(
            {"routine_type": "warmup"},
            {"_id": 0}
        )
    
    if not routine:
        # Return a default warmup routine
        return {
            "routine_id": "default_warmup",
            "title": "Échauffement" if language == "fr" else "Warm-Up",
            "routine_type": "warmup",
            "duration": "5-7 min",
            "exercises": [
                {
                    "name": "Jumping Jacks" if language != "fr" else "Sauts étoile",
                    "description": "Échauffez vos jambes et bras",
                    "duration": "45 secondes",
                    "image_url": "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400",
                    "video_url": ""
                },
                {
                    "name": "High Knees" if language != "fr" else "Montées de genoux",
                    "description": "Activez vos muscles des jambes",
                    "duration": "45 secondes",
                    "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
                    "video_url": ""
                },
                {
                    "name": "Arm Circles" if language != "fr" else "Rotations des bras",
                    "description": "Échauffez vos épaules",
                    "duration": "30 secondes",
                    "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
                    "video_url": ""
                },
                {
                    "name": "Hip Circles" if language != "fr" else "Rotations des hanches",
                    "description": "Mobilisez vos hanches",
                    "duration": "30 secondes",
                    "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400",
                    "video_url": ""
                },
                {
                    "name": "Leg Swings" if language != "fr" else "Balancements de jambes",
                    "description": "Échauffez vos ischio-jambiers",
                    "duration": "30 secondes par jambe",
                    "image_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
                    "video_url": ""
                }
            ]
        }
    
    return routine


@router.get("/stretching")
async def get_stretching_routine(language: str = "fr"):
    """Get stretching routine exercises"""
    routine = await db.routines.find_one(
        {"routine_type": "stretching", "language": language},
        {"_id": 0}
    )
    
    if not routine:
        routine = await db.routines.find_one(
            {"routine_type": "stretching"},
            {"_id": 0}
        )
    
    if not routine:
        # Return a default stretching routine
        return {
            "routine_id": "default_stretching",
            "title": "Étirements" if language == "fr" else "Stretching",
            "routine_type": "stretching",
            "duration": "5-10 min",
            "exercises": [
                {
                    "name": "Quad Stretch" if language != "fr" else "Étirement des quadriceps",
                    "description": "Maintenez 30 secondes par jambe",
                    "duration": "60 secondes",
                    "image_url": "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400",
                    "video_url": ""
                },
                {
                    "name": "Hamstring Stretch" if language != "fr" else "Étirement des ischio-jambiers",
                    "description": "Touchez vos orteils doucement",
                    "duration": "45 secondes",
                    "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
                    "video_url": ""
                },
                {
                    "name": "Shoulder Stretch" if language != "fr" else "Étirement des épaules",
                    "description": "Tirez votre bras en travers de la poitrine",
                    "duration": "30 secondes par bras",
                    "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400",
                    "video_url": ""
                },
                {
                    "name": "Triceps Stretch" if language != "fr" else "Étirement des triceps",
                    "description": "Bras derrière la tête",
                    "duration": "30 secondes par bras",
                    "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
                    "video_url": ""
                },
                {
                    "name": "Cat-Cow Stretch" if language != "fr" else "Étirement Chat-Vache",
                    "description": "Alternez dos rond et dos creux",
                    "duration": "60 secondes",
                    "image_url": "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400",
                    "video_url": ""
                }
            ]
        }
    
    return routine


# Routine session tracking
routine_session_router = APIRouter(prefix="/routine", tags=["Routine Sessions"])


@routine_session_router.post("/start")
async def start_routine_session(
    routine_type: str,
    workout_session_id: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """Start a warmup or stretching routine session"""
    if routine_type not in ["warmup", "stretching"]:
        raise HTTPException(status_code=400, detail="Invalid routine type")
    
    session_id = f"routine_{uuid.uuid4().hex[:12]}"
    session = {
        "session_id": session_id,
        "user_id": user.user_id,
        "routine_type": routine_type,
        "workout_session_id": workout_session_id,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "ended_at": None,
        "duration_seconds": 0,
        "completed": False
    }
    await db.routine_sessions.insert_one(session)
    
    return {"session_id": session_id, "message": f"{routine_type.capitalize()} started"}


@routine_session_router.post("/end")
async def end_routine_session(
    session_id: str,
    completed: bool = True,
    user: User = Depends(get_current_user)
):
    """End a routine session"""
    session = await db.routine_sessions.find_one(
        {"session_id": session_id, "user_id": user.user_id},
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    started_at_str = session.get("started_at")
    if isinstance(started_at_str, str):
        started_at = datetime.fromisoformat(started_at_str.replace('Z', '+00:00'))
    else:
        started_at = started_at_str
    
    if started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)
    
    ended_at = datetime.now(timezone.utc)
    duration = int((ended_at - started_at).total_seconds())
    
    await db.routine_sessions.update_one(
        {"session_id": session_id},
        {"$set": {
            "ended_at": ended_at.isoformat(),
            "duration_seconds": duration,
            "completed": completed
        }}
    )
    
    # Format duration
    mins = duration // 60
    secs = duration % 60
    duration_formatted = f"{mins}m {secs}s"
    
    return {
        "message": f"Routine {'completed' if completed else 'stopped'}",
        "duration_seconds": duration,
        "duration_formatted": duration_formatted,
        "completed": completed
    }


@routine_session_router.get("/history")
async def get_routine_history(user: User = Depends(get_current_user)):
    """Get user's routine session history"""
    sessions = await db.routine_sessions.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("started_at", -1).to_list(50)
    
    return {"sessions": sessions}
