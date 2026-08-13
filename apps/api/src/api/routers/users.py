"""Routes for user profile management."""

from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from api.deps import CurrentUser, DbSession
from api.models import UserModel
from api.schemas import UserRead
from api.storage import delete_file, upload_file

router = APIRouter(prefix="/users", tags=["users"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.get("/me", response_model=UserRead)
async def get_profile(current_user: CurrentUser) -> UserRead:
    """Get current user profile."""
    return current_user


@router.put("/me", response_model=UserRead)
async def update_profile(
    db: DbSession,
    current_user: CurrentUser,
    full_name: Annotated[str | None, Form()] = None,
    profile_photo: Annotated[UploadFile | None, File()] = None,
) -> UserRead:
    """Update user profile, optionally uploading a new profile photo.

    Args:
        full_name: Updated full name (optional)
        profile_photo: New profile photo file (optional)
    """
    # Get the user from the database
    user = await db.get(UserModel, current_user.id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Update full name if provided
    if full_name is not None:
        user.full_name = full_name.strip() if full_name else None

    # Handle profile photo upload
    if profile_photo is not None:
        if profile_photo.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Invalid image format. Only JPEG, PNG, and WebP images are allowed",
            )

        file_bytes = await profile_photo.read()
        if len(file_bytes) > MAX_FILE_SIZE_BYTES:
            file_size_mb = len(file_bytes) / (1024 * 1024)
            raise HTTPException(
                status_code=400,
                detail=f"Profile photo is too large ({file_size_mb:.1f}MB). Maximum size is 5MB",
            )

        # Delete old profile photo if it exists
        if user.profile_photo_key:
            try:
                delete_file(user.profile_photo_key)
            except OSError:
                # Continue even if deletion fails
                pass

        # Upload new profile photo
        extension = profile_photo.content_type.split("/")[-1]
        new_storage_key = upload_file(file_bytes, profile_photo.content_type, extension)
        user.profile_photo_key = new_storage_key

    # Commit changes
    await db.commit()
    await db.refresh(user)

    return user
