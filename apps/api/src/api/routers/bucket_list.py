"""Routes for the Bucket List module."""

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from api.deps import CurrentUser, DbSession
from api.models import BucketListItemModel, PlaceModel
from api.schemas import (
    BucketListItemCreate,
    BucketListItemRead,
    BucketListItemUpdate,
)

router = APIRouter(prefix="/bucket-list", tags=["bucket-list"])


async def _verify_place(
    db: DbSession, current_user: CurrentUser, place_id: str | None
) -> None:
    """Raise 404 if the referenced place doesn't belong to the user."""
    if place_id is not None:
        place = await db.get(PlaceModel, place_id)
        if place is None or place.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Place not found")


@router.get(
    "", response_model=list[BucketListItemRead], response_model_by_alias=True
)
async def list_bucket_list_items(db: DbSession, current_user: CurrentUser):
    """List all bucket list items for the current user."""
    result = await db.execute(
        select(BucketListItemModel).where(
            BucketListItemModel.user_id == current_user.id
        )
    )
    return result.scalars().all()


@router.post(
    "",
    response_model=BucketListItemRead,
    status_code=201,
    response_model_by_alias=True,
)
async def create_bucket_list_item(
    payload: BucketListItemCreate, db: DbSession, current_user: CurrentUser
):
    """Create a new bucket list item."""
    await _verify_place(db, current_user, payload.place_id)

    item = BucketListItemModel(
        **payload.model_dump(), user_id=current_user.id
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch(
    "/{item_id}",
    response_model=BucketListItemRead,
    response_model_by_alias=True,
)
async def update_bucket_list_item(
    item_id: str,
    payload: BucketListItemUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Update an existing bucket list item."""
    item = await db.get(BucketListItemModel, item_id)
    if item is None or item.user_id != current_user.id:
        raise HTTPException(
            status_code=404, detail="Bucket list item not found"
        )

    await _verify_place(db, current_user, payload.place_id)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
async def delete_bucket_list_item(
    item_id: str, db: DbSession, current_user: CurrentUser
):
    """Delete a bucket list item."""
    item = await db.get(BucketListItemModel, item_id)
    if item is None or item.user_id != current_user.id:
        raise HTTPException(
            status_code=404, detail="Bucket list item not found"
        )

    await db.delete(item)
    await db.commit()
