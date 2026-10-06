import json
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


def _csv_list(raw: str) -> List[str]:
    """Parse a list env var.

    These are declared as plain strings rather than List[str] on purpose:
    pydantic-settings JSON-decodes complex types straight from the environment
    before any validator runs, so a comma-separated value would raise
    SettingsError at import time and the app would never boot.
    Both "a,b" and '["a","b"]' are accepted here.
    """
    raw = raw.strip()
    if not raw:
        return []
    if raw.startswith("["):
        try:
            return [str(item).strip() for item in json.loads(raw) if str(item).strip()]
        except (ValueError, TypeError):
            pass
    return [item.strip() for item in raw.split(",") if item.strip()]


class Settings(BaseSettings):
    """Runtime configuration. Every value comes from the environment.

    Nothing here has a production-safe default except the non-secret toggles;
    the app refuses to boot in production if SECRET_KEY is still the dev value.
    """

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # --- Core -------------------------------------------------------------
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "Emmanuel Kiriinya — Portfolio API"
    API_V1_PREFIX: str = "/api/v1"

    # --- Database ---------------------------------------------------------
    # Neon connection string, e.g.
    # postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/portfolio"

    # --- Auth -------------------------------------------------------------
    SECRET_KEY: str = "dev-only-insecure-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14
    COOKIE_SECURE: bool = True
    COOKIE_SAMESITE: str = "none"  # frontend and API sit on different domains
    COOKIE_DOMAIN: str | None = None

    # Seeded on first `python -m app.seed`
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "changeme123"
    ADMIN_NAME: str = "Emmanuel Kiriinya"

    # --- CORS -------------------------------------------------------------
    # Comma separated. Add every Vercel domain that must reach this API.
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # --- Storage (Cloudflare R2 / any S3-compatible) ----------------------
    STORAGE_BACKEND: str = "r2"  # "r2" | "s3" | "local"
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET: str = "portfolio-media"
    R2_ENDPOINT_URL: str = ""  # derived from account id when blank
    R2_PUBLIC_BASE_URL: str = ""  # e.g. https://media.kiriinya.dev
    LOCAL_STORAGE_DIR: str = "./media"
    LOCAL_PUBLIC_BASE_URL: str = "http://localhost:8000/media"

    MAX_UPLOAD_BYTES: int = 8 * 1024 * 1024  # 8 MB
    ALLOWED_IMAGE_TYPES: str = "image/jpeg,image/png,image/webp,image/svg+xml"

    @property
    def cors_origins(self) -> List[str]:
        return _csv_list(self.CORS_ORIGINS)

    @property
    def allowed_image_types(self) -> List[str]:
        return _csv_list(self.ALLOWED_IMAGE_TYPES)

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in {"production", "prod"}

    @property
    def r2_endpoint(self) -> str:
        if self.R2_ENDPOINT_URL:
            return self.R2_ENDPOINT_URL
        return f"https://{self.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
