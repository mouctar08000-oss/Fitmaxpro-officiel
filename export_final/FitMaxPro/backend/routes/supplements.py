"""
FitMaxPro - Supplements/Nutrition Routes
"""
from fastapi import APIRouter, HTTPException
from typing import Optional, List

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db
from models.schemas import Supplement

router = APIRouter(prefix="/supplements", tags=["Supplements"])


@router.get("", response_model=List[Supplement])
async def get_supplements(program_type: Optional[str] = None, language: str = "fr"):
    """Get all supplements with optional filter"""
    query = {"language": language}
    if program_type:
        query["program_type"] = program_type
    
    supplements = await db.supplements.find(query, {"_id": 0}).to_list(100)
    return [Supplement(**s) for s in supplements]


@router.get("/{supplement_id}")
async def get_supplement(supplement_id: str, language: str = "fr"):
    """Get single supplement by ID"""
    supplement = await db.supplements.find_one(
        {"supplement_id": supplement_id, "language": language},
        {"_id": 0}
    )
    if not supplement:
        supplement = await db.supplements.find_one(
            {"supplement_id": supplement_id},
            {"_id": 0}
        )
    if not supplement:
        raise HTTPException(status_code=404, detail="Supplement not found")
    return supplement
