"""Reviews/Avis routes"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime, timezone
import uuid

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db
from models.schemas import User
from routes.auth import get_current_user, verify_admin

router = APIRouter(prefix="/reviews", tags=["reviews"])

class ReviewCreate(BaseModel):
    rating: int  # 1-5 stars
    title: str
    content: str
    is_public: bool = True

@router.post("")
async def create_review(review: ReviewCreate, current_user: User = Depends(get_current_user)):
    """Create a new review - Only authenticated subscribers can create reviews"""
    review_data = {
        "review_id": str(uuid.uuid4()),
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "rating": min(5, max(1, review.rating)),
        "title": review.title,
        "content": review.content,
        "is_public": review.is_public,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "admin_response": None,
        "admin_response_at": None,
        "verified_subscriber": current_user.subscription_status == "active"
    }
    await db.reviews.insert_one(review_data)
    return {"message": "Review created", "review_id": review_data["review_id"]}

@router.get("")
async def get_public_reviews():
    """Get all public reviews - accessible by everyone"""
    reviews = await db.reviews.find(
        {"is_public": True},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Calculate average rating
    all_reviews = await db.reviews.find({}, {"rating": 1}).to_list(1000)
    avg_rating = sum(r.get("rating", 0) for r in all_reviews) / len(all_reviews) if all_reviews else 0
    
    return {
        "reviews": reviews,
        "total_reviews": len(all_reviews),
        "average_rating": round(avg_rating, 1)
    }

@router.get("/user")
async def get_user_reviews(current_user: User = Depends(get_current_user)):
    """Get current user's reviews"""
    reviews = await db.reviews.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {"reviews": reviews}

@router.get("/admin/all")
async def admin_get_all_reviews(admin: User = Depends(verify_admin)):
    """Admin: Get all reviews (public and private)"""
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    
    # Calculate stats
    total = len(reviews)
    avg_rating = sum(r.get("rating", 0) for r in reviews) / total if total else 0
    rating_distribution = {i: len([r for r in reviews if r.get("rating") == i]) for i in range(1, 6)}
    
    return {
        "reviews": reviews,
        "stats": {
            "total": total,
            "average_rating": round(avg_rating, 1),
            "distribution": rating_distribution
        }
    }

@router.put("/admin/{review_id}/respond")
async def admin_respond_to_review(review_id: str, response: str, admin: User = Depends(verify_admin)):
    """Admin: Respond to a review"""
    await db.reviews.update_one(
        {"review_id": review_id},
        {"$set": {
            "admin_response": response,
            "admin_response_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Response added"}

@router.delete("/admin/{review_id}")
async def admin_delete_review(review_id: str, admin: User = Depends(verify_admin)):
    """Admin: Delete a review"""
    await db.reviews.delete_one({"review_id": review_id})
    return {"message": "Review deleted"}
