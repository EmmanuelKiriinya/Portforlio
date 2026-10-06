"use client";

import { useState } from "react";

export function ShareRow({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const targets = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: "X", href: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
      <span className="text-[var(--muted)]">Share</span>
      {targets.map((target) => (
        <a
          key={target.label}
          href={target.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--muted)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--gold)]"
        >
          {target.label}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        className="text-[var(--muted)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--gold)]"
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
