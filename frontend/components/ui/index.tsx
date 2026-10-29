import Link from "next/link";
import type { ReactNode } from "react";
import { WeaveRule } from "@/components/weave/Weave";

/* -------------------------------------------------------------- buttons */

type ButtonTone = "primary" | "secondary" | "ghost";

const TONE: Record<ButtonTone, string> = {
  primary:
    "bg-[var(--gold)] text-[var(--on-accent)] border border-[var(--gold)] hover:bg-[var(--clay)] hover:border-[var(--clay)]",
  secondary:
    "bg-transparent text-[var(--text-strong)] border border-[var(--line-strong)] hover:border-[var(--gold)] hover:text-[var(--gold)]",
  ghost:
    "bg-transparent text-[var(--muted)] border border-transparent hover:text-[var(--text-strong)]",
};

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium " +
  "rounded-[var(--radius-button)] transition-colors duration-150 " +
  "disabled:opacity-50 disabled:pointer-events-none";

export function ButtonLink({
  href, tone = "primary", external, children, className = "",
}: {
  href: string; tone?: ButtonTone; external?: boolean;
  children: ReactNode; className?: string;
}) {
  const classes = `${BUTTON_BASE} ${TONE[tone]} ${className}`;
  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  return <Link href={href} className={classes}>{children}</Link>;
}

export function Button({
  tone = "primary", className = "", ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  return <button {...props} className={`${BUTTON_BASE} ${TONE[tone]} ${className}`} />;
}

/* ------------------------------------------------------------- headings */

/**
 * Section heading with the weave rule above it. The rule replaces a card
 * border as the thing that marks where a section begins.
 */
export function SectionHeading({
  title, lead, action, id,
}: { title: string; lead?: string; action?: ReactNode; id?: string }) {
  return (
    <header className="mb-10 md:mb-14">
      <WeaveRule />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div className="max-w-2xl">
          <h2 id={id} className="text-[length:var(--text-xl)] md:text-[length:var(--text-2xl)]">
            {title}
          </h2>
          {lead ? (
            <p className="mt-3 text-[length:var(--text-md)] leading-relaxed text-[var(--muted)]">
              {lead}
            </p>
          ) : null}
        </div>
        {action}
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------- tags */

export function Tag({
  children, tone = "neutral", className = "",
}: { children: ReactNode; tone?: "neutral" | "accent" | "info"; className?: string }) {
  const tones = {
    neutral: "border-[var(--line)] text-[var(--muted)]",
    accent: "border-[var(--gold)] text-[var(--gold)]",
    info: "border-[var(--indigo)] text-[var(--indigo)]",
  };
  return (
    <span
      className={`inline-block rounded-[var(--radius-chip)] border px-2.5 py-0.5 text-[length:var(--text-xs)] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------- empty state */

/**
 * Empty states say what to do next, never just "no data" (§59).
 */
export function EmptyState({
  title, hint, action,
}: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-[var(--line-strong)] px-6 py-16 text-center rounded-[var(--radius-tile)]">
      <p className="text-[length:var(--text-md)] font-medium text-[var(--text-strong)]">{title}</p>
      {hint ? <p className="max-w-md text-sm text-[var(--muted)]">{hint}</p> : null}
      {action}
    </div>
  );
}

/* --------------------------------------------------------------- meta */

/**
 * Article and project metadata. Rendered as a real definition-free list with
 * spacing rather than strings joined by decorative middots (§54).
 */
export function MetaRow({ items, className = "" }: { items: (string | null | undefined)[]; className?: string }) {
  const visible = items.filter((item): item is string => Boolean(item));
  if (visible.length === 0) return null;
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[var(--muted)] ${className}`}>
      {visible.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
