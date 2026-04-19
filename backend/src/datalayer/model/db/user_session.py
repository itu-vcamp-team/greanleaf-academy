import uuid
from typing import Optional
from datetime import datetime
from sqlmodel import Field
from src.datalayer.model.db.base import BaseModel


class UserSession(BaseModel, table=True):
    __tablename__ = "user_sessions"

    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)

    token_jti: str = Field(unique=True, index=True, max_length=100)
    # JWT'nin "jti" (JWT ID) claim'i. Her token için benzersiz ID.

    is_active: bool = Field(default=True)
    # Yeni bir oturum açıldığında eski oturumun is_active'i False yapılır (kick-out).

    device_info: Optional[str] = Field(default=None, max_length=300)
    # Kullanıcının cihaz bilgisi (user-agent).

    ip_address: Optional[str] = Field(default=None, max_length=45)

    expires_at: datetime = Field()
    # Token'ın geçerlilik süresi.

    last_used_at: Optional[datetime] = Field(default=None)
