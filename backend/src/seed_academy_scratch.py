import asyncio
import uuid
from sqlalchemy import select
from datalayer.database import get_db_session_context
from datalayer.model.db.tenant import Tenant
from datalayer.model.db.academy_content import AcademyContent, ContentType, ContentStatus
from datalayer.model.db.user import User, UserRole
from datalayer.model.db.user_progress import UserProgress
from services.academy_service import AcademyService

async def seed_academy():
    async with get_db_session_context() as db:
        # 1. Get a Tenant
        tenant_res = await db.execute(select(Tenant).limit(1))
        tenant = tenant_res.scalar_one_or_none()
        if not tenant:
            print("No tenant found. Seed failed.")
            return

        # 2. Get SuperAdmin
        admin_res = await db.execute(select(User).where(User.role == UserRole.SUPERADMIN))
        admin = admin_res.scalar_one_or_none()
        
        # 3. Create Content using AcademyService (which handles thumbnails/validation)
        service = AcademyService()
        
        # --- SHORTS ---
        shorts_data = [
            {
                "type": ContentType.SHORT,
                "title": "Greenleaf Vizyonu: Neden Buradayız?",
                "description": "3 dakikada Greenleaf Akademi'nin kuruluş felsefesi.",
                "video_url": "https://youtube.com/shorts/hJTW3WMxAhc",
                "order": 1,
                "status": ContentStatus.PUBLISHED
            },
            {
                "type": ContentType.SHORT,
                "title": "Başarı İçin İlk 3 Kritik Adım",
                "description": "Eğitime başlarken dikkat etmeniz gereken en önemli 3 kural.",
                "video_url": "https://youtube.com/shorts/hJTW3WMxAhc",
                "order": 2,
                "status": ContentStatus.PUBLISHED
            }
        ]
        
        created_shorts = []
        for s in shorts_data:
            # Manually link prerequisite for the 2nd one
            if len(created_shorts) > 0:
                s["prerequisite_id"] = created_shorts[-1].id
            
            content = AcademyContent(**s, tenant_id=tenant.id)
            if not content.thumbnail_url:
                content.thumbnail_url = service.get_youtube_thumbnail_url(content.video_url)
            
            db.add(content)
            await db.flush()
            created_shorts.append(content)

        # --- MASTERCLASS ---
        mc = AcademyContent(
            tenant_id=tenant.id,
            type=ContentType.MASTERCLASS,
            title="Satışın Temelleri",
            description="Müşteri adaylarıyla ilk temas eğitimi.",
            video_url="https://youtu.be/A8sze3bezaM",
            order=1,
            status=ContentStatus.PUBLISHED,
            thumbnail_url=service.get_youtube_thumbnail_url("https://youtu.be/A8sze3bezaM")
        )
        db.add(mc)
        
        # 4. Mock Progress for Admin (Complete Short 1 to see if Short 2 unlocks)
        if admin:
            progress = UserProgress(
                user_id=admin.id,
                content_id=created_shorts[0].id,
                status="completed"
            )
            db.add(progress)

        await db.commit()
        print("Academy Seed Success!")

if __name__ == "__main__":
    asyncio.run(seed_academy())
