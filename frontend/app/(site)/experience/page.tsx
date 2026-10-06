import type { Metadata } from "next";
import { api } from "@/lib/api";
import { SmartImage } from "@/components/ui/SmartImage";
import { EmptyState, ButtonLink } from "@/components/ui";
import { WeaveRule } from "@/components/weave/Weave";
import { CalendarIcon, MapPinIcon, ExternalLinkIcon } from "@/components/ui/icons";
import { imageUrl, altText, dateRange, techList } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Experience",
  description: "Professional roles, responsibilities, and quantified outcomes.",
  alternates: { canonical: "/experience" },
};

export default async function ExperiencePage() {
  const experience = await api.experience();

  return (
    <div className="shell section">
      <header className="mb-14">
        <WeaveRule />
        <div className="max-w-3xl">
          <h1 className="mt-6 text-[length:var(--text-2xl)] md:text-[length:var(--text-3xl)]">
            Experience
          </h1>
          <p className="mt-4 text-[length:var(--text-md)] text-[var(--muted)]">
            Where I have worked and what the work actually produced.
          </p>
        </div>
      </header>

      {!experience || experience.length === 0 ? (
        <EmptyState
          title="No roles have been added yet."
          hint="Add your work history under Experience in the admin panel."
          action={<ButtonLink href="/admin">Open the admin panel</ButtonLink>}
        />
      ) : (
        <ol className="relative border-t border-[var(--line)]">
          {experience.map((role) => {
            const logo = imageUrl(role.organization_logo);
            const tech = techList(role.technologies);
            return (
              <li key={role.id} className="grid gap-6 border-b border-[var(--line)] py-10 md:grid-cols-[13rem_1fr] md:gap-10">
                <div>
                  <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <CalendarIcon size={14} />
                    {dateRange(role.start_date, role.end_date, role.current)}
                  </p>
                  {role.location ? (
                    <p className="mt-1.5 flex items-center gap-2 text-sm text-[var(--muted)]">
                      <MapPinIcon size={14} />
                      {role.location}
                    </p>
                  ) : null}
                  {role.current ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[length:var(--text-xs)] text-[var(--palm)]">
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--palm)]" />
                      Current role
                    </p>
                  ) : null}
                </div>

                <div>
                  <div className="flex items-start gap-3.5">
                    {logo ? (
                      <span className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-[var(--radius-hair)] bg-[var(--bg-raised)]">
                        <SmartImage
                          src={logo}
                          alt={altText(role.organization_logo, role.organization)}
                          fill
                          sizes="36px"
                          className="object-contain p-1"
                        />
                      </span>
                    ) : null}
                    <div>
                      <h2 className="text-[length:var(--text-lg)] leading-snug">{role.title}</h2>
                      <p className="mt-1 text-[var(--muted)]">
                        {role.organization_url ? (
                          <a
                            href={role.organization_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-[var(--line-strong)] underline-offset-4 hover:text-[var(--gold)]"
                          >
                            {role.organization}
                          </a>
                        ) : (
                          role.organization
                        )}
                        {role.employment_type ? ` · ${role.employment_type}` : ""}
                      </p>
                    </div>
                  </div>

                  {role.description ? (
                    <p className="mt-5 max-w-2xl leading-relaxed text-[var(--muted)]">
                      {role.description}
                    </p>
                  ) : null}

                  {role.achievements.length > 0 ? (
                    <ul className="mt-5 max-w-2xl space-y-2.5">
                      {role.achievements.map((item) => (
                        <li key={item.id} className="relative pl-5 leading-relaxed text-[var(--text)]">
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-[0.72em] h-[3px] w-3 bg-[var(--gold)]"
                          />
                          {item.content}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {tech.length > 0 ? (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {tech.map((item) => (
                        <li
                          key={item}
                          className="rounded-[var(--radius-chip)] border border-[var(--line)] px-2.5 py-0.5 text-[length:var(--text-xs)] text-[var(--muted)]"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
