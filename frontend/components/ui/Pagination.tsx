"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function Pagination({ page, pages }: { page: number; pages: number }) {
  const pathname = usePathname();
  const params = useSearchParams();

  if (pages <= 1) return null;

  function hrefFor(target: number) {
    const next = new URLSearchParams(params.toString());
    if (target > 1) next.set("page", String(target));
    else next.delete("page");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  // Window of pages around the current one, so long archives stay usable.
  const window_ = 2;
  const numbers: number[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= window_) numbers.push(i);
  }

  return (
    <nav className="mt-12 flex items-center justify-between gap-4" aria-label="Pagination">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          className="rounded-[var(--radius-hair)] border border-[var(--line-strong)] px-4 py-2 text-sm transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
        >
          Previous
        </Link>
      ) : (
        <span />
      )}

      <ol className="flex items-center gap-1.5">
        {numbers.map((number, i) => {
          const gap = i > 0 && number - numbers[i - 1] > 1;
          return (
            <li key={number} className="flex items-center gap-1.5">
              {gap ? <span className="px-1 text-[var(--muted)]">…</span> : null}
              <Link
                href={hrefFor(number)}
                aria-current={number === page ? "page" : undefined}
                className={`flex h-9 min-w-9 items-center justify-center rounded-[var(--radius-hair)] px-2 text-sm transition-colors ${
                  number === page
                    ? "bg-[var(--gold)] text-[var(--on-accent)]"
                    : "border border-[var(--line)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                }`}
              >
                {number}
              </Link>
            </li>
          );
        })}
      </ol>

      {page < pages ? (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          className="rounded-[var(--radius-hair)] border border-[var(--line-strong)] px-4 py-2 text-sm transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
        >
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
