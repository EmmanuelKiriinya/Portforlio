import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { ProjectRow } from "@/components/project/ProjectRow";
import { EmptyState, ButtonLink } from "@/components/ui";
import { SearchField } from "@/components/ui/SearchField";
import { FilterChips } from "@/components/ui/FilterChips";
import { Pagination } from "@/components/ui/Pagination";
import { WeaveRule } from "@/components/weave/Weave";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Projects",
  description: "Applied machine learning, forecasting and analytics case studies.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [data, categories] = await Promise.all([
    api.projects({ page, per_page: 8, category: params.category, q: params.q }),
    api.projectCategories(),
  ]);

  const isFiltered = Boolean(params.q || params.category);

  return (
    <div className="shell section">
      <header className="mb-12">
        <WeaveRule />
        <div className="max-w-3xl">
          <h1 className="mt-6 text-[length:var(--text-2xl)] md:text-[length:var(--text-3xl)]">
            Projects
          </h1>
          <p className="mt-4 text-[length:var(--text-md)] text-[var(--muted)]">
            Each one covers the problem, the data, the approach, and what the results mean in
            practice — not just the metric.
          </p>
        </div>
      </header>

      <div className="mb-10 flex flex-col gap-5 border-b border-[var(--line)] pb-8 sm:flex-row sm:items-center sm:justify-between">
        <Suspense fallback={null}>
          <FilterChips
            param="category"
            options={(categories ?? []).map((c) => ({ value: c, label: c }))}
          />
        </Suspense>
        <Suspense fallback={null}>
          <SearchField label="Search projects" placeholder="Search projects…" />
        </Suspense>
      </div>

      {!data || data.items.length === 0 ? (
        <EmptyState
          title={
            isFiltered
              ? "No projects matched your search."
              : "No projects are published yet."
          }
          hint={
            isFiltered
              ? "Try a different term, or clear the filters to see everything."
              : "Add a project in the admin panel and set its status to published."
          }
          action={
            isFiltered ? (
              <ButtonLink href="/projects" tone="secondary">Clear filters</ButtonLink>
            ) : (
              <ButtonLink href="/admin">Open the admin panel</ButtonLink>
            )
          }
        />
      ) : (
        <>
          <p className="sr-only" aria-live="polite">
            {data.total} {data.total === 1 ? "project" : "projects"} found.
          </p>
          <div className="border-t border-[var(--line)]">
            {data.items.map((project, i) => (
              <ProjectRow key={project.id} project={project} index={i} />
            ))}
          </div>
          <Suspense fallback={null}>
            <Pagination page={data.page} pages={data.pages} />
          </Suspense>
        </>
      )}
    </div>
  );
}
