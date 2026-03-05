"""
FitMaxPro - User Routes (Subscription, Profile)
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db
from models.schemas import User
from routes.auth import get_current_user

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/subscription")
async def get_user_subscription(current_user: User = Depends(get_current_user)):
    """Get current user subscription status"""
    return {
        "tier": current_user.subscription_tier,
        "status": current_user.subscription_status,
        "subscription": current_user.subscription
    }


@router.post("/subscription/cancel")
async def cancel_subscription(current_user: User = Depends(get_current_user)):
    """Cancel user subscription"""
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$set": {"subscription_status": "cancelled"}}
    )
    
    await db.cancellation_requests.insert_one({
        "user_id": current_user.user_id,
        "requested_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending"
    })
    
    return {"message": "Cancellation request received"}


@router.get("/profile")
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get user profile with stats"""
    user_doc = await db.users.find_one(
        {"user_id": current_user.user_id},
        {"_id": 0, "password": 0}
    )
    
    # Get user stats
    workout_count = await db.workout_sessions.count_documents({
        "user_id": current_user.user_id,
        "completed": True
    })
    
    running_sessions = await db.running_sessions.find(
        {"user_id": current_user.user_id},
        {"distance": 1}
    ).to_list(1000)
    total_distance = sum(s.get("distance", 0) for s in running_sessions)
    
    points_data = await db.users.find_one(
        {"user_id": current_user.user_id},
        {"total_points": 1, "weekly_points": 1}
    )
    
    return {
        "user": user_doc,
        "stats": {
            "completed_workouts": workout_count,
            "total_running_km": round(total_distance, 2),
            "total_runs": len(running_sessions),
            "total_points": points_data.get("total_points", 0) if points_data else 0,
            "weekly_points": points_data.get("weekly_points", 0) if points_data else 0
        }
    }
