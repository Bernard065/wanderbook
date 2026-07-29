FROM python:3.13-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Prevent Python from writing .pyc files and buffer logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy dependency files first for better Docker layer caching
COPY pyproject.toml uv.lock ./

# Install project dependencies (excluding the project itself)
RUN uv sync --frozen --no-install-project --no-dev

# Copy application source
COPY . .

# Install the project
RUN uv sync --frozen --no-dev

# Expose the application port
EXPOSE 8000

# Start the FastAPI application
CMD ["sh", "-c", "uv run uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
