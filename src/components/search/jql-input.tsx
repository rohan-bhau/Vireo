"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { JqlAutocomplete } from "./jql-autocomplete";
import { clsx } from "clsx";

interface JqlInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onClear: () => void;
  workspaceId?: string;
  error?: { message: string; position: number } | null;
  loading?: boolean;
}

const FIELD_COLORS: Record<string, string> = {
  project: "text-[#7C3AED]",
  issuetype: "text-[#7C3AED]",
  type: "text-[#7C3AED]",
  status: "text-[#7C3AED]",
  assignee: "text-[#7C3AED]",
  reporter: "text-[#7C3AED]",
  priority: "text-[#7C3AED]",
  labels: "text-[#7C3AED]",
  component: "text-[#7C3AED]",
  sprint: "text-[#7C3AED]",
  created: "text-[#7C3AED]",
  updated: "text-[#7C3AED]",
  due: "text-[#7C3AED]",
  summary: "text-[#7C3AED]",
  description: "text-[#7C3AED]",
};

function highlightJql(query: string): { text: string; className: string }[] {
  if (!query) return [];
  const parts: { text: string; className: string }[] = [];
  const tokens = query.match(/(ORDER\s+BY|[()]|!=|!~|>=|<=|[=><~]|IN|NOT\s+IN|IS\s+NOT|IS|AND|OR|NOT|ASC|DESC|[a-zA-Z_][a-zA-Z0-9_]*|"[^"]*"|'[^']*'|-?\d+(\.\d+)?|\s+)/g) || [];

  for (const token of tokens) {
    const upper = token.toUpperCase().trim();
    if (/^\s+$/.test(token)) {
      parts.push({ text: token, className: "" });
    } else if (upper === "AND" || upper === "OR" || upper === "NOT") {
      parts.push({ text: token, className: "text-[#D97706] font-semibold" });
    } else if (["=", "!=", ">", ">=", "<", "<=", "~", "!~", "IN", "NOT IN", "IS", "IS NOT"].includes(upper)) {
      parts.push({ text: token, className: "text-[#2563EB]" });
    } else if (upper === "ORDER" || upper === "BY" || upper === "ASC" || upper === "DESC") {
      parts.push({ text: token, className: "text-[#D97706] font-semibold" });
    } else if (upper.startsWith('"') || upper.startsWith("'")) {
      parts.push({ text: token, className: "text-[#059669]" });
    } else if (/^-?\d+(\.\d+)?$/.test(token.trim())) {
      parts.push({ text: token, className: "text-[#7C3AED]" });
    } else if (token === "(" || token === ")") {
      parts.push({ text: token, className: "text-[#434655]" });
    } else if (FIELD_COLORS[upper.toLowerCase()]) {
      parts.push({ text: token, className: FIELD_COLORS[upper.toLowerCase()] });
    } else if (upper.endsWith("()")) {
      parts.push({ text: token, className: "text-[#0891B2] font-medium" });
    } else {
      parts.push({ text: token, className: "text-[#121C28]" });
    }
  }

  return parts;
}

export function JqlInput({ value, onChange, onSubmit, onClear, error, loading }: JqlInputProps) {
  const [focused, setFocused] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const syncScroll = useCallback(() => {
    if (highlightRef.current && inputRef.current) {
      highlightRef.current.scrollTop = inputRef.current.scrollTop;
      highlightRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(value);
      setShowAutocomplete(false);
    }
    if (e.key === "Escape") {
      setShowAutocomplete(false);
    }
  }

  function handleSelectAutocomplete(suggestion: string) {
    const before = value.slice(0, cursorPos);
    const after = value.slice(cursorPos);
    const lastWordMatch = before.match(/[a-zA-Z0-9_'"]+$/);
    if (lastWordMatch) {
      const newBefore = before.slice(0, before.length - lastWordMatch[0].length);
      const newValue = newBefore + suggestion + after;
      onChange(newValue);
      const newPos = newBefore.length + suggestion.length;
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.selectionStart = newPos;
          inputRef.current.selectionEnd = newPos;
        }
      }, 0);
    }
    setShowAutocomplete(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
  }

  function handleCursorMove() {
    if (inputRef.current) {
      setCursorPos(inputRef.current.selectionStart);
    }
  }

  const highlighted = highlightJql(value);
  const hasValue = value.trim().length > 0;

  return (
    <div className="relative flex-1">
      <div
        className={clsx(
          "relative rounded-[3px] border transition-colors",
          error ? "border-red-400" : focused ? "border-[#2563EB]" : "border-[#DFE1E6]",
          loading && "opacity-60"
        )}
      >
        <div
          ref={highlightRef}
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-all px-3 py-2 text-sm font-mono"
          aria-hidden
        >
          {highlighted.length > 0 ? (
            highlighted.map((part, i) => (
              <span key={i} className={part.className}>{part.text}</span>
            ))
          ) : (
            <span className="text-[#C3C6D7]">Enter JQL query...</span>
          )}
          <span className="text-transparent">{"\n".repeat(20)}</span>
        </div>
        <textarea
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setFocused(true);
            setShowAutocomplete(true);
          }}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => setShowAutocomplete(false), 200);
          }}
          onSelect={handleCursorMove}
          onScroll={syncScroll}
          onClick={handleCursorMove}
          className="relative w-full resize-none border-0 bg-transparent px-3 py-2 text-sm font-mono text-transparent caret-[#121C28] outline-none"
          rows={1}
          style={{ minHeight: "36px" }}
          spellCheck={false}
          aria-label="JQL query input"
        />
      </div>

      {showAutocomplete && focused && (
        <JqlAutocomplete
          query={value}
          cursorPos={cursorPos}
          onSelect={handleSelectAutocomplete}
          onClose={() => setShowAutocomplete(false)}
        />
      )}

      {error && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-red-500">
          <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          {error.message} {error.position !== undefined && `at position ${error.position}`}
        </div>
      )}

      {hasValue && !loading && (
        <button
          onClick={onClear}
          className="absolute right-2 top-2 text-[#737686] hover:text-[#121C28] transition-colors"
          title="Clear"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
