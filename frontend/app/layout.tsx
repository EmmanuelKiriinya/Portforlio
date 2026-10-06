import type { Metadata, Viewport } from "next";
import { Sora, Newsreader, JetBrains_Mono } from "next/font/google";
import { themeScript } from "@/components/site/ThemeToggle";
import { api, SITE_URL } from "@/lib/api";
import "./globals.css";

/* Three families, three jobs — see DESIGN.md. */
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-code",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await api.settings();
  const title = settings?.site_title ?? "Emmanuel Kiriinya — Data Scientist";
  const description =
    settings?.site_description ??
    "Data scientist working on machine learning, forecasting and applied AI.";
  const base = settings?.site_url || SITE_URL;

  return {
    metadataBase: new URL(base),
    title: { default: title, template: `%s — ${title.split("—")[0].trim()}` },
    description,
    keywords: settings?.default_keywords?.split(",").map((k) => k.trim()),
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      title,
      description,
      siteName: title,
      url: base,
      images: settings?.default_social_image?.public_url
        ? [{ url: settings.default_social_image.public_url }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: settings?.default_social_image?.public_url
        ? [settings.default_social_image.public_url]
        : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0a0d" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before first paint so the page never flashes the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${sora.variable} ${newsreader.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
