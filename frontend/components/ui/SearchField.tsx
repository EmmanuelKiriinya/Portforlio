"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/** Debounced search that writes to the URL so results are linkable. */
export function SearchField({ placeholder, label }: { placeholder: string; label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  useEffect(() => {
    setValue(params.get("q") ?? "");
  }, [params]);

  useEffect(() => {
    const current = params.get("q") ?? "";
    if (value === current) return;

    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set("q", value);
      else next.delete("q");
      next.delete("page");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [value, params, pathname, router]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <label htmlFor="search-field" className="sr-only">{label}</label>
      <input
        id="search-field"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[var(--radius-hair)] border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-sm placeholder:text-[var(--muted)] focus:border-[var(--gold)] focus:outline-none"
      />
    </div>
  );
}
