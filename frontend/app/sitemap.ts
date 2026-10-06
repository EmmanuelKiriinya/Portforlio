import type { MetadataRoute } from "next";
import { api, SITE_URL } from "@/lib/api";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await api.settings();
  const base = (settings?.site_url || SITE_URL).replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/experience`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/projects`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/certifications`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/resume`, changeFrequency: "yearly", priority: 0.5 },
  ];

  // Ask for everything; the API caps per_page, so this covers a realistic archive.
  const [posts, projects] = await Promise.all([
    api.posts({ per_page: 50 }),
    api.projects({ per_page: 50 }),
  ]);

  return [
    ...staticRoutes,
    ...(posts?.items ?? []).map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...(projects?.items ?? []).map((project) => ({
      url: `${base}/projects/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
