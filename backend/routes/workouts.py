"""
FitMaxPro - Workout Routes
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from datetime import datetime, timezone
import uuid

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db
from models.schemas import User, Workout, WorkoutSession
from routes.auth import get_current_user

router = APIRouter(prefix="/workouts", tags=["Workouts"])


@router.get("", response_model=List[Workout])
async def get_workouts(level: Optional[str] = None, program_type: Optional[str] = None, language: str = "fr"):
    """Get all workouts with optional filters"""
    query = {"language": language}
    if level:
        query["level"] = level
    if program_type:
        query["program_type"] = program_type
    
    workouts = await db.workouts.find(query, {"_id": 0}).to_list(100)
    return [Workout(**w) for w in workouts]


@router.get("/{workout_id}", response_model=Workout)
async def get_workout(workout_id: str, language: str = "fr"):
    """Get single workout by ID"""
    workout = await db.workouts.find_one({"workout_id": workout_id, "language": language}, {"_id": 0})
    if not workout:
        workout = await db.workouts.find_one({"workout_id": workout_id}, {"_id": 0})
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return Workout(**workout)


# Workout Session Routes
workout_session_router = APIRouter(prefix="/workout", tags=["Workout Sessions"])


@workout_session_router.post("/start")
async def start_workout_session(workout_id: str, user: User = Depends(get_current_user)):
    """Start a workout session"""
    workout = await db.workouts.find_one({"workout_id": workout_id}, {"_id": 0})
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    session_id = f"session_{uuid.uuid4().hex[:12]}"
    session = {
        "session_id": session_id,
        "user_id": user.user_id,
        "workout_id": workout_id,
        "workout_title": workout.get("title", "Unknown"),
        "started_at": datetime.now(timezone.utc).isoformat(),
        "ended_at": None,
        "duration_seconds": 0,
        "completed": False,
        "pauses": []
    }
    await db.workout_sessions.insert_one(session)
    
    return {"session_id": session_id, "message": "Workout session started"}


@workout_session_router.post("/end")
async def end_workout_session(session_id: str, completed: bool = True, user: User = Depends(get_current_user)):
    """End a workout session"""
    session = await db.workout_sessions.find_one(
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
    total_duration = int((ended_at - started_at).total_seconds())
    
    # Subtract pause time
    total_pause_time = 0
    for pause in session.get("pauses", []):
        if pause.get("ended_at"):
            pause_start = datetime.fromisoformat(pause["started_at"].replace('Z', '+00:00'))
            pause_end = datetime.fromisoformat(pause["ended_at"].replace('Z', '+00:00'))
            total_pause_time += int((pause_end - pause_start).total_seconds())
    
    active_duration = max(0, total_duration - total_pause_time)
    
    await db.workout_sessions.update_one(
        {"session_id": session_id},
        {"$set": {
            "ended_at": ended_at.isoformat(),
            "duration_seconds": active_duration,
            "completed": completed
        }}
    )
    
    # Award points for completed workout
    if completed:
        points_earned = 10
        
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$inc": {"total_points": points_earned, "weekly_points": points_earned}}
        )
        
        await db.point_history.insert_one({
            "user_id": user.user_id,
            "points": points_earned,
            "reason": f"Workout completed: {session.get('workout_title', 'Unknown')}",
            "type": "earned",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {
        "message": "Workout session ended",
        "duration_seconds": active_duration,
        "completed": completed,
        "points_earned": 10 if completed else 0
    }


@workout_session_router.get("/my-sessions")
async def get_my_sessions(user: User = Depends(get_current_user)):
    """Get user's workout sessions"""
    sessions = await db.workout_sessions.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("started_at", -1).to_list(100)
    
    return {"sessions": sessions}


@workout_session_router.post("/pause/start")
async def start_pause(session_id: str, user: User = Depends(get_current_user)):
    """Start a pause in workout session"""
    session = await db.workout_sessions.find_one(
        {"session_id": session_id, "user_id": user.user_id},
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    pause_id = f"pause_{uuid.uuid4().hex[:8]}"
    pause = {
        "pause_id": pause_id,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "ended_at": None
    }
    
    await db.workout_sessions.update_one(
        {"session_id": session_id},
        {"$push": {"pauses": pause}}
    )
    
    return {"pause_id": pause_id, "message": "Pause started"}


@workout_session_router.post("/pause/end")
async def end_pause(session_id: str, pause_id: str, user: User = Depends(get_current_user)):
    """End a pause in workout session"""
    session = await db.workout_sessions.find_one(
        {"session_id": session_id, "user_id": user.user_id},
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    pauses = session.get("pauses", [])
    for i, pause in enumerate(pauses):
        if pause.get("pause_id") == pause_id and not pause.get("ended_at"):
            pauses[i]["ended_at"] = datetime.now(timezone.utc).isoformat()
            break
    
    await db.workout_sessions.update_one(
        {"session_id": session_id},
        {"$set": {"pauses": pauses}}
    )
    
    return {"message": "Pause ended"}


@workout_session_router.get("/session/{session_id}")
async def get_session_details(session_id: str, user: User = Depends(get_current_user)):
    """Get workout session details"""
    session = await db.workout_sessions.find_one(
        {"session_id": session_id, "user_id": user.user_id},
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
