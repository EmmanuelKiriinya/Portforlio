"use client";

import { useEffect } from "react";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import r from "highlight.js/lib/languages/r";

/* Only the languages a data science blog actually uses — registering the full
   set would ship several hundred KB for no benefit. */
hljs.registerLanguage("python", python);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("r", r);

const LABELS: Record<string, string> = {
  python: "Python", sql: "SQL", javascript: "JavaScript", typescript: "TypeScript",
  bash: "Bash", shell: "Shell", json: "JSON", yaml: "YAML", r: "R",
};

/**
 * Highlights code blocks in stored article HTML and adds a copy button to each.
 *
 * The content arrives as an HTML string from the API, so this runs once after
 * paint rather than at build time. Blocks are marked as processed so a
 * re-render never double-highlights.
 */
export function CodeEnhancer() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>(".prose pre > code");

    blocks.forEach((block) => {
      const pre = block.parentElement;
      if (!pre || pre.dataset.enhanced === "true") return;
      pre.dataset.enhanced = "true";

      const languageClass = Array.from(block.classList).find((c) => c.startsWith("language-"));
      const language = languageClass?.replace("language-", "") ?? "";

      if (language && hljs.getLanguage(language)) {
        block.innerHTML = hljs.highlight(block.textContent ?? "", { language }).value;
      } else {
        block.innerHTML = hljs.highlightAuto(block.textContent ?? "").value;
      }
      block.classList.add("hljs");

      // Position the toolbar relative to the block.
      pre.style.position = "relative";

      const bar = document.createElement("div");
      bar.className =
        "absolute right-2 top-2 flex items-center gap-2 opacity-0 transition-opacity " +
        "focus-within:opacity-100 group-hover/code:opacity-100";
      pre.classList.add("group/code");

      if (LABELS[language]) {
        const tag = document.createElement("span");
        tag.textContent = LABELS[language];
        tag.className = "text-[11px] text-[var(--muted)]";
        bar.appendChild(tag);
      }

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Copy";
      button.className =
        "rounded-[2px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-1 " +
        "text-[11px] text-[var(--muted)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]";

      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(block.textContent ?? "");
          button.textContent = "Copied";
        } catch {
          button.textContent = "Press Ctrl+C";
        }
        window.setTimeout(() => { button.textContent = "Copy"; }, 1800);
      });

      bar.appendChild(button);
      pre.appendChild(bar);
    });

    // Long tables would otherwise force the whole page to scroll sideways.
    document.querySelectorAll<HTMLElement>(".prose table").forEach((table) => {
      if (table.parentElement?.classList.contains("prose-scroll")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "prose-scroll";
      table.parentElement?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }, []);

  return null;
}
