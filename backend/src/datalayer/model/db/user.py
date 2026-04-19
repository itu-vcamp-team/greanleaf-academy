import uuid
from typing import Optional
from enum import Enum
from datetime import datetime
from sqlmodel import Field
from src.datalayer.model.db.base import BaseModel


class UserRole(str, Enum):
    SUPERADMIN = "SUPERADMIN"
    ADMIN = "ADMIN"
    EDITOR = "EDITOR"
    PARTNER = "PARTNER"
    GUEST = "GUEST"


class User(BaseModel, table=True):
    __tablename__ = "users"

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    # Hangi tenant'a (bölgeye) ait olduğu

    role: UserRole = Field(default=UserRole.GUEST)

    username: str = Field(unique=True, index=True, max_length=50)
    # Kullanıcı adı (giriş için kullanılır)

    email: str = Field(unique=True, index=True, max_length=255)

    password_hash: str = Field(max_length=255)
    # bcrypt ile hashlenmiş şifre

    full_name: str = Field(max_length=150)

    phone: Optional[str] = Field(default=None, max_length=20)

    partner_id: Optional[str] = Field(default=None, max_length=50, index=True)
    # Greenleaf Global'daki partner numarası. Admin onaylandıktan sonra atanır.

    inviter_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    # Bu kullanıcıyı davet eden partner'ın user.id'si (parent-child ilişkisi)

    is_verified: bool = Field(default=False)
    # E-posta doğrulaması yapıldı mı?

    is_active: bool = Field(default=False)
    # Admin onayı sonrası True olur. Pasif partnerlar False olarak işaretlenir.

    profile_image_path: Optional[str] = Field(default=None, max_length=500)
    # Render disk'e kaydedilen WebP görselin yolu. Örn: "/uploads/profiles/uuid.webp"

    last_2fa_at: Optional[datetime] = Field(default=None)
    # En son aylık e-posta 2FA doğrulamasının zamanı

    supervisor_note: Optional[str] = Field(default=None, max_length=500)
    # "Partner ID yok" diyen kullanıcıların yazdığı supervisor bilgisi

    consent_given_at: Optional[datetime] = Field(default=None)
    # KVKK/GDPR metninin onaylandığı tarih/saat

    consent_ip: Optional[str] = Field(default=None, max_length=45)
    # Onay verilen IP adresi (KVKK için saklanır)

    last_login_at: Optional[datetime] = Field(default=None)

    # GDPR: 1 yıl hareketsiz GUEST hesapları için
    last_active_at: Optional[datetime] = Field(default=None)
