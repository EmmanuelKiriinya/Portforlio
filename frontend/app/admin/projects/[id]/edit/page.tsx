"use client";

import { use, useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import type { Project } from "@/lib/types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader, Banner } from "@/components/admin/fields";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getProject(Number(id))
      .then(setProject)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "That project could not be loaded."),
      );
  }, [id]);

  return (
    <AdminShell>
      <AdminHeader title="Edit project" />
      {error ? <Banner tone="error">{error}</Banner> : null}
      {project ? <ProjectEditor project={project} /> : !error ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : null}
    </AdminShell>
  );
}
