from sqlalchemy.ext.asyncio import AsyncSession
from ._base_repository import AsyncBaseRepository
from ..model.db.user_session import UserSession

class UserSessionRepository(AsyncBaseRepository[UserSession]):
    """
    Repository for UserSession management.
    Handles session lifecycle and kick-out logic.
    """
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, UserSession)
