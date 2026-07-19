"""Routes for global search across Places, Trips, and Journal entries."""

from fastapi import APIRouter
from sqlalchemy import or_, select
from sqlalchemy.orm import selectinload

from api.deps import CurrentUser, DbSession
from api.models import JournalEntryModel, PlaceModel, TripModel
from api.schemas import SearchResults

router = APIRouter(tags=["search"])


@router.get("/search", response_model=SearchResults, response_model_by_alias=True)
async def search(q: str, db: DbSession, current_user: CurrentUser):
    """Search Places, Trips, and Journal entries by name/title/content."""
    term = f"%{q}%"

    places_result = await db.execute(
        select(PlaceModel).where(
            PlaceModel.user_id == current_user.id,
            or_(
                PlaceModel.name.ilike(term),
                PlaceModel.country.ilike(term),
                PlaceModel.city.ilike(term),
            ),
        )
    )

    trips_result = await db.execute(
        select(TripModel)
        .where(
            TripModel.user_id == current_user.id,
            TripModel.name.ilike(term),
        )
        .options(selectinload(TripModel.places))
    )

    journal_result = await db.execute(
        select(JournalEntryModel).where(
            JournalEntryModel.user_id == current_user.id,
            or_(
                JournalEntryModel.title.ilike(term),
                JournalEntryModel.content.ilike(term),
            ),
        )
    )

    return SearchResults(
        places=places_result.scalars().all(),
        trips=trips_result.scalars().all(),
        journal_entries=journal_result.scalars().all(),
    )
