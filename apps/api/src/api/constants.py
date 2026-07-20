"""Shared literal type constants used across schemas and models."""

from typing import Literal

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

TripStatusLiteral = Literal["planning", "ongoing", "completed", "cancelled"]

ExpenseCategory = Literal[
    "transport",
    "accommodation",
    "entrance_fee",
    "food",
    "shopping",
    "tips",
    "fuel",
    "parking",
    "insurance",
    "visa",
    "equipment",
    "other",
]

BucketListCategory = Literal[
    "country",
    "city",
    "landmark",
    "restaurant",
    "museum",
    "national_park",
    "road_trip",
    "festival",
    "custom",
]

BucketListStatus = Literal[
    "dreaming",
    "planning",
    "booked",
    "visited",
    "cancelled",
]
