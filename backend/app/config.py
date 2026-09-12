"""
Configuration settings for TANGGA API
"""

from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional
from urllib.parse import urlsplit, urlunsplit


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://tangga:tangga@localhost:5432/tangga"

    @field_validator("DATABASE_URL")
    @classmethod
    def _use_asyncpg_driver(cls, v: str) -> str:
        """
        Managed Postgres providers (Neon, Supabase, Vercel Postgres, ...) hand
        out plain postgres:// or postgresql:// URLs with libpq-style query
        params (sslmode, channel_binding, ...). SQLAlchemy's async engine
        needs the +asyncpg driver in the scheme, and asyncpg's connect()
        doesn't recognize libpq param names as kwargs (TypeError) - it takes
        a plain `ssl` kwarg instead, which database.py sets via connect_args.
        So: switch the driver, and drop query params here rather than
        requiring every deploy target to hand-edit the URL.
        """
        scheme, netloc, path, _query, fragment = urlsplit(v)
        if scheme in ("postgres", "postgresql"):
            scheme = "postgresql+asyncpg"
        query = "" if scheme == "postgresql+asyncpg" else _query
        return urlunsplit((scheme, netloc, path, query, fragment))
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: Optional[str] = None
    
    # App
    APP_NAME: str = "TANGGA"
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()