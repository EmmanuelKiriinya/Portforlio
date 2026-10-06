"use client";

import { useCallback, useState } from "react";
import { EditorContent, useEditor, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { createLowlight } from "lowlight";

import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import r from "highlight.js/lib/languages/r";

import { MediaPickerDialog } from "./MediaPicker";
import type { Media } from "@/lib/types";
import {
  CodeIcon, BulletListIcon, NumberListIcon, TaskListIcon, QuoteIcon, RuleIcon,
  LinkIcon, ImageIcon, TableIcon, UndoIcon, RedoIcon,
} from "@/components/ui/icons";

const lowlight = createLowlight();
lowlight.register({ python, sql, javascript, typescript, bash, json, yaml, r });

const CODE_LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "r", label: "R" },
];

function ToolButton({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean;
  title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`rounded-[var(--radius-hair)] border px-2.5 py-1.5 text-[length:var(--text-xs)] transition-colors disabled:opacity-40 ${
        active
          ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--on-accent)]"
          : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: TiptapEditor }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const addLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  function insertImage(media: Media) {
    editor
      .chain()
      .focus()
      .setImage({
        src: media.webp_url ?? media.public_url,
        alt: media.alt_text ?? "",
        title: media.caption ?? undefined,
      })
      .run();
  }

  return (
    <div className="sticky top-16 z-20 flex flex-wrap gap-1.5 rounded-t-[var(--radius-tile)] border-b border-[var(--line)] bg-[var(--bg)] px-3 py-2.5">
      <ToolButton title="Paragraph" active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}>P</ToolButton>
      {[2, 3, 4].map((level) => (
        <ToolButton
          key={level}
          title={`Heading ${level}`}
          active={editor.isActive("heading", { level })}
          onClick={() => editor.chain().focus().toggleHeading({ level: level as 2 | 3 | 4 }).run()}
        >
          H{level}
        </ToolButton>
      ))}

      <span className="mx-1 w-px bg-[var(--line)]" />

      <ToolButton title="Bold" active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></ToolButton>
      <ToolButton title="Italic" active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></ToolButton>
      <ToolButton title="Underline" active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></ToolButton>
      <ToolButton title="Strikethrough" active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></ToolButton>
      <ToolButton title="Inline code" active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}><CodeIcon size={14} /></ToolButton>

      <span className="mx-1 w-px bg-[var(--line)]" />

      <ToolButton title="Bullet list" active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}><BulletListIcon size={14} /></ToolButton>
      <ToolButton title="Numbered list" active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}><NumberListIcon size={14} /></ToolButton>
      <ToolButton title="Task list" active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}><TaskListIcon size={14} /></ToolButton>
      <ToolButton title="Quote" active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}><QuoteIcon size={14} /></ToolButton>
      <ToolButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <RuleIcon size={14} />
      </ToolButton>

      <span className="mx-1 w-px bg-[var(--line)]" />

      <ToolButton title="Link" active={editor.isActive("link")} onClick={addLink}><LinkIcon size={14} /></ToolButton>
      <ToolButton title="Insert image" onClick={() => setPickerOpen(true)}><ImageIcon size={14} /></ToolButton>
      <ToolButton
        title="Insert table"
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        <TableIcon size={14} />
      </ToolButton>

      {editor.isActive("table") ? (
        <>
          <ToolButton title="Add row" onClick={() => editor.chain().focus().addRowAfter().run()}>+ Row</ToolButton>
          <ToolButton title="Add column" onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Col</ToolButton>
          <ToolButton title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}>Delete table</ToolButton>
        </>
      ) : null}

      <span className="mx-1 w-px bg-[var(--line)]" />

      <select
        aria-label="Insert code block"
        value={editor.isActive("codeBlock") ? (editor.getAttributes("codeBlock").language ?? "") : ""}
        onChange={(e) => {
          const language = e.target.value;
          if (!language) return;
          editor.chain().focus().toggleCodeBlock({ language }).run();
        }}
        className="rounded-[var(--radius-hair)] border border-[var(--line)] bg-[var(--surface)] px-2 py-1.5 text-[length:var(--text-xs)]"
      >
        <option value="">Code block…</option>
        {CODE_LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>{lang.label}</option>
        ))}
      </select>

      <span className="ml-auto flex gap-1.5">
        <ToolButton title="Undo" disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}><UndoIcon size={14} /></ToolButton>
        <ToolButton title="Redo" disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}><RedoIcon size={14} /></ToolButton>
      </span>

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={insertImage}
        category="blog"
      />
    </div>
  );
}

export function RichTextEditor({
  value, onChange, placeholder = "Start writing…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    // Content is rendered on the client only; without this Next warns about
    // an SSR/client mismatch in the editor DOM.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: "python" }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose max-w-none px-4 py-6",
        spellcheck: "true",
      },
    },
  });

  if (!editor) {
    return (
      <div className="rounded-[var(--radius-tile)] border border-[var(--line)] p-6">
        <p className="text-sm text-[var(--muted)]">Loading the editor…</p>
      </div>
    );
  }

  // Note: no overflow-hidden on the wrapper. It would become the sticky
  // toolbar's scroll container and offset the toolbar 64px down.
  return (
    <div className="rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)]">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
