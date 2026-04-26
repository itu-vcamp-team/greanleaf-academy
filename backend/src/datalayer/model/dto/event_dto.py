from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class EventResponse(BaseModel):
    """Full event response for partners and admins."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: uuid.UUID
    title: str
    description: Optional[str] = None
    category: str
    start_time: datetime
    end_time: Optional[datetime] = None
    meeting_link: Optional[str] = None
    location: Optional[str] = None
    cover_image_url: Optional[str] = Field(None, alias="cover_image_path")
    contact_info: Optional[str] = None
    visibility: str
    is_published: bool = False


class GuestEventResponse(BaseModel):
    """Stripped event response for guests — no meeting link."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: uuid.UUID
    title: str
    description: Optional[str] = None
    category: str
    start_time: datetime
    end_time: Optional[datetime] = None
    meeting_link: None = None
    location: Optional[str] = None
    cover_image_url: Optional[str] = Field(None, alias="cover_image_path")
    contact_info: Optional[str] = None
    visibility: str
