import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.admin import auth, content, dashboard, media, posts, projects, settings as admin_settings
from app.api.public import routes as public_routes
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("portfolio")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.is_production and settings.SECRET_KEY == "dev-only-insecure-key-change-me":
        raise RuntimeError(
            "SECRET_KEY is still the development default. Set a real value "
            "before running in production."
        )
    logger.info("Starting %s (%s)", settings.PROJECT_NAME, settings.ENVIRONMENT)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None,
    openapi_url=None if settings.is_production else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,  # required for the HTTP-only auth cookies
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.exception_handler(Exception)
async def unhandled_error(request: Request, exc: Exception):
    """Never leak a stack trace to the client; log it instead."""
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something failed on the server. The team has been notified."},
    )


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}


P = settings.API_V1_PREFIX

# Public
app.include_router(public_routes.router, prefix=P, tags=["public"])

# Admin
app.include_router(auth.router, prefix=f"{P}/auth", tags=["auth"])
app.include_router(admin_settings.router, prefix=f"{P}/admin/settings", tags=["admin: settings"])
app.include_router(dashboard.router, prefix=f"{P}/admin", tags=["admin: dashboard"])
app.include_router(media.router, prefix=f"{P}/admin/media", tags=["admin: media"])
app.include_router(posts.router, prefix=f"{P}/admin/posts", tags=["admin: blog"])
app.include_router(projects.router, prefix=f"{P}/admin/projects", tags=["admin: projects"])
app.include_router(content.router, prefix=f"{P}/admin")

# Local media serving (development only — production uses R2)
if settings.STORAGE_BACKEND == "local":
    media_dir = Path(settings.LOCAL_STORAGE_DIR)
    media_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/media", StaticFiles(directory=str(media_dir)), name="media")
