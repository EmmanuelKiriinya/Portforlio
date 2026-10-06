"""Admin CRUD for the entities that follow the standard shape."""

from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.api.crud import build_crud_router
from app import models as m
from app import schemas as s

router = APIRouter()


# --- hooks ----------------------------------------------------------------
def _sync_achievements(db: Session, obj: m.Experience, payload) -> None:
    """Replace the achievement list wholesale when the admin sends one."""
    incoming = getattr(payload, "achievements", None)
    if incoming is None:
        return
    obj.achievements.clear()
    db.flush()
    for index, item in enumerate(incoming):
        obj.achievements.append(
            m.ExperienceAchievement(
                content=item.content,
                display_order=item.display_order or index,
            )
        )


def _ensure_slug(model):
    def hook(db: Session, obj, payload) -> None:
        from app.core.slugs import unique_slug

        requested = getattr(payload, "slug", None)
        if requested:
            obj.slug = unique_slug(db, model, requested, current_id=obj.id)
        elif not obj.slug:
            source = getattr(obj, "name", None) or getattr(obj, "title", "")
            obj.slug = unique_slug(db, model, source, current_id=obj.id)

    return hook


# --- routers --------------------------------------------------------------
router.include_router(
    build_crud_router(
        model=m.Experience,
        create_schema=s.ExperienceCreate,
        update_schema=s.ExperienceUpdate,
        out_schema=s.ExperienceOut,
        entity_name="experience entry",
        order_by=(m.Experience.display_order, m.Experience.start_date.desc()),
        on_create=_sync_achievements,
        on_update=_sync_achievements,
    ),
    prefix="/experience",
    tags=["admin: experience"],
)

router.include_router(
    build_crud_router(
        model=m.Education,
        create_schema=s.EducationCreate,
        update_schema=s.EducationUpdate,
        out_schema=s.EducationOut,
        entity_name="education entry",
        order_by=(m.Education.display_order, m.Education.graduation_date.desc()),
    ),
    prefix="/education",
    tags=["admin: education"],
)

router.include_router(
    build_crud_router(
        model=m.SkillCategory,
        create_schema=s.SkillCategoryIn,
        update_schema=s.SkillCategoryUpdate,
        out_schema=s.SkillCategoryOut,
        entity_name="skill category",
        order_by=(m.SkillCategory.display_order, m.SkillCategory.name),
        on_create=_ensure_slug(m.SkillCategory),
        on_update=_ensure_slug(m.SkillCategory),
    ),
    prefix="/skill-categories",
    tags=["admin: skills"],
)

router.include_router(
    build_crud_router(
        model=m.Skill,
        create_schema=s.SkillIn,
        update_schema=s.SkillUpdate,
        out_schema=s.SkillOut,
        entity_name="skill",
        order_by=(m.Skill.display_order, m.Skill.name),
    ),
    prefix="/skills",
    tags=["admin: skills"],
)

router.include_router(
    build_crud_router(
        model=m.Certification,
        create_schema=s.CertificationCreate,
        update_schema=s.CertificationUpdate,
        out_schema=s.CertificationOut,
        entity_name="certification",
        order_by=(m.Certification.display_order, m.Certification.issue_date.desc()),
    ),
    prefix="/certifications",
    tags=["admin: certifications"],
)

router.include_router(
    build_crud_router(
        model=m.Testimonial,
        create_schema=s.TestimonialCreate,
        update_schema=s.TestimonialUpdate,
        out_schema=s.TestimonialOut,
        entity_name="testimonial",
        order_by=(m.Testimonial.display_order, m.Testimonial.id),
    ),
    prefix="/testimonials",
    tags=["admin: testimonials"],
)

router.include_router(
    build_crud_router(
        model=m.SocialLink,
        create_schema=s.SocialLinkIn,
        update_schema=s.SocialLinkUpdate,
        out_schema=s.SocialLinkOut,
        entity_name="social link",
        order_by=(m.SocialLink.display_order, m.SocialLink.id),
    ),
    prefix="/social-links",
    tags=["admin: settings"],
)

router.include_router(
    build_crud_router(
        model=m.BlogCategory,
        create_schema=s.BlogCategoryIn,
        update_schema=s.BlogCategoryUpdate,
        out_schema=s.BlogCategoryOut,
        entity_name="category",
        order_by=(m.BlogCategory.display_order, m.BlogCategory.name),
        on_create=_ensure_slug(m.BlogCategory),
        on_update=_ensure_slug(m.BlogCategory),
    ),
    prefix="/blog-categories",
    tags=["admin: blog"],
)

router.include_router(
    build_crud_router(
        model=m.BlogTag,
        create_schema=s.BlogTagIn,
        update_schema=s.BlogTagIn,
        out_schema=s.BlogTagOut,
        entity_name="tag",
        order_by=(m.BlogTag.name,),
        on_create=_ensure_slug(m.BlogTag),
        on_update=_ensure_slug(m.BlogTag),
    ),
    prefix="/blog-tags",
    tags=["admin: blog"],
)
