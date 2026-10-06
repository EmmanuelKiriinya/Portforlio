import type { Metadata } from "next";
import { api } from "@/lib/api";
import { CertificationTile } from "@/components/home/CertificationTile";
import { EmptyState, ButtonLink } from "@/components/ui";
import { WeaveRule } from "@/components/weave/Weave";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Certifications",
  description: "Professional certifications with verification links.",
  alternates: { canonical: "/certifications" },
};

export default async function CertificationsPage() {
  const certifications = await api.certifications();

  return (
    <div className="shell section">
      <header className="mb-12">
        <WeaveRule />
        <div className="max-w-3xl">
          <h1 className="mt-6 text-[length:var(--text-2xl)] md:text-[length:var(--text-3xl)]">
            Certifications
          </h1>
          <p className="mt-4 text-[length:var(--text-md)] text-[var(--muted)]">
            Every credential below links to its issuer for verification.
          </p>
        </div>
      </header>

      {!certifications || certifications.length === 0 ? (
        <EmptyState
          title="No certifications have been added yet."
          hint="Add them under Certifications in the admin panel."
          action={<ButtonLink href="/admin">Open the admin panel</ButtonLink>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert) => (
            <CertificationTile key={cert.id} certification={cert} />
          ))}
        </div>
      )}
    </div>
  );
}
