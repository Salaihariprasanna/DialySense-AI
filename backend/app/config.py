import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "DialySense AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # PostgreSQL Configuration
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "dialysense_db")
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"postgresql://{os.getenv('POSTGRES_USER', 'postgres')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_SERVER', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'dialysense_db')}"
    )
    
    # Fallback to local SQLite if PostgreSQL connection fails
    SQLITE_FALLBACK_URL: str = "sqlite:///./dialysense.db"
    
    # CORS
    CORS_ORIGINS: list = ["*"]
    
    # AI Model Path
    MODEL_PATH: str = os.getenv("MODEL_PATH", "ml/dialysis_risk_model.joblib")
    
    # Reports Dir
    REPORTS_DIR: str = os.getenv("REPORTS_DIR", "reports")

    class Config:
        case_sensitive = True

settings = Settings()
