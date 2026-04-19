import uuid
from typing import Optional
from datetime import datetime
from sqlmodel import Field, UniqueConstraint
from src.datalayer.model.db.base import BaseModel


class UserProgress(BaseModel, table=True):
    __tablename__ = "user_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "content_id", name="uq_user_content"),
    )
    # Bir kullanıcı, bir içerik için sadece bir UserProgress kaydına sahip olabilir.

    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    content_id: uuid.UUID = Field(foreign_key="academy_contents.id", index=True)

    status: str = Field(default="not_started", max_length=20)
    # "not_started" | "in_progress" | "completed"

    completion_percentage: float = Field(default=0.0)
    # 0.0 - 100.0 arası. YouTube IFrame API'den gelen izlenme yüzdesi.

    last_watched_at: Optional[datetime] = Field(default=None)
    # En son videoyu izlediği tarih/saat.

    last_position_seconds: Optional[float] = Field(default=None)
    # Videonun en son kaldığı saniye. "Kaldığın yerden devam et" için kullanılır.

    completed_at: Optional[datetime] = Field(default=None)
    # status "completed" olduğunda otomatik set edilir.
