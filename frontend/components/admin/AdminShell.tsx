"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { ThemeToggle } from "@/components/site/ThemeToggle";

interface AdminUser { id: number; name: string; email: string; role: string }

const UserContext = createContext<AdminUser | null>(null);
export const useAdminUser = () => useContext(UserContext);

/* Deliberately plainer than the public site — no weave in the CMS (§27). */
const NAV: { heading: string; items: { href: string; label: string }[] }[] = [
  {
    heading: "Overview",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/messages", label: "Messages" },
    ],
  },
  {
    heading: "Content",
    items: [
      { href: "/admin/posts", label: "Blog posts" },
      { href: "/admin/projects", label: "Projects" },
      { href: "/admin/certifications", label: "Certifications" },
      { href: "/admin/testimonials", label: "Testimonials" },
    ],
  },
  {
    heading: "Profile",
    items: [
      { href: "/admin/profile", label: "Profile & about" },
      { href: "/admin/experience", label: "Experience" },
      { href: "/admin/education", label: "Education" },
      { href: "/admin/skills", label: "Skills" },
    ],
  },
  {
    heading: "Media",
    items: [{ href: "/admin/media", label: "Media library" }],
  },
  {
    heading: "Settings",
    items: [
      { href: "/admin/settings", label: "Site settings" },
      { href: "/admin/taxonomy", label: "Categories & tags" },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [state, setState] = useState<"checking" | "ready" | "anonymous">("checking");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .me()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("anonymous");
      });
    return () => { cancelled = true; };
  }, []);

  // Redirect in its own effect — calling replace() inside the same tick as the
  // state update above did not reliably navigate.
  useEffect(() => {
    if (state === "anonymous") router.replace("/admin/login");
  }, [state, router]);

  useEffect(() => setNavOpen(false), [pathname]);

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Checking your session…</p>
      </div>
    );
  }

  if (state === "anonymous") {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="text-center">
          <p className="text-[var(--muted)]">You need to sign in to view this page.</p>
          <Link href="/admin/login" className="mt-4 inline-block text-[var(--gold)] underline underline-offset-4">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  async function signOut() {
    try {
      await adminApi.logout();
    } finally {
      router.replace("/admin/login");
    }
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <UserContext.Provider value={user}>
      <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
        {/* Sidebar */}
        <aside
          className={`border-[var(--line)] bg-[var(--bg-raised)] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r ${
            navOpen ? "block border-b" : "hidden lg:block"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-[var(--line)] px-5">
            <Link href="/admin" className="font-semibold">
              Portfolio CMS
            </Link>
          </div>

          <nav className="px-3 py-5" aria-label="Admin">
            {NAV.map((group) => (
              <div key={group.heading} className="mb-6">
                <h2 className="px-2 text-[length:var(--text-xs)] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  {group.heading}
                </h2>
                <ul className="mt-2 space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={`block rounded-[var(--radius-hair)] px-2.5 py-2 text-sm transition-colors ${
                          isActive(item.href)
                            ? "bg-[var(--surface)] font-medium text-[var(--gold)]"
                            : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text-strong)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="border-t border-[var(--line)] px-5 py-4">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-[length:var(--text-xs)] text-[var(--muted)]">{user?.email}</p>
            <button
              type="button"
              onClick={signOut}
              className="mt-3 text-sm text-[var(--muted)] underline underline-offset-4 transition-colors hover:text-[var(--ember)]"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--line)] bg-[var(--bg)] px-5">
            <button
              type="button"
              onClick={() => setNavOpen((v) => !v)}
              aria-expanded={navOpen}
              className="rounded-[var(--radius-hair)] border border-[var(--line)] px-3 py-1.5 text-sm lg:hidden"
            >
              Menu
            </button>
            <div className="ml-auto flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--gold)]"
              >
                View site
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <div className="px-5 py-8 lg:px-8">{children}</div>
        </div>
      </div>
    </UserContext.Provider>
  );
}
