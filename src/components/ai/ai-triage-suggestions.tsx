"use client";

import { Sparkles, X, Check } from "lucide-react";

interface AITriageSuggestionsProps {
  suggestions: {
    suggestedType: string;
    suggestedPriority: string;
    suggestedLabels: string[];
    suggestedAssignee: string | null;
    reasoning: string;
  };
  onAccept: (accepted: {
    type: boolean;
    priority: boolean;
    labels: boolean;
    assignee: boolean;
  }) => void;
  onDismiss: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  highest: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  low: "bg-gray-100 text-gray-700 border-gray-200",
  lowest: "bg-gray-50 text-gray-500 border-gray-100",
};

export function AITriageSuggestions({
  suggestions,
  onAccept,
  onDismiss,
}: AITriageSuggestionsProps) {
  return (
    <div className="rounded-lg border border-[#2563EB]/20 bg-gradient-to-r from-[#EEF4FF] to-[#F8F9FF] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#2563EB]" />
          <span className="text-sm font-semibold text-[#2563EB]">AI Triage Suggestions</span>
        </div>
        <button
          onClick={onDismiss}
          className="flex h-6 w-6 items-center justify-center rounded text-[#737686] hover:bg-white/50 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="text-xs text-[#737686]">{suggestions.reasoning}</p>

      <div className="flex flex-wrap gap-2">
        <SuggestionChip
          label="Type"
          value={suggestions.suggestedType}
          className="capitalize"
          onAccept={() => onAccept({ type: true, priority: false, labels: false, assignee: false })}
        />
        <SuggestionChip
          label="Priority"
          value={suggestions.suggestedPriority}
          className={`capitalize ${PRIORITY_COLORS[suggestions.suggestedPriority] || ""}`}
          onAccept={() => onAccept({ type: false, priority: true, labels: false, assignee: false })}
        />
        {suggestions.suggestedLabels.map((label) => (
          <SuggestionChip
            key={label}
            label="Label"
            value={label}
            className="bg-purple-100 text-purple-700 border-purple-200"
            onAccept={() => onAccept({ type: false, priority: false, labels: true, assignee: false })}
          />
        ))}
        {suggestions.suggestedAssignee && (
          <SuggestionChip
            label="Assignee"
            value={suggestions.suggestedAssignee}
            className="bg-green-100 text-green-700 border-green-200"
            onAccept={() => onAccept({ type: false, priority: false, labels: false, assignee: true })}
          />
        )}
      </div>

      <button
        onClick={() => onAccept({ type: true, priority: true, labels: true, assignee: true })}
        className="w-full rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-medium text-white hover:bg-[#1d4ed8] transition-colors"
      >
        <Check className="mr-1.5 inline-block h-3.5 w-3.5" />
        Apply all suggestions
      </button>
    </div>
  );
}

function SuggestionChip({
  label,
  value,
  className,
  onAccept,
}: {
  label: string;
  value: string;
  className?: string;
  onAccept: () => void;
}) {
  return (
    <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${className || "bg-[#EEF4FF] text-[#2563EB] border-[#2563EB]/20"}`}>
      <span className="text-[10px] font-medium opacity-70">{label}:</span>
      <span className="text-xs font-semibold">{value}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onAccept(); }}
        className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-white/50 transition-colors"
        title="Accept"
      >
        <Check className="h-3 w-3" />
      </button>
    </div>
  );
}