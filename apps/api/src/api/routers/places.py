"""Routes for the Places module."""

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from api.deps import CurrentUser, DbSession
from api.models import PlaceModel
from api.schemas import PlaceCreate, PlaceRead, PlaceUpdate

router = APIRouter(prefix="/places", tags=["places"])


@router.get("", response_model=list[PlaceRead], response_model_by_alias=True)
async def list_places(db: DbSession, current_user: CurrentUser):
    """List all places belonging to the current user."""
    result = await db.execute(
        select(PlaceModel).where(PlaceModel.user_id == current_user.id)
    )
    return result.scalars().all()


@router.get(
    "/{place_id}", response_model=PlaceRead, response_model_by_alias=True
)
async def get_place(place_id: str, db: DbSession, current_user: CurrentUser):
    """Get a single place by ID, if it belongs to the current user."""
    place = await db.get(PlaceModel, place_id)
    if place is None or place.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Place not found")
    return place


@router.post(
    "", response_model=PlaceRead, status_code=201, response_model_by_alias=True
)
async def create_place(
    payload: PlaceCreate, db: DbSession, current_user: CurrentUser
):
    """Create a new place owned by the current user."""
    place = PlaceModel(**payload.model_dump(), user_id=current_user.id)
    db.add(place)
    await db.commit()
    await db.refresh(place)
    return place


@router.patch(
    "/{place_id}", response_model=PlaceRead, response_model_by_alias=True
)
async def update_place(
    place_id: str,
    payload: PlaceUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Update an existing place."""
    place = await db.get(PlaceModel, place_id)
    if place is None or place.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Place not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(place, field, value)

    await db.commit()
    await db.refresh(place)
    return place


@router.delete("/{place_id}", status_code=204)
async def delete_place(
    place_id: str, db: DbSession, current_user: CurrentUser
):
    """Delete a place."""
    place = await db.get(PlaceModel, place_id)
    if place is None or place.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Place not found")

    await db.delete(place)
    await db.commit()
