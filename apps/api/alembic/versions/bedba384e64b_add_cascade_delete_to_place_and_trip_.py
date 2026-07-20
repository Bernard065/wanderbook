"""add cascade delete to place and trip foreign keys

Revision ID: bedba384e64b
Revises: 7d72c899f3f7
Create Date: 2026-07-19 15:34:41.126989

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "bedba384e64b"
down_revision: str | None = "7d72c899f3f7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint(
        "trip_places_trip_id_fkey", "trip_places", type_="foreignkey"
    )
    op.create_foreign_key(
        "trip_places_trip_id_fkey",
        "trip_places",
        "trips",
        ["trip_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint(
        "trip_places_place_id_fkey", "trip_places", type_="foreignkey"
    )
    op.create_foreign_key(
        "trip_places_place_id_fkey",
        "trip_places",
        "places",
        ["place_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint(
        "journal_entries_place_id_fkey", "journal_entries", type_="foreignkey"
    )
    op.create_foreign_key(
        "journal_entries_place_id_fkey",
        "journal_entries",
        "places",
        ["place_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint(
        "expenses_place_id_fkey", "expenses", type_="foreignkey"
    )
    op.create_foreign_key(
        "expenses_place_id_fkey",
        "expenses",
        "places",
        ["place_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint("expenses_trip_id_fkey", "expenses", type_="foreignkey")
    op.create_foreign_key(
        "expenses_trip_id_fkey",
        "expenses",
        "trips",
        ["trip_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("expenses_trip_id_fkey", "expenses", type_="foreignkey")
    op.create_foreign_key(
        "expenses_trip_id_fkey", "expenses", "trips", ["trip_id"], ["id"]
    )

    op.drop_constraint(
        "expenses_place_id_fkey", "expenses", type_="foreignkey"
    )
    op.create_foreign_key(
        "expenses_place_id_fkey", "expenses", "places", ["place_id"], ["id"]
    )

    op.drop_constraint(
        "journal_entries_place_id_fkey", "journal_entries", type_="foreignkey"
    )
    op.create_foreign_key(
        "journal_entries_place_id_fkey",
        "journal_entries",
        "places",
        ["place_id"],
        ["id"],
    )

    op.drop_constraint(
        "trip_places_place_id_fkey", "trip_places", type_="foreignkey"
    )
    op.create_foreign_key(
        "trip_places_place_id_fkey",
        "trip_places",
        "places",
        ["place_id"],
        ["id"],
    )

    op.drop_constraint(
        "trip_places_trip_id_fkey", "trip_places", type_="foreignkey"
    )
    op.create_foreign_key(
        "trip_places_trip_id_fkey", "trip_places", "trips", ["trip_id"], ["id"]
    )
