"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { WeaveMark } from "@/components/weave/Weave";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";

const PRIMARY = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/certifications", label: "Certifications" },
  { href: "/contact", label: "Contact" },
];

export function Nav({ name, resumeUrl, resumeLabel }: {
  name: string; resumeUrl: string | null; resumeLabel: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`relative py-1 text-sm transition-colors ${
                  isActive(item.href)
                    ? "text-[var(--text-strong)]"
                    : "text-[var(--muted)] hover:text-[var(--text-strong)]"
                }`}
              >
                {item.label}
                {isActive(item.href) ? (
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
              className="hidden rounded-[var(--radius-hair)] border border-[var(--line-strong)] px-3.5 py-2 text-sm transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)] sm:inline-flex"
            >
              {resumeLabel}
            </a>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-hair)] border border-[var(--line)] lg:hidden"
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
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`flex items-center justify-between border-b border-[var(--line)] py-3.5 text-[length:var(--text-md)] ${
                    isActive(item.href) ? "text-[var(--gold)]" : "text-[var(--text)]"
                  }`}
                >
                  {item.label}
                  {isActive(item.href) ? (
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
