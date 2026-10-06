"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader } from "@/components/admin/fields";
import { CollectionManager } from "@/components/admin/CollectionManager";
import { resources } from "@/lib/api";
import type { Skill, SkillCategory } from "@/lib/types";

export default function SkillsAdmin() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);

  useEffect(() => {
    resources.skillCategories.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <AdminShell>
      <AdminHeader
        title="Skills"
        description="Technologies shown in the homepage carousel."
      />

      <div className="mb-8 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 className="text-sm font-semibold">Where to find icons</h2>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          Paste any SVG or PNG URL. These three cover almost everything, in
          order of preference:
        </p>
        <dl className="mt-4 space-y-3 text-sm">
          {[
            {
              name: "Devicon",
              href: "https://devicon.dev",
              note: "Full colour, built for developer and data tools. The default.",
              url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/NAME/NAME-original.svg",
            },
            {
              name: "Iconify",
              href: "https://icon-sets.iconify.design/logos/",
              note: "Full-colour brand logos for anything Devicon is missing.",
              url: "https://api.iconify.design/logos:NAME.svg",
            },
            {
              name: "Simple Icons",
              href: "https://simpleicons.org",
              note: "Monochrome, but you choose the colour with the trailing hex.",
              url: "https://cdn.simpleicons.org/NAME/f5b426",
            },
          ].map((source) => (
            <div key={source.name}>
              <dt className="font-medium">
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--gold)] underline underline-offset-4"
                >
                  {source.name}
                </a>
                <span className="ml-2 font-normal text-[var(--muted)]">{source.note}</span>
              </dt>
              <dd className="mt-1">
                <code className="block overflow-x-auto rounded-[2px] border border-[var(--line)] bg-[var(--bg-raised)] px-2 py-1 text-[length:var(--text-xs)]">
                  {source.url}
                </code>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[length:var(--text-xs)] text-[var(--muted)]">
          If an icon fails to load, or a tool has no logo at all, the site shows
          a lettered tile in the brand colours rather than a broken image.
        </p>
      </div>

      <CollectionManager<Skill>
        resourceClient={resources.skills}
        entityName="skill"
        addLabel="Add a skill"
        emptyTitle="No skills added yet."
        emptyHint="Add technologies and they will flow through the homepage carousel."
        defaults={{ active: true }}
        describe={(item) => ({
          title: item.name,
          subtitle: item.category?.name ?? "No category",
          meta: item.active ? undefined : "Hidden",
        })}
        fields={[
          { name: "name", label: "Name", type: "text", required: true },
          {
            name: "icon_url", label: "Icon URL", type: "url", full: true,
            placeholder: "https://img.icons8.com/color/96/python.png",
            help: "An Icons8 URL, or any other licensed icon.",
          },
          { name: "icon_media_id", label: "Or upload an icon", type: "media", category: "general" },
          {
            name: "category_id", label: "Category", type: "select",
            options: categories.map((c) => ({ value: String(c.id), label: c.name })),
          },
          { name: "official_url", label: "Official website", type: "url" },
          { name: "active", label: "Show on the site", type: "checkbox" },
        ]}
      />
    </AdminShell>
  );
}
