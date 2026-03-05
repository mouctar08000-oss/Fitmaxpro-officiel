"""
FitMaxPro - Push Notifications Routes
Handles web push notifications for incoming calls and other events
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging
import json
import os

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db, VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY, VAPID_CLAIMS
from models.schemas import User
from routes.auth import get_current_user, verify_admin

try:
    from pywebpush import webpush, WebPushException
    WEBPUSH_AVAILABLE = True
except ImportError:
    WEBPUSH_AVAILABLE = False

router = APIRouter(prefix="/notifications", tags=["Push Notifications"])


class PushSubscription(BaseModel):
    endpoint: str
    keys: dict  # {p256dh, auth}


class NotificationPayload(BaseModel):
    title: str
    body: str
    icon: Optional[str] = "/logo192.png"
    badge: Optional[str] = "/badge.png"
    tag: Optional[str] = None
    data: Optional[dict] = None
    actions: Optional[List[dict]] = None


class CallNotification(BaseModel):
    caller_id: str
    caller_name: str
    call_type: str = "video"  # video or audio
    room_name: str


@router.get("/vapid-key")
async def get_vapid_public_key():
    """Get VAPID public key for push subscription"""
    return {
        "publicKey": VAPID_PUBLIC_KEY,
        "configured": bool(VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY)
    }


@router.post("/subscribe")
async def subscribe_to_push(
    subscription: PushSubscription,
    current_user: User = Depends(get_current_user)
):
    """Subscribe user to push notifications"""
    subscription_data = {
        "user_id": current_user.user_id,
        "endpoint": subscription.endpoint,
        "keys": subscription.keys,
        "subscribed_at": datetime.now(timezone.utc).isoformat(),
        "active": True
    }
    
    # Upsert subscription (update if exists, insert if not)
    await db.push_subscriptions.update_one(
        {"user_id": current_user.user_id, "endpoint": subscription.endpoint},
        {"$set": subscription_data},
        upsert=True
    )
    
    logging.info(f"Push subscription saved for user {current_user.user_id}")
    return {"success": True, "message": "Subscription saved"}


@router.delete("/unsubscribe")
async def unsubscribe_from_push(
    endpoint: str,
    current_user: User = Depends(get_current_user)
):
    """Unsubscribe user from push notifications"""
    result = await db.push_subscriptions.delete_one({
        "user_id": current_user.user_id,
        "endpoint": endpoint
    })
    
    if result.deleted_count > 0:
        return {"success": True, "message": "Subscription removed"}
    return {"success": False, "message": "Subscription not found"}


@router.post("/send")
async def send_notification(
    user_id: str,
    payload: NotificationPayload,
    background_tasks: BackgroundTasks,
    admin: User = Depends(verify_admin)
):
    """Admin: Send push notification to a specific user"""
    subscriptions = await db.push_subscriptions.find(
        {"user_id": user_id, "active": True},
        {"_id": 0}
    ).to_list(10)
    
    if not subscriptions:
        raise HTTPException(status_code=404, detail="No active subscriptions for user")
    
    # Send in background
    background_tasks.add_task(
        send_push_to_subscriptions,
        subscriptions=subscriptions,
        payload=payload.model_dump()
    )
    
    return {"success": True, "message": f"Notification queued for {len(subscriptions)} devices"}


@router.post("/call-notification")
async def send_call_notification(
    notification: CallNotification,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Send incoming call notification to a user"""
    # Get recipient's push subscriptions
    callee_id = notification.room_name.split("_")[2] if "_" in notification.room_name else None
    
    if not callee_id:
        raise HTTPException(status_code=400, detail="Invalid room name format")
    
    subscriptions = await db.push_subscriptions.find(
        {"user_id": callee_id, "active": True},
        {"_id": 0}
    ).to_list(10)
    
    if not subscriptions:
        logging.warning(f"No push subscriptions found for user {callee_id}")
        return {"success": False, "message": "User has no push subscriptions"}
    
    # Prepare call notification payload
    call_type_label = "Appel vidéo" if notification.call_type == "video" else "Appel audio"
    payload = {
        "title": f"{call_type_label} entrant",
        "body": f"{notification.caller_name} vous appelle",
        "icon": "/logo192.png",
        "badge": "/badge.png",
        "tag": f"call_{notification.room_name}",
        "requireInteraction": True,
        "data": {
            "type": "incoming_call",
            "caller_id": notification.caller_id,
            "caller_name": notification.caller_name,
            "call_type": notification.call_type,
            "room_name": notification.room_name,
            "url": f"/call?room={notification.room_name}&answer=true"
        },
        "actions": [
            {"action": "answer", "title": "Répondre"},
            {"action": "decline", "title": "Refuser"}
        ]
    }
    
    # Send in background
    background_tasks.add_task(
        send_push_to_subscriptions,
        subscriptions=subscriptions,
        payload=payload
    )
    
    logging.info(f"Call notification sent to {callee_id} from {notification.caller_name}")
    return {"success": True, "message": "Call notification sent"}


async def send_push_to_subscriptions(subscriptions: list, payload: dict):
    """Send push notification to multiple subscriptions"""
    if not WEBPUSH_AVAILABLE:
        logging.error("pywebpush not installed")
        return
    
    if not VAPID_PRIVATE_KEY or not VAPID_PUBLIC_KEY:
        logging.error("VAPID keys not configured")
        return
    
    for sub in subscriptions:
        try:
            subscription_info = {
                "endpoint": sub["endpoint"],
                "keys": sub["keys"]
            }
            
            webpush(
                subscription_info=subscription_info,
                data=json.dumps(payload),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS
            )
            
            logging.info(f"Push notification sent to {sub['user_id']}")
            
        except WebPushException as e:
            logging.error(f"Push notification failed: {e}")
            
            # If subscription is invalid, mark it inactive
            if e.response and e.response.status_code in [404, 410]:
                await db.push_subscriptions.update_one(
                    {"endpoint": sub["endpoint"]},
                    {"$set": {"active": False}}
                )
        except Exception as e:
            logging.error(f"Unexpected error sending push: {e}")


@router.get("/my-subscriptions")
async def get_my_subscriptions(current_user: User = Depends(get_current_user)):
    """Get current user's push subscriptions"""
    subscriptions = await db.push_subscriptions.find(
        {"user_id": current_user.user_id},
        {"_id": 0, "keys": 0}  # Don't expose keys
    ).to_list(10)
    
    return {"subscriptions": subscriptions}


# Admin routes
@router.post("/admin/broadcast")
async def admin_broadcast_notification(
    payload: NotificationPayload,
    tier: Optional[str] = None,
    background_tasks: BackgroundTasks = None,
    admin: User = Depends(verify_admin)
):
    """Admin: Broadcast notification to all users or specific tier"""
    query = {"active": True}
    
    if tier:
        # Get users with specific tier
        users = await db.users.find(
            {"subscription_tier": tier},
            {"user_id": 1}
        ).to_list(1000)
        user_ids = [u["user_id"] for u in users]
        query["user_id"] = {"$in": user_ids}
    
    subscriptions = await db.push_subscriptions.find(query, {"_id": 0}).to_list(5000)
    
    if not subscriptions:
        return {"success": False, "message": "No subscriptions found"}
    
    # Send in background
    background_tasks.add_task(
        send_push_to_subscriptions,
        subscriptions=subscriptions,
        payload=payload.model_dump()
    )
    
    return {
        "success": True,
        "message": f"Broadcast queued for {len(subscriptions)} devices"
    }


@router.get("/admin/stats")
async def admin_get_notification_stats(admin: User = Depends(verify_admin)):
    """Admin: Get push notification statistics"""
    total_subscriptions = await db.push_subscriptions.count_documents({})
    active_subscriptions = await db.push_subscriptions.count_documents({"active": True})
    
    # Group by user
    pipeline = [
        {"$group": {"_id": "$user_id", "count": {"$sum": 1}}},
        {"$count": "unique_users"}
    ]
    unique_result = await db.push_subscriptions.aggregate(pipeline).to_list(1)
    unique_users = unique_result[0]["unique_users"] if unique_result else 0
    
    return {
        "total_subscriptions": total_subscriptions,
        "active_subscriptions": active_subscriptions,
        "unique_users": unique_users
    }
