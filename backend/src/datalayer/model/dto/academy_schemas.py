import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict
from datalayer.model.db import ContentType, ContentStatus


class ContentBase(BaseModel):
    type: ContentType
    locale: str = "tr"
    title: str
    description: Optional[str] = None
    video_url: str
    resource_link: Optional[str] = None
    resource_link_label: Optional[str] = None
    order: int = 0
    prerequisite_id: Optional[uuid.UUID] = None
    status: ContentStatus = ContentStatus.PUBLISHED


class ContentCreate(ContentBase):
    pass


class ContentUpdate(BaseModel):
    type: Optional[ContentType] = None
    locale: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: Optional[str] = None
    resource_link: Optional[str] = None
    resource_link_label: Optional[str] = None
    order: Optional[int] = None
    prerequisite_id: Optional[uuid.UUID] = None
    status: Optional[ContentStatus] = None
    is_new: Optional[bool] = None


class UserProgressSchema(BaseModel):
    status: str
    completion_percentage: float = 0.0
    last_position_seconds: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class ContentResponse(BaseModel):
    """Base response for partners, includes locks and progress."""
    id: uuid.UUID
    type: ContentType
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None
    resource_link: Optional[str] = None
    resource_link_label: Optional[str] = None
    order: int
    is_new: bool
    is_locked: bool
    progress: Optional[UserProgressSchema] = None

    model_config = ConfigDict(from_attributes=True)


class GuestContentResponse(BaseModel):
    """Stripped response for guest users (no video/resources)."""
    id: uuid.UUID
    type: ContentType
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    order: int
    is_new: bool
    is_locked: bool = True

    model_config = ConfigDict(from_attributes=True)
