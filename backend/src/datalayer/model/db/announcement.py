import uuid
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, ForeignKey, Text
from datalayer.model.db.base import BaseModel


class Announcement(BaseModel):
    __tablename__ = "announcements"

    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id"), index=True)

    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    # Announcement content (plain text or simple markdown)

    is_active: Mapped[bool] = mapped_column(default=True)

    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    pinned: Mapped[bool] = mapped_column(default=False)
