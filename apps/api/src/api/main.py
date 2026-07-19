"""WanderBook API entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import auth, journal, places, search, trips

app = FastAPI(title="WanderBook API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(places.router)
app.include_router(trips.router)
app.include_router(journal.router)
app.include_router(search.router)

@app.get("/")
def read_root():
    """Root health check."""
    return {"message": "WanderBook API is running"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}
