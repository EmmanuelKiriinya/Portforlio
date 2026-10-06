import Link from "next/link";
import type { ProjectSummary } from "@/lib/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { imageUrl, techList, formatMonthYear } from "@/lib/utils";
import { Weave, WeaveMark } from "@/components/weave/Weave";
import { CategoryBadge } from "./categoryIcon";
import { ExternalLinkIcon } from "@/components/ui/icons";

/**
 * Projects are the substance of the portfolio, so they get an editorial row
 * rather than a tile — image on one side, the case for the work on the other,
 * alternating down the page (§53).
 */
export function ProjectRow({ project, index }: { project: ProjectSummary; index: number }) {
  const cover = imageUrl(project.cover_image);
  const tech = techList(project.technologies).slice(0, 6);
  const flip = index % 2 === 1;

  return (
    <article className="group grid gap-8 border-b border-[var(--line)] py-12 md:grid-cols-2 md:gap-14 md:py-16">
      <Link
        href={`/projects/${project.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className={`relative block aspect-[16/10] overflow-hidden bg-[var(--bg-raised)] ${flip ? "md:order-2" : ""}`}
      >
        <SmartImage
          src={cover}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 45vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          fallback={
            // No cover set: show a woven panel seeded from the project, so
            // each one is visually distinct instead of an empty grey box.
            <span className="block h-full w-full overflow-hidden bg-[var(--bg-raised)] text-[var(--text)] opacity-70">
              <Weave seed={project.id * 13 + 5} bandCount={7} height={320} className="h-full w-full" />
            </span>
          }
        />
      </Link>

      <div className={`flex flex-col justify-center ${flip ? "md:order-1" : ""}`}>
        <div className="flex items-center gap-3.5">
          <CategoryBadge category={project.category} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
            {project.category ? <span className="text-[var(--gold)]">{project.category}</span> : null}
            {project.completion_date ? <span>{formatMonthYear(project.completion_date)}</span> : null}
            {project.featured ? (
              <span className="flex items-center gap-1.5 text-[var(--clay)]">
                <WeaveMark size={12} />
                Featured
              </span>
            ) : null}
          </div>
        </div>

        <h3 className="mt-4 text-[length:var(--text-xl)]">
          <Link
            href={`/projects/${project.slug}`}
            className="transition-colors hover:text-[var(--gold)]"
          >
            {project.title}
          </Link>
        </h3>

        {project.excerpt ? (
          <p className="mt-4 max-w-xl leading-relaxed text-[var(--muted)]">{project.excerpt}</p>
        ) : null}

        {tech.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5 text-[length:var(--text-xs)] text-[var(--muted)]">
            {tech.map((item) => (
              <li key={item} className="rounded-[var(--radius-chip)] border border-[var(--line)] px-2.5 py-0.5">
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href={`/projects/${project.slug}`}
            className="rounded-[var(--radius-hair)] border border-[var(--line-strong)] px-4 py-2 text-sm transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            Read the case study
          </Link>
          {project.github_url ? (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--gold)]"
            >
              GitHub
              <ExternalLinkIcon size={13} />
            </a>
          ) : null}
          {/* Rendered only when a URL exists — never an empty or disabled button (§13). */}
          {project.live_url ? (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--gold)]"
            >
              Live demo
              <ExternalLinkIcon size={13} />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
