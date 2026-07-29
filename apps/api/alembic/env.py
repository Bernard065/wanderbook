"""Alembic environment configuration for async migrations."""

# pylint: disable=no-member,unused-import

import asyncio
from logging.config import fileConfig

from alembic import context
from api.config import settings
from api.database import Base, engine
from api.models import (  # noqa: F401
    BucketListItemModel,
    DocumentModel,
    ExpenseModel,
    FriendshipModel,
    JournalEntryModel,
    PhotoModel,
    PlaceModel,
    TripModel,
    TripPlaceModel,
    TripShareModel,
    UserModel,
)

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

config.set_main_option("sqlalchemy.url", settings.database_url)


def run_migrations_offline() -> None:
    """Run migrations without a live database connection."""
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    """Run migrations using the given connection."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations using the application's async engine."""
    async with engine.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
