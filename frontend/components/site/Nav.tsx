"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { WeaveMark } from "@/components/weave/Weave";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";

/**
 * Each item is a section of the homepage, reached by scrolling. `page` is the
 * standalone route it falls back to when the homepage has no such section
 * (its content is empty), and what marks it active on that route.
 */
const PRIMARY = [
  { id: "about", label: "About", page: "/about" },
  { id: "experience", label: "Experience", page: "/experience" },
  { id: "projects", label: "Projects", page: "/projects" },
  { id: "writing", label: "Blog", page: "/blog" },
  { id: "contact", label: "Contact", page: "/contact" },
];

/** The homepage section currently under the header, or null above the first one. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) { setActive(null); return; }
    const els = PRIMARY.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Page order, so the topmost section in the band wins.
        setActive(PRIMARY.find((item) => visible.has(item.id))?.id ?? null);
      },
      // A thin band just below the header.
      { rootMargin: "-80px 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);
  return active;
}

export function Nav({ name, resumeUrl, resumeLabel }: {
  name: string; resumeUrl: string | null; resumeLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const onHome = pathname === "/";
  const activeSection = useActiveSection(onHome);
  // Sections the homepage actually rendered; unknown until mount.
  const [present, setPresent] = useState<Set<string> | null>(null);

  // Close the mobile menu on navigation, and lock scroll while it is open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!onHome) { setPresent(null); return; }
    const found = new Set(PRIMARY.filter((item) => document.getElementById(item.id)).map((item) => item.id));
    setPresent(found);
    // Arrived from another page via /#section, but that section is empty here.
    const target = PRIMARY.find((item) => `#${item.id}` === window.location.hash);
    if (target && !found.has(target.id)) router.replace(target.page);
  }, [onHome, router]);

  const hrefFor = (item: (typeof PRIMARY)[number]) =>
    present && !present.has(item.id) ? item.page : `/#${item.id}`;

  const isActive = (item: (typeof PRIMARY)[number]) =>
    onHome ? activeSection === item.id : pathname.startsWith(item.page);

  const monogram = name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md">
      <nav className="shell flex h-16 items-center justify-between gap-6" aria-label="Main">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <WeaveMark size={22} />
          <span className="text-[length:var(--text-md)]">{monogram || "EK"}</span>
          <span className="sr-only">{name} — home</span>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {PRIMARY.map((item) => (
            <li key={item.id}>
              <Link
                href={hrefFor(item)}
                aria-current={isActive(item) ? (onHome ? "location" : "page") : undefined}
                className={`relative py-1 text-sm transition-colors ${
                  isActive(item)
                    ? "text-[var(--text-strong)]"
                    : "text-[var(--muted)] hover:text-[var(--text-strong)]"
                }`}
              >
                {item.label}
                {isActive(item) ? (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 h-[2px] w-full bg-[var(--gold)]"
                  />
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          {resumeUrl ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-[var(--radius-button)] border border-[var(--line-strong)] px-3.5 py-2 text-sm transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)] sm:inline-flex"
            >
              {resumeLabel}
            </a>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)] border border-[var(--line)] lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? <CloseIcon size={17} /> : <MenuIcon size={17} />}
          </button>
        </div>
      </nav>

      {open ? (
        <div id="mobile-nav" className="border-t border-[var(--line)] bg-[var(--bg)] lg:hidden">
          <ul className="shell flex flex-col py-2">
            {PRIMARY.map((item) => (
              <li key={item.id}>
                <Link
                  href={hrefFor(item)}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item) ? (onHome ? "location" : "page") : undefined}
                  className={`flex items-center justify-between border-b border-[var(--line)] py-3.5 text-[length:var(--text-md)] ${
                    isActive(item) ? "text-[var(--gold)]" : "text-[var(--text)]"
                  }`}
                >
                  {item.label}
                  {isActive(item) ? (
                    <span aria-hidden="true" className="h-1.5 w-6 bg-[var(--gold)]" />
                  ) : null}
                </Link>
              </li>
            ))}
            {resumeUrl ? (
              <li>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-3.5 text-[length:var(--text-md)] text-[var(--gold)]"
                >
                  {resumeLabel}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
