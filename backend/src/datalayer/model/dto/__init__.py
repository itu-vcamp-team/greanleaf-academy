"""
Data Transfer Objects (DTO) and Pydantic schemas module.
Contains all request/response models for the API.
"""

from .tenant_dto import TenantBase, TenantCreate, TenantUpdate, TenantResponse
from .user_dto import UserBase, UserCreate, UserUpdate, UserResponse
from .academy_content_dto import (
    AcademyContentBase, 
    AcademyContentCreate, 
    AcademyContentUpdate, 
    AcademyContentResponse
)
from .auth_dto import (
    RegisterStep1Schema,
    RegisterStep2Schema,
    RegisterStep3Schema,
    LoginSchema,
    VerifyEmailSchema,
    Verify2FASchema,
    RefreshTokenSchema,
    TokenResponseSchema,
    LoginResponseSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema
)
from .academy_schemas import (
    ContentBase,
    ContentCreate,
    ContentUpdate,
    UserProgressSchema,
    ContentResponse,
    GuestContentResponse
)

__all__ = [
    # Tenant
    "TenantBase",
    "TenantCreate",
    "TenantUpdate",
    "TenantResponse",
    
    # User
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    
    # Academy Content
    "AcademyContentBase",
    "AcademyContentCreate",
    "AcademyContentUpdate",
    "AcademyContentResponse",
    
    # Auth
    "RegisterStep1Schema",
    "RegisterStep2Schema",
    "RegisterStep3Schema",
    "LoginSchema",
    "VerifyEmailSchema",
    "Verify2FASchema",
    "RefreshTokenSchema",
    "TokenResponseSchema",
    "LoginResponseSchema",
    "ForgotPasswordSchema",
    "ResetPasswordSchema",
    
    # Academy Detailed Schemas
    "ContentBase",
    "ContentCreate",
    "ContentUpdate",
    "UserProgressSchema",
    "ContentResponse",
    "GuestContentResponse",
]
