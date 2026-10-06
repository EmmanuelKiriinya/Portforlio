import Link from "next/link";
import type { SocialLink } from "@/lib/types";
import { WeaveMark, WeaveStrip } from "@/components/weave/Weave";
import { SocialButtons } from "./SocialButtons";

const SITEMAP = [
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/certifications", label: "Certifications" },
  { href: "/contact", label: "Contact" },
];

export function Footer({
  name, headline, socialLinks, email,
}: {
  name: string; headline: string; socialLinks: SocialLink[]; email: string | null;
}) {
  return (
    <footer className="mt-24 border-t border-[var(--line)]">
      {/* Weight 2: a full pattern band. One of only two on the site. */}
      <div className="h-9 w-full overflow-hidden" aria-hidden="true">
        <WeaveStrip seed={91} height={30} cellWidth={34} cells={48} className="h-full w-full" />
      </div>

      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <WeaveMark size={20} />
            <span className="font-semibold">{name}</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">{headline}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-[length:var(--text-sm)] font-semibold text-[var(--text-strong)]">
            Pages
          </h2>
          <ul className="mt-4 space-y-2.5">
            {SITEMAP.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--gold)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-[length:var(--text-sm)] font-semibold text-[var(--text-strong)]">
            Elsewhere
          </h2>
          <SocialButtons links={socialLinks} size="sm" className="mt-4" />
          {email ? (
            <a
              href={`mailto:${email}`}
              className="mt-4 inline-block text-sm text-[var(--muted)] transition-colors hover:text-[var(--gold)]"
            >
              {email}
            </a>
          ) : null}
        </div>
      </div>

      <div className="shell flex flex-col gap-2 border-t border-[var(--line)] py-6 text-[length:var(--text-xs)] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {name}
        </p>
        <p>Built with Next.js and FastAPI.</p>
      </div>
    </footer>
  );
}
