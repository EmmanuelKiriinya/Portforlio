"""Profile and site settings — both singletons, always row id=1."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.database import get_db
from app.models import (
    ExpertiseArea,
    Profile,
    ProfileStat,
    SiteSettings,
)
from app.schemas import (
    ProfileOut,
    ProfileUpdate,
    SiteSettingsOut,
    SiteSettingsUpdate,
)

router = APIRouter(dependencies=[Depends(require_admin)])


def get_or_create_profile(db: Session) -> Profile:
    profile = db.get(Profile, 1)
    if profile is None:
        profile = Profile(
            id=1, name="Your name", headline="Data Scientist"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def get_or_create_settings(db: Session) -> SiteSettings:
    record = db.get(SiteSettings, 1)
    if record is None:
        record = SiteSettings(id=1)
        db.add(record)
        db.commit()
        db.refresh(record)
    return record


@router.get("/profile", response_model=ProfileOut)
def read_profile(db: Session = Depends(get_db)):
    return get_or_create_profile(db)


@router.patch("/profile", response_model=ProfileOut)
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db)
    data = payload.model_dump(exclude_unset=True)

    stats = data.pop("stats", None)
    expertise = data.pop("expertise", None)
    for key, value in data.items():
        setattr(profile, key, value)

    if stats is not None:
        profile.stats.clear()
        db.flush()
        for index, item in enumerate(stats):
            profile.stats.append(
                ProfileStat(
                    label=item["label"],
                    value=item["value"],
                    display_order=item.get("display_order") or index,
                )
            )

    if expertise is not None:
        profile.expertise.clear()
        db.flush()
        for index, item in enumerate(expertise):
            profile.expertise.append(
                ExpertiseArea(
                    title=item["title"],
                    description=item.get("description"),
                    display_order=item.get("display_order") or index,
                )
            )

    db.commit()
    db.refresh(profile)
    return profile


@router.get("/site", response_model=SiteSettingsOut)
def read_settings(db: Session = Depends(get_db)):
    return get_or_create_settings(db)


@router.patch("/site", response_model=SiteSettingsOut)
def update_settings(payload: SiteSettingsUpdate, db: Session = Depends(get_db)):
    record = get_or_create_settings(db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return record
