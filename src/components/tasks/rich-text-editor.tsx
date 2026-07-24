"use client";

import { useRef, useEffect } from "react";
import { clsx } from "clsx";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Add a description...",
  minRows = 4,
  className,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(
        textareaRef.current.scrollHeight,
        minRows * 24
      )}px`;
    }
  }, [value, minRows]);

  function wrapSelection(before: string, after: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value;
    const selected = text.substring(start, end);
    const newText = `${text.substring(0, start)}${before}${selected}${after}${text.substring(end)}`;
    onChange(newText);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  return (
    <div className={clsx("flex flex-col rounded-[3px] border border-border-input bg-surface", className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border-light px-2 py-1.5">
        <ToolbarButton onClick={() => wrapSelection("**", "**")} title="Bold (Ctrl+B)">
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => wrapSelection("*", "*")} title="Italic (Ctrl+I)">
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => wrapSelection("<u>", "</u>")} title="Underline (Ctrl+U)">
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => wrapSelection("~~", "~~")} title="Strikethrough">
          <span className="line-through">S</span>
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border-light" />
        <ToolbarButton onClick={() => wrapSelection("# ", "")} title="Heading 1">
          H1
        </ToolbarButton>
        <ToolbarButton onClick={() => wrapSelection("## ", "")} title="Heading 2">
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => wrapSelection("### ", "")} title="Heading 3">
          H3
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border-light" />
        <ToolbarButton onClick={() => wrapSelection("\n- ", "")} title="Bullet list">
          • List
        </ToolbarButton>
        <ToolbarButton onClick={() => wrapSelection("\n1. ", "")} title="Numbered list">
          1. List
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border-light" />
        <ToolbarButton onClick={() => wrapSelection("`", "`")} title="Inline code">
          {"<>"}
        </ToolbarButton>
        <ToolbarButton onClick={() => wrapSelection("> ", "")} title="Blockquote">
          ❝
        </ToolbarButton>
        <ToolbarButton onClick={() => wrapSelection("[", "](url)")} title="Link">
          🔗
        </ToolbarButton>
        <ToolbarButton onClick={() => wrapSelection("\n```\n", "\n```\n")} title="Code block">
          {"</>"}
        </ToolbarButton>
        <ToolbarButton onClick={() => {
          const textarea = textareaRef.current;
          if (!textarea) return;
          const start = textarea.selectionStart;
          const text = value;
          const before = text.substring(0, start);
          const after = text.substring(start);
          onChange(`${before}\n| Header |\n|--------|\n| Cell |\n${after}`);
        }} title="Table">
          ⊞
        </ToolbarButton>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent px-4 py-3 text-sm text-text placeholder:text-text-placeholder focus:outline-none"
        style={{ minHeight: `${minRows * 24}px` }}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = value;
            onChange(`${text.substring(0, start)}  ${text.substring(end)}`);
            requestAnimationFrame(() => {
              textarea.selectionStart = textarea.selectionEnd = start + 2;
            });
          }
        }}
      />
    </div>
  );
}

function ToolbarButton({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded text-xs text-text-secondary hover:bg-bg-light hover:text-text transition-colors"
      title={title}
    >
      {children}
    </button>
  );
}
