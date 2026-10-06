"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader } from "@/components/admin/fields";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export default function NewProjectPage() {
  return (
    <AdminShell>
      <AdminHeader
        title="New project"
        description="Only the sections you fill in appear on the public page."
      />
      <ProjectEditor />
    </AdminShell>
  );
}
