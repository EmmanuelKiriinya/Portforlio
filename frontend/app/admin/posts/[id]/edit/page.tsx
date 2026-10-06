"use client";

import { use, useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import type { Post } from "@/lib/types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader, Banner } from "@/components/admin/fields";
import { PostEditor } from "@/components/admin/PostEditor";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getPost(Number(id))
      .then(setPost)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "That post could not be loaded."),
      );
  }, [id]);

  return (
    <AdminShell>
      <AdminHeader title="Edit post" />
      {error ? <Banner tone="error">{error}</Banner> : null}
      {post ? <PostEditor post={post} /> : !error ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : null}
    </AdminShell>
  );
}
