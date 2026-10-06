import type { Metadata } from "next";
import { api } from "@/lib/api";
import { SmartImage } from "@/components/ui/SmartImage";
import { SectionHeading, EmptyState, ButtonLink } from "@/components/ui";
import { WeaveRule } from "@/components/weave/Weave";
import { imageUrl, altText, initials, dateRange } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About",
  description: "Background, areas of expertise, and education.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [profile, education] = await Promise.all([api.profile(), api.education()]);

  if (!profile) {
    return (
      <div className="shell section">
        <EmptyState
          title="The About page has no content yet."
          hint="Add your bio and areas of expertise under Profile in the admin panel."
          action={<ButtonLink href="/admin">Open the admin panel</ButtonLink>}
        />
      </div>
    );
  }

  const portrait = imageUrl(profile.about_image) ?? imageUrl(profile.profile_image);

  return (
    <div className="shell section">
      <header className="mb-14">
        <WeaveRule />
        <div className="max-w-3xl">
          <h1 className="mt-6 text-[length:var(--text-2xl)] md:text-[length:var(--text-3xl)]">
            {profile.about_heading ?? "About"}
          </h1>
          <p className="mt-4 text-[length:var(--text-md)] text-[var(--muted)]">
            {profile.headline}
            {profile.location ? ` · ${profile.location}` : ""}
          </p>
        </div>
      </header>

      <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div>
          {profile.bio ? (
            <div className="prose">
              {profile.bio.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : null}

          {profile.expertise.length > 0 ? (
            <section className="mt-16" aria-labelledby="expertise-heading">
              <h2 id="expertise-heading" className="text-[length:var(--text-lg)]">
                Areas of expertise
              </h2>
              <ul className="mt-7 space-y-7">
                {profile.expertise.map((area) => (
                  <li key={area.id} className="border-l-2 border-[var(--gold)] pl-5">
                    <h3 className="font-semibold">{area.title}</h3>
                    {area.description ? (
                      <p className="mt-1.5 leading-relaxed text-[var(--muted)]">{area.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-12">
          {portrait ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--bg-raised)]">
              <SmartImage
                src={portrait}
                alt={altText(profile.about_image ?? profile.profile_image, profile.name)}
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover"
                fallback={
                  <span className="flex h-full w-full items-center justify-center text-[length:var(--text-3xl)] font-semibold text-[var(--muted)]">
                    {initials(profile.name)}
                  </span>
                }
              />
            </div>
          ) : null}

          {profile.stats.length > 0 ? (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-7">
              {profile.stats.map((stat) => (
                <div key={stat.id}>
                  <dt className="text-sm text-[var(--muted)]">{stat.label}</dt>
                  <dd className="mt-0.5 text-[length:var(--text-xl)] font-semibold text-[var(--text-strong)]">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </aside>
      </div>

      {education && education.length > 0 ? (
        <section className="mt-24" aria-labelledby="education-heading">
          <SectionHeading id="education-heading" title="Education" />
          <ul className="border-t border-[var(--line)]">
            {education.map((item) => (
              <li key={item.id} className="grid gap-3 border-b border-[var(--line)] py-7 md:grid-cols-[10rem_1fr] md:gap-8">
                <p className="text-sm text-[var(--muted)]">
                  {dateRange(item.start_date, item.graduation_date)}
                </p>
                <div>
                  <h3 className="text-[length:var(--text-md)] font-semibold">{item.degree}</h3>
                  <p className="mt-1 text-[var(--muted)]">
                    {item.institution}
                    {item.field_of_study ? ` · ${item.field_of_study}` : ""}
                  </p>
                  {item.description ? (
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                      {item.description}
                    </p>
                  ) : null}
                  {item.verification_url ? (
                    <a
                      href={item.verification_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm text-[var(--gold)] underline underline-offset-4"
                    >
                      Verify
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
