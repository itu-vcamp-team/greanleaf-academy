from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.datalayer.database import create_tables
from src.logger import setup_logging, logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Uygulama başlarken
    setup_logging()
    logger.info("Greenleaf Backend başlatılıyor...")
    await create_tables()  # sadece geliştirme ortamı için
    logger.info("Veritabanı bağlantısı hazır.")
    yield
    # Uygulama kapanırken
    logger.info("Greenleaf Backend kapatılıyor.")
