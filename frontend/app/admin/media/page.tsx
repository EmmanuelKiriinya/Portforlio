"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader } from "@/components/admin/fields";
import { MediaLibrary } from "@/components/admin/MediaPicker";

export default function MediaAdmin() {
  return (
    <AdminShell>
      <AdminHeader
        title="Media library"
        description="Upload images once and reuse them anywhere. Select a file to edit its alt text or copy its URL."
      />
      {/* The full page shows every folder; the picker dialog scopes itself. */}
      <MediaLibrary defaultCategory="all" />
    </AdminShell>
  );
}
