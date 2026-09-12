"""
Database connection for TANGGA
"""

import os
from urllib.parse import urlsplit

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from app.config import settings

_LOCAL_HOSTS = {"localhost", "127.0.0.1", "db"}  # "db" = docker-compose service name

# On Vercel (or any serverless host) each invocation may be a fresh process,
# and a pooled connection can be resumed stale after the function freezes.
# NullPool opens a plain connection per request instead - safe there, and
# pairs with a provider-side pooler (e.g. Neon's pooled endpoint).
_engine_kwargs = {"echo": settings.DEBUG, "future": True}
if os.getenv("VERCEL"):
    _engine_kwargs["poolclass"] = NullPool

# Managed Postgres (Neon, Supabase, ...) requires TLS; local/docker-compose
# Postgres has none configured. asyncpg wants a plain `ssl` connect kwarg
# (not a sslmode=... URL param, which it rejects outright - see config.py).
if (urlsplit(settings.DATABASE_URL).hostname or "") not in _LOCAL_HOSTS:
    _engine_kwargs["connect_args"] = {"ssl": True}

# Create async engine
engine = create_async_engine(settings.DATABASE_URL, **_engine_kwargs)

# Create async session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for models
Base = declarative_base()


async def get_db():
    """Dependency to get database session"""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)