"""WanderBook API entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="WanderBook API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # the React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Root health check."""
    return {"message": "WanderBook API is running"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}