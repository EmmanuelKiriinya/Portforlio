"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader } from "@/components/admin/fields";
import { CollectionManager } from "@/components/admin/CollectionManager";
import { resources } from "@/lib/api";
import type { Education } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";

export default function EducationAdmin() {
  return (
    <AdminShell>
      <AdminHeader title="Education" description="Degrees and formal study, shown on the About page." />
      <CollectionManager<Education>
        resourceClient={resources.education}
        entityName="entry"
        addLabel="Add an entry"
        emptyTitle="No education entries yet."
        emptyHint="Add a degree and it will appear on the About page."
        defaults={{ published: true }}
        describe={(item) => ({
          title: item.degree,
          subtitle: item.institution,
          meta: formatMonthYear(item.graduation_date),
        })}
        fields={[
          { name: "institution", label: "Institution", type: "text", required: true },
          { name: "degree", label: "Degree", type: "text", required: true },
          { name: "institution_logo_id", label: "Institution logo", type: "media", category: "general" },
          { name: "field_of_study", label: "Field of study", type: "text" },
          { name: "start_date", label: "Start date", type: "date" },
          { name: "graduation_date", label: "Graduation date", type: "date" },
          { name: "verification_url", label: "Verification link", type: "url" },
          { name: "published", label: "Show on the site", type: "checkbox" },
          { name: "description", label: "Description", type: "textarea", rows: 3, full: true },
        ]}
      />
    </AdminShell>
  );
}
