import uuid
from typing import List, Optional
from sqlalchemy import select, or_
from src.datalayer.model.db.academy_content import AcademyContent, ContentType, ContentStatus
from src.datalayer.model.db.user_progress import UserProgress
from src.datalayer.repository._tenant_base_repository import AsyncTenantBaseRepository


class AcademyRepository(AsyncTenantBaseRepository[AcademyContent]):
    """
    Repository for managing Academy Content with multi-tenant and lock logic.
    """
    def __init__(self, session, tenant_id: uuid.UUID):
        super().__init__(session, AcademyContent, tenant_id)

    async def get_contents_by_type(
        self,
        content_type: ContentType,
        locale: str = "tr",
        include_draft: bool = False
    ) -> List[AcademyContent]:
        """
        Fetch contents by type and locale, ordered by 'order'.
        """
        stmt = select(AcademyContent).where(
            AcademyContent.tenant_id == self.tenant_id,
            AcademyContent.type == content_type,
            AcademyContent.locale == locale
        ).order_by(AcademyContent.order.asc())

        if not include_draft:
            stmt = stmt.where(AcademyContent.status == ContentStatus.PUBLISHED)

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def search_contents(
        self,
        query: str,
        locale: str = "tr",
        content_type: Optional[ContentType] = None
    ) -> List[AcademyContent]:
        """
        Search contents using ILIKE on title and description.
        Only returns PUBLISHED contents.
        """
        search_pattern = f"%{query}%"
        stmt = select(AcademyContent).where(
            AcademyContent.tenant_id == self.tenant_id,
            AcademyContent.locale == locale,
            AcademyContent.status == ContentStatus.PUBLISHED,
            or_(
                AcademyContent.title.ilike(search_pattern),
                AcademyContent.description.ilike(search_pattern)
            )
        ).order_by(AcademyContent.order.asc()).limit(20)

        if content_type:
            stmt = stmt.where(AcademyContent.type == content_type)

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_with_progress(
        self,
        user_id: uuid.UUID,
        content_type: ContentType,
        locale: str = "tr"
    ) -> List[dict]:
        """
        Complex fetch: matches content with user progress and calculates 'is_locked'.
        """
        # 1. Fetch all contents for this type/locale
        contents = await self.get_contents_by_type(content_type, locale)
        if not contents:
            return []

        # 2. Fetch progress for these contents
        content_ids = [c.id for c in contents]
        progress_stmt = select(UserProgress).where(
            UserProgress.user_id == user_id,
            UserProgress.content_id.in_(content_ids)
        )
        progress_result = await self.session.execute(progress_stmt)
        progress_map = {p.content_id: p for p in progress_result.scalars().all()}

        # 3. Build enriched response with lock logic
        enriched_results = []
        for content in contents:
            progress = progress_map.get(content.id)
            is_locked = False

            # Lock Logic: If it has a prerequisite, that prerequisite must be "completed"
            if content.prerequisite_id:
                prereq_progress = progress_map.get(content.prerequisite_id)
                if not prereq_progress or prereq_progress.status != "completed":
                    is_locked = True

            enriched_results.append({
                "content": content,
                "progress": progress,
                "is_locked": is_locked
            })

        return enriched_results

    async def reorder_contents(self, ordered_ids: List[uuid.UUID]) -> None:
        """
        Update the 'order' field based on the provided list of IDs.
        """
        for index, content_id in enumerate(ordered_ids):
            stmt = select(AcademyContent).where(
                AcademyContent.id == content_id,
                AcademyContent.tenant_id == self.tenant_id
            )
            result = await self.session.execute(stmt)
            content = result.scalar_one_or_none()
            if content:
                content.order = index + 1
        
        # Note: Caller should commit the session
