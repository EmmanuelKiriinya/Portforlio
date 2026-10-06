import type { NextConfig } from "next";

/**
 * Hosts we load images from: the Icons8 CDN, the R2 public bucket, and —
 * in development — whatever host the API itself is serving media from.
 */
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  // Icon CDNs. Devicon (via jsDelivr) carries full-colour logos for most of
  // the data stack; Iconify fills the brand gaps; Simple Icons serves tintable
  // monochrome marks. Icons8 stays allowed so older entries keep working.
  { protocol: "https", hostname: "cdn.jsdelivr.net" },
  { protocol: "https", hostname: "api.iconify.design" },
  { protocol: "https", hostname: "cdn.simpleicons.org" },
  { protocol: "https", hostname: "img.icons8.com" },
  // Media storage.
  { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
  { protocol: "https", hostname: "**.r2.dev" },
];

const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOST;
if (mediaHost) {
  remotePatterns.push({ protocol: "https", hostname: mediaHost });
}

// Derived from the API URL rather than hardcoded, so running the backend on a
// non-default port doesn't silently break image loading in development.
try {
  const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1");
  remotePatterns.push({
    protocol: api.protocol.replace(":", "") as "http" | "https",
    hostname: api.hostname,
    ...(api.port ? { port: api.port } : {}),
  });
} catch {
  // Malformed URL: fall back to the documented default below.
  remotePatterns.push({ protocol: "http", hostname: "localhost", port: "8000" });
}

const config: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default config;
