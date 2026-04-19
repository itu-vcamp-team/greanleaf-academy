import uuid
from typing import Optional
from datetime import datetime
from sqlmodel import Field
from src.datalayer.model.db.base import BaseModel


class ReferenceCode(BaseModel, table=True):
    __tablename__ = "reference_codes"

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)

    code: str = Field(unique=True, index=True, max_length=20)
    # Admin'in oluşturduğu tek seferlik davetiye kodu. Örn: "GL-TR-A7X2"

    created_by: uuid.UUID = Field(foreign_key="users.id")
    # Kodu oluşturan partnerin user.id'si

    is_used: bool = Field(default=False)
    # Kullanıldı mı? True olduktan sonra bir daha kullanılamaz.

    used_by: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    # Kodu kullanan kullanıcının user.id'si

    used_at: Optional[datetime] = Field(default=None)

    expires_at: Optional[datetime] = Field(default=None)
    # None ise süresiz geçerli.
