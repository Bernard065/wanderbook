"""Routes for the Journal module."""

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from api.deps import CurrentUser, DbSession
from api.models import JournalEntryModel, PlaceModel
from api.schemas import (
    JournalEntryCreate,
    JournalEntryRead,
    JournalEntryUpdate,
)

router = APIRouter(prefix="/journal-entries", tags=["journal"])


async def _verify_place_ownership(
    db: DbSession, current_user: CurrentUser, place_id: str
) -> None:
    """Raise 404 if the place doesn't exist or isn't owned by the user."""
    place = await db.get(PlaceModel, place_id)
    if place is None or place.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Place not found")


@router.get(
    "", response_model=list[JournalEntryRead], response_model_by_alias=True
)
async def list_journal_entries(
    db: DbSession,
    current_user: CurrentUser,
    place_id: str | None = None,
):
    """List journal entries for the current user, optionally filtered by place."""
    query = select(JournalEntryModel).where(
        JournalEntryModel.user_id == current_user.id
    )
    if place_id is not None:
        query = query.where(JournalEntryModel.place_id == place_id)

    result = await db.execute(query.order_by(JournalEntryModel.created_at.desc()))
    return result.scalars().all()


@router.get(
    "/{entry_id}",
    response_model=JournalEntryRead,
    response_model_by_alias=True,
)
async def get_journal_entry(
    entry_id: str, db: DbSession, current_user: CurrentUser
):
    """Get a single journal entry by ID."""
    entry = await db.get(JournalEntryModel, entry_id)
    if entry is None or entry.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry


@router.post(
    "",
    response_model=JournalEntryRead,
    status_code=201,
    response_model_by_alias=True,
)
async def create_journal_entry(
    payload: JournalEntryCreate, db: DbSession, current_user: CurrentUser
):
    """Create a new journal entry for a place."""
    await _verify_place_ownership(db, current_user, payload.place_id)

    entry = JournalEntryModel(
        **payload.model_dump(),
        user_id=current_user.id,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.patch(
    "/{entry_id}",
    response_model=JournalEntryRead,
    response_model_by_alias=True,
)
async def update_journal_entry(
    entry_id: str,
    payload: JournalEntryUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Update an existing journal entry."""
    entry = await db.get(JournalEntryModel, entry_id)
    if entry is None or entry.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)

    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
async def delete_journal_entry(
    entry_id: str, db: DbSession, current_user: CurrentUser
):
    """Delete a journal entry."""
    entry = await db.get(JournalEntryModel, entry_id)
    if entry is None or entry.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    await db.delete(entry)
    await db.commit()
