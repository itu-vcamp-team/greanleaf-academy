import uuid
from typing import Optional
from datetime import datetime
from enum import Enum
from sqlmodel import Field
from src.datalayer.model.db.base import BaseModel


class EventCategory(str, Enum):
    WEBINAR = "WEBINAR"
    TRAINING = "TRAINING"
    CORPORATE = "CORPORATE"
    MEETUP = "MEETUP"


class EventVisibility(str, Enum):
    ALL = "ALL"          # Misafirler de görebilir
    PARTNER_ONLY = "PARTNER_ONLY"  # Sadece partnerler görebilir


class Event(BaseModel, table=True):
    __tablename__ = "events"

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)

    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=3000)

    category: EventCategory

    start_time: datetime = Field(index=True)
    end_time: Optional[datetime] = Field(default=None)

    meeting_link: Optional[str] = Field(default=None, max_length=500)
    # Zoom, Google Meet, Teams vb. bağlantı linki.

    location: Optional[str] = Field(default=None, max_length=300)
    # Fiziksel etkinlik adresi.

    cover_image_path: Optional[str] = Field(default=None, max_length=500)
    # Render disk'e kaydedilen WebP kapak görseli yolu.

    contact_info: Optional[str] = Field(default=None, max_length=500)
    # Davetiye için iletişim notu.

    visibility: EventVisibility = Field(default=EventVisibility.PARTNER_ONLY)

    is_published: bool = Field(default=False)
