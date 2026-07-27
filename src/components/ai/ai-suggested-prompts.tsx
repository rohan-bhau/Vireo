"use client";

import { Sparkles } from "lucide-react";

interface AISuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const SUGGESTED_PROMPTS = [
  "What's happening this week?",
  "Show my tasks",
  "Summarize this issue",
  "Create a new bug",
  "What's blocking my sprint?",
];

export function AISuggestedPrompts({ onSelect }: AISuggestedPromptsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
        <span className="text-xs font-semibold text-[#737686]">Suggested</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="rounded-full border border-[#C3C6D7]/30 bg-white px-3 py-1.5 text-xs text-[#434655] transition-colors hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EEF4FF]"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}