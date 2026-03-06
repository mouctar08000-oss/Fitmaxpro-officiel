"""
FitMaxPro - Admin Users Management Routes
Gestion complète de tous les utilisateurs (inscrits, essai, abonnés)
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import uuid

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db
from models.schemas import User
from routes.auth import get_current_user, verify_admin

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])


class UserUpdateRequest(BaseModel):
    subscription_tier: Optional[str] = None
    subscription_status: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    trial_end_date: Optional[str] = None
    notes: Optional[str] = None


class BulkActionRequest(BaseModel):
    user_ids: List[str]
    action: str  # activate, deactivate, upgrade, downgrade, extend_trial
    value: Optional[str] = None


@router.get("/all")
async def get_all_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,  # all, active, trial, expired, cancelled
    tier: Optional[str] = None,  # free, standard, vip, supplements
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    admin: User = Depends(verify_admin)
):
    """Get all users with filtering, pagination and search"""
    
    # Build query filter
    query = {}
    
    if status and status != "all":
        if status == "trial":
            query["subscription_status"] = {"$in": ["trial", "trialing"]}
        elif status == "active":
            query["subscription_status"] = "active"
        elif status == "expired":
            query["subscription_status"] = {"$in": ["expired", "past_due"]}
        elif status == "cancelled":
            query["subscription_status"] = "cancelled"
        elif status == "none":
            query["$or"] = [
                {"subscription_tier": {"$exists": False}},
                {"subscription_tier": "free"},
                {"subscription_tier": None}
            ]
    
    if tier and tier != "all":
        query["subscription_tier"] = tier
    
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}},
            {"user_id": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total_count = await db.users.count_documents(query)
    
    # Sort order
    sort_direction = -1 if sort_order == "desc" else 1
    
    # Get users with pagination
    skip = (page - 1) * limit
    users_cursor = db.users.find(
        query,
        {"_id": 0, "password": 0}
    ).sort(sort_by, sort_direction).skip(skip).limit(limit)
    
    users = await users_cursor.to_list(limit)
    
    # Enrich with subscription data
    enriched_users = []
    for user in users:
        user_id = user.get("user_id")
        
        # Get subscription details
        subscription = await db.user_subscriptions.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        # Get last activity
        last_session = await db.user_sessions.find_one(
            {"user_id": user_id},
            {"_id": 0, "created_at": 1},
            sort=[("created_at", -1)]
        )
        
        # Get workout count
        workout_count = await db.workout_sessions.count_documents({
            "user_id": user_id,
            "completed": True
        })
        
        # Calculate trial info
        trial_info = None
        if user.get("subscription_status") in ["trial", "trialing"]:
            created_at = user.get("created_at")
            if created_at:
                if isinstance(created_at, str):
                    created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                else:
                    created_date = created_at
                
                trial_end = created_date + timedelta(days=7)
                days_left = (trial_end - datetime.now(timezone.utc)).days
                trial_info = {
                    "trial_end": trial_end.isoformat(),
                    "days_left": max(0, days_left),
                    "expired": days_left < 0
                }
        
        enriched_users.append({
            **user,
            "subscription_details": subscription,
            "last_activity": last_session.get("created_at") if last_session else None,
            "completed_workouts": workout_count,
            "trial_info": trial_info
        })
    
    # Get statistics
    stats = await get_user_statistics()
    
    return {
        "users": enriched_users,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_count,
            "pages": (total_count + limit - 1) // limit
        },
        "stats": stats
    }


async def get_user_statistics():
    """Get user statistics for admin dashboard"""
    total_users = await db.users.count_documents({})
    
    # By status
    active_count = await db.users.count_documents({"subscription_status": "active"})
    trial_count = await db.users.count_documents({"subscription_status": {"$in": ["trial", "trialing"]}})
    cancelled_count = await db.users.count_documents({"subscription_status": "cancelled"})
    expired_count = await db.users.count_documents({"subscription_status": {"$in": ["expired", "past_due"]}})
    
    # By tier
    vip_count = await db.users.count_documents({"subscription_tier": "vip"})
    standard_count = await db.users.count_documents({"subscription_tier": "standard"})
    supplements_count = await db.users.count_documents({"subscription_tier": "supplements"})
    free_count = await db.users.count_documents({
        "$or": [
            {"subscription_tier": {"$exists": False}},
            {"subscription_tier": "free"},
            {"subscription_tier": None}
        ]
    })
    
    # New users last 7 days
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    new_this_week = await db.users.count_documents({
        "created_at": {"$gte": week_ago}
    })
    
    # New users last 30 days
    month_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    new_this_month = await db.users.count_documents({
        "created_at": {"$gte": month_ago}
    })
    
    return {
        "total": total_users,
        "by_status": {
            "active": active_count,
            "trial": trial_count,
            "cancelled": cancelled_count,
            "expired": expired_count,
            "free": free_count
        },
        "by_tier": {
            "vip": vip_count,
            "standard": standard_count,
            "supplements": supplements_count,
            "free": free_count
        },
        "growth": {
            "new_this_week": new_this_week,
            "new_this_month": new_this_month
        }
    }


@router.get("/stats")
async def get_users_stats(admin: User = Depends(verify_admin)):
    """Get user statistics only"""
    return await get_user_statistics()


@router.get("/{user_id}")
async def get_user_details(user_id: str, admin: User = Depends(verify_admin)):
    """Get detailed user information"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get subscription
    subscription = await db.user_subscriptions.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    
    # Get workout history
    workouts = await db.workout_sessions.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("started_at", -1).to_list(20)
    
    # Get running history
    runs = await db.running_sessions.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("date", -1).to_list(20)
    
    # Get payment history
    payments = await db.payment_history.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    
    # Get messages
    messages = await db.messages.find(
        {"$or": [{"sender_id": user_id}, {"receiver_id": user_id}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    
    # Get points history
    points_history = await db.points_history.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("date", -1).to_list(20)
    
    return {
        "user": user,
        "subscription": subscription,
        "activity": {
            "workouts": workouts,
            "runs": runs,
            "total_workouts": len(workouts),
            "total_runs": len(runs)
        },
        "payments": payments,
        "messages": messages,
        "points_history": points_history
    }


@router.put("/{user_id}")
async def update_user(
    user_id: str,
    request: UserUpdateRequest,
    admin: User = Depends(verify_admin)
):
    """Update user information (admin)"""
    user = await db.users.find_one({"user_id": user_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {}
    
    if request.subscription_tier is not None:
        update_data["subscription_tier"] = request.subscription_tier
    
    if request.subscription_status is not None:
        update_data["subscription_status"] = request.subscription_status
    
    if request.role is not None:
        update_data["role"] = request.role
    
    if request.is_active is not None:
        update_data["is_active"] = request.is_active
    
    if request.notes is not None:
        update_data["admin_notes"] = request.notes
    
    if request.trial_end_date is not None:
        update_data["trial_end_date"] = request.trial_end_date
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_data["updated_by"] = admin.user_id
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    # Log admin action
    await db.admin_logs.insert_one({
        "admin_id": admin.user_id,
        "action": "update_user",
        "target_user_id": user_id,
        "changes": update_data,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "User updated successfully", "updated_fields": list(update_data.keys())}


@router.post("/{user_id}/extend-trial")
async def extend_trial(
    user_id: str,
    days: int = Query(7, ge=1, le=30),
    admin: User = Depends(verify_admin)
):
    """Extend user's trial period"""
    user = await db.users.find_one({"user_id": user_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_trial_end = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "subscription_status": "trial",
            "trial_end_date": new_trial_end,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log admin action
    await db.admin_logs.insert_one({
        "admin_id": admin.user_id,
        "action": "extend_trial",
        "target_user_id": user_id,
        "days_extended": days,
        "new_trial_end": new_trial_end,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "message": f"Trial extended by {days} days",
        "new_trial_end": new_trial_end
    }


@router.post("/{user_id}/grant-subscription")
async def grant_subscription(
    user_id: str,
    tier: str = Query(..., regex="^(standard|vip|supplements)$"),
    duration_days: int = Query(30, ge=1, le=365),
    admin: User = Depends(verify_admin)
):
    """Grant free subscription to a user"""
    user = await db.users.find_one({"user_id": user_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    end_date = (datetime.now(timezone.utc) + timedelta(days=duration_days)).isoformat()
    
    # Update user
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "subscription_tier": tier,
            "subscription_status": "active",
            "subscription_end_date": end_date,
            "subscription_granted_by": admin.user_id,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Create subscription record
    await db.user_subscriptions.update_one(
        {"user_id": user_id},
        {"$set": {
            "user_id": user_id,
            "tier": tier,
            "status": "active",
            "billing_cycle": "granted",
            "started_at": datetime.now(timezone.utc).isoformat(),
            "ends_at": end_date,
            "granted_by_admin": admin.user_id
        }},
        upsert=True
    )
    
    # Log admin action
    await db.admin_logs.insert_one({
        "admin_id": admin.user_id,
        "action": "grant_subscription",
        "target_user_id": user_id,
        "tier": tier,
        "duration_days": duration_days,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "message": f"Subscription {tier} granted for {duration_days} days",
        "tier": tier,
        "end_date": end_date
    }


@router.delete("/{user_id}")
async def deactivate_user(user_id: str, admin: User = Depends(verify_admin)):
    """Deactivate a user account (soft delete)"""
    user = await db.users.find_one({"user_id": user_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Cannot deactivate admin accounts")
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "is_active": False,
            "subscription_status": "deactivated",
            "deactivated_at": datetime.now(timezone.utc).isoformat(),
            "deactivated_by": admin.user_id
        }}
    )
    
    # Log admin action
    await db.admin_logs.insert_one({
        "admin_id": admin.user_id,
        "action": "deactivate_user",
        "target_user_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "User deactivated successfully"}


@router.post("/{user_id}/reactivate")
async def reactivate_user(user_id: str, admin: User = Depends(verify_admin)):
    """Reactivate a deactivated user account"""
    user = await db.users.find_one({"user_id": user_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "is_active": True,
            "subscription_status": "trial",
            "reactivated_at": datetime.now(timezone.utc).isoformat(),
            "reactivated_by": admin.user_id
        }}
    )
    
    return {"message": "User reactivated successfully"}


@router.post("/bulk-action")
async def bulk_action(request: BulkActionRequest, admin: User = Depends(verify_admin)):
    """Perform bulk actions on multiple users"""
    
    if not request.user_ids:
        raise HTTPException(status_code=400, detail="No users selected")
    
    success_count = 0
    
    for user_id in request.user_ids:
        try:
            if request.action == "activate":
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"is_active": True, "subscription_status": "active"}}
                )
            elif request.action == "deactivate":
                await db.users.update_one(
                    {"user_id": user_id, "role": {"$ne": "admin"}},
                    {"$set": {"is_active": False, "subscription_status": "deactivated"}}
                )
            elif request.action == "upgrade" and request.value:
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"subscription_tier": request.value}}
                )
            elif request.action == "extend_trial":
                days = int(request.value) if request.value else 7
                new_end = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"subscription_status": "trial", "trial_end_date": new_end}}
                )
            
            success_count += 1
        except Exception as e:
            print(f"Error processing user {user_id}: {e}")
    
    # Log bulk action
    await db.admin_logs.insert_one({
        "admin_id": admin.user_id,
        "action": f"bulk_{request.action}",
        "affected_users": request.user_ids,
        "success_count": success_count,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "message": f"Bulk action completed",
        "action": request.action,
        "success_count": success_count,
        "total": len(request.user_ids)
    }


@router.get("/export/csv")
async def export_users_csv(
    status: Optional[str] = None,
    tier: Optional[str] = None,
    admin: User = Depends(verify_admin)
):
    """Export users to CSV format"""
    query = {}
    
    if status and status != "all":
        query["subscription_status"] = status
    if tier and tier != "all":
        query["subscription_tier"] = tier
    
    users = await db.users.find(
        query,
        {"_id": 0, "password": 0}
    ).to_list(10000)
    
    # Build CSV content
    csv_lines = ["user_id,email,name,tier,status,role,created_at"]
    
    for user in users:
        line = f"{user.get('user_id', '')},{user.get('email', '')},{user.get('name', '')},{user.get('subscription_tier', 'free')},{user.get('subscription_status', 'none')},{user.get('role', 'user')},{user.get('created_at', '')}"
        csv_lines.append(line)
    
    return {
        "csv_content": "\n".join(csv_lines),
        "total_users": len(users),
        "filename": f"fitmaxpro_users_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    }
