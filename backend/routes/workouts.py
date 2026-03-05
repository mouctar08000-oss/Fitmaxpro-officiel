"""
FitMaxPro - Workout Routes
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import os
import aiofiles

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db
from models.schemas import User, Workout, WorkoutSession
from routes.auth import get_current_user, verify_admin

router = APIRouter(prefix="/workouts", tags=["Workouts"])

# Upload directory
UPLOAD_DIR = "/app/backend/uploads"
VIDEO_DIR = os.path.join(UPLOAD_DIR, "videos")
IMAGE_DIR = os.path.join(UPLOAD_DIR, "images")

# Ensure directories exist
os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(IMAGE_DIR, exist_ok=True)


# Pydantic models for admin operations
class ExerciseCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    duration_seconds: Optional[int] = 45
    video_url: Optional[str] = ""
    image_url: Optional[str] = ""
    sets: Optional[int] = 3
    reps: Optional[str] = "12"
    rest_seconds: Optional[int] = 60


class WorkoutCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    level: str = "BEGINNER"  # BEGINNER, INTERMEDIATE, ADVANCED
    program_type: str = "general"  # mass_gain, weight_loss, legs, arms, etc.
    duration_minutes: Optional[int] = 30
    image_url: Optional[str] = ""
    video_url: Optional[str] = ""
    exercises: List[ExerciseCreate] = []
    language: str = "fr"
    tags: List[str] = []


class WorkoutUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    program_type: Optional[str] = None
    duration_minutes: Optional[int] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    exercises: Optional[List[ExerciseCreate]] = None
    language: Optional[str] = None
    tags: Optional[List[str]] = None


@router.get("", response_model=List[Workout])
async def get_workouts(level: Optional[str] = None, program_type: Optional[str] = None, language: str = "fr"):
    """Get all workouts with optional filters"""
    query = {"language": language}
    if level:
        query["level"] = level
    if program_type:
        query["program_type"] = program_type
    
    workouts = await db.workouts.find(query, {"_id": 0}).to_list(100)
    return [Workout(**w) for w in workouts]


@router.get("/{workout_id}", response_model=Workout)
async def get_workout(workout_id: str, language: str = "fr"):
    """Get single workout by ID"""
    workout = await db.workouts.find_one({"workout_id": workout_id, "language": language}, {"_id": 0})
    if not workout:
        workout = await db.workouts.find_one({"workout_id": workout_id}, {"_id": 0})
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return Workout(**workout)


# Workout Session Routes
workout_session_router = APIRouter(prefix="/workout", tags=["Workout Sessions"])


@workout_session_router.post("/start")
async def start_workout_session(workout_id: str, user: User = Depends(get_current_user)):
    """Start a workout session"""
    workout = await db.workouts.find_one({"workout_id": workout_id}, {"_id": 0})
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    session_id = f"session_{uuid.uuid4().hex[:12]}"
    session = {
        "session_id": session_id,
        "user_id": user.user_id,
        "workout_id": workout_id,
        "workout_title": workout.get("title", "Unknown"),
        "started_at": datetime.now(timezone.utc).isoformat(),
        "ended_at": None,
        "duration_seconds": 0,
        "completed": False,
        "pauses": []
    }
    await db.workout_sessions.insert_one(session)
    
    return {"session_id": session_id, "message": "Workout session started"}


@workout_session_router.post("/end")
async def end_workout_session(session_id: str, completed: bool = True, user: User = Depends(get_current_user)):
    """End a workout session"""
    session = await db.workout_sessions.find_one(
        {"session_id": session_id, "user_id": user.user_id},
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    started_at_str = session.get("started_at")
    if isinstance(started_at_str, str):
        started_at = datetime.fromisoformat(started_at_str.replace('Z', '+00:00'))
    else:
        started_at = started_at_str
    
    if started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)
    
    ended_at = datetime.now(timezone.utc)
    total_duration = int((ended_at - started_at).total_seconds())
    
    # Subtract pause time
    total_pause_time = 0
    for pause in session.get("pauses", []):
        if pause.get("ended_at"):
            pause_start = datetime.fromisoformat(pause["started_at"].replace('Z', '+00:00'))
            pause_end = datetime.fromisoformat(pause["ended_at"].replace('Z', '+00:00'))
            total_pause_time += int((pause_end - pause_start).total_seconds())
    
    active_duration = max(0, total_duration - total_pause_time)
    
    await db.workout_sessions.update_one(
        {"session_id": session_id},
        {"$set": {
            "ended_at": ended_at.isoformat(),
            "duration_seconds": active_duration,
            "completed": completed
        }}
    )
    
    # Award points for completed workout
    if completed:
        points_earned = 10
        
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$inc": {"total_points": points_earned, "weekly_points": points_earned}}
        )
        
        await db.point_history.insert_one({
            "user_id": user.user_id,
            "points": points_earned,
            "reason": f"Workout completed: {session.get('workout_title', 'Unknown')}",
            "type": "earned",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {
        "message": "Workout session ended",
        "duration_seconds": active_duration,
        "completed": completed,
        "points_earned": 10 if completed else 0
    }


@workout_session_router.get("/my-sessions")
async def get_my_sessions(user: User = Depends(get_current_user)):
    """Get user's workout sessions"""
    sessions = await db.workout_sessions.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("started_at", -1).to_list(100)
    
    return {"sessions": sessions}


@workout_session_router.post("/pause/start")
async def start_pause(session_id: str, user: User = Depends(get_current_user)):
    """Start a pause in workout session"""
    session = await db.workout_sessions.find_one(
        {"session_id": session_id, "user_id": user.user_id},
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    pause_id = f"pause_{uuid.uuid4().hex[:8]}"
    pause = {
        "pause_id": pause_id,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "ended_at": None
    }
    
    await db.workout_sessions.update_one(
        {"session_id": session_id},
        {"$push": {"pauses": pause}}
    )
    
    return {"pause_id": pause_id, "message": "Pause started"}


@workout_session_router.post("/pause/end")
async def end_pause(session_id: str, pause_id: str, user: User = Depends(get_current_user)):
    """End a pause in workout session"""
    session = await db.workout_sessions.find_one(
        {"session_id": session_id, "user_id": user.user_id},
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    pauses = session.get("pauses", [])
    for i, pause in enumerate(pauses):
        if pause.get("pause_id") == pause_id and not pause.get("ended_at"):
            pauses[i]["ended_at"] = datetime.now(timezone.utc).isoformat()
            break
    
    await db.workout_sessions.update_one(
        {"session_id": session_id},
        {"$set": {"pauses": pauses}}
    )
    
    return {"message": "Pause ended"}


@workout_session_router.get("/session/{session_id}")
async def get_session_details(session_id: str, user: User = Depends(get_current_user)):
    """Get workout session details"""
    session = await db.workout_sessions.find_one(
        {"session_id": session_id, "user_id": user.user_id},
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session



# ============================================
# ADMIN ROUTES - Workout Management
# ============================================

@router.get("/admin/all")
async def admin_get_all_workouts(admin: User = Depends(verify_admin)):
    """Admin: Get all workouts for management"""
    workouts = await db.workouts.find({}, {"_id": 0}).to_list(500)
    return {"workouts": workouts, "total": len(workouts)}


@router.post("/admin/create")
async def admin_create_workout(workout_data: WorkoutCreate, admin: User = Depends(verify_admin)):
    """Admin: Create a new workout"""
    workout_id = f"workout_{uuid.uuid4().hex[:12]}"
    
    # Convert exercises to dict format
    exercises = []
    for i, ex in enumerate(workout_data.exercises):
        exercises.append({
            "exercise_id": f"ex_{uuid.uuid4().hex[:8]}",
            "order": i + 1,
            "name": ex.name,
            "description": ex.description,
            "duration_seconds": ex.duration_seconds,
            "video_url": ex.video_url,
            "image_url": ex.image_url,
            "sets": ex.sets,
            "reps": ex.reps,
            "rest_seconds": ex.rest_seconds
        })
    
    workout = {
        "workout_id": workout_id,
        "title": workout_data.title,
        "description": workout_data.description,
        "level": workout_data.level.upper(),
        "program_type": workout_data.program_type,
        "duration_minutes": workout_data.duration_minutes,
        "image_url": workout_data.image_url,
        "video_url": workout_data.video_url,
        "exercises": exercises,
        "exercise_count": len(exercises),
        "language": workout_data.language,
        "tags": workout_data.tags,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin.user_id
    }
    
    await db.workouts.insert_one(workout)
    
    return {"success": True, "workout_id": workout_id, "message": "Workout created successfully"}


@router.put("/admin/{workout_id}")
async def admin_update_workout(workout_id: str, workout_data: WorkoutUpdate, admin: User = Depends(verify_admin)):
    """Admin: Update an existing workout"""
    existing = await db.workouts.find_one({"workout_id": workout_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if workout_data.title is not None:
        update_data["title"] = workout_data.title
    if workout_data.description is not None:
        update_data["description"] = workout_data.description
    if workout_data.level is not None:
        update_data["level"] = workout_data.level.upper()
    if workout_data.program_type is not None:
        update_data["program_type"] = workout_data.program_type
    if workout_data.duration_minutes is not None:
        update_data["duration_minutes"] = workout_data.duration_minutes
    if workout_data.image_url is not None:
        update_data["image_url"] = workout_data.image_url
    if workout_data.video_url is not None:
        update_data["video_url"] = workout_data.video_url
    if workout_data.language is not None:
        update_data["language"] = workout_data.language
    if workout_data.tags is not None:
        update_data["tags"] = workout_data.tags
    
    if workout_data.exercises is not None:
        exercises = []
        for i, ex in enumerate(workout_data.exercises):
            exercises.append({
                "exercise_id": f"ex_{uuid.uuid4().hex[:8]}",
                "order": i + 1,
                "name": ex.name,
                "description": ex.description,
                "duration_seconds": ex.duration_seconds,
                "video_url": ex.video_url,
                "image_url": ex.image_url,
                "sets": ex.sets,
                "reps": ex.reps,
                "rest_seconds": ex.rest_seconds
            })
        update_data["exercises"] = exercises
        update_data["exercise_count"] = len(exercises)
    
    await db.workouts.update_one({"workout_id": workout_id}, {"$set": update_data})
    
    return {"success": True, "message": "Workout updated successfully"}


@router.delete("/admin/{workout_id}")
async def admin_delete_workout(workout_id: str, admin: User = Depends(verify_admin)):
    """Admin: Delete a workout"""
    result = await db.workouts.delete_one({"workout_id": workout_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    return {"success": True, "message": "Workout deleted successfully"}


@router.post("/admin/{workout_id}/exercise")
async def admin_add_exercise(workout_id: str, exercise: ExerciseCreate, admin: User = Depends(verify_admin)):
    """Admin: Add an exercise to a workout"""
    workout = await db.workouts.find_one({"workout_id": workout_id})
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    exercises = workout.get("exercises", [])
    new_exercise = {
        "exercise_id": f"ex_{uuid.uuid4().hex[:8]}",
        "order": len(exercises) + 1,
        "name": exercise.name,
        "description": exercise.description,
        "duration_seconds": exercise.duration_seconds,
        "video_url": exercise.video_url,
        "image_url": exercise.image_url,
        "sets": exercise.sets,
        "reps": exercise.reps,
        "rest_seconds": exercise.rest_seconds
    }
    exercises.append(new_exercise)
    
    await db.workouts.update_one(
        {"workout_id": workout_id},
        {"$set": {
            "exercises": exercises,
            "exercise_count": len(exercises),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "exercise_id": new_exercise["exercise_id"], "message": "Exercise added"}


@router.delete("/admin/{workout_id}/exercise/{exercise_id}")
async def admin_remove_exercise(workout_id: str, exercise_id: str, admin: User = Depends(verify_admin)):
    """Admin: Remove an exercise from a workout"""
    workout = await db.workouts.find_one({"workout_id": workout_id})
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    exercises = workout.get("exercises", [])
    exercises = [ex for ex in exercises if ex.get("exercise_id") != exercise_id]
    
    # Reorder remaining exercises
    for i, ex in enumerate(exercises):
        ex["order"] = i + 1
    
    await db.workouts.update_one(
        {"workout_id": workout_id},
        {"$set": {
            "exercises": exercises,
            "exercise_count": len(exercises),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "message": "Exercise removed"}


# Get program types and levels for dropdowns
@router.get("/admin/options")
async def admin_get_workout_options(admin: User = Depends(verify_admin)):
    """Admin: Get available program types and levels"""
    return {
        "levels": ["BEGINNER", "INTERMEDIATE", "ADVANCED", "WORKOUTS.INTERMEDIATE", "WORKOUTS.ADVANCED"],
        "program_types": [
            {"value": "mass_gain", "label": "Prise de Masse"},
            {"value": "weight_loss", "label": "Perte de Poids"},
            {"value": "legs", "label": "Jambes & Fessiers"},
            {"value": "Legs & Glutes", "label": "Legs & Glutes"},
            {"value": "arms", "label": "Bras & Épaules"},
            {"value": "chest", "label": "Pectoraux"},
            {"value": "back", "label": "Dos"},
            {"value": "abs", "label": "Abdominaux"},
            {"value": "cardio", "label": "Cardio"},
            {"value": "hiit", "label": "HIIT"},
            {"value": "yoga", "label": "Yoga & Stretching"},
            {"value": "warmup", "label": "Échauffement"},
            {"value": "Women Special", "label": "Programme Femmes"},
            {"value": "general", "label": "Général"}
        ],
        "languages": [
            {"value": "fr", "label": "Français"},
            {"value": "en", "label": "English"}
        ]
    }



# ============================================
# FILE UPLOAD ROUTES
# ============================================

ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.mov', '.avi', '.webm', '.mkv'}
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500MB
MAX_IMAGE_SIZE = 10 * 1024 * 1024   # 10MB


@router.post("/admin/upload/video")
async def admin_upload_video(
    file: UploadFile = File(...),
    admin: User = Depends(verify_admin)
):
    """Admin: Upload a video file for workouts/exercises with automatic compression"""
    import subprocess
    import asyncio
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid video format. Allowed: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        )
    
    # Generate unique filename
    file_id = uuid.uuid4().hex[:12]
    original_filename = f"original_{file_id}{ext}"
    original_filepath = os.path.join(VIDEO_DIR, original_filename)
    compressed_filename = f"video_{file_id}.mp4"
    compressed_filepath = os.path.join(VIDEO_DIR, compressed_filename)
    
    # Read and save file in chunks
    total_size = 0
    try:
        async with aiofiles.open(original_filepath, 'wb') as out_file:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                total_size += len(chunk)
                if total_size > MAX_VIDEO_SIZE:
                    await out_file.close()
                    os.remove(original_filepath)
                    raise HTTPException(status_code=400, detail="File too large. Max 500MB")
                await out_file.write(chunk)
    except Exception as e:
        if os.path.exists(original_filepath):
            os.remove(original_filepath)
        raise HTTPException(status_code=500, detail=str(e))
    
    # Compress video with FFmpeg in background
    compressed_size = total_size
    compression_status = "original"
    
    try:
        # FFmpeg compression command: H.264 codec, 720p max, reasonable quality
        ffmpeg_cmd = [
            'ffmpeg', '-y', '-i', original_filepath,
            '-vf', 'scale=-2:720',  # Scale to 720p maintaining aspect ratio
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '28',  # Quality (lower = better, 28 is good for web)
            '-c:a', 'aac',
            '-b:a', '128k',
            '-movflags', '+faststart',  # Enable streaming
            compressed_filepath
        ]
        
        # Run compression
        process = await asyncio.create_subprocess_exec(
            *ffmpeg_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=300)  # 5 min timeout
        
        if process.returncode == 0 and os.path.exists(compressed_filepath):
            compressed_size = os.path.getsize(compressed_filepath)
            compression_status = "compressed"
            # Remove original if compression successful
            os.remove(original_filepath)
            final_filename = compressed_filename
        else:
            # Compression failed, use original
            print(f"FFmpeg compression failed: {stderr.decode()}")
            os.rename(original_filepath, compressed_filepath.replace('.mp4', ext))
            final_filename = compressed_filename.replace('.mp4', ext)
            compression_status = "original"
            
    except asyncio.TimeoutError:
        print("FFmpeg compression timeout, using original")
        if os.path.exists(compressed_filepath):
            os.remove(compressed_filepath)
        final_filename = original_filename
        compression_status = "original"
    except Exception as e:
        print(f"Compression error: {e}")
        final_filename = original_filename
        compression_status = "original"
    
    # Store metadata in database
    video_doc = {
        "video_id": file_id,
        "filename": final_filename,
        "original_name": file.filename,
        "original_size_bytes": total_size,
        "compressed_size_bytes": compressed_size,
        "compression_ratio": round((1 - compressed_size/total_size) * 100, 1) if total_size > 0 else 0,
        "compression_status": compression_status,
        "content_type": "video/mp4" if compression_status == "compressed" else file.content_type,
        "uploaded_by": admin.user_id,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    await db.uploaded_videos.insert_one(video_doc)
    
    # Return the URL
    video_url = f"/api/uploads/videos/{final_filename}"
    
    return {
        "success": True,
        "video_id": file_id,
        "filename": final_filename,
        "url": video_url,
        "original_size_bytes": total_size,
        "compressed_size_bytes": compressed_size,
        "compression_ratio": video_doc["compression_ratio"],
        "compression_status": compression_status
    }


@router.post("/admin/upload/image")
async def admin_upload_image(
    file: UploadFile = File(...),
    admin: User = Depends(verify_admin)
):
    """Admin: Upload an image file for workouts/exercises"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image format. Allowed: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    # Generate unique filename
    file_id = uuid.uuid4().hex[:12]
    filename = f"image_{file_id}{ext}"
    filepath = os.path.join(IMAGE_DIR, filename)
    
    # Read and save file
    total_size = 0
    try:
        async with aiofiles.open(filepath, 'wb') as out_file:
            while chunk := await file.read(1024 * 1024):
                total_size += len(chunk)
                if total_size > MAX_IMAGE_SIZE:
                    await out_file.close()
                    os.remove(filepath)
                    raise HTTPException(status_code=400, detail="File too large. Max 10MB")
                await out_file.write(chunk)
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=500, detail=str(e))
    
    # Store metadata
    image_doc = {
        "image_id": file_id,
        "filename": filename,
        "original_name": file.filename,
        "size_bytes": total_size,
        "content_type": file.content_type,
        "uploaded_by": admin.user_id,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    await db.uploaded_images.insert_one(image_doc)
    
    # Return the URL
    image_url = f"/api/uploads/images/{filename}"
    
    return {
        "success": True,
        "image_id": file_id,
        "filename": filename,
        "url": image_url,
        "size_bytes": total_size
    }


@router.get("/admin/uploads")
async def admin_list_uploads(admin: User = Depends(verify_admin)):
    """Admin: List all uploaded files"""
    videos = await db.uploaded_videos.find({}, {"_id": 0}).sort("uploaded_at", -1).to_list(100)
    images = await db.uploaded_images.find({}, {"_id": 0}).sort("uploaded_at", -1).to_list(100)
    
    return {
        "videos": videos,
        "images": images,
        "video_count": len(videos),
        "image_count": len(images)
    }


@router.delete("/admin/upload/{file_type}/{file_id}")
async def admin_delete_upload(file_type: str, file_id: str, admin: User = Depends(verify_admin)):
    """Admin: Delete an uploaded file"""
    if file_type == "video":
        doc = await db.uploaded_videos.find_one({"video_id": file_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Video not found")
        
        filepath = os.path.join(VIDEO_DIR, doc["filename"])
        if os.path.exists(filepath):
            os.remove(filepath)
        
        await db.uploaded_videos.delete_one({"video_id": file_id})
        
    elif file_type == "image":
        doc = await db.uploaded_images.find_one({"image_id": file_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Image not found")
        
        filepath = os.path.join(IMAGE_DIR, doc["filename"])
        if os.path.exists(filepath):
            os.remove(filepath)
        
        await db.uploaded_images.delete_one({"image_id": file_id})
    else:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    return {"success": True, "message": f"{file_type} deleted"}
