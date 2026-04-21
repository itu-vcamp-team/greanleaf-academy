from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datalayer.database import get_db_session
from datalayer.model.db.user import User
from datalayer.model.db.academy_content import ContentType
from schemas.progress import WatchProgressSchema
from datalayer.repository.progress_repository import ProgressRepository
from services.progress_service import ProgressService
from utils.auth_deps import get_current_partner
from utils.tenant_deps import get_current_tenant_id

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.post("/watch")
async def update_watch_progress(
    data: WatchProgressSchema,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_partner),
):
    """
    Updates watch percentage and last position.
    Automatically marks as completed if >= 85%.
    """
    repo = ProgressRepository(db, current_user.id)
    service = ProgressService(repo)
    
    progress = await service.update_watch_progress(
        content_id=data.content_id,
        percentage=data.completion_percentage,
        last_position=data.last_position_seconds
    )
    
    return {
        "status": progress.status,
        "percentage": progress.completion_percentage,
        "completed_at": progress.completed_at
    }

@router.get("/my-stats")
async def get_my_stats(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_partner),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id)
):
    """Returns overall completion stats for the current partner."""
    repo = ProgressRepository(db, current_user.id)
    service = ProgressService(repo)
    
    shorts_stats = await service.get_stats(tenant_id, ContentType.SHORT)
    masterclass_stats = await service.get_stats(tenant_id, ContentType.MASTERCLASS)
    
    return {
        "shorts": shorts_stats,
        "masterclass": masterclass_stats
    }
