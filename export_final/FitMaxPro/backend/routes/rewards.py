"""
FitMaxPro - Rewards & Gamification Routes
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db
from models.schemas import User
from routes.auth import get_current_user, verify_admin

router = APIRouter(prefix="/rewards", tags=["Rewards"])


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
    }
]


class GivePointsRequest(BaseModel):
    user_id: str
    points: int
    reason: str


class RedeemRewardRequest(BaseModel):
    reward_id: str


@router.get("/catalog")
async def get_rewards_catalog(current_user: User = Depends(get_current_user)):
    """Get available rewards catalog"""
    user_data = await db.users.find_one(
        {"user_id": current_user.user_id},
        {"total_points": 1}
    )
    user_points = user_data.get("total_points", 0) if user_data else 0
    
    catalog = []
    for reward in REWARDS_CATALOG:
        catalog.append({
            **reward,
            "can_afford": user_points >= reward["points_cost"]
        })
    
    return {
        "rewards": catalog,
        "user_points": user_points
    }


@router.post("/redeem")
async def redeem_reward(request: RedeemRewardRequest, current_user: User = Depends(get_current_user)):
    """Redeem a reward with points"""
    reward = next((r for r in REWARDS_CATALOG if r["id"] == request.reward_id), None)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    user_data = await db.users.find_one(
        {"user_id": current_user.user_id},
        {"total_points": 1}
    )
    user_points = user_data.get("total_points", 0) if user_data else 0
    
    if user_points < reward["points_cost"]:
        raise HTTPException(status_code=400, detail="Not enough points")
    
    # Deduct points
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$inc": {"total_points": -reward["points_cost"]}}
    )
    
    # Log redemption
    redemption_id = f"redeem_{uuid.uuid4().hex[:12]}"
    redemption = {
        "redemption_id": redemption_id,
        "user_id": current_user.user_id,
        "reward_id": request.reward_id,
        "reward_name": reward["name_fr"],
        "points_spent": reward["points_cost"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.redemptions.insert_one(redemption)
    
    # Log point transaction
    await db.point_history.insert_one({
        "user_id": current_user.user_id,
        "points": -reward["points_cost"],
        "reason": f"Récompense: {reward['name_fr']}",
        "type": "spent",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "redemption_id": redemption_id,
        "reward": reward,
        "remaining_points": user_points - reward["points_cost"]
    }


@router.get("/my-points")
async def get_my_points(current_user: User = Depends(get_current_user)):
    """Get user's points and history"""
    user_data = await db.users.find_one(
        {"user_id": current_user.user_id},
        {"total_points": 1, "weekly_points": 1}
    )
    
    history = await db.point_history.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {
        "total_points": user_data.get("total_points", 0) if user_data else 0,
        "weekly_points": user_data.get("weekly_points", 0) if user_data else 0,
        "history": history
    }


@router.get("/my-redemptions")
async def get_my_redemptions(current_user: User = Depends(get_current_user)):
    """Get user's reward redemptions"""
    redemptions = await db.redemptions.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"redemptions": redemptions}


@router.get("/leaderboard")
async def get_points_leaderboard(current_user: User = Depends(get_current_user)):
    """Get points leaderboard"""
    pipeline = [
        {"$match": {"total_points": {"$gt": 0}}},
        {"$project": {
            "_id": 0,
            "user_id": 1,
            "name": 1,
            "total_points": 1,
            "picture": 1
        }},
        {"$sort": {"total_points": -1}},
        {"$limit": 50}
    ]
    
    results = await db.users.aggregate(pipeline).to_list(50)
    
    user_position = 0
    for i, r in enumerate(results):
        r["rank"] = i + 1
        if r["user_id"] == current_user.user_id:
            user_position = i + 1
    
    return {
        "leaderboard": results,
        "user_position": user_position
    }


# Admin endpoints
@router.post("/admin/give-points")
async def admin_give_points(request: GivePointsRequest, admin: User = Depends(verify_admin)):
    """Admin: Give points to a user"""
    user = await db.users.find_one({"user_id": request.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.update_one(
        {"user_id": request.user_id},
        {"$inc": {"total_points": request.points}}
    )
    
    await db.point_history.insert_one({
        "user_id": request.user_id,
        "points": request.points,
        "reason": request.reason,
        "type": "admin_award",
        "awarded_by": admin.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "user_id": request.user_id,
        "points_awarded": request.points,
        "reason": request.reason
    }


@router.get("/admin/redemptions")
async def admin_get_redemptions(admin: User = Depends(verify_admin)):
    """Admin: Get all pending redemptions"""
    redemptions = await db.redemptions.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Enrich with user info
    for r in redemptions:
        user = await db.users.find_one({"user_id": r["user_id"]}, {"name": 1, "email": 1})
        r["user_name"] = user.get("name") if user else "Unknown"
        r["user_email"] = user.get("email") if user else ""
    
    return {"redemptions": redemptions}


@router.put("/admin/redemptions/{redemption_id}")
async def admin_update_redemption(redemption_id: str, status: str, admin: User = Depends(verify_admin)):
    """Admin: Update redemption status"""
    valid_statuses = ["pending", "processing", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Use: {valid_statuses}")
    
    result = await db.redemptions.update_one(
        {"redemption_id": redemption_id},
        {"$set": {
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": admin.user_id
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Redemption not found")
    
    return {"success": True, "status": status}
