import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { SmartImage } from "@/components/ui/SmartImage";
import { ProjectRow } from "@/components/project/ProjectRow";
import { SectionHeading } from "@/components/ui";
import { ArrowLeftIcon, ExternalLinkIcon } from "@/components/ui/icons";
import { WeaveRule, WeaveMark } from "@/components/weave/Weave";
import { CodeEnhancer } from "@/components/blog/CodeEnhancer";
import { CategoryIcon } from "@/components/project/categoryIcon";
import { imageUrl, altText, techList, formatMonthYear } from "@/lib/utils";
import type { Project } from "@/lib/types";

export const revalidate = 300;

async function load(slug: string): Promise<Project | null> {
  try {
    return await api.project(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await load(slug);
  if (!project) return { title: "Project not found" };

  const cover = project.cover_image?.public_url;
  return {
    title: project.title,
    description: project.excerpt ?? undefined,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.excerpt ?? undefined,
      images: cover ? [{ url: cover }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.excerpt ?? undefined,
      images: cover ? [cover] : undefined,
    },
  };
}

/** Case-study sections render only when the admin has filled them in. */
function Block({ title, html }: { title: string; html: string | null }) {
  if (!html?.trim()) return null;
  return (
    <section className="mt-14">
      <h2 className="text-[length:var(--text-lg)]">{title}</h2>
      <div className="prose mt-4" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await load(slug);
  if (!project) notFound();

  const related = await api.relatedProjects(slug);
  const cover = imageUrl(project.cover_image);
  const tech = techList(project.technologies);

  return (
    <article className="pb-8">
      <CodeEnhancer />

      <div className="shell pt-12 md:pt-16">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--gold)]"
        >
          <ArrowLeftIcon size={14} />
          All projects
        </Link>

        <header className="mt-8 max-w-4xl">
          <WeaveRule />
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
            {project.category ? (
              <span className="flex items-center gap-2 text-[var(--gold)]">
                <CategoryIcon category={project.category} size={15} />
                {project.category}
              </span>
            ) : null}
            {project.completion_date ? <span>{formatMonthYear(project.completion_date)}</span> : null}
            {project.featured ? (
              <span className="flex items-center gap-1.5 text-[var(--clay)]">
                <WeaveMark size={12} /> Featured
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-[length:var(--text-2xl)] md:text-[length:var(--text-3xl)]">
            {project.title}
          </h1>

          {project.excerpt ? (
            <p className="mt-5 max-w-3xl text-[length:var(--text-md)] leading-relaxed text-[var(--muted)]">
              {project.excerpt}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {project.github_url ? (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--gold)] bg-[var(--gold)] px-5 py-2.5 text-sm font-medium text-[var(--on-accent)] transition-colors hover:border-[var(--clay)] hover:bg-[var(--clay)]"
              >
                View on GitHub
                <ExternalLinkIcon size={14} />
              </a>
            ) : null}
            {project.live_url ? (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--line-strong)] px-5 py-2.5 text-sm font-medium transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
              >
                Live demo
                <ExternalLinkIcon size={14} />
              </a>
            ) : null}
          </div>
        </header>
      </div>

      {cover ? (
        <div className="shell mt-12">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--bg-raised)]">
            <SmartImage
              src={cover}
              alt={altText(project.cover_image, project.title)}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      <div className="shell mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-20">
        <div className="min-w-0">
          {project.content?.trim() ? (
            <section>
              <h2 className="text-[length:var(--text-lg)]">Overview</h2>
              <div className="prose mt-4" dangerouslySetInnerHTML={{ __html: project.content }} />
            </section>
          ) : null}

          <Block title="The problem" html={project.problem} />
          <Block title="The approach" html={project.solution} />
          <Block title="Data" html={project.dataset} />
          <Block title="Methodology" html={project.methodology} />
          <Block title="Models" html={project.models_used} />
          <Block title="Results" html={project.results} />

          {project.gallery.length > 0 ? (
            <section className="mt-16">
              <h2 className="text-[length:var(--text-lg)]">Screenshots</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {project.gallery.map((item) => (
                  <figure key={item.id}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-hair)] border border-[var(--line)] bg-[var(--bg-raised)]">
                      <SmartImage
                        src={imageUrl(item.media)}
                        alt={altText(item.media, `${project.title} screenshot`)}
                        fill
                        sizes="(max-width: 640px) 100vw, 45vw"
                        className="object-cover"
                      />
                    </div>
                    {item.media.caption ? (
                      <figcaption className="mt-2 text-sm text-[var(--muted)]">
                        {item.media.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          {tech.length > 0 ? (
            <div className="rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-5">
              <h2 className="text-sm font-semibold text-[var(--text-strong)]">Built with</h2>
              <ul className="mt-3.5 flex flex-wrap gap-2">
                {tech.map((item) => (
                  <li
                    key={item}
                    className="rounded-[var(--radius-chip)] border border-[var(--line)] px-2.5 py-0.5 text-[length:var(--text-xs)] text-[var(--muted)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      {related && related.length > 0 ? (
        <div className="shell section">
          <SectionHeading title="Related work" />
          <div className="border-t border-[var(--line)]">
            {related.map((item, i) => (
              <ProjectRow key={item.id} project={item} index={i} />
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
