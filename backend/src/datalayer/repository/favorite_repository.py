from __future__ import annotations
import uuid
from typing import List, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from src.datalayer.model.db.favorite import Favorite

class FavoriteRepository:
    """Repository for managing user's favorite academy contents."""

    def __init__(self, session: AsyncSession, user_id: uuid.UUID):
        self.session = session
        self.user_id = user_id

    async def get_all(self) -> List[Favorite]:
        """Fetch all favorite records for the user."""
        stmt = select(Favorite).where(Favorite.user_id == self.user_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def is_favorite(self, content_id: uuid.UUID) -> bool:
        """Check if a specific content is in user's favorites."""
        stmt = select(Favorite).where(
            Favorite.user_id == self.user_id,
            Favorite.content_id == content_id
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def add(self, content_id: uuid.UUID) -> bool:
        """Adds a content to favorites if not already present."""
        if await self.is_favorite(content_id):
            return False
            
        favorite = Favorite(user_id=self.user_id, content_id=content_id)
        self.session.add(favorite)
        await self.session.flush()
        return True

    async def remove(self, content_id: uuid.UUID) -> bool:
        """Removes a content from favorites."""
        stmt = delete(Favorite).where(
            Favorite.user_id == self.user_id,
            Favorite.content_id == content_id
        )
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.rowcount > 0
