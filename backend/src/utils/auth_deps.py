from typing import Optional
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.datalayer.database import get_db_session
from src.datalayer.model.db.user import User, UserRole
from src.services.token_service import TokenService
from src.services.session_service import SessionService
from sqlalchemy import select

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db_session)
) -> User:
    """
    FastAPI dependency to get the current authenticated user.
    Validates JWT and checks if the session is still active in DB.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = TokenService.decode_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    jti: str = payload.get("jti")
    if user_id is None or jti is None:
        raise credentials_exception

    # Check if session is still active (Kick-out check)
    if not await SessionService.is_session_active(db, jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or kicked out",
        )

    stmt = select(User).where(User.id == uuid.UUID(user_id))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception
    return user


def require_roles(allowed_roles: list[UserRole]):
    """
    Dependency to restrict access based on user roles.
    Example: Depends(require_roles([UserRole.SUPERADMIN, UserRole.ADMIN]))
    """
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have enough permissions"
            )
        return current_user
    return role_checker


async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Shortcut to require ADMIN or SUPERADMIN role."""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPERADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için yönetici yetkisi gereklidir."
        )
    return current_user


async def get_current_superadmin(current_user: User = Depends(get_current_user)) -> User:
    """Shortcut to require ONLY SUPERADMIN role."""
    if current_user.role != UserRole.SUPERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için üst düzey yönetici yetkisi gereklidir."
        )
    return current_user
