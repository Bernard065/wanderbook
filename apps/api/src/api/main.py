"""WanderBook API entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from api.config import settings
from api.database import ASYNC_SESSION_LOCAL
from api.rate_limit import limiter
from api.routers import (
    auth,
    bucket_list,
    documents,
    expenses,
    flights,
    friends,
    journal,
    photos,
    places,
    search,
    trips,
)

app = FastAPI(title="WanderBook API")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(places.router)
app.include_router(trips.router)
app.include_router(journal.router)
app.include_router(search.router)
app.include_router(expenses.router)
app.include_router(bucket_list.router)
app.include_router(photos.router)
app.include_router(documents.router)
app.include_router(friends.router)
app.include_router(flights.router)


@app.get("/")
async def read_root():
    """Root endpoint."""
    return {"message": "WanderBook API is running"}


@app.get("/health")
async def health_check():
    """
    Health check endpoint.

    Verifies that:
    - The API is running.
    - The database is reachable.
    """

    async with ASYNC_SESSION_LOCAL() as session:
        await session.execute(text("SELECT 1"))

    return {
        "status": "ok",
        "database": "connected",
    }
