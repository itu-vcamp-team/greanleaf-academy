import uuid
from typing import Optional
from sqlmodel import Field
from src.datalayer.model.db.base import BaseModel


class Announcement(BaseModel, table=True):
    __tablename__ = "announcements"

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)

    title: str = Field(max_length=200)
    body: str = Field(max_length=5000)
    # Duyuru içeriği (plain text veya basit markdown)

    is_active: bool = Field(default=True)

    created_by: uuid.UUID = Field(foreign_key="users.id")
    # Duyuruyu oluşturan admin'in user.id'si

    pinned: bool = Field(default=False)
    # True ise listenin en üstünde sabitlenir.
