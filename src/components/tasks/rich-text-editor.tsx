"use client";

import { useState, useRef, useEffect } from "react";
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

  return (
    <div className={clsx("flex flex-col rounded-lg border border-[#C3C6D7]/40 bg-white", className)}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent px-4 py-3 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none min-h-[96px]"
        style={{ minHeight: `${minRows * 24}px` }}
      />
      <div className="flex items-center gap-1 border-t border-[#C3C6D7]/20 px-3 py-2">
        <button
          type="button"
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = value;
            const before = text.substring(0, start);
            const selected = text.substring(start, end);
            const after = text.substring(end);
            onChange(`${before}**${selected}**${after}`);
          }}
          className="rounded px-2 py-1 text-xs font-semibold text-[#737686] hover:bg-[#F1F2F6] hover:text-[#121C28] transition-colors"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = value;
            const before = text.substring(0, start);
            const selected = text.substring(start, end);
            const after = text.substring(end);
            onChange(`${before}*${selected}*${after}`);
          }}
          className="rounded px-2 py-1 text-xs italic text-[#737686] hover:bg-[#F1F2F6] hover:text-[#121C28] transition-colors"
          title="Italic"
        >
          I
        </button>
        <span className="mx-1 h-4 w-px bg-[#C3C6D7]/30" />
        <button
          type="button"
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const text = value;
            const before = text.substring(0, start);
            const after = text.substring(start);
            onChange(`${before}\n- ${after}`);
          }}
          className="rounded px-2 py-1 text-xs text-[#737686] hover:bg-[#F1F2F6] hover:text-[#121C28] transition-colors"
          title="Bullet list"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const text = value;
            const before = text.substring(0, start);
            const after = text.substring(start);
            onChange(`${before}\n\`\`\`\n\`\`\`\n${after}`);
          }}
          className="rounded px-2 py-1 text-xs text-[#737686] hover:bg-[#F1F2F6] hover:text-[#121C28] transition-colors"
          title="Code block"
        >
          {"</>"}
        </button>
      </div>
    </div>
  );
}
