"use client";

import { useEffect } from "react";

export default function Error({
  error, reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-20">
      <div className="max-w-md text-center">
        <h1 className="text-[length:var(--text-xl)]">This page didn't load</h1>
        <p className="mt-3 text-[var(--muted)]">
          Something failed while fetching the content. Trying again usually fixes it.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-[var(--radius-button)] border border-[var(--gold)] bg-[var(--gold)] px-5 py-2.5 text-sm font-medium text-[var(--on-accent)] transition-colors hover:border-[var(--clay)] hover:bg-[var(--clay)]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
