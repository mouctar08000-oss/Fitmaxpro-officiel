"""Authentication utilities"""
from fastapi import Request, HTTPException, Header, Depends
from passlib.context import CryptContext
from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict

from .database import db

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    subscription_tier: str = "none"
    subscription_status: str = "inactive"
    role: Optional[str] = None
    subscription: Optional[dict] = None
    created_at: datetime

async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> User:
    """Get current authenticated user from session token"""
    session_token = request.cookies.get("session_token")
    
    if not session_token and authorization:
        if authorization.startswith("Bearer "):
            session_token = authorization.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        await db.user_sessions.delete_one({"session_token": session_token})
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc["created_at"], str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    return User(**user_doc)

async def verify_admin(current_user: User = Depends(get_current_user)):
    """Verify that the current user is an admin (VIP tier)"""
    if current_user.subscription_tier != "vip":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
