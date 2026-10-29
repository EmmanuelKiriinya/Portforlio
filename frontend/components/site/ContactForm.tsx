"use client";

import { useState } from "react";
import { submitContact, ApiError } from "@/lib/api";

type State = "idle" | "sending" | "sent" | "error";

const FIELD =
  "w-full rounded-[var(--radius-hair)] border border-[var(--line)] bg-[var(--surface)] " +
  "px-3.5 py-2.5 text-[length:var(--text-base)] placeholder:text-[var(--muted)] " +
  "focus:border-[var(--gold)] focus:outline-none";

export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /** Clear a field's error as soon as it is edited, so stale messages never
   *  sit next to input that is now valid. */
  function clearError(name: string) {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Hold the element itself: React clears event.currentTarget once the
    // handler yields, so reading it after the await below would throw.
    const formEl = event.currentTarget;
    const form = new FormData(formEl);

    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    // Validate before the round trip so the messages are immediate and specific.
    const problems: Record<string, string> = {};
    if (name.length < 2) problems.name = "Enter your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) problems.email = "Enter a valid email address.";
    if (message.length < 10) problems.message = "Add a little more detail — at least 10 characters.";

    setFieldErrors(problems);
    if (Object.keys(problems).length > 0) return;

    setState("sending");
    setError(null);

    try {
      await submitContact({
        name,
        email,
        subject: String(form.get("subject") ?? "").trim() || undefined,
        message,
        website: String(form.get("website") ?? ""), // honeypot
      });
      setState("sent");
      formEl.reset();
    } catch (err) {
      setState("error");
      setError(
        err instanceof ApiError
          ? err.message
          : "Your message could not be sent. Check your connection and try again.",
      );
    }
  }

  if (state === "sent") {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-tile)] border border-[var(--palm)] bg-[var(--surface)] p-7"
      >
        <p className="font-medium text-[var(--text-strong)]">Message sent.</p>
        <p className="mt-2 text-[var(--muted)]">
          Thanks for getting in touch — I read everything and usually reply within a few days.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-5 text-sm text-[var(--gold)] underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            onInput={() => clearError("name")}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            className={FIELD}
          />
          {fieldErrors.name ? (
            <p id="name-error" className="mt-1.5 text-sm text-[var(--ember)]">{fieldErrors.name}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            onInput={() => clearError("email")}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={FIELD}
          />
          {fieldErrors.email ? (
            <p id="email-error" className="mt-1.5 text-sm text-[var(--ember)]">{fieldErrors.email}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">
          Subject <span className="font-normal text-[var(--muted)]">(optional)</span>
        </label>
        <input id="subject" name="subject" className={FIELD} />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          onInput={() => clearError("message")}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
          className={`${FIELD} resize-y`}
        />
        {fieldErrors.message ? (
          <p id="message-error" className="mt-1.5 text-sm text-[var(--ember)]">{fieldErrors.message}</p>
        ) : null}
      </div>

      {/* Honeypot — visually and programmatically hidden from real users. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state === "error" && error ? (
        <p role="alert" className="rounded-[var(--radius-hair)] border border-[var(--ember)] px-4 py-3 text-sm text-[var(--ember)]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex items-center justify-center rounded-[var(--radius-button)] border border-[var(--gold)] bg-[var(--gold)] px-6 py-3 text-sm font-medium text-[var(--on-accent)] transition-colors hover:border-[var(--clay)] hover:bg-[var(--clay)] disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
