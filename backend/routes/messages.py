"""
FitMaxPro - Messages Routes
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timezone
import uuid

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db
from models.schemas import User, MessageCreate
from routes.auth import get_current_user, verify_admin

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/send")
async def send_message(message: MessageCreate, user: User = Depends(get_current_user)):
    """Send a message (user -> admin or admin -> user)"""
    message_id = str(uuid.uuid4())
    is_admin = user.role == 'admin'
    
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


@router.get("/inbox")
async def get_inbox(user: User = Depends(get_current_user)):
    """Get inbox messages"""
    is_admin = user.role == 'admin'
    
    if is_admin:
        messages = await db.messages.find(
            {"recipient_id": "admin"},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
    else:
        messages = await db.messages.find(
            {"$or": [
                {"sender_id": user.user_id},
                {"recipient_id": user.user_id}
            ]},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
    
    unread_count = sum(1 for m in messages if not m.get("read") and m.get("recipient_id") == user.user_id)
    
    return {"messages": messages, "unread_count": unread_count}


@router.get("/conversation/{user_id}")
async def get_conversation(user_id: str, admin: User = Depends(verify_admin)):
    """Admin: Get conversation with specific user"""
    messages = await db.messages.find(
        {"$or": [
            {"sender_id": user_id, "recipient_id": "admin"},
            {"sender_id": admin.user_id, "recipient_id": user_id}
        ]},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    
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


@router.post("/mark-read/{message_id}")
async def mark_message_read(message_id: str, user: User = Depends(get_current_user)):
    """Mark message as read"""
    await db.messages.update_one(
        {"message_id": message_id},
        {"$set": {"read": True}}
    )
    return {"status": "marked as read"}
