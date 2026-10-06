"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader } from "@/components/admin/fields";
import { CollectionManager } from "@/components/admin/CollectionManager";
import { resources } from "@/lib/api";
import type { Testimonial } from "@/lib/types";

export default function TestimonialsAdmin() {
  return (
    <AdminShell>
      <AdminHeader
        title="Testimonials"
        description="Shown in the homepage carousel, in the order set here."
      />
      <CollectionManager<Testimonial>
        resourceClient={resources.testimonials}
        entityName="testimonial"
        addLabel="Add a testimonial"
        emptyTitle="No testimonials yet."
        emptyHint="Add one and the carousel will appear on the homepage."
        defaults={{ published: true }}
        describe={(item) => ({
          title: item.name,
          subtitle: [item.title, item.organization].filter(Boolean).join(", "),
        })}
        fields={[
          { name: "name", label: "Name", type: "text", required: true },
          { name: "title", label: "Job title", type: "text" },
          { name: "organization", label: "Organization", type: "text" },
          { name: "profile_image_id", label: "Profile photo", type: "media", category: "testimonials" },
          { name: "linkedin_url", label: "LinkedIn profile", type: "url" },
          { name: "published", label: "Show on the site", type: "checkbox" },
          { name: "content", label: "Testimonial", type: "textarea", rows: 5, required: true, full: true },
        ]}
      />
    </AdminShell>
  );
}
