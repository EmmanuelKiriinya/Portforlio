"""Public, unauthenticated read API + the contact form endpoint.

Only published content is ever returned here. Draft posts and projects are
invisible to this router regardless of how they are requested.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    BlogCategory,
    BlogPost,
    BlogTag,
    Certification,
    ContactMessage,
    Education,
    Experience,
    Profile,
    Project,
    SiteSettings,
    Skill,
    SkillCategory,
    SocialLink,
    Testimonial,
)
from app.schemas import (
    BlogCategoryOut,
    BlogPostOut,
    BlogPostSummaryOut,
    BlogTagOut,
    CertificationOut,
    ContactMessageIn,
    EducationOut,
    ExperienceOut,
    HomePayload,
    PaginatedPosts,
    PaginatedProjects,
    ProfileOut,
    ProjectOut,
    ProjectSummaryOut,
    SiteSettingsOut,
    SkillCategoryOut,
    SkillOut,
    SocialLinkOut,
    TestimonialOut,
)

router = APIRouter()

PUBLISHED_POST = (BlogPost.status == "published", BlogPost.deleted_at.is_(None))
PUBLISHED_PROJECT = (Project.status == "published",)


# --------------------------------------------------------------------------
# Aggregate
# --------------------------------------------------------------------------
@router.get("/home", response_model=HomePayload)
def home(db: Session = Depends(get_db)):
    """One request for the whole homepage — avoids a waterfall of round trips."""
    featured_projects = (
        db.scalars(
            select(Project)
            .where(*PUBLISHED_PROJECT, Project.featured.is_(True))
            .order_by(Project.display_order, Project.completion_date.desc())
            .limit(6)
        )
        .unique()
        .all()
    )
    # Fall back to the most recent work so the homepage is never empty just
    # because nothing has been marked featured yet.
    if not featured_projects:
        featured_projects = (
            db.scalars(
                select(Project)
                .where(*PUBLISHED_PROJECT)
                .order_by(Project.display_order, Project.completion_date.desc())
                .limit(3)
            )
            .unique()
            .all()
        )

    featured_posts = (
        db.scalars(
            select(BlogPost)
            .where(*PUBLISHED_POST, BlogPost.featured.is_(True))
            .order_by(BlogPost.published_at.desc())
            .limit(3)
        )
        .unique()
        .all()
    )
    if not featured_posts:
        featured_posts = (
            db.scalars(
                select(BlogPost)
                .where(*PUBLISHED_POST)
                .order_by(BlogPost.published_at.desc())
                .limit(3)
            )
            .unique()
            .all()
        )

    return HomePayload(
        profile=db.get(Profile, 1),
        settings=db.get(SiteSettings, 1),
        social_links=db.scalars(
            select(SocialLink)
            .where(SocialLink.published.is_(True))
            .order_by(SocialLink.display_order)
        ).all(),
        skills=db.scalars(
            select(Skill).where(Skill.active.is_(True)).order_by(Skill.display_order, Skill.name)
        )
        .unique()
        .all(),
        skill_categories=db.scalars(
            select(SkillCategory).order_by(SkillCategory.display_order)
        ).all(),
        featured_projects=featured_projects,
        featured_posts=featured_posts,
        featured_certifications=db.scalars(
            select(Certification)
            .where(Certification.published.is_(True), Certification.featured.is_(True))
            .order_by(Certification.display_order, Certification.issue_date.desc())
            .limit(6)
        )
        .unique()
        .all(),
        testimonials=db.scalars(
            select(Testimonial)
            .where(Testimonial.published.is_(True))
            .order_by(Testimonial.display_order)
        )
        .unique()
        .all(),
        experience=db.scalars(
            select(Experience)
            .where(Experience.published.is_(True))
            .order_by(Experience.display_order, Experience.start_date.desc())
        )
        .unique()
        .all(),
        education=db.scalars(
            select(Education)
            .where(Education.published.is_(True))
            .order_by(Education.display_order, Education.graduation_date.desc())
        )
        .unique()
        .all(),
    )


@router.get("/profile", response_model=ProfileOut)
def public_profile(db: Session = Depends(get_db)):
    profile = db.get(Profile, 1)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile has not been set up yet.")
    return profile


@router.get("/settings", response_model=SiteSettingsOut)
def public_settings(db: Session = Depends(get_db)):
    record = db.get(SiteSettings, 1)
    if record is None:
        raise HTTPException(status_code=404, detail="Site settings have not been set up yet.")
    return record


@router.get("/social-links", response_model=list[SocialLinkOut])
def public_social_links(db: Session = Depends(get_db)):
    return db.scalars(
        select(SocialLink).where(SocialLink.published.is_(True)).order_by(SocialLink.display_order)
    ).all()


# --------------------------------------------------------------------------
# CV content
# --------------------------------------------------------------------------
@router.get("/experience", response_model=list[ExperienceOut])
def public_experience(db: Session = Depends(get_db)):
    return (
        db.scalars(
            select(Experience)
            .where(Experience.published.is_(True))
            .order_by(Experience.display_order, Experience.start_date.desc())
        )
        .unique()
        .all()
    )


@router.get("/education", response_model=list[EducationOut])
def public_education(db: Session = Depends(get_db)):
    return (
        db.scalars(
            select(Education)
            .where(Education.published.is_(True))
            .order_by(Education.display_order, Education.graduation_date.desc())
        )
        .unique()
        .all()
    )


@router.get("/skills", response_model=list[SkillOut])
def public_skills(db: Session = Depends(get_db), category: str | None = None):
    stmt = select(Skill).where(Skill.active.is_(True))
    if category:
        stmt = stmt.join(SkillCategory).where(SkillCategory.slug == category)
    return db.scalars(stmt.order_by(Skill.display_order, Skill.name)).unique().all()


@router.get("/skill-categories", response_model=list[SkillCategoryOut])
def public_skill_categories(db: Session = Depends(get_db)):
    return db.scalars(select(SkillCategory).order_by(SkillCategory.display_order)).all()


@router.get("/certifications", response_model=list[CertificationOut])
def public_certifications(db: Session = Depends(get_db)):
    return (
        db.scalars(
            select(Certification)
            .where(Certification.published.is_(True))
            .order_by(Certification.display_order, Certification.issue_date.desc())
        )
        .unique()
        .all()
    )


@router.get("/testimonials", response_model=list[TestimonialOut])
def public_testimonials(db: Session = Depends(get_db)):
    return (
        db.scalars(
            select(Testimonial)
            .where(Testimonial.published.is_(True))
            .order_by(Testimonial.display_order)
        )
        .unique()
        .all()
    )


# --------------------------------------------------------------------------
# Projects
# --------------------------------------------------------------------------
@router.get("/projects", response_model=PaginatedProjects)
def public_projects(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    category: str | None = None,
    q: str | None = None,
    featured: bool | None = None,
):
    stmt = select(Project).where(*PUBLISHED_PROJECT)
    if category:
        stmt = stmt.where(Project.category == category)
    if featured is not None:
        stmt = stmt.where(Project.featured.is_(featured))
    if q:
        pattern = f"%{q.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Project.title).like(pattern),
                func.lower(Project.excerpt).like(pattern),
                func.lower(Project.technologies).like(pattern),
                func.lower(Project.category).like(pattern),
            )
        )

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = (
        db.scalars(
            stmt.order_by(Project.display_order, Project.completion_date.desc())
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


@router.get("/projects/categories", response_model=list[str])
def public_project_categories(db: Session = Depends(get_db)):
    rows = db.scalars(
        select(Project.category)
        .where(*PUBLISHED_PROJECT, Project.category.is_not(None))
        .distinct()
        .order_by(Project.category)
    ).all()
    return [row for row in rows if row]


@router.get("/projects/{slug}", response_model=ProjectOut)
def public_project(slug: str, db: Session = Depends(get_db)):
    project = db.scalar(select(Project).where(Project.slug == slug, *PUBLISHED_PROJECT))
    if project is None:
        raise HTTPException(status_code=404, detail="That project could not be found.")
    return project


@router.get("/projects/{slug}/related", response_model=list[ProjectSummaryOut])
def related_projects(slug: str, db: Session = Depends(get_db), limit: int = Query(3, ge=1, le=6)):
    project = db.scalar(select(Project).where(Project.slug == slug, *PUBLISHED_PROJECT))
    if project is None:
        raise HTTPException(status_code=404, detail="That project could not be found.")

    stmt = select(Project).where(*PUBLISHED_PROJECT, Project.id != project.id)
    if project.category:
        stmt = stmt.where(Project.category == project.category)
    results = db.scalars(stmt.order_by(Project.display_order).limit(limit)).unique().all()

    if len(results) < limit:
        # Top up with any other published work rather than showing a short row.
        seen = {p.id for p in results} | {project.id}
        extra = (
            db.scalars(
                select(Project)
                .where(*PUBLISHED_PROJECT, Project.id.not_in(seen))
                .order_by(Project.display_order)
                .limit(limit - len(results))
            )
            .unique()
            .all()
        )
        results = list(results) + list(extra)
    return results


# --------------------------------------------------------------------------
# Blog
# --------------------------------------------------------------------------
@router.get("/blog", response_model=PaginatedPosts)
def public_posts(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(9, ge=1, le=50),
    category: str | None = None,
    tag: str | None = None,
    q: str | None = None,
    featured: bool | None = None,
):
    stmt = select(BlogPost).where(*PUBLISHED_POST)
    if category:
        stmt = stmt.join(BlogCategory).where(BlogCategory.slug == category)
    if tag:
        stmt = stmt.join(BlogPost.tags).where(BlogTag.slug == tag)
    if featured is not None:
        stmt = stmt.where(BlogPost.featured.is_(featured))
    if q:
        pattern = f"%{q.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(BlogPost.title).like(pattern),
                func.lower(BlogPost.excerpt).like(pattern),
                func.lower(BlogPost.content).like(pattern),
            )
        )

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = (
        db.scalars(
            stmt.order_by(BlogPost.published_at.desc())
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


@router.get("/blog/categories", response_model=list[BlogCategoryOut])
def public_blog_categories(db: Session = Depends(get_db)):
    return db.scalars(
        select(BlogCategory).order_by(BlogCategory.display_order, BlogCategory.name)
    ).all()


@router.get("/blog/tags", response_model=list[BlogTagOut])
def public_blog_tags(db: Session = Depends(get_db)):
    return db.scalars(select(BlogTag).order_by(BlogTag.name)).all()


@router.get("/blog/{slug}", response_model=BlogPostOut)
def public_post(slug: str, db: Session = Depends(get_db)):
    post = db.scalar(select(BlogPost).where(BlogPost.slug == slug, *PUBLISHED_POST))
    if post is None:
        raise HTTPException(status_code=404, detail="That article could not be found.")
    return post


@router.get("/blog/{slug}/related", response_model=list[BlogPostSummaryOut])
def related_posts(slug: str, db: Session = Depends(get_db), limit: int = Query(3, ge=1, le=6)):
    post = db.scalar(select(BlogPost).where(BlogPost.slug == slug, *PUBLISHED_POST))
    if post is None:
        raise HTTPException(status_code=404, detail="That article could not be found.")

    stmt = select(BlogPost).where(*PUBLISHED_POST, BlogPost.id != post.id)
    if post.category_id:
        stmt = stmt.where(BlogPost.category_id == post.category_id)
    results = (
        db.scalars(stmt.order_by(BlogPost.published_at.desc()).limit(limit)).unique().all()
    )

    if len(results) < limit:
        seen = {p.id for p in results} | {post.id}
        extra = (
            db.scalars(
                select(BlogPost)
                .where(*PUBLISHED_POST, BlogPost.id.not_in(seen))
                .order_by(BlogPost.published_at.desc())
                .limit(limit - len(results))
            )
            .unique()
            .all()
        )
        results = list(results) + list(extra)
    return results


# --------------------------------------------------------------------------
# Search across posts and projects (§25)
# --------------------------------------------------------------------------
@router.get("/search")
def search(q: str = Query(min_length=2), db: Session = Depends(get_db), limit: int = 10):
    pattern = f"%{q.lower()}%"

    posts = (
        db.scalars(
            select(BlogPost)
            .where(
                *PUBLISHED_POST,
                or_(
                    func.lower(BlogPost.title).like(pattern),
                    func.lower(BlogPost.excerpt).like(pattern),
                ),
            )
            .order_by(BlogPost.published_at.desc())
            .limit(limit)
        )
        .unique()
        .all()
    )
    projects = (
        db.scalars(
            select(Project)
            .where(
                *PUBLISHED_PROJECT,
                or_(
                    func.lower(Project.title).like(pattern),
                    func.lower(Project.excerpt).like(pattern),
                    func.lower(Project.technologies).like(pattern),
                ),
            )
            .order_by(Project.display_order)
            .limit(limit)
        )
        .unique()
        .all()
    )

    return {
        "query": q,
        "posts": [BlogPostSummaryOut.model_validate(p).model_dump(mode="json") for p in posts],
        "projects": [
            ProjectSummaryOut.model_validate(p).model_dump(mode="json") for p in projects
        ],
        "total": len(posts) + len(projects),
    }


# --------------------------------------------------------------------------
# Contact
# --------------------------------------------------------------------------
@router.post("/contact", status_code=status.HTTP_201_CREATED)
def submit_contact(payload: ContactMessageIn, request: Request, db: Session = Depends(get_db)):
    # Honeypot: silently accept so bots don't learn they were caught.
    if payload.website:
        return {"detail": "Thanks — your message has been sent."}

    duplicate = db.scalar(
        select(ContactMessage).where(
            ContactMessage.email == payload.email,
            ContactMessage.message == payload.message,
        )
    )
    if duplicate is not None:
        return {"detail": "Thanks — your message has already been received."}

    db.add(
        ContactMessage(
            name=payload.name.strip(),
            email=payload.email.lower(),
            subject=(payload.subject or "").strip() or None,
            message=payload.message.strip(),
            ip_address=request.client.host if request.client else None,
        )
    )
    db.commit()
    return {"detail": "Thanks — your message has been sent."}
