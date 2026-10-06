"""A router factory for the straightforward entities.

Experience, education, skills, certifications, testimonials and the taxonomy
tables all need the same eight operations. Writing them once means a fix to
ordering or error handling applies everywhere, and the bespoke routers
(projects, posts, media) stay small enough to read.
"""

# NOTE: deliberately no `from __future__ import annotations` here.
# The endpoints below are annotated with the runtime variables `create_schema`
# and `update_schema`. PEP 563 would turn those into strings that FastAPI
# cannot resolve, and it would silently treat the request body as a query
# parameter instead.

from typing import Any, Callable, Optional, Sequence, Type

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.database import Base, get_db
from app.models import User


class ReorderRequest(BaseModel):
    """Admin drag-and-drop sends the full ordered list of ids."""

    ids: list[int]


def build_crud_router(
    *,
    model: Type[Base],
    create_schema: Type[BaseModel],
    update_schema: Type[BaseModel],
    out_schema: Type[BaseModel],
    entity_name: str,
    order_by: Optional[Sequence[Any]] = None,
    on_create: Optional[Callable[[Session, Any, BaseModel], None]] = None,
    on_update: Optional[Callable[[Session, Any, BaseModel], None]] = None,
) -> APIRouter:
    router = APIRouter(dependencies=[Depends(require_admin)])
    ordering = order_by or (model.id,)

    def _get_or_404(db: Session, item_id: int):
        obj = db.get(model, item_id)
        if obj is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"That {entity_name} no longer exists. It may have been deleted.",
            )
        return obj

    @router.get("", response_model=list[out_schema])
    def list_items(db: Session = Depends(get_db)):
        return db.scalars(select(model).order_by(*ordering)).unique().all()

    @router.get("/{item_id}", response_model=out_schema)
    def get_item(item_id: int, db: Session = Depends(get_db)):
        return _get_or_404(db, item_id)

    @router.post("", response_model=out_schema, status_code=status.HTTP_201_CREATED)
    def create_item(payload: create_schema, db: Session = Depends(get_db)):  # type: ignore[valid-type]
        data = payload.model_dump(exclude_unset=True)
        obj = model(**{k: v for k, v in data.items() if hasattr(model, k)})
        db.add(obj)
        db.flush()
        if on_create:
            on_create(db, obj, payload)
        db.commit()
        db.refresh(obj)
        return obj

    @router.patch("/{item_id}", response_model=out_schema)
    def update_item(item_id: int, payload: update_schema, db: Session = Depends(get_db)):  # type: ignore[valid-type]
        obj = _get_or_404(db, item_id)
        for key, value in payload.model_dump(exclude_unset=True).items():
            if hasattr(model, key):
                setattr(obj, key, value)
        if on_update:
            on_update(db, obj, payload)
        db.commit()
        db.refresh(obj)
        return obj

    @router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_item(item_id: int, db: Session = Depends(get_db)):
        obj = _get_or_404(db, item_id)
        db.delete(obj)
        db.commit()

    @router.post("/reorder", status_code=status.HTTP_204_NO_CONTENT)
    def reorder(payload: ReorderRequest, db: Session = Depends(get_db)):
        if not hasattr(model, "display_order"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{entity_name.title()} items cannot be reordered.",
            )
        for position, item_id in enumerate(payload.ids):
            obj = db.get(model, item_id)
            if obj is not None:
                obj.display_order = position
        db.commit()

    return router
