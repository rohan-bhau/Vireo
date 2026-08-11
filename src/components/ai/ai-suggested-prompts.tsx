"use client";

interface AISuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const SUGGESTED_PROMPTS = [
  "What's happening this week?",
  "Show my tasks",
  "Summarize this issue",
  "Create a new bug",
  "What's blocking my sprint?",
  "Draft a ticket for dark mode",
];

export function AISuggestedPrompts({ onSelect }: AISuggestedPromptsProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="rounded-xl border border-border-light bg-white px-4 py-3 text-left text-sm text-text-secondary transition-colors hover:bg-bg-light hover:text-text"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
