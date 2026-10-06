"""Media library: upload, browse, search, edit metadata, delete."""

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.config import settings
from app.core.storage import VALID_CATEGORIES, get_storage
from app.database import get_db
from app.models import Media
from app.schemas import MediaOut, MediaUpdate

router = APIRouter(dependencies=[Depends(require_admin)])

_MAX_MB = settings.MAX_UPLOAD_BYTES // (1024 * 1024)


@router.get("", response_model=list[MediaOut])
def list_media(
    db: Session = Depends(get_db),
    category: str | None = None,
    q: str | None = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    stmt = select(Media)
    if category and category in VALID_CATEGORIES:
        stmt = stmt.where(Media.category == category)
    if q:
        pattern = f"%{q.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Media.file_name).like(pattern),
                func.lower(Media.alt_text).like(pattern),
                func.lower(Media.caption).like(pattern),
            )
        )
    return db.scalars(
        stmt.order_by(Media.created_at.desc()).offset(offset).limit(limit)
    ).all()


@router.post("", response_model=MediaOut, status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    category: str = Query("general"),
    alt_text: str | None = Query(None),
    db: Session = Depends(get_db),
):
    content_type = file.content_type or "application/octet-stream"
    if content_type not in settings.allowed_image_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Upload a PNG, JPG, WebP, or SVG file. This one is {content_type}.",
        )

    data = await file.read()
    if len(data) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"This file is larger than {_MAX_MB} MB. Compress it and try again.",
        )
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="That file is empty. Choose a different image.",
        )

    try:
        stored = get_storage().save(
            data, file.filename or "upload", content_type, category
        )
    except Exception as exc:  # storage misconfiguration, network, permissions
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Upload failed while saving to storage. Check the storage "
            "credentials and try again.",
        ) from exc

    record = Media(
        file_name=file.filename or "upload",
        storage_path=stored.storage_path,
        public_url=stored.public_url,
        webp_url=stored.webp_url,
        mime_type=stored.mime_type,
        size_bytes=stored.size_bytes,
        width=stored.width,
        height=stored.height,
        alt_text=alt_text,
        category=category if category in VALID_CATEGORIES else "general",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.patch("/{media_id}", response_model=MediaOut)
def update_media(media_id: int, payload: MediaUpdate, db: Session = Depends(get_db)):
    record = db.get(Media, media_id)
    if record is None:
        raise HTTPException(status_code=404, detail="That file is no longer in the library.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media(media_id: int, db: Session = Depends(get_db)):
    record = db.get(Media, media_id)
    if record is None:
        raise HTTPException(status_code=404, detail="That file is no longer in the library.")
    try:
        get_storage().delete(record.storage_path)
    except Exception:
        # The object may already be gone; removing the row is still correct.
        pass
    db.delete(record)
    db.commit()
