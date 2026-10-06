"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, type resource } from "@/lib/api";
import type { Media } from "@/lib/types";
import { AdminButton, Banner, ConfirmButton, Field, INPUT } from "./fields";
import { MediaField } from "./MediaPicker";
import { ChevronUpIcon, ChevronDownIcon, CloseIcon } from "@/components/ui/icons";

export type FieldDef =
  | { name: string; label: string; type: "text" | "url" | "email" | "date" | "number"; help?: string; required?: boolean; placeholder?: string; full?: boolean }
  | { name: string; label: string; type: "textarea"; rows?: number; help?: string; required?: boolean; full?: boolean }
  | { name: string; label: string; type: "checkbox"; help?: string }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[]; help?: string; required?: boolean }
  | { name: string; label: string; type: "media"; category?: string; help?: string }
  | { name: string; label: string; type: "bullets"; itemLabel: string; help?: string; full?: boolean };

/** Any API row. Field access goes through a cast, since interfaces have no
 *  implicit index signature. */
type Row = { id: number };

interface Props<T extends Row> {
  resourceClient: ReturnType<typeof resource<T>>;
  fields: FieldDef[];
  /** How each row is summarised in the list. */
  describe: (item: T) => { title: string; subtitle?: string; meta?: string };
  emptyTitle: string;
  emptyHint: string;
  addLabel: string;
  entityName: string;
  /** Values applied when opening a blank form. */
  defaults?: Record<string, unknown>;
}

/**
 * List + form for the collections that share the same shape. Writing this once
 * keeps every admin screen behaving identically — same confirm flow, same
 * error wording, same ordering controls.
 */
export function CollectionManager<T extends Row>({
  resourceClient, fields, describe, emptyTitle, emptyHint, addLabel, entityName, defaults = {},
}: Props<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<T | "new" | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await resourceClient.list());
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `The ${entityName} list could not be loaded.`);
    } finally {
      setLoading(false);
    }
  }, [resourceClient, entityName]);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setForm({ ...defaults });
    setEditing("new");
    setNotice(null);
  }

  function openEdit(item: T) {
    const source = item as unknown as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.type === "media") {
        // The API returns the nested object but accepts the id.
        next[field.name] = source[field.name.replace(/_id$/, "")] ?? null;
      } else if (field.type === "select" && field.name.endsWith("_id")) {
        // Relations come back nested (`category`), but are written by id.
        const nested = source[field.name.replace(/_id$/, "")] as { id: number } | null;
        const direct = source[field.name];
        next[field.name] = direct != null ? String(direct) : nested ? String(nested.id) : "";
      } else if (field.type === "bullets") {
        const list = source[field.name];
        next[field.name] = Array.isArray(list)
          ? (list as { content: string }[]).map((entry) => entry.content)
          : [];
      } else {
        next[field.name] = source[field.name] ?? (field.type === "checkbox" ? false : "");
      }
    }
    setForm(next);
    setEditing(item);
    setNotice(null);
  }

  function buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = form[field.name];
      if (field.type === "media") {
        payload[field.name] = (raw as Media | null)?.id ?? null;
      } else if (field.type === "bullets") {
        payload[field.name] = (raw as string[])
          .map((content) => content.trim())
          .filter(Boolean)
          .map((content, index) => ({ content, display_order: index }));
      } else if (field.type === "number") {
        payload[field.name] = raw === "" || raw == null ? 0 : Number(raw);
      } else if (field.type === "checkbox") {
        payload[field.name] = Boolean(raw);
      } else if (field.type === "select" && field.name.endsWith("_id")) {
        payload[field.name] = raw === "" || raw == null ? null : Number(raw);
      } else if (field.type === "date") {
        payload[field.name] = raw === "" ? null : raw;
      } else {
        const value = typeof raw === "string" ? raw.trim() : raw;
        payload[field.name] = value === "" ? null : value;
      }
    }
    return payload;
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = buildPayload();
      if (editing === "new") await resourceClient.create(payload);
      else if (editing) await resourceClient.update(editing.id, payload);
      await load();
      setEditing(null);
      setNotice(editing === "new" ? `${capitalize(entityName)} added.` : "Changes saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That could not be saved. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: T) {
    setBusy(true);
    try {
      await resourceClient.remove(item.id);
      await load();
      setNotice(`${capitalize(entityName)} deleted.`);
      if (editing !== "new" && editing?.id === item.id) setEditing(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That could not be deleted.");
    } finally {
      setBusy(false);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    try {
      await resourceClient.reorder(next.map((item) => item.id));
    } catch {
      setError("The new order could not be saved.");
      load();
    }
  }

  return (
    <div>
      {error ? <Banner tone="error">{error}</Banner> : null}
      {notice ? <Banner tone="success">{notice}</Banner> : null}

      {editing ? (
        <form
          onSubmit={save}
          className="mb-8 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-6"
        >
          <h2 className="mb-5 text-[length:var(--text-lg)]">
            {editing === "new" ? addLabel : `Edit ${entityName}`}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className={"full" in field && field.full ? "sm:col-span-2" : undefined}>
                <FieldInput
                  field={field}
                  value={form[field.name]}
                  onChange={(value) => setForm((prev) => ({ ...prev, [field.name]: value }))}
                />
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <AdminButton type="submit" disabled={busy}>
              {busy ? "Saving…" : editing === "new" ? "Add" : "Save changes"}
            </AdminButton>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-sm text-[var(--muted)] underline underline-offset-4"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <AdminButton onClick={openNew} className="mb-6">{addLabel}</AdminButton>
      )}

      {loading ? (
        <p className="py-10 text-sm text-[var(--muted)]">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-[var(--radius-tile)] border border-dashed border-[var(--line-strong)] px-6 py-14 text-center">
          <p className="font-medium">{emptyTitle}</p>
          <p className="mt-1.5 text-sm text-[var(--muted)]">{emptyHint}</p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--line)] rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)]">
          {items.map((item, index) => {
            const summary = describe(item);
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="flex shrink-0 flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${summary.title} up`}
                    className="px-1 text-[var(--muted)] transition-colors hover:text-[var(--gold)] disabled:opacity-25"
                  >
                    <ChevronUpIcon size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    aria-label={`Move ${summary.title} down`}
                    className="px-1 text-[var(--muted)] transition-colors hover:text-[var(--gold)] disabled:opacity-25"
                  >
                    <ChevronDownIcon size={14} />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{summary.title}</p>
                  {summary.subtitle ? (
                    <p className="truncate text-sm text-[var(--muted)]">{summary.subtitle}</p>
                  ) : null}
                </div>

                {summary.meta ? (
                  <p className="shrink-0 text-[length:var(--text-xs)] text-[var(--muted)]">{summary.meta}</p>
                ) : null}

                <div className="flex shrink-0 gap-2">
                  <AdminButton tone="secondary" onClick={() => openEdit(item)}>Edit</AdminButton>
                  <ConfirmButton
                    label="Delete"
                    confirmLabel="Delete permanently"
                    busy={busy}
                    onConfirm={() => remove(item)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FieldInput({
  field, value, onChange,
}: { field: FieldDef; value: unknown; onChange: (value: unknown) => void }) {
  const id = `field-${field.name}`;

  switch (field.type) {
    case "textarea":
      return (
        <Field label={field.label} htmlFor={id} help={field.help} required={field.required}>
          <textarea
            id={id}
            rows={field.rows ?? 4}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className={`${INPUT} resize-y`}
          />
        </Field>
      );

    case "checkbox":
      return (
        <label htmlFor={id} className="flex items-center gap-2.5 pt-6 text-sm">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-[var(--gold)]"
          />
          <span>
            {field.label}
            {field.help ? (
              <span className="block text-[length:var(--text-xs)] text-[var(--muted)]">{field.help}</span>
            ) : null}
          </span>
        </label>
      );

    case "select":
      return (
        <Field label={field.label} htmlFor={id} help={field.help} required={field.required}>
          <select
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={INPUT}
          >
            <option value="">Not set</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>
      );

    case "media":
      return (
        <MediaField
          label={field.label}
          category={field.category}
          value={(value as Media | null) ?? null}
          onChange={onChange}
        />
      );

    case "bullets": {
      const list = (value as string[]) ?? [];
      return (
        <Field label={field.label} help={field.help}>
          <ul className="space-y-2">
            {list.map((entry, index) => (
              <li key={index} className="flex gap-2">
                <input
                  value={entry}
                  onChange={(e) => {
                    const next = [...list];
                    next[index] = e.target.value;
                    onChange(next);
                  }}
                  aria-label={`${field.itemLabel} ${index + 1}`}
                  className={INPUT}
                />
                <button
                  type="button"
                  onClick={() => onChange(list.filter((_, i) => i !== index))}
                  aria-label={`Remove ${field.itemLabel} ${index + 1}`}
                  className="shrink-0 px-2 text-[var(--muted)] transition-colors hover:text-[var(--ember)]"
                >
                  <CloseIcon size={14} />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onChange([...list, ""])}
            className="mt-2.5 text-sm text-[var(--gold)] underline underline-offset-4"
          >
            Add {field.itemLabel}
          </button>
        </Field>
      );
    }

    default:
      return (
        <Field label={field.label} htmlFor={id} help={field.help} required={field.required}>
          <input
            id={id}
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className={INPUT}
          />
        </Field>
      );
  }
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
