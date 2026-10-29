import type { Certification } from "@/lib/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { imageUrl, altText, formatMonthYear } from "@/lib/utils";
import { ExternalLinkIcon } from "@/components/ui/icons";

/**
 * Credentials are compared, so this one genuinely is a card: bordered, dense,
 * consistent height, 32px issuer logo (§53).
 */
export function CertificationTile({ certification }: { certification: Certification }) {
  const logo = imageUrl(certification.issuer_logo);
  const year = certification.issue_date
    ? new Date(certification.issue_date).getUTCFullYear()
    : null;
  const expired =
    certification.expiry_date != null && new Date(certification.expiry_date) < new Date();

  return (
    <article className="flex h-full flex-col rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-tile)] transition-colors hover:border-[var(--line-strong)]">
      <div className="flex items-start gap-3.5">
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[var(--radius-hair)] bg-[var(--bg-raised)]">
          <SmartImage
            src={logo}
            alt={altText(certification.issuer_logo, certification.issuer)}
            fill
            sizes="36px"
            className="object-contain p-0.5"
            fallback={
              <span className="flex h-full w-full items-center justify-center text-[length:var(--text-xs)] font-semibold text-[var(--muted)]">
                {certification.issuer[0]?.toUpperCase()}
              </span>
            }
          />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-[length:var(--text-base)] font-semibold leading-snug">
            {certification.name}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{certification.issuer}</p>
        </div>

        {year ? (
          <span className="shrink-0 rounded-[var(--radius-chip)] border border-[var(--line)] px-2.5 py-0.5 text-[length:var(--text-xs)] text-[var(--muted)]">
            {year}
          </span>
        ) : null}
      </div>

      {certification.description ? (
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          {certification.description}
        </p>
      ) : null}

      <dl className="mt-4 space-y-1 text-[length:var(--text-xs)] text-[var(--muted)]">
        {certification.expiry_date ? (
          <div className="flex gap-2">
            <dt>{expired ? "Expired" : "Expires"}</dt>
            <dd className={expired ? "text-[var(--ember)]" : "text-[var(--text)]"}>
              {formatMonthYear(certification.expiry_date)}
            </dd>
          </div>
        ) : null}
        {certification.credential_id ? (
          <div className="flex gap-2">
            <dt>Credential</dt>
            <dd className="truncate text-[var(--text)]">{certification.credential_id}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        {certification.verification_url ? (
          <a
            href={certification.verification_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-[var(--line-strong)] px-3.5 py-1.5 text-sm transition-colors hover:border-[var(--palm)] hover:text-[var(--palm)]"
          >
            Verify credential
            <ExternalLinkIcon size={13} />
          </a>
        ) : null}
        {certification.certificate_image?.public_url ? (
          <a
            href={certification.certificate_image.public_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[var(--radius-button)] border border-transparent px-2 py-1.5 text-sm text-[var(--muted)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--gold)]"
          >
            View certificate
          </a>
        ) : null}
      </div>
    </article>
  );
}
