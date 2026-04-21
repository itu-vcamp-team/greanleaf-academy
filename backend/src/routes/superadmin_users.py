import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.datalayer.database import get_db_session
from src.datalayer.model.db.user import User, UserRole
from src.datalayer.model.db.tenant import Tenant
from src.datalayer.model.dto.auth_dto import SuperadminCreateUserSchema
from src.services import PasswordService
from src.services.mailing_service import MailingService
from src.utils.auth_deps import get_current_superadmin
from src.config import get_settings
from src.logger import logger

router = APIRouter(prefix="/superadmin/users", tags=["Superadmin – User Management"])
settings = get_settings()


@router.post("/create", dependencies=[Depends(get_current_superadmin)])
async def superadmin_create_user(
    data: SuperadminCreateUserSchema,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session),
):
    """
    Superadmin tarafından belirtilen tenant içine ADMIN veya PARTNER rolünde
    kullanıcı oluşturur. Hesap aktif ve doğrulanmış olarak başlar.
    Oluşturulan kullanıcıya otomatik olarak hoş geldiniz e-postası gönderilir.
    """
    # Tenant kontrolü
    stmt_tenant = select(Tenant).where(Tenant.id == data.tenant_id, Tenant.is_active == True)
    res_tenant = await db.execute(stmt_tenant)
    tenant = res_tenant.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant bulunamadı veya aktif değil.")

    # Username çakışma kontrolü
    stmt_username = select(User).where(User.username == data.username)
    res_username = await db.execute(stmt_username)
    if res_username.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Bu kullanıcı adı zaten kullanılıyor.")

    # Email çakışma kontrolü
    stmt_email = select(User).where(User.email == data.email)
    res_email = await db.execute(stmt_email)
    if res_email.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Bu e-posta adresi zaten kayıtlı.")

    role_enum = UserRole.ADMIN if data.role == "ADMIN" else UserRole.PARTNER

    new_user = User(
        id=uuid.uuid4(),
        tenant_id=data.tenant_id,
        username=data.username,
        email=data.email,
        full_name=data.full_name,
        phone=data.phone,
        password_hash=PasswordService.hash_password(data.password),
        role=role_enum,
        is_active=True,        # Superadmin tarafından oluşturuldu → direkt aktif
        is_verified=True,      # Manuel oluşturma → doğrulama gerekmez
        consent_given_at=datetime.now(timezone.utc),
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    logger.info(
        f"Superadmin created user '{new_user.username}' "
        f"(role={role_enum.value}) in tenant '{tenant.slug}'"
    )

    # Hoş geldiniz maili → arka planda gönder
    background_tasks.add_task(
        MailingService.send_account_created_by_admin_email,
        to_email=new_user.email,
        full_name=new_user.full_name,
        username=new_user.username,
        temp_password=data.password,   # şifreyi değiştirmesi önerilir
        role=data.role,
        frontend_url=settings.FRONTEND_URL,
    )

    return {
        "id": str(new_user.id),
        "username": new_user.username,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "role": new_user.role.value,
        "tenant_id": str(new_user.tenant_id),
        "is_active": new_user.is_active,
        "message": f"{new_user.full_name} adlı kullanıcı başarıyla oluşturuldu. Hoş geldiniz e-postası gönderildi.",
    }


@router.get("/tenants", dependencies=[Depends(get_current_superadmin)])
async def list_all_tenants(db: AsyncSession = Depends(get_db_session)):
    """
    Superadmin için tüm aktif tenant'ları listeler.
    Kullanıcı oluştururken tenant seçiminde kullanılır.
    """
    stmt = select(Tenant).where(Tenant.is_active == True)
    res = await db.execute(stmt)
    tenants = res.scalars().all()
    return [
        {"id": str(t.id), "slug": t.slug, "name": t.name}
        for t in tenants
    ]
