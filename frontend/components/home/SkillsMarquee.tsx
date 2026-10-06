"use client";

import { useMemo, useState } from "react";
import type { Skill, SkillCategory } from "@/lib/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { imageUrl } from "@/lib/utils";

function SkillChip({ skill }: { skill: Skill }) {
  const icon = imageUrl(skill.icon_media) ?? skill.icon_url;

  const body = (
    <>
      <span className="relative h-6 w-6 shrink-0">
        <SmartImage
          src={icon}
          alt=""
          width={24}
          height={24}
          eager
          unoptimized
          className="h-6 w-6 object-contain"
          fallback={
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--gold-soft)] text-[length:var(--text-2xs)] font-semibold text-[var(--gold)]">
              {skill.name[0]?.toUpperCase()}
            </span>
          }
        />
      </span>
      <span className="whitespace-nowrap text-sm">{skill.name}</span>
    </>
  );

  const classes =
    "flex items-center gap-2.5 rounded-[var(--radius-chip)] border border-[var(--line)] " +
    "bg-[var(--surface)] px-4 py-2.5 transition-colors hover:border-[var(--gold)]";

  return skill.official_url ? (
    <a href={skill.official_url} target="_blank" rel="noopener noreferrer" className={classes}>
      {body}
    </a>
  ) : (
    <div className={classes}>{body}</div>
  );
}

/** One marquee row. The list is duplicated so the loop has no visible seam. */
function Row({ skills, duration, reverse }: { skills: Skill[]; duration: number; reverse?: boolean }) {
  if (skills.length === 0) return null;
  return (
    <div className="marquee-viewport marquee-mask overflow-hidden py-2">
      <div
        className={`marquee gap-3 ${reverse ? "marquee--reverse" : ""}`}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-3 pr-3" aria-hidden={copy === 1}>
            {skills.map((skill) => (
              <SkillChip key={`${copy}-${skill.id}`} skill={skill} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkillsMarquee({
  skills, categories,
}: { skills: Skill[]; categories: SkillCategory[] }) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(
    () => (active ? skills.filter((s) => s.category?.slug === active) : skills),
    [skills, active],
  );

  // Three rows moving at different speeds reads as woven cloth rather than a
  // single scrolling ticker.
  const rows = useMemo(() => {
    const size = Math.ceil(filtered.length / 3) || 1;
    return [filtered.slice(0, size), filtered.slice(size, size * 2), filtered.slice(size * 2)];
  }, [filtered]);

  if (skills.length === 0) return null;

  return (
    <div>
      {categories.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter skills by category">
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-pressed={active === null}
            className={`rounded-[var(--radius-chip)] border px-3.5 py-1.5 text-sm transition-colors ${
              active === null
                ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--on-accent)]"
                : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActive(category.slug)}
              aria-pressed={active === category.slug}
              className={`rounded-[var(--radius-chip)] border px-3.5 py-1.5 text-sm transition-colors ${
                active === category.slug
                  ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--on-accent)]"
                  : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="py-8 text-sm text-[var(--muted)]">
          No tools listed in this category yet.
        </p>
      ) : (
        <div className="space-y-1">
          <Row skills={rows[0]} duration={58} />
          <Row skills={rows[1]} duration={72} reverse />
          <Row skills={rows[2]} duration={64} />
        </div>
      )}

      {/* The marquee is decorative motion; this list is what assistive tech reads. */}
      <p className="sr-only">
        Technologies: {filtered.map((s) => s.name).join(", ")}.
      </p>
    </div>
  );
}
