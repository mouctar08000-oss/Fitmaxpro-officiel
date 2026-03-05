"""
FitMaxPro - Main Server Application
Refactored modular architecture with organized routes.
"""
from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
import logging
import os
from pathlib import Path

# Import configuration
from utils.config import db, client, APP_URL

# Import all routers
from routes import (
    auth_router,
    payments_router,
    webhook_router,
    workouts_router,
    workout_session_router,
    supplements_router,
    messages_router,
    reminders_router,
    user_router,
    social_router,
    lives_router,
    livekit_router,
    running_router,
    rewards_router,
    reviews_router,
    iap_router,
    notifications_router,
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="FitMaxPro API",
    description="Complete fitness application with live streaming, workouts, gamification and more",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create main API router
api_router = APIRouter(prefix="/api")

# Include all modular routers
api_router.include_router(auth_router)
api_router.include_router(payments_router)
api_router.include_router(webhook_router)
api_router.include_router(workouts_router)
api_router.include_router(workout_session_router)
api_router.include_router(supplements_router)
api_router.include_router(messages_router)
api_router.include_router(reminders_router)
api_router.include_router(user_router)
api_router.include_router(social_router)
api_router.include_router(lives_router)
api_router.include_router(livekit_router)
api_router.include_router(running_router)
api_router.include_router(rewards_router)
api_router.include_router(reviews_router)
api_router.include_router(iap_router)
api_router.include_router(notifications_router)


# Health check endpoint
@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "FitMaxPro API",
        "version": "2.0.0"
    }


# Include the main API router
app.include_router(api_router)

# Mount static files for uploads
ROOT_DIR = Path(__file__).parent
uploads_dir = ROOT_DIR / "uploads"
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on shutdown"""
    client.close()
    logger.info("Database connection closed")


# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
