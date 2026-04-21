import bcrypt


class PasswordService:
    """
    Service for secure password hashing and verification using raw bcrypt.
    Handles compatibility issues with passlib auto-detection in newer bcrypt versions.
    """

    @staticmethod
    def hash_password(password: str) -> str:
        """Hashes a plain-text password using bcrypt."""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
        return hashed.decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verifies a plain-text password against a stored hash."""
        try:
            return bcrypt.checkpw(
                plain_password.encode("utf-8"), 
                hashed_password.encode("utf-8")
            )
        except Exception:
            return False
