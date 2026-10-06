import Link from "next/link";
import { api } from "@/lib/api";
import { resumeHref } from "@/lib/utils";
import { Hero } from "@/components/home/Hero";
import { SkillsMarquee } from "@/components/home/SkillsMarquee";
import { Testimonials } from "@/components/home/Testimonials";
import { CertificationTile } from "@/components/home/CertificationTile";
import { ProjectRow } from "@/components/project/ProjectRow";
import { PostCard } from "@/components/blog/PostCard";
import { SectionHeading, EmptyState, ButtonLink } from "@/components/ui";
import { Weave } from "@/components/weave/Weave";

export const revalidate = 300;

export default async function HomePage() {
  const data = await api.home();

  if (!data?.profile) {
    return (
      <div className="shell section">
        <EmptyState
          title="This portfolio has not been set up yet."
          hint="Sign in to the admin panel and add your profile, then this page will fill in."
          action={<ButtonLink href="/admin">Open the admin panel</ButtonLink>}
        />
      </div>
    );
  }

  const {
    profile, settings, social_links, skills, skill_categories,
    featured_projects, featured_posts, featured_certifications, testimonials,
  } = data;

  const resume = resumeHref(settings?.resume_url ?? null, settings?.resume_type ?? "drive");

  return (
    <>
      <Hero
        profile={profile}
        socialLinks={social_links}
        resumeUrl={resume}
        resumeLabel={settings?.resume_label ?? "View resume"}
      />

      {/* ---------------------------------------------------------- about */}
      {profile.bio || profile.expertise.length > 0 ? (
        <section className="shell section" aria-labelledby="about-heading">
          <SectionHeading
            id="about-heading"
            title={profile.about_heading ?? "About"}
            action={
              <Link
                href="/about"
                className="text-sm text-[var(--muted)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--gold)]"
              >
                More about my work
              </Link>
            }
          />

          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            {profile.bio ? (
              <div className="font-[family-name:var(--font-body)] text-[length:var(--text-md)] leading-[1.75] text-[var(--muted)]">
                {profile.bio.split("\n\n").map((para, i) => (
                  <p key={i} className={i > 0 ? "mt-5" : undefined}>
                    {para}
                  </p>
                ))}
              </div>
            ) : null}

            {profile.expertise.length > 0 ? (
              <ul className="space-y-6">
                {profile.expertise.map((area) => (
                  <li key={area.id} className="border-l-2 border-[var(--gold)] pl-5">
                    <h3 className="text-[length:var(--text-base)] font-semibold">{area.title}</h3>
                    {area.description ? (
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                        {area.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {profile.stats.length > 0 ? (
            <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-[var(--line)] pt-10 md:grid-cols-4">
              {profile.stats.map((stat) => (
                <div key={stat.id}>
                  <dt className="text-sm text-[var(--muted)]">{stat.label}</dt>
                  <dd className="mt-1 text-[length:var(--text-2xl)] font-semibold text-[var(--text-strong)]">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      ) : null}

      {/* --------------------------------------------------------- skills */}
      {skills.length > 0 ? (
        <section className="shell section" aria-labelledby="skills-heading">
          <SectionHeading
            id="skills-heading"
            title="Tools I work with"
            lead="The stack behind the projects below — filter by area to narrow it down."
          />
          <SkillsMarquee skills={skills} categories={skill_categories} />
        </section>
      ) : null}

      {/* ------------------------------------------------------- projects */}
      <section className="shell section" aria-labelledby="projects-heading">
        <SectionHeading
          id="projects-heading"
          title="Selected work"
          lead="Case studies covering the problem, the approach, and what the results actually mean."
          action={
            <Link
              href="/projects"
              className="text-sm text-[var(--muted)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--gold)]"
            >
              All projects
            </Link>
          }
        />

        {featured_projects.length === 0 ? (
          <EmptyState
            title="No projects are published yet."
            hint="Add a project in the admin panel and mark it featured to show it here."
          />
        ) : (
          <div className="border-t border-[var(--line)]">
            {featured_projects.map((project, i) => (
              <ProjectRow key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------- blog */}
      {featured_posts.length > 0 ? (
        <section className="shell section" aria-labelledby="writing-heading">
          <SectionHeading
            id="writing-heading"
            title="Writing"
            lead="Notes on modelling, evaluation, and the parts that usually go wrong."
            action={
              <Link
                href="/blog"
                className="text-sm text-[var(--muted)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--gold)]"
              >
                All articles
              </Link>
            }
          />
          <div className="border-t border-[var(--line)]">
            {featured_posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      {/* --------------------------------------------------- testimonials */}
      {testimonials.length > 0 ? (
        <section className="shell section" aria-labelledby="testimonials-heading">
          <SectionHeading id="testimonials-heading" title="What people say" />
          <Testimonials testimonials={testimonials} />
        </section>
      ) : null}

      {/* -------------------------------------------------- certifications */}
      {featured_certifications.length > 0 ? (
        <section className="shell section" aria-labelledby="certs-heading">
          <SectionHeading
            id="certs-heading"
            title="Certifications"
            action={
              <Link
                href="/certifications"
                className="text-sm text-[var(--muted)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--gold)]"
              >
                All certifications
              </Link>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured_certifications.map((cert) => (
              <CertificationTile key={cert.id} certification={cert} />
            ))}
          </div>
        </section>
      ) : null}

      {/* -------------------------------------------------------- contact */}
      <section className="shell section" aria-labelledby="contact-cta">
        <div className="relative overflow-hidden rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] px-7 py-12 md:px-14 md:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-28 overflow-hidden md:w-48"
            style={{
              maskImage: "linear-gradient(90deg, transparent, #000 70%)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000 70%)",
            }}
          >
            <Weave seed={42} bandCount={4} height={300} className="h-full w-full" />
          </div>
          <div className="relative max-w-xl">
            <h2 id="contact-cta" className="text-[length:var(--text-xl)] md:text-[length:var(--text-2xl)]">
              {settings?.contact_heading ?? "Let's talk"}
            </h2>
            {settings?.contact_intro ? (
              <p className="mt-4 leading-relaxed text-[var(--muted)]">{settings.contact_intro}</p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contact">Send a message</ButtonLink>
              {settings?.public_email ? (
                <ButtonLink href={`mailto:${settings.public_email}`} tone="secondary">
                  {settings.public_email}
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
