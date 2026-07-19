"""Routes for the Expenses module."""

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from api.deps import CurrentUser, DbSession
from api.models import ExpenseModel, PlaceModel, TripModel
from api.schemas import ExpenseCreate, ExpenseRead, ExpenseUpdate

router = APIRouter(prefix="/expenses", tags=["expenses"])


async def _verify_refs(
    db: DbSession,
    current_user: CurrentUser,
    place_id: str | None,
    trip_id: str | None,
) -> None:
    """Raise 404 if a referenced place/trip doesn't belong to the user."""
    if place_id is not None:
        place = await db.get(PlaceModel, place_id)
        if place is None or place.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Place not found")

    if trip_id is not None:
        trip = await db.get(TripModel, trip_id)
        if trip is None or trip.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Trip not found")


@router.get(
    "", response_model=list[ExpenseRead], response_model_by_alias=True
)
async def list_expenses(
    db: DbSession,
    current_user: CurrentUser,
    place_id: str | None = None,
    trip_id: str | None = None,
):
    """List expenses for the current user, optionally filtered."""
    query = select(ExpenseModel).where(
        ExpenseModel.user_id == current_user.id
    )
    if place_id is not None:
        query = query.where(ExpenseModel.place_id == place_id)
    if trip_id is not None:
        query = query.where(ExpenseModel.trip_id == trip_id)

    result = await db.execute(
        query.order_by(ExpenseModel.expense_date.desc())
    )
    return result.scalars().all()


@router.post(
    "",
    response_model=ExpenseRead,
    status_code=201,
    response_model_by_alias=True,
)
async def create_expense(
    payload: ExpenseCreate, db: DbSession, current_user: CurrentUser
):
    """Create a new expense."""
    await _verify_refs(db, current_user, payload.place_id, payload.trip_id)

    expense = ExpenseModel(**payload.model_dump(), user_id=current_user.id)
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return expense


@router.patch(
    "/{expense_id}",
    response_model=ExpenseRead,
    response_model_by_alias=True,
)
async def update_expense(
    expense_id: str,
    payload: ExpenseUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Update an existing expense."""
    expense = await db.get(ExpenseModel, expense_id)
    if expense is None or expense.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Expense not found")

    await _verify_refs(db, current_user, payload.place_id, payload.trip_id)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)

    await db.commit()
    await db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204)
async def delete_expense(
    expense_id: str, db: DbSession, current_user: CurrentUser
):
    """Delete an expense."""
    expense = await db.get(ExpenseModel, expense_id)
    if expense is None or expense.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Expense not found")

    await db.delete(expense)
    await db.commit()
