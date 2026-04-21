"""
Utility module.
Contains helper functions, dependencies, and caching logic.
"""

from .auth_deps import (
    get_current_user, 
    get_current_admin, 
    get_current_superadmin, 
    get_current_partner
)
from .tenant_deps import get_current_tenant, get_current_tenant_id
from .tenant_cache import invalidate_tenant_cache
from .ical_generator import generate_ics
from .cleanup_jobs import CleanupService

__all__ = [
    "get_current_user",
    "get_current_admin",
    "get_current_superadmin",
    "get_current_partner",
    "get_current_tenant",
    "get_current_tenant_id",
    "invalidate_tenant_cache",
    "generate_ics",
    "CleanupService",
]
