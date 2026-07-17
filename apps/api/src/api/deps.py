"""Shared FastAPI dependencies."""

from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import get_db
from api.models import UserModel
from api.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> UserModel:
    """Resolve the currently authenticated user from the Bearer token."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await db.get(UserModel, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user


CurrentUser = Annotated[UserModel, Depends(get_current_user)]
