"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import type { Media } from "@/lib/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { AdminButton, INPUT } from "./fields";

const CATEGORIES = [
  "general", "profile", "blog", "projects", "certifications", "testimonials", "resumes",
] as const;

/**
 * The media library, usable both as a full page and as a modal picker.
 * Upload, drag-and-drop, search, alt text, copy URL, delete.
 */
export function MediaLibrary({
  onSelect, defaultCategory = "general", compact,
}: {
  onSelect?: (media: Media) => void;
  defaultCategory?: string;
  compact?: boolean;
}) {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<string>(defaultCategory);
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<Media | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listMedia({
        category: category === "all" ? undefined : category,
        q: query || undefined,
      });
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The media library could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [category, query]);

  useEffect(() => {
    const timer = window.setTimeout(load, query ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [load, query]);

  async function upload(files: FileList | File[]) {
    setUploading(true);
    setError(null);
    const list = Array.from(files);
    try {
      for (const file of list) {
        await adminApi.uploadMedia(file, category === "all" ? "general" : category);
      }
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Upload failed. Use a PNG, JPG, or WebP file under 8 MB.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(media: Media) {
    try {
      await adminApi.deleteMedia(media.id);
      setItems((prev) => prev.filter((m) => m.id !== media.id));
      if (selected?.id === media.id) setSelected(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That file could not be deleted.");
    }
  }

  async function saveAlt(media: Media, alt: string) {
    try {
      const updated = await adminApi.updateMedia(media.id, { alt_text: alt });
      setItems((prev) => prev.map((m) => (m.id === media.id ? updated : m)));
      setSelected(updated);
    } catch {
      setError("The alt text could not be saved.");
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by folder"
          className={`${INPUT} w-auto`}
        >
          <option value="all">All folders</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by file name or alt text…"
          aria-label="Search media"
          className={`${INPUT} w-auto flex-1 min-w-[12rem]`}
        />

        <AdminButton onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading…" : "Upload image"}
        </AdminButton>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          multiple
          hidden
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
      </div>

      {error ? (
        <p role="alert" className="mb-4 rounded-[var(--radius-hair)] border border-[var(--ember)] px-4 py-3 text-sm text-[var(--ember)]">
          {error}
        </p>
      ) : null}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
        }}
        className={`rounded-[var(--radius-tile)] border-2 border-dashed p-4 transition-colors ${
          dragging ? "border-[var(--gold)] bg-[var(--gold-soft)]" : "border-[var(--line)]"
        }`}
      >
        {loading ? (
          <p className="py-10 text-center text-sm text-[var(--muted)]">Loading…</p>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-medium">
              {query
                ? "No images matched your search."
                : category === "all"
                  ? "No images uploaded yet."
                  : `No images in the ${category} folder yet.`}
            </p>
            <p className="mt-1.5 text-sm text-[var(--muted)]">
              {query
                ? "Try a different term, or clear the search."
                : "Drag files here, or use Upload image. PNG, JPG, WebP or SVG up to 8 MB."}
            </p>
          </div>
        ) : (
          <ul className={`grid gap-3 ${compact ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"}`}>
            {items.map((media) => (
              <li key={media.id}>
                <button
                  type="button"
                  onClick={() => (onSelect ? onSelect(media) : setSelected(media))}
                  className={`group block w-full overflow-hidden rounded-[var(--radius-hair)] border text-left transition-colors ${
                    selected?.id === media.id
                      ? "border-[var(--gold)]"
                      : "border-[var(--line)] hover:border-[var(--gold)]"
                  }`}
                >
                  <span className="relative block aspect-square bg-[var(--bg-raised)]">
                    <SmartImage
                      src={media.webp_url ?? media.public_url}
                      alt={media.alt_text ?? media.file_name}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </span>
                  <span className="block truncate px-2 py-1.5 text-[length:var(--text-xs)] text-[var(--muted)]">
                    {media.file_name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && !onSelect ? (
        <div className="mt-6 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-medium">{selected.file_name}</p>
              <p className="mt-1 text-[length:var(--text-xs)] text-[var(--muted)]">
                {selected.width && selected.height ? `${selected.width}×${selected.height} · ` : ""}
                {(selected.size_bytes / 1024).toFixed(0)} KB ·{" "}
                {new Date(selected.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-sm text-[var(--muted)] underline underline-offset-4"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              defaultValue={selected.alt_text ?? ""}
              onBlur={(e) => saveAlt(selected, e.target.value)}
              placeholder="Describe this image for screen readers"
              aria-label="Alt text"
              className={INPUT}
            />
            <div className="flex gap-2">
              <AdminButton
                tone="secondary"
                onClick={() => navigator.clipboard?.writeText(selected.public_url)}
              >
                Copy URL
              </AdminButton>
              <AdminButton tone="danger" onClick={() => remove(selected)}>
                Delete
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Modal wrapper used by forms that need to choose one image. */
export function MediaPickerDialog({
  open, onClose, onSelect, category,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (media: Media) => void;
  category?: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose an image"
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-10"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-4xl rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--bg)] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[length:var(--text-lg)]">Choose an image</h2>
          <button type="button" onClick={onClose} className="text-sm text-[var(--muted)] underline underline-offset-4">
            Close
          </button>
        </div>
        <MediaLibrary
          compact
          defaultCategory={category ?? "general"}
          onSelect={(media) => { onSelect(media); onClose(); }}
        />
      </div>
    </div>
  );
}

/** A single image field: preview, choose, clear. */
export function MediaField({
  value, onChange, category, label,
}: {
  value: Media | null;
  onChange: (media: Media | null) => void;
  category?: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">
        {label} <span className="font-normal text-[var(--muted)]">(optional)</span>
      </span>
      <div className="flex items-center gap-3">
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-hair)] border border-[var(--line)] bg-[var(--bg-raised)]">
          {value ? (
            <SmartImage
              src={value.webp_url ?? value.public_url}
              alt={value.alt_text ?? ""}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[length:var(--text-xs)] text-[var(--muted)]">
              None
            </span>
          )}
        </span>
        <AdminButton type="button" tone="secondary" onClick={() => setOpen(true)}>
          {value ? "Replace" : "Choose image"}
        </AdminButton>
        {value ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ember)]"
          >
            Remove
          </button>
        ) : null}
      </div>
      <MediaPickerDialog
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onChange}
        category={category}
      />
    </div>
  );
}
