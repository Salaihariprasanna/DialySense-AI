import logging
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

DATABASE_URL = settings.DATABASE_URL
engine = None

try:
    # Try PostgreSQL first
    test_engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 2})
    with test_engine.connect() as conn:
        logger.info("Successfully connected to PostgreSQL database.")
    engine = test_engine
except Exception as e:
    logger.warning(f"PostgreSQL connection failed ({e}). Falling back to SQLite for seamless local execution.")
    DATABASE_URL = settings.SQLITE_FALLBACK_URL
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
