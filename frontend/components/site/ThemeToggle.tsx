"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon, SystemIcon } from "@/components/ui/icons";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "pf-theme";

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") setTheme(stored);
    setMounted(true);
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private browsing — the choice just won't persist */
    }
  }

  // Cycle light -> dark -> system so all three are reachable from one control.
  const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const label =
    theme === "light" ? "Light theme" : theme === "dark" ? "Dark theme" : "Matching your system";

  return (
    <button
      type="button"
      onClick={() => choose(next)}
      title={label}
      aria-label={`${label}. Switch to ${next === "system" ? "system" : next} theme.`}
      className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)] border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
    >
      {/* Show the neutral system glyph until mounted, so SSR and client agree. */}
      {!mounted || theme === "system" ? (
        <SystemIcon size={15} />
      ) : theme === "light" ? (
        <SunIcon size={15} />
      ) : (
        <MoonIcon size={15} />
      )}
    </button>
  );
}

/**
 * Runs before first paint to stop the page flashing the wrong theme.
 * Kept as a string so it can be injected with dangerouslySetInnerHTML.
 */
export const themeScript = `
(function(){
  try {
    var t = localStorage.getItem("${STORAGE_KEY}");
    if (t === "light" || t === "dark") {
      document.documentElement.setAttribute("data-theme", t);
    }
  } catch (e) {}
})();
`;
