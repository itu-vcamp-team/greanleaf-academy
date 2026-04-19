class GreenleafError(Exception):
    """Base exception for all domain-specific errors."""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class NotFoundError(GreenleafError):
    """Raised when a resource is not found."""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, code="NOT_FOUND")


class ConflictError(GreenleafError):
    """Raised when there is a conflict (e.g., duplicate unique field)."""
    def __init__(self, message: str):
        super().__init__(message, code="CONFLICT")


class UnauthorizedError(GreenleafError):
    """Raised when authentication fails."""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, code="UNAUTHORIZED")


class ForbiddenError(GreenleafError):
    """Raised when user doesn't have enough permissions."""
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, code="FORBIDDEN")


class RateLimitExceededError(GreenleafError):
    """Raised when rate limit is reached."""
    def __init__(self, message: str, retry_after: int = 0):
        self.retry_after = retry_after
        super().__init__(message, code="RATE_LIMIT_EXCEEDED")


class AcademyError(GreenleafError):
    """Base exception for academy related errors."""
    def __init__(self, message: str, code: str = "ACADEMY_ERROR"):
        super().__init__(message, code)


class PrerequisiteNotMetError(AcademyError):
    """Raised when a user tries to access a locked content."""
    def __init__(self, message: str = "Bu içeriğe erişmek için önce önceki adımı tamamlamalısınız."):
        super().__init__(message, code="PREREQUISITE_NOT_MET")


class InvalidYouTubeURLError(AcademyError):
    """Raised when a provided YouTube URL is invalid."""
    def __init__(self, message: str = "Geçerli bir YouTube URL'si girmelisiniz."):
        super().__init__(message, code="INVALID_YOUTUBE_URL")
