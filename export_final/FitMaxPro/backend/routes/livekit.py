"""
FitMaxPro - LiveKit WebRTC Routes
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid
import os

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

router = APIRouter(prefix="/livekit", tags=["LiveKit WebRTC"])


class LiveKitTokenRequest(BaseModel):
    room_name: str
    participant_name: Optional[str] = None
    can_publish: bool = True
    can_subscribe: bool = True
    room_type: str = "live"


class LiveKitRoomRequest(BaseModel):
    room_name: str
    room_type: str = "live"
    max_participants: Optional[int] = None
    empty_timeout: Optional[int] = 300


@router.get("/status")
async def livekit_status():
    """Check if LiveKit is configured"""
    configured = bool(LIVEKIT_URL and LIVEKIT_API_KEY and LIVEKIT_API_SECRET and LIVEKIT_AVAILABLE)
    return {
        "configured": configured,
        "server_url": LIVEKIT_URL if configured else None,
        "message": "LiveKit WebRTC is ready" if configured else "LiveKit not configured"
    }


@router.post("/token")
async def get_livekit_token(request: LiveKitTokenRequest, current_user: User = Depends(get_current_user)):
    """Generate a LiveKit JWT token for room access"""
    if not LIVEKIT_AVAILABLE:
        raise HTTPException(status_code=503, detail="LiveKit not available")
    
    if not all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        raise HTTPException(status_code=503, detail="LiveKit not configured")
    
    try:
        token = livekit_api.AccessToken(
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
        )
        
        token.identity = current_user.user_id
        token.name = request.participant_name or current_user.name
        
        token.video_grants = livekit_api.VideoGrants(
            room_join=True,
            room=request.room_name,
            can_publish=request.can_publish,
            can_subscribe=request.can_subscribe,
            can_publish_data=True,
            can_update_own_metadata=True,
        )
        
        jwt_token = token.to_jwt()
        
        await db.livekit_sessions.insert_one({
            "session_id": str(uuid.uuid4()),
            "user_id": current_user.user_id,
            "user_name": current_user.name,
            "room_name": request.room_name,
            "room_type": request.room_type,
            "can_publish": request.can_publish,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "token": jwt_token,
            "server_url": LIVEKIT_URL,
            "room_name": request.room_name,
            "identity": current_user.user_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rooms")
async def create_livekit_room(request: LiveKitRoomRequest, current_user: User = Depends(verify_admin)):
    """Create a new LiveKit room (admin only)"""
    if not LIVEKIT_AVAILABLE:
        raise HTTPException(status_code=503, detail="LiveKit not available")
    
    if not all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        raise HTTPException(status_code=503, detail="LiveKit not configured")
    
    try:
        lkapi = livekit_api.LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        
        max_participants = 2 if request.room_type == "call" else (request.max_participants or 100)
        
        room_info = await lkapi.room.create_room(
            livekit_api.CreateRoomRequest(
                name=request.room_name,
                max_participants=max_participants,
                empty_timeout=request.empty_timeout or 300,
            )
        )
        
        await lkapi.aclose()
        
        await db.livekit_rooms.update_one(
            {"room_name": request.room_name},
            {"$set": {
                "room_name": request.room_name,
                "room_type": request.room_type,
                "max_participants": max_participants,
                "created_by": current_user.user_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "status": "active"
            }},
            upsert=True
        )
        
        return {
            "room_name": room_info.name,
            "max_participants": room_info.max_participants,
            "num_participants": room_info.num_participants,
            "room_type": request.room_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rooms/{room_name}/participants")
async def list_room_participants(room_name: str, current_user: User = Depends(get_current_user)):
    """List all participants in a room"""
    if not LIVEKIT_AVAILABLE or not all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        return {"participants": [], "message": "LiveKit not configured"}
    
    try:
        lkapi = livekit_api.LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        
        participants = await lkapi.room.list_participants(
            livekit_api.ListParticipantsRequest(room=room_name)
        )
        
        await lkapi.aclose()
        
        return {
            "participants": [
                {
                    "identity": p.identity,
                    "name": p.name,
                    "state": str(p.state),
                    "joined_at": p.joined_at,
                }
                for p in participants.participants
            ]
        }
    except Exception as e:
        return {"participants": [], "error": str(e)}


@router.delete("/rooms/{room_name}")
async def delete_livekit_room(room_name: str, current_user: User = Depends(verify_admin)):
    """Delete a LiveKit room (admin only)"""
    if not LIVEKIT_AVAILABLE or not all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        raise HTTPException(status_code=503, detail="LiveKit not configured")
    
    try:
        lkapi = livekit_api.LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        await lkapi.room.delete_room(livekit_api.DeleteRoomRequest(room=room_name))
        await lkapi.aclose()
        
        await db.livekit_rooms.update_one(
            {"room_name": room_name},
            {"$set": {"status": "deleted", "deleted_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        return {"success": True, "message": f"Room {room_name} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/active-rooms")
async def get_active_livekit_rooms(current_user: User = Depends(get_current_user)):
    """Get all active LiveKit rooms"""
    rooms = await db.livekit_rooms.find(
        {"status": "active"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"rooms": rooms}


# One-to-One Calls
@router.post("/calls/initiate")
async def initiate_call(callee_id: str, call_type: str = "video", current_user: User = Depends(get_current_user)):
    """Initiate a one-to-one call"""
    call_id = f"call_{uuid.uuid4().hex[:12]}"
    room_name = f"call_{current_user.user_id}_{callee_id}_{call_id[-8:]}"
    
    call_doc = {
        "call_id": call_id,
        "room_name": room_name,
        "caller_id": current_user.user_id,
        "caller_name": current_user.name,
        "callee_id": callee_id,
        "call_type": call_type,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.livekit_calls.insert_one(call_doc)
    
    if LIVEKIT_AVAILABLE and all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        token = livekit_api.AccessToken(
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
        )
        token.identity = current_user.user_id
        token.name = current_user.name
        token.video_grants = livekit_api.VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=True,
            can_subscribe=True,
            can_publish_data=True,
        )
        jwt_token = token.to_jwt()
        
        return {
            "call_id": call_id,
            "room_name": room_name,
            "token": jwt_token,
            "server_url": LIVEKIT_URL,
            "status": "pending"
        }
    
    return {
        "call_id": call_id,
        "room_name": room_name,
        "status": "pending",
        "message": "LiveKit not configured"
    }


@router.get("/calls/pending")
async def get_pending_calls(current_user: User = Depends(get_current_user)):
    """Get pending calls for the current user"""
    calls = await db.livekit_calls.find(
        {"callee_id": current_user.user_id, "status": "pending"},
        {"_id": 0}
    ).to_list(10)
    
    return {"calls": calls}


@router.post("/calls/{call_id}/answer")
async def answer_call(call_id: str, accept: bool = True, current_user: User = Depends(get_current_user)):
    """Answer a pending call"""
    call = await db.livekit_calls.find_one({"call_id": call_id, "callee_id": current_user.user_id})
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    if not accept:
        await db.livekit_calls.update_one(
            {"call_id": call_id},
            {"$set": {"status": "declined", "answered_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"status": "declined"}
    
    await db.livekit_calls.update_one(
        {"call_id": call_id},
        {"$set": {"status": "active", "answered_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if LIVEKIT_AVAILABLE and all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        token = livekit_api.AccessToken(
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
        )
        token.identity = current_user.user_id
        token.name = current_user.name
        token.video_grants = livekit_api.VideoGrants(
            room_join=True,
            room=call["room_name"],
            can_publish=True,
            can_subscribe=True,
            can_publish_data=True,
        )
        jwt_token = token.to_jwt()
        
        return {
            "status": "active",
            "room_name": call["room_name"],
            "token": jwt_token,
            "server_url": LIVEKIT_URL,
            "caller_name": call["caller_name"]
        }
    
    return {"status": "active", "room_name": call["room_name"]}


@router.post("/calls/{call_id}/end")
async def end_call(call_id: str, duration: int = 0, current_user: User = Depends(get_current_user)):
    """End an active call"""
    result = await db.livekit_calls.update_one(
        {"call_id": call_id, "$or": [{"caller_id": current_user.user_id}, {"callee_id": current_user.user_id}]},
        {"$set": {
            "status": "ended",
            "ended_at": datetime.now(timezone.utc).isoformat(),
            "duration": duration
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Call not found")
    
    return {"status": "ended", "duration": duration}
