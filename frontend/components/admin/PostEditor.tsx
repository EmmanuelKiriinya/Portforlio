"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminApi, ApiError, resources } from "@/lib/api";
import type { BlogCategory, Media, Post } from "@/lib/types";
import { RichTextEditor } from "./Editor";
import { MediaField } from "./MediaPicker";
import { AdminButton, Banner, ConfirmButton, Field, INPUT } from "./fields";
import { CloseIcon } from "@/components/ui/icons";

interface Draft {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: string;
  featured: boolean;
  seo_title: string;
  seo_description: string;
  tags: string[];
}

const EMPTY: Draft = {
  title: "", slug: "", excerpt: "", content: "", category_id: "",
  featured: false, seo_title: "", seo_description: "", tags: [],
};

export function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(
    post
      ? {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content ?? "",
          category_id: post.category ? String(post.category.id) : "",
          featured: post.featured,
          seo_title: post.seo_title ?? "",
          seo_description: post.seo_description ?? "",
          tags: post.tags.map((t) => t.name),
        }
      : EMPTY,
  );
  const [cover, setCover] = useState<Media | null>(post?.cover_image ?? null);
  const [social, setSocial] = useState<Media | null>(post?.social_image ?? null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [id, setId] = useState<number | null>(post?.id ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    resources.blogCategories.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function payload() {
    return {
      title: draft.title.trim(),
      slug: draft.slug.trim() || undefined,
      excerpt: draft.excerpt.trim() || null,
      content: draft.content,
      cover_image_id: cover?.id ?? null,
      social_image_id: social?.id ?? null,
      category_id: draft.category_id ? Number(draft.category_id) : null,
      featured: draft.featured,
      seo_title: draft.seo_title.trim() || null,
      seo_description: draft.seo_description.trim() || null,
      tag_names: draft.tags,
    };
  }

  /** Save without changing whether the post is live. */
  async function save(): Promise<number | null> {
    if (!draft.title.trim()) {
      setError("Give the post a title before saving.");
      return null;
    }
    setBusy(true);
    setError(null);
    try {
      const saved = id
        ? await adminApi.updatePost(id, payload())
        : await adminApi.createPost({ ...payload(), status: "draft" });
      setId(saved.id);
      setStatus(saved.status);
      setDraft((prev) => ({ ...prev, slug: saved.slug }));
      setNotice("Draft saved.");
      if (!id) router.replace(`/admin/posts/${saved.id}/edit`);
      return saved.id;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The post could not be saved.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    const savedId = await save();
    if (!savedId) return;
    setBusy(true);
    try {
      const published = await adminApi.publishPost(savedId);
      setStatus(published.status);
      setNotice("Published. It is live on the blog now.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The post could not be published.");
    } finally {
      setBusy(false);
    }
  }

  async function unpublish() {
    if (!id) return;
    setBusy(true);
    try {
      const updated = await adminApi.unpublishPost(id);
      setStatus(updated.status);
      setNotice("Unpublished. It is now a draft and hidden from the blog.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The post could not be unpublished.");
    } finally {
      setBusy(false);
    }
  }

  function addTag(raw: string) {
    const name = raw.trim().replace(/,$/, "");
    if (!name || draft.tags.includes(name)) return;
    set("tags", [...draft.tags, name]);
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
          <AdminButton tone="secondary" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save draft"}
          </AdminButton>
          {status === "published" ? (
            <AdminButton tone="secondary" onClick={unpublish} disabled={busy}>
              Unpublish
            </AdminButton>
          ) : (
            <AdminButton onClick={publish} disabled={busy}>Publish</AdminButton>
          )}
          {id && status === "published" ? (
            <a
              href={`/blog/${draft.slug}`}
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
              confirmLabel="Move to trash"
              busy={busy}
              onConfirm={async () => {
                await adminApi.deletePost(id);
                router.push("/admin/posts");
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
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              className={`${INPUT} text-[length:var(--text-lg)]`}
              placeholder="What is this article about?"
            />
          </Field>

          <Field label="Excerpt" htmlFor="excerpt" help="Shown on the blog index and in search results.">
            <textarea
              id="excerpt"
              rows={3}
              value={draft.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              className={`${INPUT} resize-y`}
            />
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-medium">Content</span>
            <RichTextEditor
              value={draft.content}
              onChange={(html) => set("content", html)}
              placeholder="Write the article. Use the toolbar for headings, code blocks, tables and images."
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="space-y-5 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-5">
            <h2 className="text-sm font-semibold">Organisation</h2>

            <Field label="Category" htmlFor="category">
              <select
                id="category"
                value={draft.category_id}
                onChange={(e) => set("category_id", e.target.value)}
                className={INPUT}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Tags" htmlFor="tags" help="Press Enter or comma to add. New tags are created automatically.">
              <input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag(tagInput);
                    setTagInput("");
                  }
                }}
                onBlur={() => { addTag(tagInput); setTagInput(""); }}
                className={INPUT}
              />
              {draft.tags.length > 0 ? (
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {draft.tags.map((tag) => (
                    <li key={tag}>
                      <button
                        type="button"
                        onClick={() => set("tags", draft.tags.filter((t) => t !== tag))}
                        className="inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-[var(--line)] px-2.5 py-0.5 text-[length:var(--text-xs)] text-[var(--muted)] hover:border-[var(--ember)] hover:text-[var(--ember)]"
                      >
                        {tag}
                        <CloseIcon size={11} />
                        <span className="sr-only">Remove tag</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Field>

            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 accent-[var(--gold)]"
              />
              Feature this article
            </label>

            <Field label="URL slug" htmlFor="slug" help="Generated from the title if left blank.">
              <input
                id="slug"
                value={draft.slug}
                onChange={(e) => set("slug", e.target.value)}
                className={INPUT}
              />
            </Field>
          </div>

          <div className="space-y-5 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-5">
            <h2 className="text-sm font-semibold">Images</h2>
            <MediaField label="Cover image" value={cover} onChange={setCover} category="blog" />
            <MediaField label="Social share image" value={social} onChange={setSocial} category="blog" />
          </div>

          <div className="space-y-5 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-5">
            <h2 className="text-sm font-semibold">Search appearance</h2>
            <p className="text-[length:var(--text-xs)] text-[var(--muted)]">
              Leave these blank and the title and excerpt are used instead.
            </p>
            <Field label="SEO title" htmlFor="seo_title">
              <input
                id="seo_title"
                value={draft.seo_title}
                onChange={(e) => set("seo_title", e.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="Meta description" htmlFor="seo_description">
              <textarea
                id="seo_description"
                rows={3}
                value={draft.seo_description}
                onChange={(e) => set("seo_description", e.target.value)}
                className={`${INPUT} resize-y`}
              />
            </Field>
          </div>
        </aside>
      </div>
    </div>
  );
}
