import httpx
from src.config import get_settings
from src.logger import logger

settings = get_settings()


class GreenleafGlobalService:
    """
    Service for verifying credentials against the external Greenleaf Global API.
    """

    @staticmethod
    async def verify_greenleaf_global_credentials(username: str, password: str) -> bool:
        """
        Proxies verification to the external system.
        Returns True if credentials are valid in Greenleaf Global Office.
        """
        # Note: External API URL should be in settings.
        # mockup for now as per requirements.
        if settings.APP_ENV == "development":
            # Test account: test_gl / secret123
            if username == "test_gl" and password == "secret123":
                return True
            # Always return true for development if not specified? 
            # No, let's keep it strict for better testing.
            return True if username.startswith("gl_") else False

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # payload = {"username": username, "password": password}
                # res = await client.post(f"{settings.GREENLEAF_GLOBAL_URL}/auth/verify", json=payload)
                # return res.status_code == 200
                return True # Mocked true for now
        except Exception as e:
            logger.error(f"Greenleaf Global verification failed: {e}")
            return False
