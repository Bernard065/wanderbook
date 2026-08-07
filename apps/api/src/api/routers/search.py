"""Routes for global search across Places, Trips, Journal entries and Photos."""

from fastapi import APIRouter, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import selectinload

from api.deps import CurrentUser, DbSession
from api.models import (
    JournalEntryModel,
    PhotoModel,
    PlaceModel,
    TripModel,
)
from api.schemas import PhotoRead, SearchResults
from api.storage import get_file_url

router = APIRouter(tags=["search"])


@router.get(
    "/search",
    response_model=SearchResults,
    response_model_by_alias=True,
)
async def search(q: str, db: DbSession, current_user: CurrentUser):
    """Search Places, Trips, Journal entries, and Photos."""

    q = q.strip()

    if not q:
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    term = f"%{q}%"

    places_result = await db.execute(
        select(PlaceModel)
        .where(
            PlaceModel.user_id == current_user.id,
            or_(
                PlaceModel.name.ilike(term),
                PlaceModel.country.ilike(term),
                PlaceModel.city.ilike(term),
                PlaceModel.description.ilike(term),
            ),
        )
        .order_by(PlaceModel.created_at.desc())
        .limit(20)
    )

    trips_result = await db.execute(
        select(TripModel)
        .where(
            TripModel.user_id == current_user.id,
            or_(
                TripModel.name.ilike(term),
                TripModel.description.ilike(term),
            ),
        )
        .options(selectinload(TripModel.places))
        .order_by(TripModel.created_at.desc())
        .limit(20)
    )

    journal_result = await db.execute(
        select(JournalEntryModel)
        .where(
            JournalEntryModel.user_id == current_user.id,
            or_(
                JournalEntryModel.title.ilike(term),
                JournalEntryModel.content.ilike(term),
            ),
        )
        .order_by(JournalEntryModel.created_at.desc())
        .limit(20)
    )

    photo_result = await db.execute(
        select(PhotoModel)
        .where(
            PhotoModel.user_id == current_user.id,
            PhotoModel.caption.ilike(term),
        )
        .order_by(PhotoModel.created_at.desc())
        .limit(20)
    )

    return SearchResults(
        places=places_result.scalars().all(),
        trips=trips_result.scalars().all(),
        journal_entries=journal_result.scalars().all(),
        photos=[
            PhotoRead(
                id=photo.id,
                place_id=photo.place_id,
                caption=photo.caption,
                url=get_file_url(photo.storage_key),
                created_at=photo.created_at,
            )
            for photo in photo_result.scalars().all()
        ],
    )
