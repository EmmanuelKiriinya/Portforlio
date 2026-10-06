"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import type { ProjectSummary } from "@/lib/types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader, Banner, INPUT } from "@/components/admin/fields";
import { formatMonthYear } from "@/lib/utils";

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listProjects({ q: query || undefined });
      setProjects(data.items);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Projects could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = window.setTimeout(load, query ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [load, query]);

  return (
    <AdminShell>
      <AdminHeader
        title="Projects"
        description="Case studies shown on the projects page and the homepage."
        actions={
          <Link
            href="/admin/projects/new"
            className="rounded-[var(--radius-hair)] border border-[var(--gold)] bg-[var(--gold)] px-4 py-2 text-sm font-medium text-[var(--on-accent)] transition-colors hover:border-[var(--clay)] hover:bg-[var(--clay)]"
          >
            New project
          </Link>
        }
      />

      {error ? <Banner tone="error">{error}</Banner> : null}

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search projects…"
        aria-label="Search projects"
        className={`${INPUT} mb-6 max-w-sm`}
      />

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="rounded-[var(--radius-tile)] border border-dashed border-[var(--line-strong)] px-6 py-14 text-center">
          <p className="font-medium">
            {query ? "No projects matched your search." : "No projects yet."}
          </p>
          {!query ? (
            <Link
              href="/admin/projects/new"
              className="mt-4 inline-block text-sm text-[var(--gold)] underline underline-offset-4"
            >
              Add your first project
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="divide-y divide-[var(--line)] rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)]">
          {projects.map((project) => (
            <li key={project.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {project.title}
                  {project.featured ? (
                    <span className="ml-2 text-[length:var(--text-xs)] text-[var(--clay)]">Featured</span>
                  ) : null}
                </p>
                <p className="mt-0.5 truncate text-sm text-[var(--muted)]">
                  {project.category ?? "No category"}
                  {project.completion_date ? ` · ${formatMonthYear(project.completion_date)}` : ""}
                  {project.live_url ? " · has live demo" : ""}
                </p>
              </div>

              <span
                className={`shrink-0 text-[length:var(--text-xs)] ${
                  project.status === "published" ? "text-[var(--palm)]" : "text-[var(--muted)]"
                }`}
              >
                {project.status === "published" ? "Published" : "Draft"}
              </span>

              <Link
                href={`/admin/projects/${project.id}/edit`}
                className="shrink-0 rounded-[var(--radius-hair)] border border-[var(--line-strong)] px-4 py-2 text-sm transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
