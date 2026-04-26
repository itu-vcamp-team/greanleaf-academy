import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, ForeignKey, DateTime
from src.datalayer.model.db.base import BaseModel


class UserDevice(BaseModel):
    __tablename__ = "user_devices"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    
    fingerprint: Mapped[str] = mapped_column(String(255), index=True)
    # Hash or combined string of User-Agent, etc.

    is_trusted: Mapped[bool] = mapped_column(default=True)
    
    last_login_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone))

    def __repr__(self):
        return f"<UserDevice(user_id={self.user_id}, fingerprint={self.fingerprint[:10]}...)>"
