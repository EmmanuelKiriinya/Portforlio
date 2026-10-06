import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { api } from "@/lib/api";
import { resumeHref } from "@/lib/utils";

/**
 * Public chrome. The admin panel sits outside this group and has its own
 * layout, so the portfolio nav and footer never appear over the CMS.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, settings, socialLinks] = await Promise.all([
    api.profile(),
    api.settings(),
    api.socialLinks(),
  ]);

  const name = profile?.name ?? "Emmanuel Kiriinya";
  const headline = profile?.headline ?? "Data Scientist";
  const resume = resumeHref(settings?.resume_url ?? null, settings?.resume_type ?? "drive");

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav name={name} resumeUrl={resume} resumeLabel={settings?.resume_label ?? "Resume"} />
      <main id="main">{children}</main>
      <Footer
        name={name}
        headline={headline}
        socialLinks={socialLinks ?? []}
        email={settings?.public_email ?? null}
      />
    </>
  );
}
