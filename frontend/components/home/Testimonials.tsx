"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Testimonial } from "@/lib/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { imageUrl, altText, initials } from "@/lib/utils";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";

/**
 * Accessible carousel (§21): arrow-key navigation, swipe on touch, autoplay
 * that stops on any interaction and never starts under reduced motion.
 *
 * No card border here — the quote mark and a hairline above the attribution
 * do the structural work instead.
 */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  const count = testimonials.length;
  const go = useCallback(
    (next: number) => setIndex((next + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), 8000);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPaused(true);
      go(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setPaused(true);
      go(index + 1);
    }
  }

  if (count === 0) return null;
  const current = testimonials[index];

  return (
    <div
      ref={regionRef}
      role="group"
      aria-roledescription="carousel"
      aria-label="What people say"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(delta) > 45) go(delta > 0 ? index - 1 : index + 1);
        touchStart.current = null;
      }}
      className="relative rounded-[var(--radius-tile)]"
    >
      {/* Weight 4 of the weave: a decorative quotation mark. */}
      <svg
        width="52"
        height="42"
        viewBox="0 0 52 42"
        aria-hidden="true"
        className="mb-6 opacity-90"
      >
        <polygon points="0,42 12,0 22,0 12,42" fill="var(--gold)" />
        <polygon points="16,42 28,0 38,0 28,42" fill="var(--clay)" opacity="0.8" />
        <polygon points="32,42 44,0 52,0 42,42" fill="var(--plum)" opacity="0.6" />
      </svg>

      <div aria-live="polite" aria-atomic="true">
        <blockquote key={current.id} className="rise">
          <p className="max-w-3xl font-[family-name:var(--font-body)] text-[length:var(--text-lg)] leading-[1.65] text-[var(--text)] md:text-[length:var(--text-xl)] md:leading-[1.5]">
            {current.content}
          </p>

          <footer className="mt-8 flex items-center gap-4 border-t border-[var(--line)] pt-6">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--bg-raised)]">
              <SmartImage
                src={imageUrl(current.profile_image)}
                alt={altText(current.profile_image, current.name)}
                fill
                sizes="48px"
                className="object-cover"
                fallback={
                  <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--muted)]">
                    {initials(current.name)}
                  </span>
                }
              />
            </span>

            <div className="min-w-0">
              <p className="font-medium text-[var(--text-strong)]">{current.name}</p>
              <p className="text-sm text-[var(--muted)]">
                {[current.title, current.organization].filter(Boolean).join(", ")}
              </p>
            </div>

            {current.linkedin_url ? (
              <a
                href={current.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto shrink-0 rounded-[var(--radius-hair)] border border-[var(--line-strong)] px-3.5 py-2 text-sm transition-colors hover:border-[var(--indigo)] hover:text-[var(--indigo)]"
              >
                LinkedIn
                <span className="sr-only"> profile for {current.name}</span>
              </a>
            ) : null}
          </footer>
        </blockquote>
      </div>

      {count > 1 ? (
        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => { setPaused(true); go(index - 1); }}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-hair)] border border-[var(--line)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            <ArrowLeftIcon size={15} />
            <span className="sr-only">Previous testimonial</span>
          </button>
          <button
            type="button"
            onClick={() => { setPaused(true); go(index + 1); }}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-hair)] border border-[var(--line)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            <ArrowRightIcon size={15} />
            <span className="sr-only">Next testimonial</span>
          </button>

          <ol className="flex items-center gap-2">
            {testimonials.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => { setPaused(true); setIndex(i); }}
                  aria-current={i === index ? "true" : undefined}
                  className={`block h-[3px] transition-all ${
                    i === index ? "w-8 bg-[var(--gold)]" : "w-4 bg-[var(--line-strong)] hover:bg-[var(--muted)]"
                  }`}
                >
                  <span className="sr-only">Show testimonial {i + 1} of {count}</span>
                </button>
              </li>
            ))}
          </ol>

          <p className="ml-auto text-sm text-[var(--muted)]" aria-hidden="true">
            {index + 1} / {count}
          </p>
        </div>
      ) : null}
    </div>
  );
}
