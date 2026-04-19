import asyncio
import uuid
from datetime import datetime, timezone
import bcrypt
from sqlalchemy import select, update
from src.datalayer.database import AsyncSessionFactory
from src.datalayer.model.db.tenant import Tenant
from src.datalayer.model.db.user import User, UserRole
from src.datalayer.model.db.academy_content import AcademyContent, ContentType, ContentStatus
from src.datalayer.model.db.user_progress import UserProgress
from src.services.academy_service import AcademyService

async def seed_initial_data():
    async with AsyncSessionFactory() as session:
        # 1. Seed or Update TR Tenant
        stmt = select(Tenant).where(Tenant.slug == "tr")
        result = await session.execute(stmt)
        tenant = result.scalar_one_or_none()
        
        tenant_config = {
            "primary_color": "#4AA435",
            "secondary_color": "#3B8C2E",
            "background_color": "#FFFFFF",
            "logo_url": "/static/logo.svg",
            "legal": {
                "kvkk": "Greenleaf Akademi KVKK Aydınlatma Metni Taslağı: Verileriniz eğitim platformu erişimi amacıyla işlenmektedir...",
                "terms": "Greenleaf Akademi Kullanım Şartları Taslağı..."
            }
        }
        
        if tenant:
            tenant.name = "Greenleaf Türkiye"
            tenant.config = tenant_config
        else:
            tenant = Tenant(
                id=uuid.uuid4(),
                slug="tr",
                name="Greenleaf Türkiye",
                is_active=True,
                config=tenant_config
            )
            session.add(tenant)
        
        await session.flush()
        tenant_id = tenant.id

        # 2. Seed SuperAdmin User
        username = "gaffar-dulkadir"
        stmt_user = select(User).where(User.username == username)
        result_user = await session.execute(stmt_user)
        user = result_user.scalar_one_or_none()
        
        salt = bcrypt.gensalt()
        hashed_pw = bcrypt.hashpw("admin123".encode(), salt).decode()
        
        if user:
            user.full_name = "Gaffar Dulkadir"
            user.email = "gaffardulkadir@gmail.com"
            user.password_hash = hashed_pw
            user.role = UserRole.SUPERADMIN
            user.is_active = True
            user.is_verified = True
            user.tenant_id = tenant_id
        else:
            user = User(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                username=username,
                email="gaffardulkadir@gmail.com",
                full_name="Gaffar Dulkadir",
                password_hash=hashed_pw,
                role=UserRole.SUPERADMIN,
                is_active=True,
                is_verified=True,
                consent_given_at=datetime.now(timezone.utc)
            )
            session.add(user)
        
        await session.flush()
        admin_id = user.id

        # 3. Seed Academy Contents (Task 6)
        service = AcademyService()
        
        # 3. Seed Academy Contents (Task 6)
        service = AcademyService()
        
        # Cleanup existing academy contents for this tenant to ensure a clean state
        from sqlalchemy import delete
        # First clean progress records associated with the tenant's contents
        await session.execute(
            delete(UserProgress).where(
                UserProgress.content_id.in_(
                    select(AcademyContent.id).where(AcademyContent.tenant_id == tenant_id)
                )
            )
        )
        # Then clean the contents themselves
        await session.execute(delete(AcademyContent).where(AcademyContent.tenant_id == tenant_id))
        await session.flush()
        
        print("Seeding Academy Contents...")
        
        # --- SHORTS ---
        shorts_data = [
            {
                "title": "Greenleaf Vizyonu: Neden Buradayız?",
                "description": "3 dakikada Greenleaf Akademi'nin kuruluş felsefesi.",
                "video_url": "https://youtube.com/shorts/hJTW3WMxAhc",
                "order": 1
            },
            {
                "title": "Başarı İçin İlk 3 Kritik Adım",
                "description": "Eğitime başlarken dikkat etmeniz gereken en önemli 3 kural.",
                "video_url": "https://youtube.com/shorts/hJTW3WMxAhc",
                "order": 2
            },
            {
                "title": "Partnerlik Süreci ve Yol Haritası",
                "description": "Kayıt işleminden sonra sizi neler bekliyor?",
                "video_url": "https://youtube.com/shorts/hJTW3WMxAhc",
                "order": 3
            }
        ]
        
        last_short_id = None
        for s in shorts_data:
            content = AcademyContent(
                tenant_id=tenant_id,
                type=ContentType.SHORT,
                locale="tr",
                title=s["title"],
                description=s["description"],
                video_url=s["video_url"],
                order=s["order"],
                status=ContentStatus.PUBLISHED,
                prerequisite_id=last_short_id,
                thumbnail_url=service.get_youtube_thumbnail_url(s["video_url"])
            )
            session.add(content)
            await session.flush()
            last_short_id = content.id
            
            # Mock Progress: Set Short 1 as completed for Admin (to unlock Short 2)
            if s["order"] == 1:
                progress = UserProgress(
                    user_id=admin_id,
                    content_id=content.id,
                    status="completed",
                    completed_at=datetime.now(timezone.utc)
                )
                session.add(progress)

        # --- MASTERCLASS ---
        mc = AcademyContent(
            tenant_id=tenant_id,
            type=ContentType.MASTERCLASS,
            locale="tr",
            title="Satışın Temelleri ve İtiraz Yönetimi",
            description="Müşteri adaylarıyla ilk temas eğitimi.",
            video_url="https://youtu.be/A8sze3bezaM",
            order=1,
            status=ContentStatus.PUBLISHED,
            thumbnail_url=service.get_youtube_thumbnail_url("https://youtu.be/A8sze3bezaM")
        )
        session.add(mc)

        try:
            await session.commit()
            print("Seeding completed successfully with Academy content.")
        except Exception as e:
            import traceback
            print("--- SEED ERROR ---")
            traceback.print_exc()
            await session.rollback()
            raise e

if __name__ == "__main__":
    asyncio.run(seed_initial_data())
