"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader, Banner } from "@/components/admin/fields";
import { formatFullDate } from "@/lib/utils";

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const body = (
    <>
      <dt className="text-sm text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-[length:var(--text-2xl)] font-semibold text-[var(--text-strong)]">
        {value}
      </dd>
    </>
  );
  const classes =
    "block rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-5 transition-colors";

  return href ? (
    <Link href={href} className={`${classes} hover:border-[var(--gold)]`}>{body}</Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .stats()
      .then(setStats)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "The dashboard could not be loaded."),
      );
  }, []);

  return (
    <AdminShell>
      <AdminHeader
        title="Dashboard"
        description="A summary of what is on the site, and quick ways to add more."
      />

      {error ? <Banner tone="error">{error}</Banner> : null}

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/admin/posts/new"
          className="rounded-[var(--radius-hair)] border border-[var(--gold)] bg-[var(--gold)] px-4 py-2 text-sm font-medium text-[var(--on-accent)] transition-colors hover:border-[var(--clay)] hover:bg-[var(--clay)]"
        >
          New blog post
        </Link>
        <Link
          href="/admin/projects/new"
          className="rounded-[var(--radius-hair)] border border-[var(--line-strong)] px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
        >
          New project
        </Link>
        <Link
          href="/admin/media"
          className="rounded-[var(--radius-hair)] border border-[var(--line-strong)] px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
        >
          Upload media
        </Link>
      </div>

      {!stats ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : (
        <>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Published posts" value={stats.published_posts} href="/admin/posts" />
            <StatCard label="Drafts" value={stats.draft_posts} href="/admin/posts?status=draft" />
            <StatCard label="Projects" value={stats.total_projects} href="/admin/projects" />
            <StatCard label="Unread messages" value={stats.unread_messages} href="/admin/messages" />
            <StatCard label="Certifications" value={stats.total_certifications} href="/admin/certifications" />
            <StatCard label="Testimonials" value={stats.total_testimonials} href="/admin/testimonials" />
            <StatCard label="Media files" value={stats.total_media} href="/admin/media" />
            <StatCard label="All posts" value={stats.total_posts} href="/admin/posts" />
          </dl>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <section>
              <h2 className="mb-4 text-[length:var(--text-md)] font-semibold">Recently edited</h2>
              {stats.recent_posts.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  No posts yet. Create your first article to see it here.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--line)] rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)]">
                  {stats.recent_posts.map((post) => (
                    <li key={post.id} className="flex items-center gap-4 px-4 py-3">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="min-w-0 flex-1 truncate text-sm hover:text-[var(--gold)]"
                      >
                        {post.title}
                      </Link>
                      <span
                        className={`shrink-0 text-[length:var(--text-xs)] ${
                          post.status === "published" ? "text-[var(--palm)]" : "text-[var(--muted)]"
                        }`}
                      >
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-[length:var(--text-md)] font-semibold">Recent messages</h2>
              {stats.recent_messages.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  No messages yet. Anything sent through the contact form arrives here.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--line)] rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)]">
                  {stats.recent_messages.map((message) => (
                    <li key={message.id} className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium">
                          {message.name}
                          {message.read ? null : (
                            <span className="ml-2 text-[length:var(--text-xs)] text-[var(--gold)]">New</span>
                          )}
                        </p>
                        <time className="shrink-0 text-[length:var(--text-xs)] text-[var(--muted)]">
                          {formatFullDate(message.created_at)}
                        </time>
                      </div>
                      <p className="mt-1 truncate text-sm text-[var(--muted)]">
                        {message.subject || message.message}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/admin/messages"
                className="mt-3 inline-block text-sm text-[var(--gold)] underline underline-offset-4"
              >
                All messages
              </Link>
            </section>
          </div>
        </>
      )}
    </AdminShell>
  );
}
