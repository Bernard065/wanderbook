"""Application configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App settings loaded from environment variables / .env file."""

    database_url: str
    secret_key: str
    s3_endpoint_url: str | None = None
    s3_access_key: str
    s3_secret_key: str
    s3_bucket_name: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
