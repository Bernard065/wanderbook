"""Routes for the Flights module."""

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from api.deps import CurrentUser, DbSession
from api.models import FlightModel, TripModel
from api.schemas import FlightCreate, FlightRead

router = APIRouter(prefix="/flights", tags=["flights"])


@router.get("", response_model=list[FlightRead], response_model_by_alias=True)
async def list_flights(db: DbSession, current_user: CurrentUser):
    """List all flights for the current user."""
    result = await db.execute(
        select(FlightModel)
        .where(FlightModel.user_id == current_user.id)
        .order_by(FlightModel.departure_date.desc())
    )
    return result.scalars().all()


@router.post(
    "", response_model=FlightRead, status_code=201, response_model_by_alias=True
)
async def create_flight(
    payload: FlightCreate, db: DbSession, current_user: CurrentUser
):
    """Log a new flight."""
    if payload.trip_id is not None:
        trip = await db.get(TripModel, payload.trip_id)
        if trip is None or trip.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Trip not found")

    flight = FlightModel(**payload.model_dump(), user_id=current_user.id)
    db.add(flight)
    await db.commit()
    await db.refresh(flight)
    return flight


@router.delete("/{flight_id}", status_code=204)
async def delete_flight(
    flight_id: str, db: DbSession, current_user: CurrentUser
):
    """Delete a flight."""
    flight = await db.get(FlightModel, flight_id)
    if flight is None or flight.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Flight not found")
    await db.delete(flight)
    await db.commit()
