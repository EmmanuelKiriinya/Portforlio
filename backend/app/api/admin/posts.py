"""Blog post admin: rich content, tags, draft/publish, soft delete."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from slugify import slugify
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.sanitize import reading_minutes, sanitize_html
from app.core.slugs import unique_slug
from app.database import get_db
from app.models import BlogPost, BlogTag, User
from app.schemas import (
    BlogPostCreate,
    BlogPostOut,
    BlogPostSummaryOut,
    BlogPostUpdate,
    PaginatedPosts,
)

router = APIRouter(dependencies=[Depends(require_admin)])


def _get_post(db: Session, post_id: int) -> BlogPost:
    post = db.get(BlogPost, post_id)
    if post is None or post.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="That post no longer exists. It may have been deleted.",
        )
    return post


def _resolve_tags(db: Session, tag_ids: list[int] | None, tag_names: list[str] | None):
    """Accept existing tag ids and free-typed names; create what's missing."""
    tags: list[BlogTag] = []
    if tag_ids:
        tags.extend(db.scalars(select(BlogTag).where(BlogTag.id.in_(tag_ids))).all())
    for raw in tag_names or []:
        name = raw.strip()
        if not name:
            continue
        slug = slugify(name)
        existing = db.scalar(select(BlogTag).where(BlogTag.slug == slug))
        if existing is None:
            existing = BlogTag(name=name, slug=slug)
            db.add(existing)
            db.flush()
        if existing not in tags:
            tags.append(existing)
    return tags


def _apply_publish_state(post: BlogPost, status_value: str | None) -> None:
    """Stamp published_at the first time a post goes live; clear it on unpublish."""
    if status_value is None:
        return
    post.status = status_value
    if status_value == "published" and post.published_at is None:
        post.published_at = datetime.now(timezone.utc)
    elif status_value == "draft":
        post.published_at = None


@router.get("", response_model=PaginatedPosts)
def list_posts(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    q: str | None = None,
):
    stmt = select(BlogPost).where(BlogPost.deleted_at.is_(None))
    if status_filter in {"draft", "published"}:
        stmt = stmt.where(BlogPost.status == status_filter)
    if q:
        pattern = f"%{q.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(BlogPost.title).like(pattern),
                func.lower(BlogPost.excerpt).like(pattern),
            )
        )

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = (
        db.scalars(
            stmt.order_by(BlogPost.updated_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        .unique()
        .all()
    )
    return PaginatedPosts(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        pages=max(1, -(-total // per_page)),
    )


@router.get("/{post_id}", response_model=BlogPostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    return _get_post(db, post_id)


@router.post("", response_model=BlogPostOut, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: BlogPostCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    data = payload.model_dump(exclude={"tag_ids", "tag_names", "slug", "status"})
    data["content"] = sanitize_html(data.get("content"))

    post = BlogPost(**data, author_id=user.id)
    post.slug = unique_slug(db, BlogPost, payload.slug or payload.title)
    post.reading_minutes = reading_minutes(post.content)
    _apply_publish_state(post, payload.status)
    post.tags = _resolve_tags(db, payload.tag_ids, payload.tag_names)

    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.patch("/{post_id}", response_model=BlogPostOut)
def update_post(post_id: int, payload: BlogPostUpdate, db: Session = Depends(get_db)):
    post = _get_post(db, post_id)
    data = payload.model_dump(exclude_unset=True)

    if "slug" in data or "title" in data:
        source = data.get("slug") or data.get("title") or post.title
        post.slug = unique_slug(db, BlogPost, source, current_id=post.id)
    data.pop("slug", None)

    if "content" in data:
        data["content"] = sanitize_html(data["content"])
        post.reading_minutes = reading_minutes(data["content"])

    status_value = data.pop("status", None)
    tag_ids = data.pop("tag_ids", None)
    tag_names = data.pop("tag_names", None)

    for key, value in data.items():
        setattr(post, key, value)

    _apply_publish_state(post, status_value)
    if tag_ids is not None or tag_names is not None:
        post.tags = _resolve_tags(db, tag_ids, tag_names)

    db.commit()
    db.refresh(post)
    return post


@router.post("/{post_id}/publish", response_model=BlogPostOut)
def publish_post(post_id: int, db: Session = Depends(get_db)):
    post = _get_post(db, post_id)
    if not post.content or not post.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Add some content before publishing this post.",
        )
    _apply_publish_state(post, "published")
    db.commit()
    db.refresh(post)
    return post


@router.post("/{post_id}/unpublish", response_model=BlogPostOut)
def unpublish_post(post_id: int, db: Session = Depends(get_db)):
    post = _get_post(db, post_id)
    _apply_publish_state(post, "draft")
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(get_db)):
    """Soft delete — the row stays recoverable (§17)."""
    post = _get_post(db, post_id)
    post.deleted_at = datetime.now(timezone.utc)
    post.status = "draft"
    db.commit()


@router.get("/trash/list", response_model=list[BlogPostSummaryOut])
def list_trash(db: Session = Depends(get_db)):
    return (
        db.scalars(
            select(BlogPost)
            .where(BlogPost.deleted_at.is_not(None))
            .order_by(BlogPost.deleted_at.desc())
        )
        .unique()
        .all()
    )


@router.post("/{post_id}/restore", response_model=BlogPostOut)
def restore_post(post_id: int, db: Session = Depends(get_db)):
    post = db.get(BlogPost, post_id)
    if post is None or post.deleted_at is None:
        raise HTTPException(status_code=404, detail="That post isn't in the trash.")
    post.deleted_at = None
    db.commit()
    db.refresh(post)
    return post
