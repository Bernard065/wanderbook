"""Database engine and session setup."""

from collections.abc import AsyncGenerator

from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from api.config import settings

# asyncpg doesn't support libpq-style query params like sslmode/channel_binding
# (used by Neon and other managed Postgres providers). Strip them from the URL
# and pass SSL via connect_args instead.
_url = make_url(settings.database_url).set(query={})

connect_args = {"statement_cache_size": 0}
if settings.is_production:
    connect_args["ssl"] = "require"

engine = create_async_engine(
    _url,
    echo=not settings.is_production,
    connect_args=connect_args,
)

ASYNC_SESSION_LOCAL = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    """Base class for all ORM models."""


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a database session."""
    async with ASYNC_SESSION_LOCAL() as session:
        yield session
