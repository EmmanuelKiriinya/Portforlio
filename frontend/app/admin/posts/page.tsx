"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import type { PostSummary } from "@/lib/types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton, AdminHeader, Banner, INPUT } from "@/components/admin/fields";
import { formatFullDate } from "@/lib/utils";

type Filter = "all" | "published" | "draft" | "trash";

export default function PostsAdmin() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (filter === "trash") {
        setPosts(await adminApi.trashedPosts());
      } else {
        const data = await adminApi.listPosts({
          status: filter === "all" ? undefined : filter,
          q: query || undefined,
        });
        setPosts(data.items);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Posts could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filter, query]);

  useEffect(() => {
    const timer = window.setTimeout(load, query ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [load, query]);

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Drafts" },
    { value: "trash", label: "Trash" },
  ];

  return (
    <AdminShell>
      <AdminHeader
        title="Blog posts"
        description="Write, edit, and publish articles."
        actions={
          <Link
            href="/admin/posts/new"
            className="rounded-[var(--radius-hair)] border border-[var(--gold)] bg-[var(--gold)] px-4 py-2 text-sm font-medium text-[var(--on-accent)] transition-colors hover:border-[var(--clay)] hover:bg-[var(--clay)]"
          >
            New blog post
          </Link>
        }
      />

      {error ? <Banner tone="error">{error}</Banner> : null}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
              className={`rounded-[var(--radius-chip)] border px-3.5 py-1.5 text-sm transition-colors ${
                filter === item.value
                  ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--on-accent)]"
                  : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {filter !== "trash" ? (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts…"
            aria-label="Search posts"
            className={`${INPUT} w-auto flex-1 min-w-[12rem]`}
          />
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : posts.length === 0 ? (
        <div className="rounded-[var(--radius-tile)] border border-dashed border-[var(--line-strong)] px-6 py-14 text-center">
          <p className="font-medium">
            {query
              ? "No posts matched your search."
              : filter === "trash"
                ? "The trash is empty."
                : "No posts yet. Create your first article to publish it here."}
          </p>
          {filter !== "trash" && !query ? (
            <Link
              href="/admin/posts/new"
              className="mt-4 inline-block text-sm text-[var(--gold)] underline underline-offset-4"
            >
              Write your first post
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="divide-y divide-[var(--line)] rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)]">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{post.title}</p>
                <p className="mt-0.5 truncate text-sm text-[var(--muted)]">
                  {post.category?.name ?? "No category"}
                  {post.published_at ? ` · ${formatFullDate(post.published_at)}` : ""}
                  {` · ${post.reading_minutes} min read`}
                </p>
              </div>

              <span
                className={`shrink-0 text-[length:var(--text-xs)] ${
                  post.status === "published" ? "text-[var(--palm)]" : "text-[var(--muted)]"
                }`}
              >
                {post.status === "published" ? "Published" : "Draft"}
              </span>

              <div className="flex shrink-0 gap-2">
                {filter === "trash" ? (
                  <AdminButton
                    tone="secondary"
                    onClick={async () => { await adminApi.restorePost(post.id); load(); }}
                  >
                    Restore
                  </AdminButton>
                ) : (
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="rounded-[var(--radius-hair)] border border-[var(--line-strong)] px-4 py-2 text-sm transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
