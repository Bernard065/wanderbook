"""Application configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    database_url: str
    secret_key: str

    s3_endpoint_url: str | None = None
    s3_access_key: str
    s3_secret_key: str
    s3_bucket_name: str

    environment: str = "development"
    cors_origins: str = "http://localhost:4200"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    @property
    def is_production(self) -> bool:
        """Return whether the application is running in production."""
        return self.environment == "production"

    @property
    def cors_origins_list(self) -> list[str]:
        """Return the configured CORS origins as a list."""
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


# Global application settings instance.
settings = Settings()
