from sqlalchemy import select, func
from src.datalayer.model.db.user import User, UserRole
from src.datalayer.model.db.academy_content import AcademyContent, ContentStatus


class AdminStatsService:
    def __init__(self, session):
        self.session = session

    async def get_dashboard_stats(self) -> dict:
        """
        Calculates basic metrics for the admin dashboard.
        """
        # 1. Total Partners (Active)
        total_partners_stmt = (
            select(func.count(User.id))
            .where(
                User.role == UserRole.PARTNER,
                User.is_active == True
            )
        )

        # 2. Pending Approvals (Verified Guests)
        pending_users_stmt = (
            select(func.count(User.id))
            .where(
                User.is_verified == True,
                User.is_active == False,
                User.role == UserRole.GUEST
            )
        )


        # 4. Total Published Contents
        content_stmt = (
            select(func.count(AcademyContent.id))
            .where(AcademyContent.status == ContentStatus.PUBLISHED)
        )

        # Execute all counts
        total_partners = (await self.session.execute(total_partners_stmt)).scalar() or 0
        pending_approvals = (await self.session.execute(pending_users_stmt)).scalar() or 0
        total_contents = (await self.session.execute(content_stmt)).scalar() or 0

        return {
            "total_partners": total_partners,
            "pending_approvals": pending_approvals,
            "total_contents": total_contents
        }
