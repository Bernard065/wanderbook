"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

PlaceCategory = Literal[
    "mountain",
    "beach",
    "museum",
    "restaurant",
    "park",
    "national_park",
    "hotel",
    "church",
    "mosque",
    "temple",
    "waterfall",
    "lake",
    "river",
    "forest",
    "island",
    "village",
    "market",
    "bridge",
    "monument",
    "zoo",
    "stadium",
    "airport",
    "cafe",
    "university",
    "shopping_mall",
    "historic_site",
    "landmark",
    "custom",
]


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
