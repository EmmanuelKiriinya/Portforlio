import Link from "next/link";
import type { Profile, SocialLink } from "@/lib/types";
import { WeaveLetter } from "@/components/weave/Weave";
import { SocialButtons } from "@/components/site/SocialButtons";

/**
 * The strongest visual moment on the site (§51). Type-led, with no image: the
 * name is set at display size and carries the hero on its own, its initial cut
 * from the cloth. Everything else sits on a calm band below a hairline.
 */
export function Hero({
  profile, socialLinks, resumeUrl, resumeLabel,
}: {
  profile: Profile;
  socialLinks: SocialLink[];
  resumeUrl: string | null;
  resumeLabel: string;
}) {
  const [firstName, ...restName] = profile.name.split(" ");

  return (
    <section className="border-b border-[var(--line)]">
      <div className="shell rise pb-14 pt-16 md:pb-20 md:pt-24 lg:pt-28">
        {profile.location ? (
          <p className="mb-8 flex items-center gap-2.5 text-sm text-[var(--muted)]">
            <span aria-hidden="true" className="inline-block h-[3px] w-8 bg-[var(--gold)]" />
            {profile.location}
          </p>
        ) : null}

        <h1 className="text-[length:var(--text-3xl)] leading-[0.98] sm:text-[length:var(--text-4xl)] lg:text-[length:var(--text-5xl)]">
          <WeaveLetter>{firstName.charAt(0)}</WeaveLetter>
          {firstName.slice(1)}
          {restName.length ? (
            <>
              <br />
              <span className="text-[var(--muted)]">{restName.join(" ")}</span>
            </>
          ) : null}
          <span className="text-[var(--gold)]">.</span>
        </h1>

        <div className="mt-12 grid gap-8 border-t border-[var(--line)] pt-10 md:mt-16 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <p className="max-w-lg text-[length:var(--text-lg)] font-medium leading-snug text-[var(--text-strong)] md:text-[length:var(--text-xl)]">
            {profile.headline}
          </p>

          <div>
            {profile.hero_description ? (
              <p className="max-w-xl text-[length:var(--text-md)] leading-relaxed text-[var(--muted)]">
                {profile.hero_description}
              </p>
            ) : null}

            <div className={`flex flex-wrap items-center gap-3 ${profile.hero_description ? "mt-8" : ""}`}>
              <Link
                href={profile.primary_cta_url}
                className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--gold)] bg-[var(--gold)] px-6 py-3 text-sm font-medium text-[var(--on-accent)] transition-colors hover:border-[var(--clay)] hover:bg-[var(--clay)]"
              >
                {profile.primary_cta_label}
              </Link>

              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--line-strong)] px-6 py-3 text-sm font-medium transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                >
                  {resumeLabel}
                </a>
              ) : (
                <Link
                  href={profile.secondary_cta_url}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--line-strong)] px-6 py-3 text-sm font-medium transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                >
                  {profile.secondary_cta_label}
                </Link>
              )}
            </div>

            <SocialButtons links={socialLinks} className="mt-8" />
          </div>
        </div>
      </div>
    </section>
  );
}
