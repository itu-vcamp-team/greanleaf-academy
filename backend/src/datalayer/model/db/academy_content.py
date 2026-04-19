import uuid
from typing import Optional
from enum import Enum
from sqlmodel import Field
from src.datalayer.model.db.base import BaseModel


class ContentType(str, Enum):
    SHORT = "SHORT"        # Kısa dikey format video (eski adı: Reels)
    MASTERCLASS = "MASTERCLASS"  # Uzun format eğitim videosu


class ContentStatus(str, Enum):
    PUBLISHED = "PUBLISHED"  # Yayında; partner ve editor görebilir
    DRAFT = "DRAFT"          # Taslak; sadece admin/editor görebilir


class AcademyContent(BaseModel, table=True):
    __tablename__ = "academy_contents"

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)

    type: ContentType

    locale: str = Field(max_length=5, index=True)
    # Dil kodu. Örn: "tr", "en", "de"

    title: str = Field(max_length=200)

    description: Optional[str] = Field(default=None, max_length=2000)

    video_url: str = Field(max_length=500)
    # YouTube "liste dışı" video URL'si.

    resource_link: Optional[str] = Field(default=None, max_length=500)
    # Google Drive döküman linki (PDF, sunum vb.).

    resource_link_label: Optional[str] = Field(default=None, max_length=100)
    # Buton etiketi.

    order: int = Field(default=0, index=True)
    # Aynı tenant + locale + type içindeki sıralama.

    status: ContentStatus = Field(default=ContentStatus.DRAFT)

    prerequisite_id: Optional[uuid.UUID] = Field(default=None, foreign_key="academy_contents.id")
    # Bu içeriğin kilidini açmak için önce hangi içeriğin tamamlanması gerektiği.

    is_new: bool = Field(default=True)
    # İçerik ilk eklendiğinde True.

    thumbnail_url: Optional[str] = Field(default=None, max_length=500)
    # YouTube otomatik thumbnail URL'si.
