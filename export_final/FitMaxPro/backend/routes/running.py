"""
FitMaxPro - Running Routes
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta
import uuid

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db
from models.schemas import User
from routes.auth import get_current_user

router = APIRouter(prefix="/running", tags=["Running"])


class RunningSessionStart(BaseModel):
    goal_distance: Optional[float] = None
    goal_time: Optional[int] = None


class RunningSessionEnd(BaseModel):
    distance: float
    duration: int
    calories: Optional[int] = None
    avg_pace: Optional[float] = None
    route_data: Optional[List[Dict]] = None


@router.post("/start")
async def start_running_session(data: RunningSessionStart, user: User = Depends(get_current_user)):
    """Start a running session"""
    session_id = f"run_{uuid.uuid4().hex[:12]}"
    
    session = {
        "session_id": session_id,
        "user_id": user.user_id,
        "user_name": user.name,
        "goal_distance": data.goal_distance,
        "goal_time": data.goal_time,
        "start_time": datetime.now(timezone.utc).isoformat(),
        "status": "active"
    }
    
    await db.running_sessions.insert_one(session)
    
    return {"session_id": session_id, "message": "Running session started"}


@router.post("/end/{session_id}")
async def end_running_session(session_id: str, data: RunningSessionEnd, user: User = Depends(get_current_user)):
    """End a running session"""
    session = await db.running_sessions.find_one({
        "session_id": session_id,
        "user_id": user.user_id
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Calculate points based on distance
    points_earned = int(data.distance * 10)
    
    update_data = {
        "distance": data.distance,
        "duration": data.duration,
        "calories": data.calories or int(data.distance * 60),
        "avg_pace": data.avg_pace or (data.duration / 60 / data.distance if data.distance > 0 else 0),
        "route_data": data.route_data,
        "end_time": datetime.now(timezone.utc).isoformat(),
        "status": "completed",
        "points_earned": points_earned
    }
    
    await db.running_sessions.update_one(
        {"session_id": session_id},
        {"$set": update_data}
    )
    
    # Award points
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$inc": {"total_points": points_earned, "weekly_points": points_earned}}
    )
    
    await db.point_history.insert_one({
        "user_id": user.user_id,
        "points": points_earned,
        "reason": f"Course: {data.distance:.2f} km",
        "type": "earned",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "message": "Running session completed",
        "distance": data.distance,
        "duration": data.duration,
        "points_earned": points_earned
    }


@router.get("/history")
async def get_running_history(user: User = Depends(get_current_user)):
    """Get user's running history"""
    sessions = await db.running_sessions.find(
        {"user_id": user.user_id, "status": "completed"},
        {"_id": 0}
    ).sort("start_time", -1).to_list(100)
    
    total_distance = sum(s.get("distance", 0) for s in sessions)
    total_time = sum(s.get("duration", 0) for s in sessions)
    total_calories = sum(s.get("calories", 0) for s in sessions)
    
    return {
        "sessions": sessions,
        "stats": {
            "total_runs": len(sessions),
            "total_distance": round(total_distance, 2),
            "total_time": total_time,
            "total_calories": total_calories
        }
    }


@router.get("/leaderboard")
async def get_running_leaderboard(period: str = "all", user: User = Depends(get_current_user)):
    """Get running leaderboard"""
    match_filter = {"status": "completed"}
    
    if period == "weekly":
        week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        match_filter["start_time"] = {"$gte": week_ago}
    elif period == "monthly":
        month_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        match_filter["start_time"] = {"$gte": month_ago}
    
    pipeline = [
        {"$match": match_filter},
        {"$group": {
            "_id": "$user_id",
            "user_name": {"$first": "$user_name"},
            "total_distance": {"$sum": "$distance"},
            "total_runs": {"$sum": 1},
            "total_time": {"$sum": "$duration"},
            "total_calories": {"$sum": "$calories"}
        }},
        {"$sort": {"total_distance": -1}},
        {"$limit": 50}
    ]
    
    results = await db.running_sessions.aggregate(pipeline).to_list(50)
    
    # Find current user's position
    user_position = 0
    for i, r in enumerate(results):
        if r["_id"] == user.user_id:
            user_position = i + 1
            break
    
    leaderboard = []
    for i, r in enumerate(results):
        leaderboard.append({
            "rank": i + 1,
            "user_id": r["_id"],
            "user_name": r["user_name"],
            "total_distance": round(r["total_distance"], 2),
            "total_runs": r["total_runs"],
            "total_time": r["total_time"],
            "is_current_user": r["_id"] == user.user_id
        })
    
    return {
        "leaderboard": leaderboard,
        "user_position": user_position,
        "period": period
    }


@router.get("/challenges")
async def get_running_challenges(user: User = Depends(get_current_user)):
    """Get running challenges and progress"""
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    
    weekly_sessions = await db.running_sessions.find({
        "user_id": user.user_id,
        "status": "completed",
        "start_time": {"$gte": week_ago}
    }, {"_id": 0}).to_list(100)
    
    weekly_distance = sum(s.get("distance", 0) for s in weekly_sessions)
    weekly_runs = len(weekly_sessions)
    weekly_calories = sum(s.get("calories", 0) for s in weekly_sessions)
    
    challenges = [
        {"id": "5km", "name": "5 km cette semaine", "target": 5, "progress": weekly_distance, "type": "distance", "unit": "km"},
        {"id": "10km", "name": "10 km cette semaine", "target": 10, "progress": weekly_distance, "type": "distance", "unit": "km"},
        {"id": "20km", "name": "20 km cette semaine", "target": 20, "progress": weekly_distance, "type": "distance", "unit": "km"},
        {"id": "3runs", "name": "3 courses cette semaine", "target": 3, "progress": weekly_runs, "type": "runs", "unit": "courses"},
        {"id": "5runs", "name": "5 courses cette semaine", "target": 5, "progress": weekly_runs, "type": "runs", "unit": "courses"},
        {"id": "500cal", "name": "500 calories brûlées", "target": 500, "progress": weekly_calories, "type": "calories", "unit": "cal"},
    ]
    
    for c in challenges:
        c["completed"] = c["progress"] >= c["target"]
        c["percentage"] = min(100, round(c["progress"] / c["target"] * 100, 1))
    
    return {
        "challenges": challenges,
        "weekly_stats": {
            "distance": round(weekly_distance, 2),
            "runs": weekly_runs,
            "calories": weekly_calories
        }
    }
