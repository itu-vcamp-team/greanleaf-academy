import random
import redis.asyncio as aioredis
from src.config import get_settings

settings = get_settings()


class OTPService:
    """
    Service for generating and verifying 6-digit OTP codes using Redis.
    """

    @staticmethod
    async def generate_otp(user_id: str, purpose: str = "auth") -> str:
        """Generates a 6-digit code and stores it in Redis for 10 minutes."""
        code = "".join([str(random.randint(0, 9)) for _ in range(6)])
        
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        # Key format: otp:{purpose}:{user_id}
        await r.setex(f"otp:{purpose}:{user_id}", 600, code)
        await r.aclose()
        
        return code

    @staticmethod
    async def verify_otp(user_id: str, code: str, purpose: str = "auth") -> bool:
        """Verifies and consumes the OTP code."""
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        key = f"otp:{purpose}:{user_id}"
        stored_code = await r.get(key)
        
        if stored_code is None:
            await r.aclose()
            return False
            
        is_valid = stored_code == code
        if is_valid:
            await r.delete(key)
            
        await r.aclose()
        return is_valid
