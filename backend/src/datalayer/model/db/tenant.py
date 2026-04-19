from typing import Optional
from sqlmodel import Field, Column
from sqlalchemy import JSON
from src.datalayer.model.db.base import BaseModel


class Tenant(BaseModel, table=True):
    __tablename__ = "tenants"

    slug: str = Field(unique=True, index=True, max_length=10)
    # Örnek slug değerleri: "tr", "de", "fr"

    name: str = Field(max_length=100)
    # Örnek: "Greenleaf Türkiye"

    is_active: bool = Field(default=True)

    config: Optional[dict] = Field(default={}, sa_column=Column(JSON))
    # config içeriği: logo_url, colors, support_links, social_media, etc.
