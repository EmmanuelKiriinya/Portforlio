"""Pydantic v2 schemas.

Naming: `XCreate` / `XUpdate` are request bodies, `XOut` is the response.
Update schemas make every field optional so the admin can PATCH one value.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --------------------------------------------------------------------------
# Auth
# --------------------------------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class TokenPair(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserOut(ORMModel):
    id: int
    name: str
    email: EmailStr
    role: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=10, max_length=128)


# --------------------------------------------------------------------------
# Media
# --------------------------------------------------------------------------
class MediaOut(ORMModel):
    id: int
    file_name: str
    public_url: str
    webp_url: Optional[str] = None
    mime_type: str
    size_bytes: int
    width: Optional[int] = None
    height: Optional[int] = None
    alt_text: Optional[str] = None
    caption: Optional[str] = None
    category: str
    created_at: datetime


class MediaUpdate(BaseModel):
    alt_text: Optional[str] = None
    caption: Optional[str] = None
    category: Optional[str] = None


# --------------------------------------------------------------------------
# Profile
# --------------------------------------------------------------------------
class ProfileStatIn(BaseModel):
    label: str
    value: str
    display_order: int = 0


class ProfileStatOut(ORMModel):
    id: int
    label: str
    value: str
    display_order: int


class ExpertiseAreaIn(BaseModel):
    title: str
    description: Optional[str] = None
    display_order: int = 0


class ExpertiseAreaOut(ORMModel):
    id: int
    title: str
    description: Optional[str] = None
    display_order: int


class ProfileOut(ORMModel):
    id: int
    name: str
    headline: str
    hero_description: Optional[str] = None
    bio: Optional[str] = None
    about_heading: Optional[str] = None
    location: Optional[str] = None
    profile_image: Optional[MediaOut] = None
    about_image: Optional[MediaOut] = None
    primary_cta_label: str
    primary_cta_url: str
    secondary_cta_label: str
    secondary_cta_url: str
    stats: List[ProfileStatOut] = []
    expertise: List[ExpertiseAreaOut] = []


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    headline: Optional[str] = None
    hero_description: Optional[str] = None
    bio: Optional[str] = None
    about_heading: Optional[str] = None
    location: Optional[str] = None
    profile_image_id: Optional[int] = None
    about_image_id: Optional[int] = None
    primary_cta_label: Optional[str] = None
    primary_cta_url: Optional[str] = None
    secondary_cta_label: Optional[str] = None
    secondary_cta_url: Optional[str] = None
    stats: Optional[List[ProfileStatIn]] = None
    expertise: Optional[List[ExpertiseAreaIn]] = None


# --------------------------------------------------------------------------
# Site settings & social links
# --------------------------------------------------------------------------
class SiteSettingsOut(ORMModel):
    id: int
    site_title: str
    site_description: Optional[str] = None
    site_url: Optional[str] = None
    default_keywords: Optional[str] = None
    default_social_image: Optional[MediaOut] = None
    resume_url: Optional[str] = None
    resume_type: str
    resume_label: str
    public_email: Optional[str] = None
    contact_heading: Optional[str] = None
    contact_intro: Optional[str] = None
    theme_default: str
    homepage_config: Optional[str] = None


class SiteSettingsUpdate(BaseModel):
    site_title: Optional[str] = None
    site_description: Optional[str] = None
    site_url: Optional[str] = None
    default_keywords: Optional[str] = None
    default_social_image_id: Optional[int] = None
    resume_url: Optional[str] = None
    resume_type: Optional[str] = None
    resume_label: Optional[str] = None
    public_email: Optional[str] = None
    contact_heading: Optional[str] = None
    contact_intro: Optional[str] = None
    theme_default: Optional[str] = None
    homepage_config: Optional[str] = None


class SocialLinkIn(BaseModel):
    platform: str
    label: str
    url: str
    icon_url: Optional[str] = None
    display_order: int = 0
    published: bool = True


class SocialLinkUpdate(BaseModel):
    platform: Optional[str] = None
    label: Optional[str] = None
    url: Optional[str] = None
    icon_url: Optional[str] = None
    display_order: Optional[int] = None
    published: Optional[bool] = None


class SocialLinkOut(ORMModel):
    id: int
    platform: str
    label: str
    url: str
    icon_url: Optional[str] = None
    display_order: int
    published: bool


# --------------------------------------------------------------------------
# Experience
# --------------------------------------------------------------------------
class AchievementIn(BaseModel):
    content: str
    display_order: int = 0


class AchievementOut(ORMModel):
    id: int
    content: str
    display_order: int


class ExperienceBase(BaseModel):
    title: str
    organization: str
    organization_logo_id: Optional[int] = None
    organization_url: Optional[str] = None
    employment_type: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    current: bool = False
    description: Optional[str] = None
    technologies: Optional[str] = None
    display_order: int = 0
    published: bool = True


class ExperienceCreate(ExperienceBase):
    achievements: List[AchievementIn] = []


class ExperienceUpdate(BaseModel):
    title: Optional[str] = None
    organization: Optional[str] = None
    organization_logo_id: Optional[int] = None
    organization_url: Optional[str] = None
    employment_type: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    current: Optional[bool] = None
    description: Optional[str] = None
    technologies: Optional[str] = None
    display_order: Optional[int] = None
    published: Optional[bool] = None
    achievements: Optional[List[AchievementIn]] = None


class ExperienceOut(ORMModel):
    id: int
    title: str
    organization: str
    organization_logo: Optional[MediaOut] = None
    organization_url: Optional[str] = None
    employment_type: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    current: bool
    description: Optional[str] = None
    technologies: Optional[str] = None
    display_order: int
    published: bool
    achievements: List[AchievementOut] = []


# --------------------------------------------------------------------------
# Education
# --------------------------------------------------------------------------
class EducationBase(BaseModel):
    institution: str
    institution_logo_id: Optional[int] = None
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    graduation_date: Optional[date] = None
    description: Optional[str] = None
    verification_url: Optional[str] = None
    display_order: int = 0
    published: bool = True


class EducationCreate(EducationBase):
    pass


class EducationUpdate(BaseModel):
    institution: Optional[str] = None
    institution_logo_id: Optional[int] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    graduation_date: Optional[date] = None
    description: Optional[str] = None
    verification_url: Optional[str] = None
    display_order: Optional[int] = None
    published: Optional[bool] = None


class EducationOut(ORMModel):
    id: int
    institution: str
    institution_logo: Optional[MediaOut] = None
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    graduation_date: Optional[date] = None
    description: Optional[str] = None
    verification_url: Optional[str] = None
    display_order: int
    published: bool


# --------------------------------------------------------------------------
# Skills
# --------------------------------------------------------------------------
class SkillCategoryIn(BaseModel):
    name: str
    slug: Optional[str] = None
    display_order: int = 0


class SkillCategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    display_order: Optional[int] = None


class SkillCategoryOut(ORMModel):
    id: int
    name: str
    slug: str
    display_order: int


class SkillIn(BaseModel):
    name: str
    icon_url: Optional[str] = None
    icon_media_id: Optional[int] = None
    category_id: Optional[int] = None
    official_url: Optional[str] = None
    display_order: int = 0
    active: bool = True


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    icon_url: Optional[str] = None
    icon_media_id: Optional[int] = None
    category_id: Optional[int] = None
    official_url: Optional[str] = None
    display_order: Optional[int] = None
    active: Optional[bool] = None


class SkillOut(ORMModel):
    id: int
    name: str
    icon_url: Optional[str] = None
    icon_media: Optional[MediaOut] = None
    category: Optional[SkillCategoryOut] = None
    official_url: Optional[str] = None
    display_order: int
    active: bool


# --------------------------------------------------------------------------
# Projects
# --------------------------------------------------------------------------
class ProjectBase(BaseModel):
    title: str
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    dataset: Optional[str] = None
    methodology: Optional[str] = None
    models_used: Optional[str] = None
    results: Optional[str] = None
    cover_image_id: Optional[int] = None
    technologies: Optional[str] = None
    category: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    featured: bool = False
    status: str = "draft"
    completion_date: Optional[date] = None
    display_order: int = 0

    @field_validator("live_url", "github_url", mode="before")
    @classmethod
    def _blank_to_none(cls, v):
        """An empty string must become NULL so the frontend hides the button
        rather than rendering a dead link (§13)."""
        if isinstance(v, str) and not v.strip():
            return None
        return v


class ProjectCreate(ProjectBase):
    gallery_media_ids: List[int] = []


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    dataset: Optional[str] = None
    methodology: Optional[str] = None
    models_used: Optional[str] = None
    results: Optional[str] = None
    cover_image_id: Optional[int] = None
    technologies: Optional[str] = None
    category: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    featured: Optional[bool] = None
    status: Optional[str] = None
    completion_date: Optional[date] = None
    display_order: Optional[int] = None
    gallery_media_ids: Optional[List[int]] = None

    @field_validator("live_url", "github_url", mode="before")
    @classmethod
    def _blank_to_none(cls, v):
        if isinstance(v, str) and not v.strip():
            return None
        return v


class ProjectGalleryOut(ORMModel):
    id: int
    display_order: int
    media: MediaOut


class ProjectSummaryOut(ORMModel):
    id: int
    title: str
    slug: str
    excerpt: Optional[str] = None
    cover_image: Optional[MediaOut] = None
    technologies: Optional[str] = None
    category: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    featured: bool
    status: str
    completion_date: Optional[date] = None
    display_order: int


class ProjectOut(ProjectSummaryOut):
    content: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    dataset: Optional[str] = None
    methodology: Optional[str] = None
    models_used: Optional[str] = None
    results: Optional[str] = None
    gallery: List[ProjectGalleryOut] = []
    created_at: datetime
    updated_at: datetime


# --------------------------------------------------------------------------
# Blog
# --------------------------------------------------------------------------
class BlogCategoryIn(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    accent: Optional[str] = None
    display_order: int = 0


class BlogCategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    accent: Optional[str] = None
    display_order: Optional[int] = None


class BlogCategoryOut(ORMModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    accent: Optional[str] = None
    display_order: int


class BlogTagIn(BaseModel):
    name: str
    slug: Optional[str] = None


class BlogTagOut(ORMModel):
    id: int
    name: str
    slug: str


class BlogPostBase(BaseModel):
    title: str
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image_id: Optional[int] = None
    category_id: Optional[int] = None
    status: str = "draft"
    featured: bool = False
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    social_image_id: Optional[int] = None
    published_at: Optional[datetime] = None


class BlogPostCreate(BlogPostBase):
    tag_ids: List[int] = []
    tag_names: List[str] = []


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image_id: Optional[int] = None
    category_id: Optional[int] = None
    status: Optional[str] = None
    featured: Optional[bool] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    social_image_id: Optional[int] = None
    published_at: Optional[datetime] = None
    tag_ids: Optional[List[int]] = None
    tag_names: Optional[List[str]] = None


class BlogPostSummaryOut(ORMModel):
    id: int
    title: str
    slug: str
    excerpt: Optional[str] = None
    cover_image: Optional[MediaOut] = None
    category: Optional[BlogCategoryOut] = None
    tags: List[BlogTagOut] = []
    status: str
    featured: bool
    reading_minutes: int
    published_at: Optional[datetime] = None
    updated_at: datetime


class BlogPostOut(BlogPostSummaryOut):
    content: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    social_image: Optional[MediaOut] = None
    author: Optional[UserOut] = None
    created_at: datetime


# --------------------------------------------------------------------------
# Certifications & testimonials
# --------------------------------------------------------------------------
class CertificationBase(BaseModel):
    name: str
    issuer: str
    issuer_logo_id: Optional[int] = None
    certificate_image_id: Optional[int] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_id: Optional[str] = None
    verification_url: Optional[str] = None
    description: Optional[str] = None
    featured: bool = False
    display_order: int = 0
    published: bool = True


class CertificationCreate(CertificationBase):
    pass


class CertificationUpdate(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    issuer_logo_id: Optional[int] = None
    certificate_image_id: Optional[int] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_id: Optional[str] = None
    verification_url: Optional[str] = None
    description: Optional[str] = None
    featured: Optional[bool] = None
    display_order: Optional[int] = None
    published: Optional[bool] = None


class CertificationOut(ORMModel):
    id: int
    name: str
    issuer: str
    issuer_logo: Optional[MediaOut] = None
    certificate_image: Optional[MediaOut] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_id: Optional[str] = None
    verification_url: Optional[str] = None
    description: Optional[str] = None
    featured: bool
    display_order: int
    published: bool


class TestimonialBase(BaseModel):
    name: str
    title: Optional[str] = None
    organization: Optional[str] = None
    profile_image_id: Optional[int] = None
    content: str
    linkedin_url: Optional[str] = None
    display_order: int = 0
    published: bool = True


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    organization: Optional[str] = None
    profile_image_id: Optional[int] = None
    content: Optional[str] = None
    linkedin_url: Optional[str] = None
    display_order: Optional[int] = None
    published: Optional[bool] = None


class TestimonialOut(ORMModel):
    id: int
    name: str
    title: Optional[str] = None
    organization: Optional[str] = None
    profile_image: Optional[MediaOut] = None
    content: str
    linkedin_url: Optional[str] = None
    display_order: int
    published: bool


# --------------------------------------------------------------------------
# Contact
# --------------------------------------------------------------------------
class ContactMessageIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    subject: Optional[str] = Field(default=None, max_length=255)
    message: str = Field(min_length=10, max_length=5000)
    # Honeypot: real users never fill this; bots do. (§22 spam protection)
    website: Optional[str] = None


class ContactMessageOut(ORMModel):
    id: int
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str
    read: bool
    archived: bool
    created_at: datetime


# --------------------------------------------------------------------------
# Aggregates
# --------------------------------------------------------------------------
class PaginatedPosts(BaseModel):
    items: List[BlogPostSummaryOut]
    total: int
    page: int
    per_page: int
    pages: int


class PaginatedProjects(BaseModel):
    items: List[ProjectSummaryOut]
    total: int
    page: int
    per_page: int
    pages: int


class DashboardStats(BaseModel):
    total_posts: int
    published_posts: int
    draft_posts: int
    total_projects: int
    published_projects: int
    total_certifications: int
    total_testimonials: int
    total_media: int
    unread_messages: int
    recent_posts: List[BlogPostSummaryOut]
    recent_messages: List[ContactMessageOut]


class HomePayload(BaseModel):
    """Everything the homepage needs, in one request."""

    profile: Optional[ProfileOut] = None
    settings: Optional[SiteSettingsOut] = None
    social_links: List[SocialLinkOut] = []
    skills: List[SkillOut] = []
    skill_categories: List[SkillCategoryOut] = []
    featured_projects: List[ProjectSummaryOut] = []
    featured_posts: List[BlogPostSummaryOut] = []
    featured_certifications: List[CertificationOut] = []
    testimonials: List[TestimonialOut] = []
    experience: List[ExperienceOut] = []
    education: List[EducationOut] = []
