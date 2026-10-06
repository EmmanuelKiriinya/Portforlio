import type { Media } from "./types";

/** Prefer the WebP derivative the API generated at upload time. */
export function imageUrl(media: Media | null | undefined): string | null {
  if (!media) return null;
  return media.webp_url ?? media.public_url;
}

export function altText(media: Media | null | undefined, fallback: string): string {
  return media?.alt_text?.trim() || fallback;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "March 2024" — dates on this site are never more precise than a month. */
export function formatMonthYear(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatFullDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "March 2021 — Present" */
export function dateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  current = false,
): string {
  const from = formatMonthYear(start);
  const to = current ? "Present" : formatMonthYear(end);
  if (from && to) return `${from} — ${to}`;
  return from || to;
}

export function techList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(",").map((t) => t.trim()).filter(Boolean);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Turn a Google Drive share link into one that downloads directly (§20). */
export function resumeHref(url: string | null, type: string): string | null {
  if (!url) return null;
  if (type !== "drive") return url;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) ?? url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? `https://drive.google.com/uc?export=download&id=${match[1]}` : url;
}

/**
 * Pull h2/h3 headings out of stored article HTML for the table of contents,
 * adding the ids the anchors point at.
 */
export function extractHeadings(html: string): {
  html: string;
  headings: { id: string; text: string; level: number }[];
} {
  const headings: { id: string; text: string; level: number }[] = [];
  const used = new Set<string>();

  const withIds = html.replace(
    /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi,
    (_match, level: string, attrs: string | undefined, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      let id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (!id) id = `section-${headings.length + 1}`;
      let unique = id;
      let n = 2;
      while (used.has(unique)) unique = `${id}-${n++}`;
      used.add(unique);
      headings.push({ id: unique, text, level: Number(level) });
      return `<h${level}${attrs ?? ""} id="${unique}">${inner}</h${level}>`;
    },
  );

  return { html: withIds, headings };
}
