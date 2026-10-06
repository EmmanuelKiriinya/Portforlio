"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader } from "@/components/admin/fields";
import { CollectionManager } from "@/components/admin/CollectionManager";
import { resources } from "@/lib/api";
import type { BlogCategory, BlogTag, SkillCategory, SocialLink } from "@/lib/types";

const ACCENTS = [
  { value: "gold", label: "Gold" },
  { value: "clay", label: "Clay" },
  { value: "indigo", label: "Indigo" },
  { value: "palm", label: "Palm" },
  { value: "plum", label: "Plum (AI and deep learning)" },
];

export default function TaxonomyAdmin() {
  return (
    <AdminShell>
      <AdminHeader
        title="Categories, tags & links"
        description="The groupings used across the blog, the skills carousel, and your social profiles."
      />

      <section className="mb-14">
        <h2 className="mb-4 text-[length:var(--text-md)] font-semibold">Blog categories</h2>
        <CollectionManager<BlogCategory>
          resourceClient={resources.blogCategories}
          entityName="category"
          addLabel="Add a category"
          emptyTitle="No blog categories yet."
          emptyHint="Categories let readers filter the blog index."
          describe={(item) => ({ title: item.name, subtitle: item.description ?? undefined, meta: item.slug })}
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "slug", label: "URL slug", type: "text", help: "Left blank, this is generated from the name." },
            { name: "accent", label: "Accent colour", type: "select", options: ACCENTS },
            { name: "description", label: "Description", type: "textarea", rows: 2, full: true },
          ]}
        />
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-[length:var(--text-md)] font-semibold">Blog tags</h2>
        <CollectionManager<BlogTag>
          resourceClient={resources.blogTags}
          entityName="tag"
          addLabel="Add a tag"
          emptyTitle="No tags yet."
          emptyHint="Tags can also be created while writing a post."
          describe={(item) => ({ title: item.name, meta: item.slug })}
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "slug", label: "URL slug", type: "text" },
          ]}
        />
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-[length:var(--text-md)] font-semibold">Skill categories</h2>
        <CollectionManager<SkillCategory>
          resourceClient={resources.skillCategories}
          entityName="category"
          addLabel="Add a category"
          emptyTitle="No skill categories yet."
          emptyHint="Categories become the filter buttons above the skills carousel."
          describe={(item) => ({ title: item.name, meta: item.slug })}
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "slug", label: "URL slug", type: "text" },
          ]}
        />
      </section>

      <section>
        <h2 className="mb-4 text-[length:var(--text-md)] font-semibold">Social links</h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          Set these once — they appear in the hero, the contact page, and the footer.
        </p>
        <CollectionManager<SocialLink>
          resourceClient={resources.socialLinks}
          entityName="link"
          addLabel="Add a link"
          emptyTitle="No social links yet."
          emptyHint="Add LinkedIn, GitHub, or anywhere else you want people to find you."
          defaults={{ published: true }}
          describe={(item) => ({ title: item.label, subtitle: item.url })}
          fields={[
            { name: "platform", label: "Platform key", type: "text", required: true, placeholder: "linkedin" },
            { name: "label", label: "Label shown to visitors", type: "text", required: true, placeholder: "LinkedIn" },
            { name: "url", label: "URL", type: "url", required: true, full: true },
            { name: "icon_url", label: "Icon URL", type: "url", full: true },
            { name: "published", label: "Show on the site", type: "checkbox" },
          ]}
        />
      </section>
    </AdminShell>
  );
}
