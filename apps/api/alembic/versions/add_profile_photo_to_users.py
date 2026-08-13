"""add profile_photo_key to users table

Revision ID: add_profile_photo_key
Revises: 6f123bf523cc
Create Date: 2026-08-12 10:00:00.000000
"""

# pylint: disable=no-member,invalid-name
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "add_profile_photo_key"
down_revision: str | Sequence[str] | None = "6f123bf523cc"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "users",
        sa.Column("profile_photo_key", sa.String(), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "profile_photo_key")
