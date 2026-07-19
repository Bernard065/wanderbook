"""Pydantic schemas for request/response validation."""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from api.constants import ExpenseCategory, PlaceCategory, TripStatusLiteral


class CamelModel(BaseModel):
    """Base schema that serializes fields as camelCase for the frontend."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class PlaceCreate(CamelModel):
    """Schema for creating a new place."""

    name: str
    description: str | None = None
    country: str
    region: str | None = None
    city: str | None = None
    category: PlaceCategory
    gps_lat: float | None = None
    gps_lng: float | None = None
    rating: float | None = None


class PlaceRead(CamelModel):
    """Schema for reading a place."""

    id: str
    name: str
    description: str | None
    country: str
    region: str | None
    city: str | None
    category: str
    gps_lat: float | None
    gps_lng: float | None
    rating: float | None
    visit_count: int
    created_at: datetime
    updated_at: datetime

class PlaceUpdate(CamelModel):
    """Schema for updating an existing place."""

    name: str | None = None
    description: str | None = None
    country: str | None = None
    region: str | None = None
    city: str | None = None
    category: PlaceCategory | None = None
    gps_lat: float | None = None
    gps_lng: float | None = None
    rating: float | None = None

class UserCreate(CamelModel):
    """Schema for registering a new user."""

    email: str
    password: str
    full_name: str | None = None


class UserLogin(CamelModel):
    """Schema for logging in."""

    email: str
    password: str


class UserRead(CamelModel):
    """Schema for reading a user (never includes the password hash)."""

    id: str
    email: str
    full_name: str | None
    created_at: datetime


class TokenResponse(CamelModel):
    """Schema for a successful login/register response."""

    access_token: str
    token_type: str = "bearer"
    user: UserRead


class TripCreate(CamelModel):
    """Schema for creating a new trip."""

    name: str
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: TripStatusLiteral = "planning"
    place_ids: list[str] = []


class TripUpdate(CamelModel):
    """Schema for updating an existing trip."""

    name: str | None = None
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: TripStatusLiteral | None = None
    place_ids: list[str] | None = None


class TripRead(CamelModel):
    """Schema for reading a trip."""

    id: str
    name: str
    description: str | None
    start_date: date | None
    end_date: date | None
    status: str
    places: list[PlaceRead]
    created_at: datetime
    updated_at: datetime


class JournalEntryCreate(CamelModel):
    """Schema for creating a new journal entry."""

    place_id: str
    title: str
    content: str
    mood: str | None = None
    is_private: bool = True


class JournalEntryUpdate(CamelModel):
    """Schema for updating an existing journal entry."""

    title: str | None = None
    content: str | None = None
    mood: str | None = None
    is_private: bool | None = None


class JournalEntryRead(CamelModel):
    """Schema for reading a journal entry."""

    id: str
    place_id: str
    title: str
    content: str
    mood: str | None
    is_private: bool
    created_at: datetime
    updated_at: datetime


class SearchResults(CamelModel):
    """Schema for aggregated search results."""

    places: list[PlaceRead]
    trips: list[TripRead]
    journal_entries: list[JournalEntryRead]


class ExpenseCreate(CamelModel):
    """Schema for creating a new expense."""

    place_id: str | None = None
    trip_id: str | None = None
    amount: float
    currency: str = "USD"
    category: ExpenseCategory
    notes: str | None = None
    expense_date: date


class ExpenseUpdate(CamelModel):
    """Schema for updating an existing expense."""

    place_id: str | None = None
    trip_id: str | None = None
    amount: float | None = None
    currency: str | None = None
    category: ExpenseCategory | None = None
    notes: str | None = None
    expense_date: date | None = None


class ExpenseRead(CamelModel):
    """Schema for reading an expense."""

    id: str
    place_id: str | None
    trip_id: str | None
    amount: float
    currency: str
    category: str
    notes: str | None
    expense_date: date
    created_at: datetime
    updated_at: datetime
