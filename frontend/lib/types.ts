/** Mirrors the FastAPI response schemas in backend/app/schemas.py. */

export interface Media {
  id: number;
  file_name: string;
  public_url: string;
  webp_url: string | null;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  category: string;
  created_at: string;
}

export interface ProfileStat { id: number; label: string; value: string; display_order: number }
export interface ExpertiseArea {
  id: number; title: string; description: string | null; display_order: number;
}

export interface Profile {
  id: number;
  name: string;
  headline: string;
  hero_description: string | null;
  bio: string | null;
  about_heading: string | null;
  location: string | null;
  profile_image: Media | null;
  about_image: Media | null;
  primary_cta_label: string;
  primary_cta_url: string;
  secondary_cta_label: string;
  secondary_cta_url: string;
  stats: ProfileStat[];
  expertise: ExpertiseArea[];
}

export interface SiteSettings {
  id: number;
  site_title: string;
  site_description: string | null;
  site_url: string | null;
  default_keywords: string | null;
  default_social_image: Media | null;
  resume_url: string | null;
  resume_type: string;
  resume_label: string;
  public_email: string | null;
  contact_heading: string | null;
  contact_intro: string | null;
  theme_default: string;
  homepage_config: string | null;
}

export interface SocialLink {
  id: number; platform: string; label: string; url: string;
  icon_url: string | null; display_order: number; published: boolean;
}

export interface Achievement { id: number; content: string; display_order: number }

export interface Experience {
  id: number;
  title: string;
  organization: string;
  organization_logo: Media | null;
  organization_url: string | null;
  employment_type: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean;
  description: string | null;
  technologies: string | null;
  display_order: number;
  published: boolean;
  achievements: Achievement[];
}

export interface Education {
  id: number;
  institution: string;
  institution_logo: Media | null;
  degree: string;
  field_of_study: string | null;
  start_date: string | null;
  graduation_date: string | null;
  description: string | null;
  verification_url: string | null;
  display_order: number;
  published: boolean;
}

export interface SkillCategory { id: number; name: string; slug: string; display_order: number }

export interface Skill {
  id: number;
  name: string;
  icon_url: string | null;
  icon_media: Media | null;
  category: SkillCategory | null;
  official_url: string | null;
  display_order: number;
  active: boolean;
}

export interface ProjectSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: Media | null;
  technologies: string | null;
  category: string | null;
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
  status: string;
  completion_date: string | null;
  display_order: number;
}

export interface ProjectGalleryItem { id: number; display_order: number; media: Media }

export interface Project extends ProjectSummary {
  content: string | null;
  problem: string | null;
  solution: string | null;
  dataset: string | null;
  methodology: string | null;
  models_used: string | null;
  results: string | null;
  gallery: ProjectGalleryItem[];
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: number; name: string; slug: string;
  description: string | null; accent: string | null; display_order: number;
}

export interface BlogTag { id: number; name: string; slug: string }

export interface PostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: Media | null;
  category: BlogCategory | null;
  tags: BlogTag[];
  status: string;
  featured: boolean;
  reading_minutes: number;
  published_at: string | null;
  updated_at: string;
}

export interface Post extends PostSummary {
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
  social_image: Media | null;
  author: { id: number; name: string; email: string; role: string } | null;
  created_at: string;
}

export interface Certification {
  id: number;
  name: string;
  issuer: string;
  issuer_logo: Media | null;
  certificate_image: Media | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  verification_url: string | null;
  description: string | null;
  featured: boolean;
  display_order: number;
  published: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  title: string | null;
  organization: string | null;
  profile_image: Media | null;
  content: string;
  linkedin_url: string | null;
  display_order: number;
  published: boolean;
}

export interface ContactMessage {
  id: number; name: string; email: string; subject: string | null;
  message: string; read: boolean; archived: boolean; created_at: string;
}

export interface Paginated<T> {
  items: T[]; total: number; page: number; per_page: number; pages: number;
}

export interface DashboardStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_projects: number;
  published_projects: number;
  total_certifications: number;
  total_testimonials: number;
  total_media: number;
  unread_messages: number;
  recent_posts: PostSummary[];
  recent_messages: ContactMessage[];
}

export interface HomePayload {
  profile: Profile | null;
  settings: SiteSettings | null;
  social_links: SocialLink[];
  skills: Skill[];
  skill_categories: SkillCategory[];
  featured_projects: ProjectSummary[];
  featured_posts: PostSummary[];
  featured_certifications: Certification[];
  testimonials: Testimonial[];
  experience: Experience[];
  education: Education[];
}
