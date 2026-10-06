import Link from "next/link";
import type { Profile, SocialLink } from "@/lib/types";
import { Weave } from "@/components/weave/Weave";
import { SocialButtons } from "@/components/site/SocialButtons";
import { SmartImage } from "@/components/ui/SmartImage";
import { imageUrl, altText, initials } from "@/lib/utils";

/**
 * The strongest visual moment on the site (§51). Text sits entirely in the
 * left column; the weave occupies the right and never runs behind a word.
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
  const photo = imageUrl(profile.profile_image);

  return (
    <section className="relative border-b border-[var(--line)]">
      <div className="shell grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div className="rise">
          {profile.location ? (
            <p className="mb-5 flex items-center gap-2.5 text-sm text-[var(--muted)]">
              <span aria-hidden="true" className="inline-block h-[3px] w-8 bg-[var(--gold)]" />
              {profile.location}
            </p>
          ) : null}

          <h1 className="text-[length:var(--text-3xl)] leading-[1.04] md:text-[length:var(--text-4xl)]">
            {firstName}
            {restName.length ? (
              <>
                <br />
                <span className="text-[var(--muted)]">{restName.join(" ")}</span>
              </>
            ) : null}
          </h1>

          <p className="mt-6 text-[length:var(--text-lg)] font-medium text-[var(--text-strong)]">
            {profile.headline}
          </p>

          {profile.hero_description ? (
            <p className="mt-5 max-w-xl text-[length:var(--text-md)] leading-relaxed text-[var(--muted)]">
              {profile.hero_description}
            </p>
          ) : null}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={profile.primary_cta_url}
              className="inline-flex items-center gap-2 rounded-[var(--radius-hair)] border border-[var(--gold)] bg-[var(--gold)] px-6 py-3 text-sm font-medium text-[var(--on-accent)] transition-colors hover:border-[var(--clay)] hover:bg-[var(--clay)]"
            >
              {profile.primary_cta_label}
            </Link>

            {resumeUrl ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[var(--radius-hair)] border border-[var(--line-strong)] px-6 py-3 text-sm font-medium transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
              >
                {resumeLabel}
              </a>
            ) : (
              <Link
                href={profile.secondary_cta_url}
                className="inline-flex items-center gap-2 rounded-[var(--radius-hair)] border border-[var(--line-strong)] px-6 py-3 text-sm font-medium transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
              >
                {profile.secondary_cta_label}
              </Link>
            )}
          </div>

          <SocialButtons links={socialLinks} className="mt-9" />
        </div>

        {/* Right column: the weave, with the portrait woven into it. */}
        <div className="relative">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--bg-raised)] sm:aspect-[3/2] lg:ml-auto lg:aspect-[4/5] lg:max-w-md">
            <div className="absolute inset-0 text-[var(--text)]">
              <Weave seed={11} bandCount={8} height={620} animate className="h-full w-full" />
            </div>

            {photo ? (
              <div className="absolute inset-x-6 bottom-6 top-16 overflow-hidden rounded-[var(--radius-hair)] border border-[var(--line-strong)] shadow-[var(--shadow-lift)]">
                <SmartImage
                  src={photo}
                  alt={altText(profile.profile_image, `${profile.name}, ${profile.headline}`)}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 420px"
                  className="object-cover"
                  fallback={
                    <span className="flex h-full w-full items-center justify-center bg-[var(--bg-raised)] text-[length:var(--text-3xl)] font-semibold text-[var(--muted)]">
                      {initials(profile.name)}
                    </span>
                  }
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
