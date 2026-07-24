"""Routes for the Trips module."""

from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from api.deps import CurrentUser, DbSession
from api.models import PlaceModel, TripModel, TripShareModel, UserModel
from api.schemas import (
    TripCreate,
    TripRead,
    TripShareCreate,
    TripShareRead,
    TripUpdate,
    UserRead,
)

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


async def _get_viewable_trip(
    db: DbSession, current_user: CurrentUser, trip_id: str
) -> TripModel:
    """Fetch a trip if owned by, or shared with, the current user."""
    result = await db.execute(
        select(TripModel)
        .where(TripModel.id == trip_id)
        .options(selectinload(TripModel.places))
    )
    trip = result.scalar_one_or_none()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip.user_id == current_user.id:
        return trip

    share = await db.get(
        TripShareModel, {"trip_id": trip_id, "shared_with_user_id": current_user.id}
    )
    if share is None:
        raise HTTPException(status_code=404, detail="Trip not found")

    return trip


@router.get("", response_model=list[TripRead], response_model_by_alias=True)
async def list_trips(db: DbSession, current_user: CurrentUser):
    """List all trips owned by the current user."""
    result = await db.execute(
        select(TripModel)
        .where(TripModel.user_id == current_user.id)
        .options(selectinload(TripModel.places))
    )
    return result.scalars().all()


@router.get(
    "/shared-with-me",
    response_model=list[TripRead],
    response_model_by_alias=True,
)
async def list_shared_trips(db: DbSession, current_user: CurrentUser):
    """List trips shared with the current user by friends."""
    result = await db.execute(
        select(TripModel)
        .join(TripShareModel, TripShareModel.trip_id == TripModel.id)
        .where(TripShareModel.shared_with_user_id == current_user.id)
        .options(selectinload(TripModel.places))
    )
    return result.scalars().all()


@router.get(
    "/{trip_id}", response_model=TripRead, response_model_by_alias=True
)
async def get_trip(trip_id: str, db: DbSession, current_user: CurrentUser):
    """Get a single trip, if owned by or shared with the current user."""
    return await _get_viewable_trip(db, current_user, trip_id)


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
    """Update an existing trip. Only the owner may update."""
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
    """Delete a trip. Only the owner may delete."""
    trip = await db.get(TripModel, trip_id)
    if trip is None or trip.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Trip not found")

    await db.delete(trip)
    await db.commit()


@router.get(
    "/{trip_id}/shares",
    response_model=list[TripShareRead],
    response_model_by_alias=True,
)
async def list_trip_shares(
    trip_id: str, db: DbSession, current_user: CurrentUser
):
    """List who a trip is shared with. Only the owner may view this."""
    trip = await db.get(TripModel, trip_id)
    if trip is None or trip.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Trip not found")

    result = await db.execute(
        select(TripShareModel).where(TripShareModel.trip_id == trip_id)
    )
    shares = result.scalars().all()

    reads = []
    for share in shares:
        user = await db.get(UserModel, share.shared_with_user_id)
        if user is not None:
            reads.append(
                TripShareRead(
                    shared_with_user_id=share.shared_with_user_id,
                    shared_with=UserRead.model_validate(user),
                    created_at=share.created_at,
                )
            )
    return reads


@router.post(
    "/{trip_id}/shares", status_code=201, response_model=TripShareRead
)
async def share_trip(
    trip_id: str,
    payload: TripShareCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Share a trip with a friend. Only the owner may share."""
    trip = await db.get(TripModel, trip_id)
    if trip is None or trip.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Trip not found")

    user = await db.get(UserModel, payload.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    existing = await db.get(
        TripShareModel,
        {"trip_id": trip_id, "shared_with_user_id": payload.user_id},
    )
    if existing is not None:
        raise HTTPException(
            status_code=409, detail="Trip already shared with this user"
        )

    share = TripShareModel(
        trip_id=trip_id, shared_with_user_id=payload.user_id
    )
    db.add(share)
    await db.commit()

    return TripShareRead(
        shared_with_user_id=user.id,
        shared_with=UserRead.model_validate(user),
        created_at=share.created_at,
    )


@router.delete("/{trip_id}/shares/{user_id}", status_code=204)
async def unshare_trip(
    trip_id: str, user_id: str, db: DbSession, current_user: CurrentUser
):
    """Revoke a trip share. Only the owner may unshare."""
    trip = await db.get(TripModel, trip_id)
    if trip is None or trip.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Trip not found")

    share = await db.get(
        TripShareModel, {"trip_id": trip_id, "shared_with_user_id": user_id}
    )
    if share is None:
        raise HTTPException(status_code=404, detail="Share not found")

    await db.delete(share)
    await db.commit()
