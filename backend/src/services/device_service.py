import uuid
import hashlib
from datetime import datetime, timezone
from fastapi import Request
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from src.datalayer.model.db.user_device import UserDevice


class DeviceService:
    """
    Service for identifying and managing user devices to prevent account sharing 
    and trigger 2FA on new devices.
    """

    @staticmethod
    def get_device_fingerprint(request: Request) -> str:
        """
        Generates a unique fingerprint based on User-Agent.
        In production, we might add more headers for better uniqueness.
        """
        ua = request.headers.get("user-agent", "unknown")
        # We can combine UA with some other stable factors
        raw_string = f"{ua}"
        return hashlib.sha256(raw_string.encode()).hexdigest()

    @staticmethod
    async def is_device_recognized(db: AsyncSession, user_id: uuid.UUID, fingerprint: str) -> bool:
        """Checks if the device fingerprint is already registered and trusted for this user."""
        stmt = select(UserDevice).where(
            UserDevice.user_id == user_id,
            UserDevice.fingerprint == fingerprint,
            UserDevice.is_trusted == True
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none() is not None

    @staticmethod
    async def register_device(db: AsyncSession, user_id: uuid.UUID, fingerprint: str):
        """Registers or updates a device for a user."""
        stmt = select(UserDevice).where(
            UserDevice.user_id == user_id,
            UserDevice.fingerprint == fingerprint
        )
        result = await db.execute(stmt)
        device = result.scalar_one_or_none()

        if device:
            device.last_login_at = datetime.now(timezone.utc)
        else:
            device = UserDevice(
                user_id=user_id,
                fingerprint=fingerprint,
                is_trusted=True,
                last_login_at=datetime.now(timezone.utc)
            )
            db.add(device)
        
        # Note: caller should commit the session
