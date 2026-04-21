from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class WatchProgressSchema(BaseModel):
    content_id: uuid.UUID
    completion_percentage: float = Field(..., ge=0, le=100)
    last_position_seconds: float = Field(..., ge=0)


class StatsSchema(BaseModel):
    completed: int
    total: int
    percentage: float
