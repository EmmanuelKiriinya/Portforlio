"""Project admin: case-study fields, gallery ordering, draft/publish."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.sanitize import sanitize_html
from app.core.slugs import unique_slug
from app.database import get_db
from app.models import Project, ProjectMedia
from app.schemas import (
    PaginatedProjects,
    ProjectCreate,
    ProjectOut,
    ProjectUpdate,
)

router = APIRouter(dependencies=[Depends(require_admin)])

RICH_FIELDS = ("content", "problem", "solution", "dataset", "methodology", "models_used", "results")


def _get_project(db: Session, project_id: int) -> Project:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="That project no longer exists. It may have been deleted.",
        )
    return project


def _sync_gallery(db: Session, project: Project, media_ids: list[int] | None) -> None:
    if media_ids is None:
        return
    project.gallery.clear()
    db.flush()
    for index, media_id in enumerate(media_ids):
        project.gallery.append(ProjectMedia(media_id=media_id, display_order=index))


@router.get("", response_model=PaginatedProjects)
def list_projects(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    q: str | None = None,
):
    stmt = select(Project)
    if status_filter in {"draft", "published"}:
        stmt = stmt.where(Project.status == status_filter)
    if q:
        pattern = f"%{q.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Project.title).like(pattern),
                func.lower(Project.excerpt).like(pattern),
            )
        )

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = (
        db.scalars(
            stmt.order_by(Project.display_order, Project.updated_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        .unique()
        .all()
    )
    return PaginatedProjects(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        pages=max(1, -(-total // per_page)),
    )


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    return _get_project(db, project_id)


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"gallery_media_ids", "slug"})
    for field in RICH_FIELDS:
        if data.get(field):
            data[field] = sanitize_html(data[field])

    project = Project(**data)
    project.slug = unique_slug(db, Project, payload.slug or payload.title)
    db.add(project)
    db.flush()
    _sync_gallery(db, project, payload.gallery_media_ids)
    db.commit()
    db.refresh(project)
    return project


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, payload: ProjectUpdate, db: Session = Depends(get_db)):
    project = _get_project(db, project_id)
    data = payload.model_dump(exclude_unset=True)

    if "slug" in data or "title" in data:
        source = data.get("slug") or data.get("title") or project.title
        project.slug = unique_slug(db, Project, source, current_id=project.id)
    data.pop("slug", None)

    gallery_ids = data.pop("gallery_media_ids", None)
    for field in RICH_FIELDS:
        if field in data and data[field]:
            data[field] = sanitize_html(data[field])

    for key, value in data.items():
        setattr(project, key, value)

    _sync_gallery(db, project, gallery_ids)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = _get_project(db, project_id)
    db.delete(project)
    db.commit()


@router.post("/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_projects(ids: list[int], db: Session = Depends(get_db)):
    for position, project_id in enumerate(ids):
        project = db.get(Project, project_id)
        if project is not None:
            project.display_order = position
    db.commit()
