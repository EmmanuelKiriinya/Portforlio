"""Media storage behind one interface.

Cloudflare R2 is the default. Because R2 speaks the S3 API, the same class
serves AWS S3, Backblaze B2, and MinIO — only the endpoint changes. A local
disk backend exists for development.

Swapping providers is a change to STORAGE_BACKEND and credentials; no call
site changes.
"""

from __future__ import annotations

import io
import mimetypes
import os
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from PIL import Image

from app.config import settings

# Buckets/prefixes from §36
VALID_CATEGORIES = {
    "profile",
    "blog",
    "projects",
    "certifications",
    "testimonials",
    "general",
    "resumes",
}


@dataclass(slots=True)
class StoredFile:
    storage_path: str
    public_url: str
    webp_url: str | None
    width: int | None
    height: int | None
    size_bytes: int
    mime_type: str


def _object_key(category: str, filename: str) -> str:
    category = category if category in VALID_CATEGORIES else "general"
    stem = Path(filename).stem[:60]
    ext = Path(filename).suffix.lower() or ".bin"
    safe_stem = "".join(c if c.isalnum() or c in "-_" else "-" for c in stem).strip("-")
    stamp = datetime.utcnow().strftime("%Y/%m")
    return f"{category}/{stamp}/{safe_stem or 'file'}-{uuid.uuid4().hex[:8]}{ext}"


def _make_webp(data: bytes, max_width: int = 1920) -> tuple[bytes, int, int] | None:
    """Produce a WebP derivative. Returns None for formats Pillow can't open
    (SVG) or when conversion would not help."""
    try:
        with Image.open(io.BytesIO(data)) as img:
            img = img.convert("RGBA") if img.mode in ("P", "LA") else img.convert("RGB")
            if img.width > max_width:
                ratio = max_width / img.width
                img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, format="WEBP", quality=82, method=4)
            return buf.getvalue(), img.width, img.height
    except Exception:
        return None


def _probe_dimensions(data: bytes) -> tuple[int | None, int | None]:
    try:
        with Image.open(io.BytesIO(data)) as img:
            return img.width, img.height
    except Exception:
        return None, None


class StorageBackend(ABC):
    @abstractmethod
    def save(self, data: bytes, filename: str, mime_type: str, category: str) -> StoredFile: ...

    @abstractmethod
    def delete(self, storage_path: str) -> None: ...


class S3CompatibleStorage(StorageBackend):
    """Cloudflare R2, AWS S3, Backblaze B2, MinIO."""

    def __init__(self) -> None:
        import boto3
        from botocore.config import Config

        self._bucket = settings.R2_BUCKET
        self._public_base = settings.R2_PUBLIC_BASE_URL.rstrip("/")
        self._client = boto3.client(
            "s3",
            endpoint_url=settings.r2_endpoint,
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name="auto",
            config=Config(signature_version="s3v4", retries={"max_attempts": 3}),
        )

    def _url(self, key: str) -> str:
        if self._public_base:
            return f"{self._public_base}/{key}"
        # Fall back to the S3-style path; works for MinIO and public S3 buckets.
        return f"{settings.r2_endpoint}/{self._bucket}/{key}"

    def _put(self, key: str, data: bytes, mime_type: str) -> None:
        self._client.put_object(
            Bucket=self._bucket,
            Key=key,
            Body=data,
            ContentType=mime_type,
            CacheControl="public, max-age=31536000, immutable",
        )

    def save(self, data: bytes, filename: str, mime_type: str, category: str) -> StoredFile:
        key = _object_key(category, filename)
        self._put(key, data, mime_type)

        webp_url, width, height = None, None, None
        derivative = _make_webp(data)
        if derivative and mime_type != "image/svg+xml":
            webp_bytes, width, height = derivative
            webp_key = f"{key.rsplit('.', 1)[0]}.webp"
            self._put(webp_key, webp_bytes, "image/webp")
            webp_url = self._url(webp_key)
        else:
            width, height = _probe_dimensions(data)

        return StoredFile(
            storage_path=key,
            public_url=self._url(key),
            webp_url=webp_url,
            width=width,
            height=height,
            size_bytes=len(data),
            mime_type=mime_type,
        )

    def delete(self, storage_path: str) -> None:
        self._client.delete_object(Bucket=self._bucket, Key=storage_path)
        if not storage_path.endswith(".webp"):
            webp_key = f"{storage_path.rsplit('.', 1)[0]}.webp"
            try:
                self._client.delete_object(Bucket=self._bucket, Key=webp_key)
            except Exception:
                pass  # derivative may not exist


class LocalStorage(StorageBackend):
    """Development only. Render's filesystem is ephemeral."""

    def __init__(self) -> None:
        self._root = Path(settings.LOCAL_STORAGE_DIR)
        self._root.mkdir(parents=True, exist_ok=True)
        self._base = settings.LOCAL_PUBLIC_BASE_URL.rstrip("/")

    def save(self, data: bytes, filename: str, mime_type: str, category: str) -> StoredFile:
        key = _object_key(category, filename)
        dest = self._root / key
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)

        webp_url, width, height = None, None, None
        derivative = _make_webp(data)
        if derivative and mime_type != "image/svg+xml":
            webp_bytes, width, height = derivative
            webp_key = f"{key.rsplit('.', 1)[0]}.webp"
            (self._root / webp_key).write_bytes(webp_bytes)
            webp_url = f"{self._base}/{webp_key}"
        else:
            width, height = _probe_dimensions(data)

        return StoredFile(
            storage_path=key,
            public_url=f"{self._base}/{key}",
            webp_url=webp_url,
            width=width,
            height=height,
            size_bytes=len(data),
            mime_type=mime_type,
        )

    def delete(self, storage_path: str) -> None:
        for candidate in (storage_path, f"{storage_path.rsplit('.', 1)[0]}.webp"):
            target = self._root / candidate
            if target.exists():
                target.unlink()


_backend: StorageBackend | None = None


def get_storage() -> StorageBackend:
    global _backend
    if _backend is None:
        if settings.STORAGE_BACKEND in {"r2", "s3"}:
            _backend = S3CompatibleStorage()
        else:
            _backend = LocalStorage()
    return _backend


def guess_mime(filename: str, fallback: str = "application/octet-stream") -> str:
    return mimetypes.guess_type(filename)[0] or fallback
