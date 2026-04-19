import bcrypt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class PasswordService:
    """
    Service for secure password hashing and verification.
    """

    @staticmethod
    def hash_password(password: str) -> str:
        """Hashes a plain-text password using bcrypt."""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verifies a plain-text password against a stored hash."""
        return pwd_context.verify(plain_password, hashed_password)
