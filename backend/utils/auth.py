"""
FitMaxPro - Authentication Utilities
"""
from fastapi import Request, HTTPException, Header, Depends
from typing import Optional
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import uuid

from ..utils.config import db, SECRET_KEY
from ..models.schemas import User, UserSession

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def generate_session_token() -> str:
    return str(uuid.uuid4())

async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> User:
    """Get current user from session token (cookie or header)"""
    session_token = request.cookies.get("session_token")
    
    if not session_token and authorization:
        if authorization.startswith("Bearer "):
            session_token = authorization[7:]
        else:
            session_token = authorization
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = await db.sessions.find_one({
        "session_token": session_token,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    })
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    user_data = await db.users.find_one({"user_id": session["user_id"]})
    if not user_data:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_data)

async def verify_admin(current_user: User = Depends(get_current_user)) -> User:
    """Verify that the current user is an admin"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def create_user_session(user_id: str, days_valid: int = 30) -> str:
    """Create a new session for a user"""
    session_token = generate_session_token()
    session_data = {
        "user_id": user_id,
        "session_token": session_token,
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(days=days_valid)
    }
    await db.sessions.insert_one(session_data)
    return session_token

async def delete_user_sessions(user_id: str):
    """Delete all sessions for a user"""
    await db.sessions.delete_many({"user_id": user_id})

async def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email"""
    return await db.users.find_one({"email": email.lower()})

async def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user by ID"""
    return await db.users.find_one({"user_id": user_id})
