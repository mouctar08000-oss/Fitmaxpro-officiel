"""
FitMaxPro - WebSocket Sync Routes
Real-time synchronization for multi-device support
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List, Set
import json
import asyncio
from datetime import datetime, timezone

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db

router = APIRouter(prefix="/sync", tags=["Sync"])

# Store active WebSocket connections per user
class ConnectionManager:
    def __init__(self):
        # user_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        print(f"[WS] User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")
        
    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        print(f"[WS] User {user_id} disconnected")
        
    async def send_personal_message(self, message: dict, user_id: str):
        """Send message to all devices of a specific user"""
        if user_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.append(connection)
            
            # Clean up disconnected sockets
            for conn in disconnected:
                self.active_connections[user_id].discard(conn)
                
    async def broadcast_to_user(self, user_id: str, event_type: str, data: dict):
        """Broadcast sync event to all user's devices"""
        message = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.send_personal_message(message, user_id)
        
    def get_user_device_count(self, user_id: str) -> int:
        return len(self.active_connections.get(user_id, set()))


manager = ConnectionManager()


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time sync"""
    await manager.connect(websocket, user_id)
    
    # Send initial sync data
    try:
        # Get user's latest data
        user_data = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
        
        await websocket.send_json({
            "type": "connected",
            "data": {
                "user_id": user_id,
                "device_count": manager.get_user_device_count(user_id),
                "user_data": user_data,
                "server_time": datetime.now(timezone.utc).isoformat()
            }
        })
        
        # Listen for messages
        while True:
            data = await websocket.receive_json()
            await handle_sync_message(websocket, user_id, data)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"[WS] Error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)


async def handle_sync_message(websocket: WebSocket, user_id: str, data: dict):
    """Handle incoming sync messages"""
    msg_type = data.get("type")
    payload = data.get("data", {})
    
    if msg_type == "sync_progress":
        # User is syncing their workout progress
        await sync_workout_progress(user_id, payload)
        
    elif msg_type == "sync_session":
        # Sync workout session data
        await sync_session_data(user_id, payload)
        
    elif msg_type == "request_full_sync":
        # Client requesting full data sync
        await send_full_sync(websocket, user_id)
        
    elif msg_type == "ping":
        # Keep-alive ping
        await websocket.send_json({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()})


async def sync_workout_progress(user_id: str, data: dict):
    """Sync workout progress and broadcast to other devices"""
    # Update user progress in database
    if "completed_workouts" in data:
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "completed_workouts": data["completed_workouts"],
                "last_sync": datetime.now(timezone.utc).isoformat()
            }}
        )
    
    # Broadcast to other devices (last write wins)
    await manager.broadcast_to_user(user_id, "progress_updated", data)


async def sync_session_data(user_id: str, data: dict):
    """Sync session data across devices"""
    session_id = data.get("session_id")
    
    if session_id:
        # Update session in database
        await db.workout_sessions.update_one(
            {"session_id": session_id, "user_id": user_id},
            {"$set": {
                "synced_at": datetime.now(timezone.utc).isoformat(),
                **data
            }},
            upsert=True
        )
    
    # Broadcast to other devices
    await manager.broadcast_to_user(user_id, "session_updated", data)


async def send_full_sync(websocket: WebSocket, user_id: str):
    """Send full data sync to a specific device"""
    # Get all user data
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    sessions = await db.workout_sessions.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("started_at", -1).to_list(100)
    
    subscription = await db.user_subscriptions.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    
    await websocket.send_json({
        "type": "full_sync",
        "data": {
            "user": user,
            "sessions": sessions,
            "subscription": subscription,
            "synced_at": datetime.now(timezone.utc).isoformat()
        }
    })


# HTTP endpoint to trigger sync for a user (e.g., from admin or other services)
@router.post("/trigger/{user_id}")
async def trigger_sync(user_id: str, event_type: str = "data_updated", data: dict = None):
    """Trigger a sync event for a user (API endpoint)"""
    await manager.broadcast_to_user(user_id, event_type, data or {})
    return {
        "success": True,
        "user_id": user_id,
        "device_count": manager.get_user_device_count(user_id)
    }


@router.get("/status/{user_id}")
async def get_sync_status(user_id: str):
    """Get sync status for a user"""
    return {
        "user_id": user_id,
        "connected_devices": manager.get_user_device_count(user_id),
        "is_online": manager.get_user_device_count(user_id) > 0
    }
