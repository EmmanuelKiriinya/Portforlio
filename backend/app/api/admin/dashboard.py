from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.database import get_db
from app.models import (
    BlogPost,
    Certification,
    ContactMessage,
    Media,
    Project,
    Testimonial,
)
from app.schemas import ContactMessageOut, DashboardStats

router = APIRouter(dependencies=[Depends(require_admin)])


def _count(db: Session, model, *conditions) -> int:
    stmt = select(func.count()).select_from(model)
    for condition in conditions:
        stmt = stmt.where(condition)
    return db.scalar(stmt) or 0


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db)):
    live = BlogPost.deleted_at.is_(None)
    recent_posts = (
        db.scalars(
            select(BlogPost)
            .where(live)
            .order_by(BlogPost.updated_at.desc())
            .limit(5)
        )
        .unique()
        .all()
    )
    recent_messages = db.scalars(
        select(ContactMessage)
        .where(ContactMessage.archived.is_(False))
        .order_by(ContactMessage.created_at.desc())
        .limit(5)
    ).all()

    return DashboardStats(
        total_posts=_count(db, BlogPost, live),
        published_posts=_count(db, BlogPost, live, BlogPost.status == "published"),
        draft_posts=_count(db, BlogPost, live, BlogPost.status == "draft"),
        total_projects=_count(db, Project),
        published_projects=_count(db, Project, Project.status == "published"),
        total_certifications=_count(db, Certification),
        total_testimonials=_count(db, Testimonial),
        total_media=_count(db, Media),
        unread_messages=_count(db, ContactMessage, ContactMessage.read.is_(False)),
        recent_posts=recent_posts,
        recent_messages=recent_messages,
    )


@router.get("/messages", response_model=list[ContactMessageOut])
def list_messages(
    db: Session = Depends(get_db),
    archived: bool = Query(False),
    limit: int = Query(100, ge=1, le=500),
):
    return db.scalars(
        select(ContactMessage)
        .where(ContactMessage.archived.is_(archived))
        .order_by(ContactMessage.created_at.desc())
        .limit(limit)
    ).all()


@router.post("/messages/{message_id}/read", response_model=ContactMessageOut)
def mark_read(message_id: int, db: Session = Depends(get_db)):
    message = db.get(ContactMessage, message_id)
    if message is None:
        raise HTTPException(status_code=404, detail="That message no longer exists.")
    message.read = True
    db.commit()
    db.refresh(message)
    return message


@router.post("/messages/{message_id}/archive", response_model=ContactMessageOut)
def archive_message(message_id: int, db: Session = Depends(get_db)):
    message = db.get(ContactMessage, message_id)
    if message is None:
        raise HTTPException(status_code=404, detail="That message no longer exists.")
    message.archived = True
    message.read = True
    db.commit()
    db.refresh(message)
    return message


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(message_id: int, db: Session = Depends(get_db)):
    message = db.get(ContactMessage, message_id)
    if message is None:
        raise HTTPException(status_code=404, detail="That message no longer exists.")
    db.delete(message)
    db.commit()
