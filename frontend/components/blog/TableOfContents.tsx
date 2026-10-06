"use client";

import { useEffect, useState } from "react";

/** Highlights the section currently in view (§18). */
export function TableOfContents({
  headings,
}: { headings: { id: string; text: string; level: number }[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Bias toward the upper third so the heading you are reading wins.
      { rootMargin: "-80px 0px -66% 0px", threshold: 0 },
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav aria-labelledby="toc-heading" className="lg:sticky lg:top-24">
      <h2 id="toc-heading" className="text-sm font-semibold text-[var(--text-strong)]">
        On this page
      </h2>
      <ol className="mt-4 space-y-2.5 border-l border-[var(--line)]">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: heading.level === 3 ? "1.5rem" : "0.85rem" }}>
            <a
              href={`#${heading.id}`}
              aria-current={active === heading.id ? "true" : undefined}
              className={`-ml-px block border-l-2 pl-3 text-sm leading-snug transition-colors ${
                active === heading.id
                  ? "border-[var(--gold)] text-[var(--gold)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--text-strong)]"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
