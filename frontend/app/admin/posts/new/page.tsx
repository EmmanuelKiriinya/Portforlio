"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader } from "@/components/admin/fields";
import { PostEditor } from "@/components/admin/PostEditor";

export default function NewPostPage() {
  return (
    <AdminShell>
      <AdminHeader title="New blog post" description="Save a draft at any point — publishing is a separate step." />
      <PostEditor />
    </AdminShell>
  );
}
