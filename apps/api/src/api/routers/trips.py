"""Routes for the Trips module."""

from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from api.deps import CurrentUser, DbSession
from api.models import PlaceModel, TripModel
from api.schemas import TripCreate, TripRead, TripUpdate

router = APIRouter(prefix="/trips", tags=["trips"])


async def _get_places_by_ids(
    db: DbSession, current_user: CurrentUser, place_ids: list[str]
) -> list[PlaceModel]:
    """Fetch places by id, scoped to the current user."""
    if not place_ids:
        return []
    result = await db.execute(
        select(PlaceModel).where(
            PlaceModel.id.in_(place_ids),
            PlaceModel.user_id == current_user.id,
        )
    )
    return list(result.scalars().all())


@router.get("", response_model=list[TripRead], response_model_by_alias=True)
async def list_trips(db: DbSession, current_user: CurrentUser):
    """List all trips belonging to the current user."""
    result = await db.execute(
        select(TripModel)
        .where(TripModel.user_id == current_user.id)
        .options(selectinload(TripModel.places))
    )
    return result.scalars().all()


@router.get(
    "/{trip_id}", response_model=TripRead, response_model_by_alias=True
)
async def get_trip(trip_id: str, db: DbSession, current_user: CurrentUser):
    """Get a single trip by ID, if it belongs to the current user."""
    result = await db.execute(
        select(TripModel)
        .where(TripModel.id == trip_id)
        .options(selectinload(TripModel.places))
    )
    trip = result.scalar_one_or_none()
    if trip is None or trip.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.post(
    "", response_model=TripRead, status_code=201, response_model_by_alias=True
)
async def create_trip(
    payload: TripCreate, db: DbSession, current_user: CurrentUser
):
    """Create a new trip owned by the current user."""
    places = await _get_places_by_ids(db, current_user, payload.place_ids)

    trip = TripModel(
        name=payload.name,
        description=payload.description,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=payload.status,
        user_id=current_user.id,
        places=places,
    )
    db.add(trip)
    await db.commit()
    await db.refresh(trip, attribute_names=["places"])
    return trip


@router.patch(
    "/{trip_id}", response_model=TripRead, response_model_by_alias=True
)
async def update_trip(
    trip_id: str,
    payload: TripUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Update an existing trip."""
    result = await db.execute(
        select(TripModel)
        .where(TripModel.id == trip_id)
        .options(selectinload(TripModel.places))
    )
    trip = result.scalar_one_or_none()
    if trip is None or trip.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Trip not found")

    update_data = payload.model_dump(
        exclude_unset=True, exclude={"place_ids"}
    )
    for field, value in update_data.items():
        setattr(trip, field, value)

    if payload.place_ids is not None:
        trip.places = await _get_places_by_ids(
            db, current_user, payload.place_ids
        )

    await db.commit()
    await db.refresh(trip, attribute_names=["places"])
    return trip


@router.delete("/{trip_id}", status_code=204)
async def delete_trip(trip_id: str, db: DbSession, current_user: CurrentUser):
    """Delete a trip."""
    trip = await db.get(TripModel, trip_id)
    if trip is None or trip.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Trip not found")

    await db.delete(trip)
    await db.commit()
