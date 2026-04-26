from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class EventResponse(BaseModel):
    """Full event response for partners and admins."""
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    category: str
    start_time: datetime
    end_time: Optional[datetime] = None
    meeting_link: Optional[str] = None
    location: Optional[str] = None
    cover_image_url: Optional[str] = None
    contact_info: Optional[str] = None
    visibility: str
    is_published: bool = True


class GuestEventResponse(BaseModel):
    """Stripped event response for guests — no meeting link."""
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    category: str
    start_time: datetime
    end_time: Optional[datetime] = None
    meeting_link: None = None
    location: Optional[str] = None
    cover_image_url: Optional[str] = None
    contact_info: Optional[str] = None
    visibility: str
