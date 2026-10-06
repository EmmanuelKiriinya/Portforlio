"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader } from "@/components/admin/fields";
import { CollectionManager } from "@/components/admin/CollectionManager";
import { resources } from "@/lib/api";
import type { Certification } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";

export default function CertificationsAdmin() {
  return (
    <AdminShell>
      <AdminHeader
        title="Certifications"
        description="Credentials with verification links. Featured ones also appear on the homepage."
      />
      <CollectionManager<Certification>
        resourceClient={resources.certifications}
        entityName="certification"
        addLabel="Add a certification"
        emptyTitle="No certifications yet."
        emptyHint="Add one and it will appear on the certifications page."
        defaults={{ published: true, featured: false }}
        describe={(item) => ({
          title: item.name,
          subtitle: item.issuer,
          meta: formatMonthYear(item.issue_date),
        })}
        fields={[
          { name: "name", label: "Certification name", type: "text", required: true },
          { name: "issuer", label: "Issuing organization", type: "text", required: true },
          { name: "issuer_logo_id", label: "Issuer logo", type: "media", category: "certifications" },
          { name: "certificate_image_id", label: "Certificate image", type: "media", category: "certifications" },
          { name: "issue_date", label: "Issue date", type: "date" },
          { name: "expiry_date", label: "Expiry date", type: "date" },
          { name: "credential_id", label: "Credential ID", type: "text" },
          { name: "verification_url", label: "Verification link", type: "url", help: "Where visitors can confirm this credential." },
          { name: "featured", label: "Feature on the homepage", type: "checkbox" },
          { name: "published", label: "Show on the site", type: "checkbox" },
          { name: "description", label: "Description", type: "textarea", rows: 3, full: true },
        ]}
      />
    </AdminShell>
  );
}
