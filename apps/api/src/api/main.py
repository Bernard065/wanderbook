"""WanderBook API entrypoint."""

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException):
    """Normalize HTTPException detail into { errors: { field: [...] } }."""
    # reference _request to satisfy linters that check for unused arguments
    _ = getattr(_request, "method", None)
    detail = exc.detail
    # If detail already contains errors, return as-is
    if isinstance(detail, dict) and "errors" in detail:
        body = {"errors": detail["errors"]}
    elif isinstance(detail, dict):
        # wrap dict under '_' key
        body = {"errors": {"_": [detail]}}
    else:
        body = {"errors": {"_": [str(detail) if detail is not None else ""]}}
    return JSONResponse(status_code=exc.status_code, content=body)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    """Convert FastAPI validation errors to { errors: { field: [msg] } }."""
    # reference _request to satisfy linters that check for unused arguments
    _ = getattr(_request, "method", None)
    errors: dict[str, list[str]] = {}
    for err in exc.errors():
        # err['loc'] often like ('body', 'field') or ('query', 'param')
        loc = err.get("loc", [])
        key = str(loc[-1]) if isinstance(loc, (list, tuple)) and len(loc) > 0 else "_"
        msg = err.get("msg", "Invalid input")
        errors.setdefault(key, []).append(msg)

    return JSONResponse(status_code=400, content={"errors": errors})


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
