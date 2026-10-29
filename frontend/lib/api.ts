import type {
  Certification, DashboardStats, Education, Experience, HomePayload,
  Paginated, Post, PostSummary, Profile, Project, ProjectSummary,
  SiteSettings, Skill, SkillCategory, SocialLink, Testimonial, BlogCategory, BlogTag,
} from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Public pages revalidate rather than rendering per request. */
const PUBLIC_REVALIDATE = 300;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
    // FastAPI validation errors arrive as a list of field problems.
    if (Array.isArray(body?.detail) && body.detail.length > 0) {
      const first = body.detail[0];
      const field = Array.isArray(first?.loc) ? first.loc.at(-1) : null;
      return field ? `${field}: ${first.msg}` : first.msg ?? fallback;
    }
  } catch {
    /* non-JSON error body */
  }
  return fallback;
}

/**
 * Public GET. Returns null when the content simply is not there, so a page can
 * render its empty state instead of crashing — a portfolio whose API is
 * briefly unavailable should degrade, not 500.
 */
async function publicGet<T>(path: string, revalidate = PUBLIC_REVALIDATE): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Same as publicGet but surfaces a 404 distinctly so pages can call notFound(). */
export async function publicGetStrict<T>(path: string, revalidate = PUBLIC_REVALIDATE): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new ApiError(res.status, await readError(res, "That content could not be loaded."));
  }
  return (await res.json()) as T;
}

function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

/* ---------------------------------------------------------------- public */

export const api = {
  home: () => publicGet<HomePayload>("/home"),
  profile: () => publicGet<Profile>("/profile"),
  settings: () => publicGet<SiteSettings>("/settings"),
  socialLinks: () => publicGet<SocialLink[]>("/social-links"),
  experience: () => publicGet<Experience[]>("/experience"),
  education: () => publicGet<Education[]>("/education"),
  skills: () => publicGet<Skill[]>("/skills"),
  skillCategories: () => publicGet<SkillCategory[]>("/skill-categories"),
  certifications: () => publicGet<Certification[]>("/certifications"),
  testimonials: () => publicGet<Testimonial[]>("/testimonials"),

  projects: (params: {
    page?: number; per_page?: number; category?: string; q?: string; featured?: boolean;
  } = {}) => publicGet<Paginated<ProjectSummary>>(`/projects${qs(params)}`),
  projectCategories: () => publicGet<string[]>("/projects/categories"),
  project: (slug: string) => publicGetStrict<Project>(`/projects/${slug}`),
  relatedProjects: (slug: string) =>
    publicGet<ProjectSummary[]>(`/projects/${slug}/related`),

  posts: (params: {
    page?: number; per_page?: number; category?: string; tag?: string;
    q?: string; featured?: boolean;
  } = {}) => publicGet<Paginated<PostSummary>>(`/blog${qs(params)}`),
  blogCategories: () => publicGet<BlogCategory[]>("/blog/categories"),
  blogTags: () => publicGet<BlogTag[]>("/blog/tags"),
  post: (slug: string) => publicGetStrict<Post>(`/blog/${slug}`),
  relatedPosts: (slug: string) => publicGet<PostSummary[]>(`/blog/${slug}/related`),

  search: (q: string) =>
    publicGet<{ query: string; posts: PostSummary[]; projects: ProjectSummary[]; total: number }>(
      `/search${qs({ q })}`,
      0,
    ),
};

/* ----------------------------------------------------------------- admin */

/** Auth endpoints that must never trigger a refresh-and-retry themselves. */
const NO_REFRESH = new Set(["/auth/login", "/auth/refresh", "/auth/logout"]);

let refreshing: Promise<boolean> | null = null;

/**
 * Trade the refresh cookie for a new access cookie. The access token lives an
 * hour and the refresh token two weeks, so without this every admin request
 * starts failing an hour after sign-in. Concurrent 401s share one attempt.
 */
function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => { refreshing = null; });
  return refreshing;
}

/** Send once; on a 401, refresh the session and send again. */
async function withRefresh(path: string, send: () => Promise<Response>): Promise<Response> {
  const res = await send();
  if (res.status !== 401 || NO_REFRESH.has(path)) return res;
  return (await refreshSession()) ? send() : res;
}

/**
 * Authenticated request from the browser. Credentials are the HTTP-only
 * cookies set by /auth/login, so no token is ever stored in JS.
 */
export async function adminFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (json !== undefined) headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  const res = await withRefresh(path, () =>
    fetch(`${API_URL}${path}`, {
      ...rest,
      headers,
      credentials: "include",
      cache: "no-store",
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    }),
  );

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    throw new ApiError(
      res.status,
      await readError(res, "That request failed. Check your connection and try again."),
    );
  }
  return (await res.json()) as T;
}

export const adminApi = {
  login: (email: string, password: string) =>
    adminFetch<{ access_token: string }>("/auth/login", {
      method: "POST",
      json: { email, password },
    }),
  logout: () => adminFetch<void>("/auth/logout", { method: "POST" }),
  me: () => adminFetch<{ id: number; name: string; email: string; role: string }>("/auth/me"),
  changePassword: (current_password: string, new_password: string) =>
    adminFetch<void>("/auth/change-password", {
      method: "POST",
      json: { current_password, new_password },
    }),

  stats: () => adminFetch<DashboardStats>("/admin/stats"),

  messages: (archived = false) =>
    adminFetch<import("./types").ContactMessage[]>(`/admin/messages${qs({ archived })}`),
  markMessageRead: (id: number) =>
    adminFetch<void>(`/admin/messages/${id}/read`, { method: "POST" }),
  archiveMessage: (id: number) =>
    adminFetch<void>(`/admin/messages/${id}/archive`, { method: "POST" }),
  deleteMessage: (id: number) =>
    adminFetch<void>(`/admin/messages/${id}`, { method: "DELETE" }),

  // Posts
  listPosts: (params: { page?: number; status?: string; q?: string } = {}) =>
    adminFetch<Paginated<PostSummary>>(`/admin/posts${qs(params)}`),
  getPost: (id: number) => adminFetch<Post>(`/admin/posts/${id}`),
  createPost: (body: unknown) =>
    adminFetch<Post>("/admin/posts", { method: "POST", json: body }),
  updatePost: (id: number, body: unknown) =>
    adminFetch<Post>(`/admin/posts/${id}`, { method: "PATCH", json: body }),
  publishPost: (id: number) => adminFetch<Post>(`/admin/posts/${id}/publish`, { method: "POST" }),
  unpublishPost: (id: number) =>
    adminFetch<Post>(`/admin/posts/${id}/unpublish`, { method: "POST" }),
  deletePost: (id: number) => adminFetch<void>(`/admin/posts/${id}`, { method: "DELETE" }),
  trashedPosts: () => adminFetch<PostSummary[]>("/admin/posts/trash/list"),
  restorePost: (id: number) => adminFetch<Post>(`/admin/posts/${id}/restore`, { method: "POST" }),

  // Projects
  listProjects: (params: { page?: number; status?: string; q?: string } = {}) =>
    adminFetch<Paginated<ProjectSummary>>(`/admin/projects${qs(params)}`),
  getProject: (id: number) => adminFetch<Project>(`/admin/projects/${id}`),
  createProject: (body: unknown) =>
    adminFetch<Project>("/admin/projects", { method: "POST", json: body }),
  updateProject: (id: number, body: unknown) =>
    adminFetch<Project>(`/admin/projects/${id}`, { method: "PATCH", json: body }),
  deleteProject: (id: number) => adminFetch<void>(`/admin/projects/${id}`, { method: "DELETE" }),

  // Media
  listMedia: (params: { category?: string; q?: string; limit?: number } = {}) =>
    adminFetch<import("./types").Media[]>(`/admin/media${qs(params)}`),
  updateMedia: (id: number, body: unknown) =>
    adminFetch<import("./types").Media>(`/admin/media/${id}`, { method: "PATCH", json: body }),
  deleteMedia: (id: number) => adminFetch<void>(`/admin/media/${id}`, { method: "DELETE" }),
  uploadMedia: async (file: File, category = "general", altText?: string) => {
    const form = new FormData();
    form.append("file", file);
    const res = await withRefresh("/admin/media", () =>
      fetch(`${API_URL}/admin/media${qs({ category, alt_text: altText })}`, {
        method: "POST", body: form, credentials: "include",
      }),
    );
    if (!res.ok) {
      throw new ApiError(
        res.status,
        await readError(res, "Upload failed. Use a PNG, JPG, or WebP under 8 MB."),
      );
    }
    return (await res.json()) as import("./types").Media;
  },

  // Settings
  getProfile: () => adminFetch<Profile>("/admin/settings/profile"),
  updateProfile: (body: unknown) =>
    adminFetch<Profile>("/admin/settings/profile", { method: "PATCH", json: body }),
  getSettings: () => adminFetch<SiteSettings>("/admin/settings/site"),
  updateSettings: (body: unknown) =>
    adminFetch<SiteSettings>("/admin/settings/site", { method: "PATCH", json: body }),
};

/**
 * The simple collections all expose the same eight operations, so one helper
 * covers every admin list screen.
 */
export function resource<T>(path: string) {
  return {
    list: () => adminFetch<T[]>(`/admin/${path}`),
    get: (id: number) => adminFetch<T>(`/admin/${path}/${id}`),
    create: (body: unknown) => adminFetch<T>(`/admin/${path}`, { method: "POST", json: body }),
    update: (id: number, body: unknown) =>
      adminFetch<T>(`/admin/${path}/${id}`, { method: "PATCH", json: body }),
    remove: (id: number) => adminFetch<void>(`/admin/${path}/${id}`, { method: "DELETE" }),
    reorder: (ids: number[]) =>
      adminFetch<void>(`/admin/${path}/reorder`, { method: "POST", json: { ids } }),
  };
}

export const resources = {
  experience: resource<Experience>("experience"),
  education: resource<Education>("education"),
  skills: resource<Skill>("skills"),
  skillCategories: resource<SkillCategory>("skill-categories"),
  certifications: resource<Certification>("certifications"),
  testimonials: resource<Testimonial>("testimonials"),
  socialLinks: resource<SocialLink>("social-links"),
  blogCategories: resource<BlogCategory>("blog-categories"),
  blogTags: resource<BlogTag>("blog-tags"),
};

export async function submitContact(body: {
  name: string; email: string; subject?: string; message: string; website?: string;
}): Promise<void> {
  const res = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new ApiError(
      res.status,
      await readError(res, "Your message could not be sent. Try again in a moment."),
    );
  }
}
