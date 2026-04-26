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
    async def verify_turnstile_token(token: str) -> bool:
        """Verifies Cloudflare Turnstile token."""
        import httpx
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                    data={
                        "secret": settings.TURNSTILE_SECRET_KEY,
                        "response": token,
                    },
                    timeout=5.0
                )
                res_data = response.json()
                return res_data.get("success", False)
        except Exception as e:
            print(f"Turnstile verification failed: {e}")
            return False
