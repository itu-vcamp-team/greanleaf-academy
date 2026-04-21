from __future__ import annotations

import uuid

from pydantic import BaseModel


class FavoriteCreateSchema(BaseModel):
    content_id: uuid.UUID


class FavoriteResponseSchema(BaseModel):
    content_id: uuid.UUID
