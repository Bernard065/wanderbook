"""Routes for the Places module."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import get_db
from api.models import PlaceModel
from api.schemas import PlaceCreate, PlaceRead

router = APIRouter(prefix="/places", tags=["places"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=list[PlaceRead])
async def list_places(db: DbSession):
    """List all places."""
    result = await db.execute(select(PlaceModel))
    return result.scalars().all()


@router.get("/{place_id}", response_model=PlaceRead)
async def get_place(place_id: str, db: DbSession):
    """Get a single place by ID."""
    place = await db.get(PlaceModel, place_id)
    if place is None:
        raise HTTPException(status_code=404, detail="Place not found")
    return place


@router.post("", response_model=PlaceRead, status_code=201)
async def create_place(payload: PlaceCreate, db: DbSession):
    """Create a new place."""
    place = PlaceModel(**payload.model_dump())
    db.add(place)
    await db.commit()
    await db.refresh(place)
    return place
