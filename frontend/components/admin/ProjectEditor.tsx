"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import type { Media, Project } from "@/lib/types";
import { RichTextEditor } from "./Editor";
import { MediaField, MediaPickerDialog } from "./MediaPicker";
import { AdminButton, Banner, ConfirmButton, Field, INPUT } from "./fields";
import { SmartImage } from "@/components/ui/SmartImage";
import { CloseIcon } from "@/components/ui/icons";

/* The case-study fields from §14, each rich text. */
const SECTIONS = [
  { key: "content", label: "Overview", hint: "What the project is, in a paragraph or two." },
  { key: "problem", label: "The problem", hint: "What was broken, and who it affected." },
  { key: "solution", label: "The approach", hint: "What you built and why that shape." },
  { key: "dataset", label: "Data", hint: "Sources, size, and anything unusual about it." },
  { key: "methodology", label: "Methodology", hint: "Feature work, validation strategy, what you had to get right." },
  { key: "models_used", label: "Models", hint: "What you tried, what won, and what it cost." },
  { key: "results", label: "Results", hint: "Metrics against a baseline, and what they mean in practice." },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

export function ProjectEditor({ project }: { project?: Project }) {
  const router = useRouter();
  const [id, setId] = useState<number | null>(project?.id ?? null);
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [excerpt, setExcerpt] = useState(project?.excerpt ?? "");
  const [category, setCategory] = useState(project?.category ?? "");
  const [technologies, setTechnologies] = useState(project?.technologies ?? "");
  const [github, setGithub] = useState(project?.github_url ?? "");
  const [live, setLive] = useState(project?.live_url ?? "");
  const [completion, setCompletion] = useState(project?.completion_date ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [status, setStatus] = useState(project?.status ?? "draft");
  const [cover, setCover] = useState<Media | null>(project?.cover_image ?? null);
  const [gallery, setGallery] = useState<Media[]>(
    project?.gallery.map((item) => item.media) ?? [],
  );
  const [sections, setSections] = useState<Record<SectionKey, string>>(() => {
    const initial = {} as Record<SectionKey, string>;
    for (const section of SECTIONS) initial[section.key] = project?.[section.key] ?? "";
    return initial;
  });

  const [openSection, setOpenSection] = useState<SectionKey>("content");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function payload(nextStatus?: string) {
    return {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim() || null,
      category: category.trim() || null,
      technologies: technologies.trim() || null,
      github_url: github.trim() || null,
      // An empty string must become null so the public button stays hidden (§13).
      live_url: live.trim() || null,
      completion_date: completion || null,
      featured,
      status: nextStatus ?? status,
      cover_image_id: cover?.id ?? null,
      gallery_media_ids: gallery.map((m) => m.id),
      ...sections,
    };
  }

  async function save(nextStatus?: string) {
    if (!title.trim()) {
      setError("Give the project a title before saving.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const saved = id
        ? await adminApi.updateProject(id, payload(nextStatus))
        : await adminApi.createProject(payload(nextStatus ?? "draft"));
      setId(saved.id);
      setStatus(saved.status);
      setSlug(saved.slug);
      setNotice(
        nextStatus === "published"
          ? "Published. It is live on the projects page now."
          : nextStatus === "draft"
            ? "Unpublished. It is now a draft and hidden from the site."
            : "Changes saved.",
      );
      if (!project) router.replace(`/admin/projects/${saved.id}/edit`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The project could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {error ? <Banner tone="error">{error}</Banner> : null}
      {notice ? <Banner tone="success">{notice}</Banner> : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] px-5 py-3">
        <p className="text-sm">
          Status:{" "}
          <span className={status === "published" ? "text-[var(--palm)]" : "text-[var(--muted)]"}>
            {status === "published" ? "Published" : "Draft"}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <AdminButton tone="secondary" onClick={() => save()} disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </AdminButton>
          {status === "published" ? (
            <AdminButton tone="secondary" onClick={() => save("draft")} disabled={busy}>
              Unpublish
            </AdminButton>
          ) : (
            <AdminButton onClick={() => save("published")} disabled={busy}>Publish</AdminButton>
          )}
          {id && status === "published" ? (
            <a
              href={`/projects/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-[var(--radius-hair)] border border-[var(--line-strong)] px-4 py-2 text-sm transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              Preview
            </a>
          ) : null}
          {id ? (
            <ConfirmButton
              label="Delete"
              confirmLabel="Delete permanently"
              busy={busy}
              onConfirm={async () => {
                await adminApi.deleteProject(id);
                router.push("/admin/projects");
              }}
            />
          ) : null}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          <Field label="Title" htmlFor="title" required>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${INPUT} text-[length:var(--text-lg)]`}
            />
          </Field>

          <Field label="Short description" htmlFor="excerpt" help="Shown on the projects list and the homepage.">
            <textarea
              id="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className={`${INPUT} resize-y`}
            />
          </Field>

          {/* Case study sections as tabs — one long scroll of seven editors is
              unusable, and most projects only fill in some of them. */}
          <div>
            <span className="mb-2 block text-sm font-medium">Case study</span>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {SECTIONS.map((section) => {
                const filled = Boolean(sections[section.key]?.replace(/<[^>]*>/g, "").trim());
                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => setOpenSection(section.key)}
                    aria-pressed={openSection === section.key}
                    className={`rounded-[var(--radius-chip)] border px-3 py-1.5 text-[length:var(--text-xs)] transition-colors ${
                      openSection === section.key
                        ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--on-accent)]"
                        : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--gold)]"
                    }`}
                  >
                    {section.label}
                    {filled ? <span className="ml-1.5 text-[var(--palm)]">•</span> : null}
                  </button>
                );
              })}
            </div>

            {SECTIONS.filter((s) => s.key === openSection).map((section) => (
              <div key={section.key}>
                <p className="mb-2 text-[length:var(--text-xs)] text-[var(--muted)]">{section.hint}</p>
                <RichTextEditor
                  key={section.key}
                  value={sections[section.key]}
                  onChange={(html) =>
                    setSections((prev) => ({ ...prev, [section.key]: html }))
                  }
                  placeholder={`Write the ${section.label.toLowerCase()} section. Leave it blank to hide it.`}
                />
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="space-y-5 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-5">
            <h2 className="text-sm font-semibold">Links</h2>
            <Field label="GitHub URL" htmlFor="github">
              <input id="github" type="url" value={github} onChange={(e) => setGithub(e.target.value)} className={INPUT} />
            </Field>
            <Field
              label="Live demo URL"
              htmlFor="live"
              help="Left blank, the Live demo button is not shown at all."
            >
              <input id="live" type="url" value={live} onChange={(e) => setLive(e.target.value)} className={INPUT} />
            </Field>
          </div>

          <div className="space-y-5 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-5">
            <h2 className="text-sm font-semibold">Details</h2>
            <Field label="Category" htmlFor="category" help="e.g. Machine Learning, Deep Learning, Analytics">
              <input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT} />
            </Field>
            <Field label="Technologies" htmlFor="tech" help="Comma separated.">
              <input id="tech" value={technologies} onChange={(e) => setTechnologies(e.target.value)} className={INPUT} />
            </Field>
            <Field label="Completion date" htmlFor="completion">
              <input id="completion" type="date" value={completion ?? ""} onChange={(e) => setCompletion(e.target.value)} className={INPUT} />
            </Field>
            <Field label="URL slug" htmlFor="slug" help="Generated from the title if left blank.">
              <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className={INPUT} />
            </Field>
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 accent-[var(--gold)]"
              />
              Feature on the homepage
            </label>
          </div>

          <div className="space-y-5 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-5">
            <h2 className="text-sm font-semibold">Images</h2>
            <MediaField label="Cover image" value={cover} onChange={setCover} category="projects" />

            <div>
              <span className="mb-1.5 block text-sm font-medium">
                Gallery <span className="font-normal text-[var(--muted)]">(optional)</span>
              </span>
              {gallery.length > 0 ? (
                <ul className="mb-3 grid grid-cols-3 gap-2">
                  {gallery.map((media) => (
                    <li key={media.id} className="relative">
                      <span className="relative block aspect-square overflow-hidden rounded-[var(--radius-hair)] border border-[var(--line)]">
                        <SmartImage
                          src={media.webp_url ?? media.public_url}
                          alt={media.alt_text ?? ""}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </span>
                      <button
                        type="button"
                        onClick={() => setGallery((prev) => prev.filter((m) => m.id !== media.id))}
                        aria-label={`Remove ${media.file_name} from the gallery`}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg)] text-[var(--ember)]"
                      >
                        <CloseIcon size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <AdminButton type="button" tone="secondary" onClick={() => setGalleryOpen(true)}>
                Add gallery image
              </AdminButton>
              <MediaPickerDialog
                open={galleryOpen}
                onClose={() => setGalleryOpen(false)}
                category="projects"
                onSelect={(media) =>
                  setGallery((prev) =>
                    prev.some((m) => m.id === media.id) ? prev : [...prev, media],
                  )
                }
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
