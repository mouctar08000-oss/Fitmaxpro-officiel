"""
FitMaxPro - Social Links Routes
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db
from models.schemas import User
from routes.auth import verify_admin

router = APIRouter(tags=["Social Links"])


class SocialLinkUpdate(BaseModel):
    platform: str
    url: str


@router.get("/social-links")
async def get_social_links():
    """Get social media links"""
    links = await db.settings.find_one({"type": "social_links"}, {"_id": 0})
    return links or {"type": "social_links", "links": {}}


@router.put("/admin/social-links")
async def admin_update_social_links(links: dict, admin: User = Depends(verify_admin)):
    """Admin: Update all social media links"""
    await db.settings.update_one(
        {"type": "social_links"},
        {"$set": {"type": "social_links", "links": links}},
        upsert=True
    )
    return {"message": "Social links updated"}


@router.put("/admin/social-link")
async def admin_update_single_social_link(data: SocialLinkUpdate, admin: User = Depends(verify_admin)):
    """Admin: Update a single social media link"""
    current = await db.settings.find_one({"type": "social_links"})
    links = current.get("links", {}) if current else {}
    
    if data.url.strip():
        links[data.platform] = data.url.strip()
    else:
        links.pop(data.platform, None)
    
    await db.settings.update_one(
        {"type": "social_links"},
        {"$set": {"type": "social_links", "links": links}},
        upsert=True
    )
    return {"message": f"{data.platform} updated", "platform": data.platform, "url": data.url}


@router.delete("/admin/social-link/{platform}")
async def admin_delete_social_link(platform: str, admin: User = Depends(verify_admin)):
    """Admin: Delete a single social media link"""
    current = await db.settings.find_one({"type": "social_links"})
    links = current.get("links", {}) if current else {}
    
    if platform in links:
        del links[platform]
        await db.settings.update_one(
            {"type": "social_links"},
            {"$set": {"links": links}}
        )
        return {"message": f"{platform} deleted", "platform": platform}
    
    return {"message": f"{platform} not found", "platform": platform}
