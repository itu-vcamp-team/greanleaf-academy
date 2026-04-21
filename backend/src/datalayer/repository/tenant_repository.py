from typing import Optional
from sqlalchemy import select
from datalayer.model.db.tenant import Tenant
from datalayer.repository._base_repository import AsyncBaseRepository


class TenantRepository(AsyncBaseRepository[Tenant]):
    def __init__(self, session):
        super().__init__(session, Tenant)

    async def get_by_slug(self, slug: str) -> Optional[Tenant]:
        stmt = select(self.model_class).where(self.model_class.slug == slug)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
