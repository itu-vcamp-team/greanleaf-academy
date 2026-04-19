import asyncio
import uuid
from datetime import datetime, timezone
import bcrypt
from sqlalchemy import select, update
from src.datalayer.database import AsyncSessionFactory
from src.datalayer.model.db.tenant import Tenant
from src.datalayer.model.db.user import User, UserRole

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
            print("Existing TR tenant updated.")
        else:
            tenant = Tenant(
                id=uuid.uuid4(),
                slug="tr",
                name="Greenleaf Türkiye",
                is_active=True,
                config=tenant_config
            )
            session.add(tenant)
            print("New TR tenant created.")
        
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
            print(f"User {username} updated.")
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
            print(f"User {username} created.")

        await session.commit()
        print("Seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_initial_data())
