"""S3-compatible file storage utilities."""

import uuid

import boto3

from api.config import settings

_s3_client = boto3.client(
    "s3",
    endpoint_url=settings.s3_endpoint_url,
    aws_access_key_id=settings.s3_access_key,
    aws_secret_access_key=settings.s3_secret_key,
    region_name=settings.s3_region,
)


def upload_file(file_bytes: bytes, content_type: str, extension: str) -> str:
    """Upload a file to S3-compatible storage and return its key."""
    key = f"{uuid.uuid4()}.{extension}"
    _s3_client.put_object(
        Bucket=settings.s3_bucket_name,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return key


def get_file_url(key: str) -> str:
    """Generate a presigned URL for reading a stored file.

    Returns a URL that the browser can access by replacing the internal
    Docker container URL with the external localhost URL.
    """
    url = _s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.s3_bucket_name, "Key": key},
        ExpiresIn=3600,
    )

    # Replace internal container URL with external URL for browser access
    endpoint_url = settings.s3_endpoint_url
    if endpoint_url and endpoint_url.find("minio") >= 0:
        # Replace minio hostname with localhost for browser access
        url = url.replace("minio:9000", "localhost:9000")
        url = url.replace("//minio", "//localhost")

    return url


def delete_file(key: str) -> None:
    """Delete a file from storage."""
    _s3_client.delete_object(Bucket=settings.s3_bucket_name, Key=key)
