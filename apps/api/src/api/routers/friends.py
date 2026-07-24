"""Routes for friend connections."""

from fastapi import APIRouter, HTTPException
from sqlalchemy import or_, select

from api.deps import CurrentUser, DbSession
from api.models import FriendshipModel, UserModel
from api.schemas import FriendRequestCreate, FriendshipRead, UserRead

router = APIRouter(prefix="/friends", tags=["friends"])


def _to_friendship_read(
    friendship: FriendshipModel,
    friend: UserModel,
) -> FriendshipRead:
    return FriendshipRead(
        id=friendship.id,
        requester_id=friendship.requester_id,
        addressee_id=friendship.addressee_id,
        status=friendship.status,
        friend=UserRead.model_validate(friend),
        created_at=friendship.created_at,
    )


@router.get("", response_model=list[FriendshipRead])
async def list_friendships(db: DbSession, current_user: CurrentUser):
    """List all friendships (pending and accepted) for the current user."""
    result = await db.execute(
        select(FriendshipModel).where(
            or_(
                FriendshipModel.requester_id == current_user.id,
                FriendshipModel.addressee_id == current_user.id,
            )
        )
    )
    friendships = result.scalars().all()

    reads = []
    for friendship in friendships:
        friend_id = (
            friendship.addressee_id
            if friendship.requester_id == current_user.id
            else friendship.requester_id
        )
        friend = await db.get(UserModel, friend_id)
        if friend is not None:
            reads.append(_to_friendship_read(friendship, friend))

    return reads


@router.post("/requests", response_model=FriendshipRead, status_code=201)
async def send_friend_request(
    payload: FriendRequestCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Send a friend request by email."""
    result = await db.execute(
        select(UserModel).where(UserModel.email == payload.email)
    )
    addressee = result.scalar_one_or_none()

    if addressee is None:
        raise HTTPException(status_code=404, detail="User not found")

    if addressee.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot add yourself as a friend",
        )

    existing = await db.execute(
        select(FriendshipModel).where(
            or_(
                (FriendshipModel.requester_id == current_user.id)
                & (FriendshipModel.addressee_id == addressee.id),
                (FriendshipModel.requester_id == addressee.id)
                & (FriendshipModel.addressee_id == current_user.id),
            )
        )
    )

    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=409,
            detail="Friendship already exists",
        )

    friendship = FriendshipModel(
        requester_id=current_user.id,
        addressee_id=addressee.id,
        status="pending",
    )

    db.add(friendship)
    await db.commit()
    await db.refresh(friendship)

    return _to_friendship_read(friendship, addressee)


@router.patch("/requests/{friendship_id}", response_model=FriendshipRead)
async def respond_to_friend_request(
    friendship_id: str,
    status: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Accept or reject a pending friend request."""
    if status not in ("accepted", "rejected"):
        raise HTTPException(
            status_code=400,
            detail="Invalid status",
        )

    friendship = await db.get(FriendshipModel, friendship_id)

    if friendship is None or friendship.addressee_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Friend request not found",
        )

    friendship.status = status
    await db.commit()
    await db.refresh(friendship)

    friend = await db.get(UserModel, friendship.requester_id)
    if friend is None:
        raise HTTPException(
            status_code=404,
            detail="Friend not found",
        )

    return _to_friendship_read(friendship, friend)


@router.delete("/{friendship_id}", status_code=204)
async def remove_friendship(
    friendship_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Remove a friendship (unfriend, or cancel/decline a request)."""
    friendship = await db.get(FriendshipModel, friendship_id)

    if friendship is None or (
        friendship.requester_id != current_user.id
        and friendship.addressee_id != current_user.id
    ):
        raise HTTPException(
            status_code=404,
            detail="Friendship not found",
        )

    await db.delete(friendship)
    await db.commit()
