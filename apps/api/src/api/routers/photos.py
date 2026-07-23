"""Routes for photo uploads."""

from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from sqlalchemy import select

from api.deps import CurrentUser, DbSession
from api.models import PhotoModel, PlaceModel
from api.schemas import PhotoRead
from api.storage import delete_file, get_file_url, upload_file

router = APIRouter(prefix="/photos", tags=["photos"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


def _photo_to_read(photo: PhotoModel) -> PhotoRead:
    return PhotoRead(
        id=photo.id,
        place_id=photo.place_id,
        caption=photo.caption,
        url=get_file_url(photo.storage_key),
        created_at=photo.created_at,
    )


@router.get("", response_model=list[PhotoRead])
async def list_photos(
    db: DbSession,
    current_user: CurrentUser,
    place_id: str | None = None,
):
    """List photos for the current user, optionally filtered by place."""
    query = select(PhotoModel).where(PhotoModel.user_id == current_user.id)
    if place_id is not None:
        query = query.where(PhotoModel.place_id == place_id)

    result = await db.execute(query.order_by(PhotoModel.created_at.desc()))
    photos = result.scalars().all()
    return [_photo_to_read(p) for p in photos]


@router.post("", response_model=PhotoRead, status_code=201)
async def create_photo(
    db: DbSession,
    current_user: CurrentUser,
    file: Annotated[UploadFile, File()],
    place_id: Annotated[str | None, Form()] = None,
    caption: Annotated[str | None, Form()] = None,
):
    """Upload a new photo."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, and WebP images are allowed",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400, detail="File must be under 10MB"
        )

    if place_id is not None:
        place = await db.get(PlaceModel, place_id)
        if place is None or place.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Place not found")

    extension = file.content_type.split("/")[-1]
    storage_key = upload_file(file_bytes, file.content_type, extension)

    photo = PhotoModel(
        user_id=current_user.id,
        place_id=place_id,
        storage_key=storage_key,
        caption=caption,
    )
    db.add(photo)
    await db.commit()
    await db.refresh(photo)

    return _photo_to_read(photo)


@router.delete("/{photo_id}", status_code=204)
async def delete_photo(
    photo_id: str, db: DbSession, current_user: CurrentUser
):
    """Delete a photo."""
    photo = await db.get(PhotoModel, photo_id)
    if photo is None or photo.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Photo not found")

    delete_file(photo.storage_key)
    await db.delete(photo)
    await db.commit()
