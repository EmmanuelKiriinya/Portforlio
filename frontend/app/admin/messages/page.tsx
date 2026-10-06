"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import type { ContactMessage } from "@/lib/types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton, AdminHeader, Banner, ConfirmButton } from "@/components/admin/fields";
import { formatFullDate } from "@/lib/utils";

export default function MessagesAdmin() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [archived, setArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMessages(await adminApi.messages(archived));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Messages could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [archived]);

  useEffect(() => { load(); }, [load]);

  async function expand(message: ContactMessage) {
    const next = open === message.id ? null : message.id;
    setOpen(next);
    if (next !== null && !message.read) {
      try {
        await adminApi.markMessageRead(message.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, read: true } : m)),
        );
      } catch {
        /* marking read is not worth interrupting the reader for */
      }
    }
  }

  return (
    <AdminShell>
      <AdminHeader
        title="Messages"
        description="Everything sent through the contact form on your site."
        actions={
          <AdminButton tone="secondary" onClick={() => setArchived((v) => !v)}>
            {archived ? "Show inbox" : "Show archived"}
          </AdminButton>
        }
      />

      {error ? <Banner tone="error">{error}</Banner> : null}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : messages.length === 0 ? (
        <div className="rounded-[var(--radius-tile)] border border-dashed border-[var(--line-strong)] px-6 py-14 text-center">
          <p className="font-medium">
            {archived ? "Nothing archived." : "No messages yet."}
          </p>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            {archived
              ? "Messages you archive from the inbox appear here."
              : "Anything sent through your contact form will arrive here."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--line)] rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)]">
          {messages.map((message) => (
            <li key={message.id}>
              <button
                type="button"
                onClick={() => expand(message)}
                aria-expanded={open === message.id}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`truncate ${message.read ? "" : "font-semibold"}`}>
                      {message.name}
                    </span>
                    {message.read ? null : (
                      <span className="shrink-0 rounded-[var(--radius-chip)] bg-[var(--gold)] px-2 py-0.5 text-[length:var(--text-2xs)] text-[var(--on-accent)]">
                        New
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-[var(--muted)]">
                    {message.subject || message.message}
                  </span>
                </span>
                <time className="shrink-0 text-[length:var(--text-xs)] text-[var(--muted)]">
                  {formatFullDate(message.created_at)}
                </time>
              </button>

              {open === message.id ? (
                <div className="border-t border-[var(--line)] bg-[var(--bg-raised)] px-5 py-5">
                  <dl className="grid gap-1 text-sm">
                    <div className="flex gap-2">
                      <dt className="text-[var(--muted)]">From</dt>
                      <dd>
                        <a
                          href={`mailto:${message.email}`}
                          className="text-[var(--gold)] underline underline-offset-4"
                        >
                          {message.email}
                        </a>
                      </dd>
                    </div>
                    {message.subject ? (
                      <div className="flex gap-2">
                        <dt className="text-[var(--muted)]">Subject</dt>
                        <dd>{message.subject}</dd>
                      </div>
                    ) : null}
                  </dl>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
                    {message.message}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <a
                      href={`mailto:${message.email}?subject=${encodeURIComponent(
                        message.subject ? `Re: ${message.subject}` : "Re: your message",
                      )}`}
                      className="rounded-[var(--radius-hair)] border border-[var(--gold)] bg-[var(--gold)] px-4 py-2 text-sm font-medium text-[var(--on-accent)]"
                    >
                      Reply by email
                    </a>
                    {!message.archived ? (
                      <AdminButton
                        tone="secondary"
                        onClick={async () => {
                          await adminApi.archiveMessage(message.id);
                          load();
                        }}
                      >
                        Archive
                      </AdminButton>
                    ) : null}
                    <ConfirmButton
                      label="Delete"
                      confirmLabel="Delete permanently"
                      onConfirm={async () => {
                        await adminApi.deleteMessage(message.id);
                        load();
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
