"use client";

import type { SocialLink } from "@/lib/types";
import { SmartImage } from "@/components/ui/SmartImage";
import {
  MailIcon, GlobeIcon, GithubIcon, LinkedinIcon, XIcon,
} from "@/components/ui/icons";

/**
 * Social links as icon buttons.
 *
 * Known platforms use an inline mark so they inherit currentColor and stay
 * legible in both themes — an external brand image is a fixed colour and goes
 * muddy against one theme or the other. Anything else falls back to the
 * `icon_url` stored on the link (editable in the admin), then to a globe, so a
 * missing or failed icon never renders as a broken image.
 */
const INLINE_MARKS: Record<string, (p: { size?: number }) => React.ReactElement> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  x: XIcon,
  twitter: XIcon,
  email: MailIcon,
  mail: MailIcon,
};

function inlineMarkFor(link: SocialLink) {
  if (link.url.startsWith("mailto:")) return MailIcon;
  return INLINE_MARKS[link.platform.toLowerCase().trim()] ?? null;
}

function Glyph({ link, size }: { link: SocialLink; size: number }) {
  const Mark = inlineMarkFor(link);
  if (Mark) return <Mark size={size} />;

  if (link.icon_url) {
    return (
      <SmartImage
        src={link.icon_url}
        alt=""
        width={size}
        height={size}
        eager
        unoptimized
        className="object-contain"
        style={{ width: size, height: size }}
        fallback={<GlobeIcon size={size} />}
      />
    );
  }

  return <GlobeIcon size={size} />;
}

export function SocialButtons({
  links, size = "md", className = "",
}: {
  links: SocialLink[];
  size?: "sm" | "md";
  className?: string;
}) {
  if (links.length === 0) return null;

  const box = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const glyph = size === "sm" ? 15 : 18;

  return (
    <ul className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            className={`${box} flex items-center justify-center rounded-[var(--radius-tile)] border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]`}
          >
            <Glyph link={link} size={glyph} />
            <span className="sr-only">{link.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
