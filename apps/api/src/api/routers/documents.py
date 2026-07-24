"""Routes for document uploads."""

from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from sqlalchemy import select

from api.deps import CurrentUser, DbSession
from api.models import DocumentModel, PlaceModel, TripModel
from api.schemas import DocumentRead
from api.storage import delete_file, get_file_url, upload_file

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_CONTENT_TYPES = {"application/pdf", "image/jpeg", "image/png"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB


def _document_to_read(document: DocumentModel) -> DocumentRead:
    return DocumentRead(
        id=document.id,
        place_id=document.place_id,
        trip_id=document.trip_id,
        file_name=document.file_name,
        document_type=document.document_type,
        url=get_file_url(document.storage_key),
        created_at=document.created_at,
    )


async def _verify_refs(
    db: DbSession,
    current_user: CurrentUser,
    place_id: str | None,
    trip_id: str | None,
) -> None:
    """Raise 404 if a referenced place/trip doesn't belong to the user."""
    if place_id is not None:
        place = await db.get(PlaceModel, place_id)
        if place is None or place.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Place not found")

    if trip_id is not None:
        trip = await db.get(TripModel, trip_id)
        if trip is None or trip.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Trip not found")


@router.get("", response_model=list[DocumentRead])
async def list_documents(
    db: DbSession,
    current_user: CurrentUser,
    place_id: str | None = None,
    trip_id: str | None = None,
):
    """List documents for the current user, optionally filtered."""
    query = select(DocumentModel).where(
        DocumentModel.user_id == current_user.id
    )
    if place_id is not None:
        query = query.where(DocumentModel.place_id == place_id)
    if trip_id is not None:
        query = query.where(DocumentModel.trip_id == trip_id)

    result = await db.execute(
        query.order_by(DocumentModel.created_at.desc())
    )
    documents = result.scalars().all()
    return [_document_to_read(d) for d in documents]


@router.post("", response_model=DocumentRead, status_code=201)
async def create_document(
    db: DbSession,
    current_user: CurrentUser,
    file: Annotated[UploadFile, File()],
    document_type: Annotated[str, Form()],
    place_id: Annotated[str | None, Form()] = None,
    trip_id: Annotated[str | None, Form()] = None,
):
    """Upload a new document."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, JPEG, and PNG files are allowed",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400, detail="File must be under 15MB"
        )

    await _verify_refs(db, current_user, place_id, trip_id)

    extension = file.filename.split(".")[-1] if file.filename else "bin"
    storage_key = upload_file(file_bytes, file.content_type, extension)

    document = DocumentModel(
        user_id=current_user.id,
        place_id=place_id,
        trip_id=trip_id,
        storage_key=storage_key,
        file_name=file.filename or "document",
        document_type=document_type,
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)

    return _document_to_read(document)


@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: str, db: DbSession, current_user: CurrentUser
):
    """Delete a document."""
    document = await db.get(DocumentModel, document_id)
    if document is None or document.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Document not found")

    delete_file(document.storage_key)
    await db.delete(document)
    await db.commit()
