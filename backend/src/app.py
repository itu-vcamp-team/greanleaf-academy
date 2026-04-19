from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from src.app_lifespan import lifespan
from src.config import get_settings
from src.middleware.tenant_middleware import TenantMiddleware
from src.routes.auth import router as auth_router

settings = get_settings()

app = FastAPI(
    title="Greenleaf Akademi API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.APP_ENV == "development" else None,
    redoc_url=None,
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TenantMiddleware)

app.include_router(auth_router, prefix="/api")

# Health check endpoint
@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok", "env": settings.APP_ENV}
