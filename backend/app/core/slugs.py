from slugify import slugify
from sqlalchemy import select
from sqlalchemy.orm import Session


def unique_slug(db: Session, model, source: str, *, current_id: int | None = None) -> str:
    """Slugify `source`, then append -2, -3 … until the slug is free.

    `current_id` lets an edit keep its own slug instead of colliding with itself.
    """
    base = slugify(source)[:240] or "item"
    candidate = base
    suffix = 2
    while True:
        stmt = select(model.id).where(model.slug == candidate)
        if current_id is not None:
            stmt = stmt.where(model.id != current_id)
        if db.scalar(stmt) is None:
            return candidate
        candidate = f"{base}-{suffix}"
        suffix += 1
