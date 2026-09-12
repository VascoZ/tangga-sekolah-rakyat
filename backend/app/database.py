"""
Database connection for TANGGA
"""

import os

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from app.config import settings

# On Vercel (or any serverless host) each invocation may be a fresh process,
# and a pooled connection can be resumed stale after the function freezes.
# NullPool opens a plain connection per request instead - safe there, and
# pairs with a provider-side pooler (e.g. Neon's pooled endpoint).
_engine_kwargs = {"echo": settings.DEBUG, "future": True}
if os.getenv("VERCEL"):
    _engine_kwargs["poolclass"] = NullPool

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