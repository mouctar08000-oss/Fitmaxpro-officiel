"""
FitMaxPro - Live Streaming Routes
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime, timezone
import uuid
import os
import asyncio

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db, LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET

try:
    from livekit import api as livekit_api
    LIVEKIT_AVAILABLE = True
except ImportError:
    LIVEKIT_AVAILABLE = False

from models.schemas import User
from routes.auth import get_current_user, verify_admin

router = APIRouter(prefix="/lives", tags=["Live Streaming"])


class LiveCreate(BaseModel):
    title: str
    description: Optional[str] = None
    vip_only: bool = False


class LiveChat(BaseModel):
    message: str


class CreateScheduledLive(BaseModel):
    title: str
    description: Optional[str] = None
    is_vip: bool = False
    scheduled_time: Optional[str] = None


class LiveRequest(BaseModel):
    title: str
    message: Optional[str] = None
    category: Optional[str] = None
    exercise_type: Optional[str] = None
    category_label: Optional[str] = None
    exercise_label: Optional[str] = None


# IMPORTANT: Static routes must be defined BEFORE parameterized routes

@router.get("")
async def get_active_lives(current_user: User = Depends(get_current_user)):
    """Get all active lives"""
    lives = await db.lives.find(
        {"status": "active"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    
    user_sub = current_user.subscription or {}
    is_vip = user_sub.get("type") == "vip" or current_user.role == "admin"
    
    for live in lives:
        if live.get("vip_only") and not is_vip:
            live["restricted"] = True
    
    return {"lives": lives}


@router.get("/analytics")
async def get_lives_analytics(current_user: User = Depends(verify_admin)):
    """Get comprehensive analytics for all lives (admin only)"""
    all_lives = await db.lives.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    
    total_lives = len(all_lives)
    total_viewers = sum(l.get('peak_viewers', 0) for l in all_lives)
    total_duration = sum(l.get('duration_minutes', 0) for l in all_lives)
    total_messages = sum(len(l.get('chat_messages', [])) for l in all_lives)
    total_reactions = sum(sum(l.get('reactions', {}).values()) for l in all_lives)
    
    ended_lives = [l for l in all_lives if l.get('status') == 'ended']
    
    top_by_viewers = sorted(ended_lives, key=lambda x: x.get('peak_viewers', 0), reverse=True)[:5]
    top_by_duration = sorted(ended_lives, key=lambda x: x.get('duration_minutes', 0), reverse=True)[:5]
    
    recent_lives = [{
        "live_id": l.get('live_id'),
        "title": l.get('title'),
        "status": l.get('status'),
        "created_at": l.get('created_at'),
        "duration_minutes": l.get('duration_minutes', 0),
        "peak_viewers": l.get('peak_viewers', 0),
        "chat_messages_count": len(l.get('chat_messages', [])),
        "total_reactions": sum(l.get('reactions', {}).values())
    } for l in all_lives[:20]]
    
    avg_viewers = total_viewers / len(ended_lives) if ended_lives else 0
    avg_duration = total_duration / len(ended_lives) if ended_lives else 0
    
    return {
        "summary": {
            "total_lives": total_lives,
            "active_lives": len([l for l in all_lives if l.get('status') == 'active']),
            "ended_lives": len(ended_lives),
            "total_viewers_all_time": total_viewers,
            "total_duration_minutes": total_duration,
            "total_chat_messages": total_messages,
            "total_reactions": total_reactions
        },
        "averages": {
            "avg_peak_viewers": round(avg_viewers, 1),
            "avg_duration_minutes": round(avg_duration, 1)
        },
        "top_performers": {
            "by_viewers": [{"live_id": l.get('live_id'), "title": l.get('title'), "peak_viewers": l.get('peak_viewers', 0)} for l in top_by_viewers],
            "by_duration": [{"live_id": l.get('live_id'), "title": l.get('title'), "duration_minutes": l.get('duration_minutes', 0)} for l in top_by_duration]
        },
        "recent_lives": recent_lives
    }


@router.get("/scheduled")
async def get_scheduled_lives(current_user: User = Depends(get_current_user)):
    """Get scheduled and active lives"""
    now = datetime.now(timezone.utc).isoformat()
    
    scheduled = await db.lives.find({
        "status": "scheduled",
        "scheduled_time": {"$gte": now}
    }, {"_id": 0}).sort("scheduled_time", 1).to_list(10)
    
    active = await db.lives.find({
        "status": "active"
    }, {"_id": 0}).to_list(5)
    
    return {
        "active_lives": active,
        "scheduled_lives": scheduled
    }


@router.get("/requests")
async def get_live_requests(current_user: User = Depends(get_current_user)):
    """Get live requests (for admin to see subscriber requests)"""
    requests = await db.live_requests.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {"requests": requests}


@router.post("/request")
async def create_live_request(request_data: LiveRequest, current_user: User = Depends(get_current_user)):
    """Submit a request for a live session (subscribers)"""
    request_id = f"req_{uuid.uuid4().hex[:12]}"
    
    request_doc = {
        "request_id": request_id,
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "title": request_data.title,
        "message": request_data.message,
        "category": request_data.category,
        "exercise_type": request_data.exercise_type,
        "category_label": request_data.category_label,
        "exercise_label": request_data.exercise_label,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.live_requests.insert_one(request_doc)
    return {"success": True, "request_id": request_id}


@router.post("")
async def create_live(live_data: LiveCreate, admin: User = Depends(verify_admin)):
    """Admin: Create a new live session"""
    live_id = f"live_{uuid.uuid4().hex[:12]}"
    room_name = f"live_{live_id}"
    
    live = {
        "live_id": live_id,
        "room_name": room_name,
        "title": live_data.title,
        "description": live_data.description,
        "host_id": admin.user_id,
        "host_name": admin.name,
        "vip_only": live_data.vip_only,
        "status": "active",
        "viewer_count": 0,
        "peak_viewers": 0,
        "viewers": [],
        "chat_messages": [],
        "reactions": {"fire": 0, "heart": 0, "muscle": 0, "clap": 0},
        "settings": {"chat_enabled": True, "reactions_enabled": True},
        "created_at": datetime.now(timezone.utc).isoformat(),
        "started_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.lives.insert_one(live)
    
    if LIVEKIT_AVAILABLE and all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        try:
            # First, create the LiveKit room
            http_url = LIVEKIT_URL.replace("wss://", "https://")
            lkapi = livekit_api.LiveKitAPI(http_url, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            
            await lkapi.room.create_room(
                livekit_api.CreateRoomRequest(
                    name=room_name,
                    max_participants=100,
                    empty_timeout=300,
                )
            )
            await lkapi.aclose()
            
            # Generate the token for the host using chained syntax
            from livekit.api import AccessToken, VideoGrants
            jwt_token = (
                AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
                .with_identity(admin.user_id)
                .with_name(admin.name)
                .with_grants(VideoGrants(
                    room_join=True,
                    room=room_name,
                    can_publish=True,
                    can_subscribe=True,
                    can_publish_data=True,
                ))
            ).to_jwt()
            
            return {
                "live_id": live_id,
                "room_name": room_name,
                "livekit_room_name": room_name,
                "token": jwt_token,
                "host_token": jwt_token,
                "server_url": LIVEKIT_URL,
                "livekit_url": LIVEKIT_URL
            }
        except Exception as e:
            print(f"LiveKit room creation error: {e}")
            # Continue without LiveKit
    
    return {"live_id": live_id, "room_name": room_name}


@router.post("/schedule")
async def schedule_live(data: CreateScheduledLive, admin: User = Depends(verify_admin)):
    """Admin: Schedule a live session"""
    live_id = f"live_{uuid.uuid4().hex[:12]}"
    
    live = {
        "live_id": live_id,
        "title": data.title,
        "description": data.description,
        "created_by": admin.user_id,
        "creator_name": admin.name,
        "is_vip": data.is_vip,
        "status": "scheduled" if data.scheduled_time else "active",
        "scheduled_time": data.scheduled_time,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "viewer_count": 0,
        "chat_messages": []
    }
    
    await db.lives.insert_one(live)
    
    return {"success": True, "live_id": live_id, "status": live["status"]}


# Parameterized routes (must come AFTER static routes)

@router.get("/{live_id}")
async def get_live(live_id: str, current_user: User = Depends(get_current_user)):
    """Get live session details"""
    live = await db.lives.find_one({"live_id": live_id}, {"_id": 0})
    if not live:
        raise HTTPException(status_code=404, detail="Live not found")
    
    user_sub = current_user.subscription or {}
    is_vip = user_sub.get("type") == "vip" or current_user.role == "admin"
    
    if live.get("vip_only") and not is_vip:
        raise HTTPException(status_code=403, detail="VIP access required")
    
    return live


@router.post("/{live_id}/join")
async def join_live(live_id: str, current_user: User = Depends(get_current_user)):
    """Join a live session as viewer"""
    live = await db.lives.find_one({"live_id": live_id, "status": "active"})
    if not live:
        raise HTTPException(status_code=404, detail="Live not found or ended")
    
    user_sub = current_user.subscription or {}
    is_vip = user_sub.get("type") == "vip" or current_user.role == "admin"
    
    if live.get("vip_only") and not is_vip:
        raise HTTPException(status_code=403, detail="VIP access required")
    
    room_name = live.get("room_name", f"live_{live_id}")
    
    viewers = live.get("viewers", [])
    if current_user.user_id not in viewers:
        viewers.append(current_user.user_id)
        new_count = len(viewers)
        peak = max(live.get("peak_viewers", 0), new_count)
        
        await db.lives.update_one(
            {"live_id": live_id},
            {
                "$set": {
                    "viewers": viewers,
                    "viewer_count": new_count,
                    "peak_viewers": peak
                }
            }
        )
    
    if LIVEKIT_AVAILABLE and all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        from livekit.api import AccessToken, VideoGrants
        jwt_token = (
            AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            .with_identity(current_user.user_id)
            .with_name(current_user.name)
            .with_grants(VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=False,
                can_subscribe=True,
                can_publish_data=True,
            ))
        ).to_jwt()
        
        return {
            "token": jwt_token,
            "server_url": LIVEKIT_URL,
            "room_name": room_name,
            "live": live
        }
    
    return {"room_name": room_name, "live": live}


@router.post("/{live_id}/leave")
async def leave_live(live_id: str, current_user: User = Depends(get_current_user)):
    """Leave a live session"""
    await db.lives.update_one(
        {"live_id": live_id},
        {
            "$pull": {"viewers": current_user.user_id},
            "$inc": {"viewer_count": -1}
        }
    )
    return {"success": True}


@router.post("/{live_id}/reaction")
async def send_reaction(live_id: str, reaction_type: str, current_user: User = Depends(get_current_user)):
    """Send a reaction"""
    valid_reactions = ["fire", "heart", "muscle", "clap"]
    if reaction_type not in valid_reactions:
        raise HTTPException(status_code=400, detail=f"Invalid reaction. Use: {valid_reactions}")
    
    await db.lives.update_one(
        {"live_id": live_id, "status": "active"},
        {"$inc": {f"reactions.{reaction_type}": 1}}
    )
    
    return {"success": True, "reaction": reaction_type}


@router.get("/{live_id}/stats")
async def get_live_stats(live_id: str, current_user: User = Depends(get_current_user)):
    """Get real-time stats for a live session"""
    live = await db.lives.find_one({"live_id": live_id}, {"_id": 0})
    if not live:
        raise HTTPException(status_code=404, detail="Live not found")
    
    duration = 0
    if live.get('started_at'):
        started = datetime.fromisoformat(live['started_at'].replace('Z', '+00:00'))
        duration = int((datetime.now(timezone.utc) - started).total_seconds() / 60)
    
    return {
        "viewer_count": live.get('viewer_count', 0),
        "peak_viewers": live.get('peak_viewers', 0),
        "reactions": live.get('reactions', {}),
        "chat_count": len(live.get('chat_messages', [])),
        "duration_minutes": duration,
        "status": live.get('status')
    }


@router.post("/{live_id}/end")
async def end_live(live_id: str, current_user: User = Depends(get_current_user)):
    """End a live session (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admin can end lives")
    
    live = await db.lives.find_one({"live_id": live_id})
    if not live:
        raise HTTPException(status_code=404, detail="Live not found")
    
    duration_minutes = 0
    if live.get('started_at'):
        started_dt = datetime.fromisoformat(live['started_at'].replace('Z', '+00:00'))
        duration_minutes = int((datetime.now(timezone.utc) - started_dt).total_seconds() / 60)
    
    await db.lives.update_one(
        {"live_id": live_id},
        {
            "$set": {
                "status": "ended",
                "ended_at": datetime.now(timezone.utc).isoformat(),
                "duration_minutes": duration_minutes,
                "final_viewer_count": live.get('viewer_count', 0)
            }
        }
    )
    
    return {
        "success": True,
        "duration_minutes": duration_minutes,
        "peak_viewers": live.get('peak_viewers', 0),
        "total_reactions": sum(live.get('reactions', {}).values())
    }


@router.post("/{live_id}/chat")
async def send_chat_message(live_id: str, chat: LiveChat, current_user: User = Depends(get_current_user)):
    """Send a chat message in a live session"""
    live = await db.lives.find_one({"live_id": live_id, "status": "active"})
    if not live:
        raise HTTPException(status_code=404, detail="Live not found or ended")
    
    message_doc = {
        "message_id": f"msg_{uuid.uuid4().hex[:8]}",
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "message": chat.message[:500],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "is_host": current_user.user_id == live.get('host_id')
    }
    
    await db.lives.update_one(
        {"live_id": live_id},
        {"$push": {"chat_messages": message_doc}}
    )
    
    return {"success": True, "message": message_doc}


@router.get("/{live_id}/chat")
async def get_chat_messages(live_id: str, since: str = None, current_user: User = Depends(get_current_user)):
    """Get chat messages for a live session"""
    live = await db.lives.find_one({"live_id": live_id}, {"chat_messages": 1})
    if not live:
        raise HTTPException(status_code=404, detail="Live not found")
    
    messages = live.get('chat_messages', [])
    
    if since:
        messages = [m for m in messages if m.get('timestamp', '') > since]
    
    return messages[-100:]
