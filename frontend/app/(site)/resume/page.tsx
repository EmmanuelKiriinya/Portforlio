import type { Metadata } from "next";
import { api } from "@/lib/api";
import { EmptyState, ButtonLink } from "@/components/ui";
import { WeaveRule } from "@/components/weave/Weave";
import { resumeHref } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Resume",
  description: "Download or view the full resume.",
  alternates: { canonical: "/resume" },
};

export default async function ResumePage() {
  const [settings, profile] = await Promise.all([api.settings(), api.profile()]);

  const viewUrl = settings?.resume_url ?? null;
  const downloadUrl = resumeHref(viewUrl, settings?.resume_type ?? "drive");

  return (
    <div className="shell section">
      <header className="mb-10">
        <WeaveRule />
        <div className="max-w-2xl">
          <h1 className="mt-6 text-[length:var(--text-2xl)] md:text-[length:var(--text-3xl)]">Resume</h1>
          <p className="mt-4 text-[length:var(--text-md)] text-[var(--muted)]">
            {profile?.name ?? "Emmanuel Kiriinya"} — {profile?.headline ?? "Data Scientist"}
          </p>
        </div>
      </header>

      {!viewUrl ? (
        <EmptyState
          title="No resume has been linked yet."
          hint="Add a Google Drive or PDF link under Settings → Resume in the admin panel."
          action={<ButtonLink href="/admin">Open the admin panel</ButtonLink>}
        />
      ) : (
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={viewUrl} external>View resume</ButtonLink>
          {downloadUrl && downloadUrl !== viewUrl ? (
            <ButtonLink href={downloadUrl} tone="secondary" external>
              {settings?.resume_label ?? "Download resume"}
            </ButtonLink>
          ) : null}
        </div>
      )}
    </div>
  );
}
