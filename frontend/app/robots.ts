import type { MetadataRoute } from "next";
import { api, SITE_URL } from "@/lib/api";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await api.settings();
  const base = (settings?.site_url || SITE_URL).replace(/\/$/, "");

  return {
    rules: [
      // The CMS is behind auth, but there is no reason for it to be crawled.
      { userAgent: "*", allow: "/", disallow: ["/admin", "/admin/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
