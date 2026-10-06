import type { Metadata } from "next";
import { api } from "@/lib/api";
import { ContactForm } from "@/components/site/ContactForm";
import { WeaveRule } from "@/components/weave/Weave";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about consulting, collaboration, or data work.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [settings, socialLinks] = await Promise.all([api.settings(), api.socialLinks()]);

  return (
    <div className="shell section">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <WeaveRule />
          <h1 className="mt-6 text-[length:var(--text-2xl)] md:text-[length:var(--text-3xl)]">
            {settings?.contact_heading ?? "Let's talk"}
          </h1>
          {settings?.contact_intro ? (
            <p className="mt-5 max-w-lg text-[length:var(--text-md)] leading-relaxed text-[var(--muted)]">
              {settings.contact_intro}
            </p>
          ) : null}

          <dl className="mt-10 space-y-6">
            {settings?.public_email ? (
              <div>
                <dt className="text-sm text-[var(--muted)]">Email</dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${settings.public_email}`}
                    className="text-[length:var(--text-md)] text-[var(--gold)] underline underline-offset-4"
                  >
                    {settings.public_email}
                  </a>
                </dd>
              </div>
            ) : null}

            {socialLinks && socialLinks.length > 0 ? (
              <div>
                <dt className="text-sm text-[var(--muted)]">Elsewhere</dt>
                <dd className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--gold)]"
                    >
                      {link.label}
                    </a>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8">
          <h2 className="text-[length:var(--text-lg)]">Send a message</h2>
          <p className="mb-7 mt-1.5 text-sm text-[var(--muted)]">
            Fields marked without "optional" are required.
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
