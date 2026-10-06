"use client";

import { useState, type ReactNode } from "react";

export const INPUT =
  "w-full rounded-[var(--radius-hair)] border border-[var(--line)] bg-[var(--surface)] " +
  "px-3 py-2 text-sm placeholder:text-[var(--muted)] focus:border-[var(--gold)] focus:outline-none " +
  "disabled:opacity-60";

export function Field({
  label, htmlFor, help, error, required, children,
}: {
  label: string; htmlFor?: string; help?: string; error?: string;
  required?: boolean; children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
        {required ? null : <span className="ml-1.5 font-normal text-[var(--muted)]">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-sm text-[var(--ember)]">{error}</p>
      ) : help ? (
        <p className="mt-1.5 text-[length:var(--text-xs)] text-[var(--muted)]">{help}</p>
      ) : null}
    </div>
  );
}

export function AdminHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[length:var(--text-xl)]">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-[var(--muted)]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Banner({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  const tones = {
    error: "border-[var(--ember)] text-[var(--ember)]",
    success: "border-[var(--palm)] text-[var(--palm)]",
  };
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`mb-5 rounded-[var(--radius-hair)] border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </p>
  );
}

export function AdminButton({
  tone = "primary", className = "", ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "secondary" | "danger" }) {
  const tones = {
    primary: "border-[var(--gold)] bg-[var(--gold)] text-[var(--on-accent)] hover:bg-[var(--clay)] hover:border-[var(--clay)]",
    secondary: "border-[var(--line-strong)] hover:border-[var(--gold)] hover:text-[var(--gold)]",
    danger: "border-[var(--line-strong)] text-[var(--ember)] hover:border-[var(--ember)]",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-hair)] border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${tones[tone]} ${className}`}
    />
  );
}

/** Destructive actions always confirm first (§17). */
export function ConfirmButton({
  onConfirm, label, confirmLabel = "Confirm", busy,
}: { onConfirm: () => void; label: string; confirmLabel?: string; busy?: boolean }) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <AdminButton tone="danger" onClick={() => setArmed(true)} disabled={busy}>
        {label}
      </AdminButton>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <AdminButton tone="danger" onClick={onConfirm} disabled={busy}>
        {busy ? "Working…" : confirmLabel}
      </AdminButton>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="text-sm text-[var(--muted)] underline underline-offset-4"
      >
        Cancel
      </button>
    </span>
  );
}
