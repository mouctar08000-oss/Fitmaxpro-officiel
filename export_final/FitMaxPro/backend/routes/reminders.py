"""
FitMaxPro - Reminders Routes
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db
from models.schemas import User
from routes.auth import get_current_user

router = APIRouter(prefix="/reminders", tags=["Reminders"])


class ReminderCreate(BaseModel):
    workout_id: str
    workout_title: str
    day_of_week: int
    time: str
    repeat_weekly: bool = True
    notes: Optional[str] = None


class ReminderUpdate(BaseModel):
    day_of_week: Optional[int] = None
    time: Optional[str] = None
    repeat_weekly: Optional[bool] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


@router.post("")
async def create_reminder(reminder: ReminderCreate, user: User = Depends(get_current_user)):
    """Create a new reminder"""
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


@router.get("")
async def get_my_reminders(user: User = Depends(get_current_user)):
    """Get all user reminders"""
    reminders = await db.reminders.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("day_of_week", 1).to_list(50)
    
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


@router.put("/{reminder_id}")
async def update_reminder(reminder_id: str, update: ReminderUpdate, user: User = Depends(get_current_user)):
    """Update a reminder"""
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


@router.delete("/{reminder_id}")
async def delete_reminder(reminder_id: str, user: User = Depends(get_current_user)):
    """Delete a reminder"""
    result = await db.reminders.delete_one(
        {"reminder_id": reminder_id, "user_id": user.user_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    return {"message": "Reminder deleted successfully"}


@router.get("/today")
async def get_today_reminders(user: User = Depends(get_current_user)):
    """Get today's reminders"""
    today = datetime.now(timezone.utc).weekday()
    
    reminders = await db.reminders.find(
        {"user_id": user.user_id, "day_of_week": today, "is_active": True},
        {"_id": 0}
    ).to_list(10)
    
    return {"reminders": reminders, "count": len(reminders)}


@router.get("/upcoming")
async def get_upcoming_reminders(user: User = Depends(get_current_user)):
    """Get next 7 days reminders"""
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
        if days_until == 0 and r["time"] < current_time:
            days_until = 7
        
        r["days_until"] = days_until
        r["day_name_fr"] = days_fr[r["day_of_week"]]
        r["day_name_en"] = days_en[r["day_of_week"]]
        upcoming.append(r)
    
    upcoming.sort(key=lambda x: (x["days_until"], x["time"]))
    
    return {"upcoming": upcoming[:10]}


@router.post("/{reminder_id}/toggle")
async def toggle_reminder(reminder_id: str, user: User = Depends(get_current_user)):
    """Toggle reminder active status"""
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
    
    return {"is_active": new_status, "message": f"Reminder {'enabled' if new_status else 'disabled'}"}
