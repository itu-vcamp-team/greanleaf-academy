from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.datalayer.database import get_db_session
from src.datalayer.model.db.user import User
from src.schemas.favorite import FavoriteCreateSchema, FavoriteResponseSchema
from src.datalayer.repository.favorite_repository import FavoriteRepository
from src.utils.auth_deps import get_current_partner

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.get("/", response_model=list[FavoriteResponseSchema])
async def list_favorites(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_partner)
):
    """Lists all favorites for the current user."""
    repo = FavoriteRepository(db, current_user.id)
    favorites = await repo.get_all()
    return [FavoriteResponseSchema(content_id=f.content_id) for f in favorites]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_favorite(
    data: FavoriteCreateSchema,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_partner)
):
    """Adds a content to user's favorites."""
    repo = FavoriteRepository(db, current_user.id)
    added = await repo.add(data.content_id)
    if not added:
        return {"message": "Zaten favorilerde."}
    return {"message": "Favorilere eklendi."}

@router.delete("/{content_id}")
async def remove_favorite(
    content_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_partner)
):
    """Removes a content from user's favorites."""
    repo = FavoriteRepository(db, current_user.id)
    removed = await repo.remove(content_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="İçerik favorilerinizde bulunamadı."
        )
    return {"message": "Favorilerden çıkarıldı."}
