"""
FitMaxPro - Authentication Routes
"""
from fastapi import APIRouter, HTTPException, Request, Response, Depends, Header
from typing import Optional
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import uuid
import httpx
import logging
import os
import resend

import sys
sys.path.insert(0, '/app/backend')
from utils.config import db, RESEND_API_KEY, SENDER_EMAIL, APP_URL
from models.schemas import (
    User, RegisterRequest, LoginRequest, SessionRequest, 
    SessionResponse, ForgotPasswordRequest
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> User:
    """Get current user from session token (cookie or header)"""
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
    
    # Auto-renew session on activity
    new_expires_at = (datetime.now(timezone.utc) + timedelta(days=365)).isoformat()
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {
            "expires_at": new_expires_at,
            "last_activity": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc["created_at"], str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    return User(**user_doc)


async def verify_admin(current_user: User = Depends(get_current_user)) -> User:
    """Verify that the current user is an admin"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.post("/session", response_model=SessionResponse)
async def create_session(request: SessionRequest, response: Response):
    """Create session from OAuth provider"""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": request.session_id}
            )
            resp.raise_for_status()
            data = resp.json()
        
        existing_user = await db.users.find_one({"email": data["email"]}, {"_id": 0})
        
        if existing_user:
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": data["name"],
                    "picture": data.get("picture")
                }}
            )
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            user_doc = {
                "user_id": user_id,
                "email": data["email"],
                "name": data["name"],
                "picture": data.get("picture"),
                "subscription_tier": "none",
                "subscription_status": "inactive",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
        
        session_token = data["session_token"]
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=365)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_activity": datetime.now(timezone.utc).isoformat()
        }
        await db.user_sessions.insert_one(session_doc)
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=365*24*60*60
        )
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if isinstance(user["created_at"], str):
            user["created_at"] = datetime.fromisoformat(user["created_at"])
        
        return SessionResponse(user=User(**user), session_token=session_token)
    except Exception as e:
        logging.error(f"Session creation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user


@router.post("/logout")
async def logout(response: Response, current_user: User = Depends(get_current_user)):
    """Logout current user"""
    await db.user_sessions.delete_many({"user_id": current_user.user_id})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}


@router.post("/register", response_model=SessionResponse)
async def register(request: RegisterRequest, response: Response):
    """Register new user with email/password"""
    try:
        existing_user = await db.users.find_one({"email": request.email}, {"_id": 0})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = pwd_context.hash(request.password)
        
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": request.email,
            "name": request.name,
            "password": hashed_password,
            "picture": None,
            "subscription_tier": "none",
            "subscription_status": "inactive",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        
        session_token = f"session_{uuid.uuid4().hex}"
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=365)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.user_sessions.insert_one(session_doc)
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=365*24*60*60
        )
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
        if isinstance(user["created_at"], str):
            user["created_at"] = datetime.fromisoformat(user["created_at"])
        
        return SessionResponse(user=User(**user), session_token=session_token)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Registration error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=SessionResponse)
async def login(request: LoginRequest, response: Response):
    """Login with email/password"""
    try:
        user_doc = await db.users.find_one({"email": request.email}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if "password" not in user_doc:
            raise HTTPException(status_code=401, detail="Please login with Google")
        
        if not pwd_context.verify(request.password, user_doc["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user_id = user_doc["user_id"]
        
        session_token = f"session_{uuid.uuid4().hex}"
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=365)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.user_sessions.insert_one(session_doc)
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=365*24*60*60
        )
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
        if isinstance(user["created_at"], str):
            user["created_at"] = datetime.fromisoformat(user["created_at"])
        
        return SessionResponse(user=User(**user), session_token=session_token)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Login error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Send password reset email"""
    try:
        user = await db.users.find_one({"email": request.email})
        
        if user:
            reset_token = f"reset_{uuid.uuid4().hex}"
            expires_at = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
            
            await db.password_resets.update_one(
                {"user_id": user["user_id"]},
                {"$set": {
                    "user_id": user["user_id"],
                    "token": reset_token,
                    "expires_at": expires_at,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
            
            reset_link = f"{APP_URL}/reset-password?token={reset_token}"
            
            try:
                if RESEND_API_KEY:
                    resend.api_key = RESEND_API_KEY
                    resend.Emails.send({
                        "from": f"FitMaxPro <{SENDER_EMAIL}>",
                        "to": request.email,
                        "subject": "Réinitialisation de votre mot de passe FitMaxPro",
                        "html": f"""
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #EF4444;">FitMaxPro</h2>
                            <p>Bonjour {user.get('name', '')},</p>
                            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                            <p><a href="{reset_link}" style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Réinitialiser mon mot de passe</a></p>
                            <p style="color: #666; font-size: 12px;">Ce lien expire dans 1 heure.</p>
                        </div>
                        """
                    })
            except Exception as email_error:
                logging.error(f"Email send error: {email_error}")
        
        return {"message": "If an account exists with this email, a reset link has been sent."}
    except Exception as e:
        logging.error(f"Forgot password error: {e}")
        return {"message": "If an account exists with this email, a reset link has been sent."}
