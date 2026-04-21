import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from datalayer.database import get_db_session
from services.admin_stats_service import AdminStatsService
from utils.auth_deps import get_current_admin
from utils.tenant_deps import get_current_tenant_id

router = APIRouter(prefix="/admin/stats", tags=["Admin - Stats"])

@router.get("/", dependencies=[Depends(get_current_admin)])
async def get_dashboard_metrics(
    db: AsyncSession = Depends(get_db_session),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
):
    """Admin dashboard metriklerini döner (Toplam partner, bekleyen onaylar vb.)."""
    service = AdminStatsService(db)
    return await service.get_dashboard_stats(tenant_id)
