"""SQLAlchemy models. One module — the schema is small enough to read at once.

Conventions:
  * Every content table carries `display_order` so the admin can reorder.
  * Publishable content carries `published` (bool) or `status` (enum-like str).
  * Images are never stored as binaries; tables reference `media.id`.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


# --------------------------------------------------------------------------
# Auth
# --------------------------------------------------------------------------
class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    # Single admin today; the column exists so roles can be added without a
    # migration of every authorization call site.
    role: Mapped[str] = mapped_column(String(32), default="admin", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    posts: Mapped[List["BlogPost"]] = relationship(back_populates="author")


# --------------------------------------------------------------------------
# Media
# --------------------------------------------------------------------------
class Media(Base, TimestampMixin):
    __tablename__ = "media"

    id: Mapped[int] = mapped_column(primary_key=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(512), nullable=False)
    public_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    # WebP derivative generated at upload time; falls back to public_url.
    webp_url: Mapped[Optional[str]] = mapped_column(String(1024))
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    width: Mapped[Optional[int]] = mapped_column(Integer)
    height: Mapped[Optional[int]] = mapped_column(Integer)
    alt_text: Mapped[Optional[str]] = mapped_column(String(500))
    caption: Mapped[Optional[str]] = mapped_column(String(500))
    # profile | blog | projects | certifications | testimonials | general | resumes
    category: Mapped[str] = mapped_column(String(50), default="general", index=True)


# --------------------------------------------------------------------------
# Profile & settings (singletons — always row id=1)
# --------------------------------------------------------------------------
class Profile(Base, TimestampMixin):
    __tablename__ = "profile"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    headline: Mapped[str] = mapped_column(String(255), nullable=False)
    hero_description: Mapped[Optional[str]] = mapped_column(Text)
    bio: Mapped[Optional[str]] = mapped_column(Text)
    about_heading: Mapped[Optional[str]] = mapped_column(String(255))
    location: Mapped[Optional[str]] = mapped_column(String(160))
    profile_image_id: Mapped[Optional[int]] = mapped_column(ForeignKey("media.id"))
    about_image_id: Mapped[Optional[int]] = mapped_column(ForeignKey("media.id"))

    primary_cta_label: Mapped[str] = mapped_column(String(80), default="View projects")
    primary_cta_url: Mapped[str] = mapped_column(String(512), default="/projects")
    secondary_cta_label: Mapped[str] = mapped_column(String(80), default="View resume")
    secondary_cta_url: Mapped[str] = mapped_column(String(512), default="/resume")

    profile_image: Mapped[Optional[Media]] = relationship(
        foreign_keys=[profile_image_id], lazy="joined"
    )
    about_image: Mapped[Optional[Media]] = relationship(
        foreign_keys=[about_image_id], lazy="joined"
    )
    stats: Mapped[List["ProfileStat"]] = relationship(
        back_populates="profile",
        cascade="all, delete-orphan",
        order_by="ProfileStat.display_order",
    )
    expertise: Mapped[List["ExpertiseArea"]] = relationship(
        back_populates="profile",
        cascade="all, delete-orphan",
        order_by="ExpertiseArea.display_order",
    )


class ProfileStat(Base):
    """Optional About statistics — years of experience, projects shipped, etc."""

    __tablename__ = "profile_stats"

    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("profile.id", ondelete="CASCADE"), nullable=False
    )
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    value: Mapped[str] = mapped_column(String(40), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    profile: Mapped[Profile] = relationship(back_populates="stats")


class ExpertiseArea(Base):
    __tablename__ = "expertise_areas"

    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("profile.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    profile: Mapped[Profile] = relationship(back_populates="expertise")


class SiteSettings(Base, TimestampMixin):
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(primary_key=True)

    site_title: Mapped[str] = mapped_column(String(160), default="Emmanuel Kiriinya")
    site_description: Mapped[Optional[str]] = mapped_column(Text)
    site_url: Mapped[Optional[str]] = mapped_column(String(512))
    default_keywords: Mapped[Optional[str]] = mapped_column(String(512))
    default_social_image_id: Mapped[Optional[int]] = mapped_column(ForeignKey("media.id"))

    # Resume — never hardcoded in the frontend (§20)
    resume_url: Mapped[Optional[str]] = mapped_column(String(1024))
    resume_type: Mapped[str] = mapped_column(String(32), default="drive")  # drive|pdf|upload
    resume_label: Mapped[str] = mapped_column(String(80), default="Download resume")

    public_email: Mapped[Optional[str]] = mapped_column(String(255))
    contact_heading: Mapped[Optional[str]] = mapped_column(String(255))
    contact_intro: Mapped[Optional[str]] = mapped_column(Text)

    theme_default: Mapped[str] = mapped_column(String(16), default="system")

    # Homepage section visibility & order, stored as JSON-ish text so new
    # sections don't require a migration.
    homepage_config: Mapped[Optional[str]] = mapped_column(Text)

    default_social_image: Mapped[Optional[Media]] = relationship(lazy="joined")


class SocialLink(Base):
    __tablename__ = "social_links"

    id: Mapped[int] = mapped_column(primary_key=True)
    platform: Mapped[str] = mapped_column(String(60), nullable=False)  # linkedin|github|email|x…
    label: Mapped[str] = mapped_column(String(80), nullable=False)
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    icon_url: Mapped[Optional[str]] = mapped_column(String(1024))
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


# --------------------------------------------------------------------------
# Experience & education
# --------------------------------------------------------------------------
class Experience(Base, TimestampMixin):
    __tablename__ = "experience"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    organization: Mapped[str] = mapped_column(String(200), nullable=False)
    organization_logo_id: Mapped[Optional[int]] = mapped_column(ForeignKey("media.id"))
    organization_url: Mapped[Optional[str]] = mapped_column(String(512))
    employment_type: Mapped[Optional[str]] = mapped_column(String(80))
    location: Mapped[Optional[str]] = mapped_column(String(160))
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    technologies: Mapped[Optional[str]] = mapped_column(Text)  # comma-separated
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    organization_logo: Mapped[Optional[Media]] = relationship(lazy="joined")
    achievements: Mapped[List["ExperienceAchievement"]] = relationship(
        back_populates="experience",
        cascade="all, delete-orphan",
        order_by="ExperienceAchievement.display_order",
        lazy="selectin",
    )


class ExperienceAchievement(Base):
    __tablename__ = "experience_achievements"

    id: Mapped[int] = mapped_column(primary_key=True)
    experience_id: Mapped[int] = mapped_column(
        ForeignKey("experience.id", ondelete="CASCADE"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    experience: Mapped[Experience] = relationship(back_populates="achievements")


class Education(Base, TimestampMixin):
    __tablename__ = "education"

    id: Mapped[int] = mapped_column(primary_key=True)
    institution: Mapped[str] = mapped_column(String(200), nullable=False)
    institution_logo_id: Mapped[Optional[int]] = mapped_column(ForeignKey("media.id"))
    degree: Mapped[str] = mapped_column(String(200), nullable=False)
    field_of_study: Mapped[Optional[str]] = mapped_column(String(200))
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    graduation_date: Mapped[Optional[date]] = mapped_column(Date)
    description: Mapped[Optional[str]] = mapped_column(Text)
    verification_url: Mapped[Optional[str]] = mapped_column(String(1024))
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    institution_logo: Mapped[Optional[Media]] = relationship(lazy="joined")


# --------------------------------------------------------------------------
# Skills
# --------------------------------------------------------------------------
class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    skills: Mapped[List["Skill"]] = relationship(
        back_populates="category", order_by="Skill.display_order"
    )


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    # Icons8 CDN URL, or any licensed icon provider
    icon_url: Mapped[Optional[str]] = mapped_column(String(1024))
    icon_media_id: Mapped[Optional[int]] = mapped_column(ForeignKey("media.id"))
    category_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("skill_categories.id", ondelete="SET NULL")
    )
    official_url: Mapped[Optional[str]] = mapped_column(String(1024))
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    category: Mapped[Optional[SkillCategory]] = relationship(back_populates="skills")
    icon_media: Mapped[Optional[Media]] = relationship(lazy="joined")


# --------------------------------------------------------------------------
# Projects
# --------------------------------------------------------------------------
class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(280), unique=True, index=True)
    excerpt: Mapped[Optional[str]] = mapped_column(Text)
    content: Mapped[Optional[str]] = mapped_column(Text)  # rich HTML

    # Structured case-study fields (§14)
    problem: Mapped[Optional[str]] = mapped_column(Text)
    solution: Mapped[Optional[str]] = mapped_column(Text)
    dataset: Mapped[Optional[str]] = mapped_column(Text)
    methodology: Mapped[Optional[str]] = mapped_column(Text)
    models_used: Mapped[Optional[str]] = mapped_column(Text)
    results: Mapped[Optional[str]] = mapped_column(Text)

    cover_image_id: Mapped[Optional[int]] = mapped_column(ForeignKey("media.id"))
    technologies: Mapped[Optional[str]] = mapped_column(Text)  # comma-separated
    category: Mapped[Optional[str]] = mapped_column(String(120), index=True)
    github_url: Mapped[Optional[str]] = mapped_column(String(1024))
    live_url: Mapped[Optional[str]] = mapped_column(String(1024))
    featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="draft", index=True)
    completion_date: Mapped[Optional[date]] = mapped_column(Date)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    cover_image: Mapped[Optional[Media]] = relationship(lazy="joined")
    gallery: Mapped[List["ProjectMedia"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="ProjectMedia.display_order",
        lazy="selectin",
    )


class ProjectMedia(Base):
    __tablename__ = "project_media"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    media_id: Mapped[int] = mapped_column(ForeignKey("media.id", ondelete="CASCADE"))
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    project: Mapped[Project] = relationship(back_populates="gallery")
    media: Mapped[Media] = relationship(lazy="joined")


# --------------------------------------------------------------------------
# Blog
# --------------------------------------------------------------------------
blog_post_tags = Table(
    "blog_post_tags",
    Base.metadata,
    Column("post_id", ForeignKey("blog_posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("blog_tags.id", ondelete="CASCADE"), primary_key=True),
)


class BlogCategory(Base):
    __tablename__ = "blog_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    # Optional accent override so the AI/LLM category can use --plum (§5)
    accent: Mapped[Optional[str]] = mapped_column(String(20))
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    posts: Mapped[List["BlogPost"]] = relationship(back_populates="category")


class BlogTag(Base):
    __tablename__ = "blog_tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    posts: Mapped[List["BlogPost"]] = relationship(
        secondary=blog_post_tags, back_populates="tags"
    )


class BlogPost(Base, TimestampMixin):
    __tablename__ = "blog_posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(280), unique=True, index=True)
    excerpt: Mapped[Optional[str]] = mapped_column(Text)
    content: Mapped[Optional[str]] = mapped_column(Text)  # sanitized rich HTML
    cover_image_id: Mapped[Optional[int]] = mapped_column(ForeignKey("media.id"))
    author_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    category_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("blog_categories.id", ondelete="SET NULL")
    )
    status: Mapped[str] = mapped_column(String(20), default="draft", index=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reading_minutes: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    seo_title: Mapped[Optional[str]] = mapped_column(String(255))
    seo_description: Mapped[Optional[str]] = mapped_column(Text)
    social_image_id: Mapped[Optional[int]] = mapped_column(ForeignKey("media.id"))

    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    # Soft delete (§17) — nothing is destroyed by a single click.
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    cover_image: Mapped[Optional[Media]] = relationship(
        foreign_keys=[cover_image_id], lazy="joined"
    )
    social_image: Mapped[Optional[Media]] = relationship(
        foreign_keys=[social_image_id], lazy="joined"
    )
    category: Mapped[Optional[BlogCategory]] = relationship(
        back_populates="posts", lazy="joined"
    )
    author: Mapped[Optional[User]] = relationship(back_populates="posts", lazy="joined")
    tags: Mapped[List[BlogTag]] = relationship(
        secondary=blog_post_tags, back_populates="posts", lazy="selectin"
    )


# --------------------------------------------------------------------------
# Credentials & social proof
# --------------------------------------------------------------------------
class Certification(Base, TimestampMixin):
    __tablename__ = "certifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    issuer: Mapped[str] = mapped_column(String(200), nullable=False)
    issuer_logo_id: Mapped[Optional[int]] = mapped_column(ForeignKey("media.id"))
    certificate_image_id: Mapped[Optional[int]] = mapped_column(ForeignKey("media.id"))
    issue_date: Mapped[Optional[date]] = mapped_column(Date)
    expiry_date: Mapped[Optional[date]] = mapped_column(Date)
    credential_id: Mapped[Optional[str]] = mapped_column(String(200))
    verification_url: Mapped[Optional[str]] = mapped_column(String(1024))
    description: Mapped[Optional[str]] = mapped_column(Text)
    featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    issuer_logo: Mapped[Optional[Media]] = relationship(
        foreign_keys=[issuer_logo_id], lazy="joined"
    )
    certificate_image: Mapped[Optional[Media]] = relationship(
        foreign_keys=[certificate_image_id], lazy="joined"
    )


class Testimonial(Base, TimestampMixin):
    __tablename__ = "testimonials"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(200))
    organization: Mapped[Optional[str]] = mapped_column(String(200))
    profile_image_id: Mapped[Optional[int]] = mapped_column(ForeignKey("media.id"))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(1024))
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    profile_image: Mapped[Optional[Media]] = relationship(lazy="joined")


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[Optional[str]] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text, nullable=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (UniqueConstraint("email", "message", name="uq_contact_dedupe"),)
