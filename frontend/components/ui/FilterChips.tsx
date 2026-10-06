"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/** Category/tag filters as links, so they work without JavaScript. */
export function FilterChips({
  param, options, allLabel = "All",
}: {
  param: string;
  options: { value: string; label: string }[];
  allLabel?: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get(param);

  function hrefFor(value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(param, value);
    else next.delete(param);
    next.delete("page");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  const chip = (isActive: boolean) =>
    `rounded-[var(--radius-chip)] border px-3.5 py-1.5 text-sm transition-colors ${
      isActive
        ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--on-accent)]"
        : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
    }`;

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={hrefFor(null)} className={chip(!active)} aria-current={!active ? "true" : undefined}>
        {allLabel}
      </Link>
      {options.map((option) => (
        <Link
          key={option.value}
          href={hrefFor(option.value)}
          className={chip(active === option.value)}
          aria-current={active === option.value ? "true" : undefined}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
