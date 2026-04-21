import random
import redis.asyncio as aioredis
from src.config import get_settings

settings = get_settings()


class CaptchaService:
    """
    Service for generating and verifying math-based captchas using Redis.
    """

    @staticmethod
    async def generate_login_captcha(session_key: str) -> list[int]:
        """Generates 4 random numbers and stores their sum in Redis."""
        numbers = [random.randint(1, 9) for _ in range(4)]
        total = sum(numbers)
        
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await r.setex(f"captcha:{session_key}", 300, str(total)) # 5 min TTL
        await r.aclose()
        
        return numbers

    @staticmethod
    async def verify_login_captcha(session_key: str, answer: int) -> bool:
        """Verifies the user's captcha answer against the stored total."""
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        stored_sum = await r.get(f"captcha:{session_key}")
        
        if stored_sum is None:
            await r.aclose()
            return False
            
        is_valid = int(stored_sum) == answer
        if is_valid:
            await r.delete(f"captcha:{session_key}")
            
        await r.aclose()
        return is_valid
