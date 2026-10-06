import Link from "next/link";
import { WeaveMark } from "@/components/weave/Weave";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-20">
      <div className="max-w-md text-center">
        <WeaveMark size={40} className="mx-auto" />
        <h1 className="mt-7 text-[length:var(--text-xl)]">This page doesn't exist</h1>
        <p className="mt-3 text-[var(--muted)]">
          The link may be out of date, or the content may have been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-[var(--radius-hair)] border border-[var(--gold)] bg-[var(--gold)] px-5 py-2.5 text-sm font-medium text-[var(--on-accent)] transition-colors hover:border-[var(--clay)] hover:bg-[var(--clay)]"
          >
            Go to the homepage
          </Link>
          <Link
            href="/blog"
            className="rounded-[var(--radius-hair)] border border-[var(--line-strong)] px-5 py-2.5 text-sm font-medium transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            Browse the blog
          </Link>
        </div>
      </div>
    </div>
  );
}
