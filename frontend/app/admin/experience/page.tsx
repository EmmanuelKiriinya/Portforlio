"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader } from "@/components/admin/fields";
import { CollectionManager } from "@/components/admin/CollectionManager";
import { resources } from "@/lib/api";
import type { Experience } from "@/lib/types";
import { dateRange } from "@/lib/utils";

export default function ExperienceAdmin() {
  return (
    <AdminShell>
      <AdminHeader
        title="Experience"
        description="Roles shown on the homepage and the experience page. Drag order controls how they appear."
      />
      <CollectionManager<Experience>
        resourceClient={resources.experience}
        entityName="role"
        addLabel="Add a role"
        emptyTitle="No roles added yet."
        emptyHint="Add your first role and it will appear on the experience page."
        defaults={{ published: true, current: false }}
        describe={(item) => ({
          title: item.title,
          subtitle: item.organization,
          meta: dateRange(item.start_date, item.end_date, item.current),
        })}
        fields={[
          { name: "title", label: "Job title", type: "text", required: true },
          { name: "organization", label: "Organization", type: "text", required: true },
          { name: "organization_logo_id", label: "Organization logo", type: "media", category: "general" },
          { name: "organization_url", label: "Organization website", type: "url" },
          { name: "employment_type", label: "Employment type", type: "text", placeholder: "Full-time" },
          { name: "location", label: "Location", type: "text" },
          { name: "start_date", label: "Start date", type: "date" },
          { name: "end_date", label: "End date", type: "date", help: "Leave blank if this is your current role." },
          { name: "current", label: "This is my current role", type: "checkbox" },
          { name: "published", label: "Show on the site", type: "checkbox" },
          { name: "description", label: "Description", type: "textarea", rows: 4, full: true },
          {
            name: "achievements", label: "Key achievements", type: "bullets", itemLabel: "achievement", full: true,
            help: "Quantified outcomes read best — what changed, and by how much.",
          },
          {
            name: "technologies", label: "Technologies", type: "text", full: true,
            help: "Comma separated, e.g. Python, PostgreSQL, Airflow",
          },
        ]}
      />
    </AdminShell>
  );
}
