"use client";

import { useState } from "react";
import { useParseNaturalLanguageMutation } from "@/store/automationApi";
import type { AutomationTrigger, AutomationCondition, AutomationAction } from "@/store/automationApi";

interface NaturalLanguageInputProps {
  onParsed: (data: { trigger: AutomationTrigger; conditions: AutomationCondition[]; actions: AutomationAction[] }) => void;
}

const EXAMPLES = [
  "When a bug is created, assign it to the component lead and set priority to High",
  "When a high priority issue is created, notify the project lead and set due date to 3 days from now",
  "When an issue transitions to Done, add a 'completed' label and notify the reporter",
  "When a sprint starts, move all unassigned issues to In Progress",
];

export function NaturalLanguageInput({ onParsed }: NaturalLanguageInputProps) {
  const [description, setDescription] = useState("");
  const [parseNL, { isLoading }] = useParseNaturalLanguageMutation();
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    if (!description.trim()) {
      setError("Please describe your rule in plain English.");
      return;
    }

    try {
      const result = await parseNL(description.trim()).unwrap();
      onParsed(result);
      setDescription("");
    } catch {
      setError("Could not parse your description. Try rewording it.");
    }
  }

  return (
    <div className="rounded-xl border border-[#2563EB]/20 bg-gradient-to-br from-[#EFF6FF] to-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <svg className="h-5 w-5 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-sm font-semibold text-[#121C28]">Create with AI</span>
      </div>

      <p className="mb-2 text-xs text-[#737686]">Describe your automation rule in plain English:</p>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder='e.g. "When a bug is created, set due date to 7 days from now, then email the reporter"'
        rows={3}
        className="w-full rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
      />

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isLoading}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Parsing...
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Generate rule
          </>
        )}
      </button>

      <div className="mt-3">
        <p className="mb-1.5 text-xs font-medium text-[#737686]">Try these examples:</p>
        <div className="space-y-1">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setDescription(ex)}
              className="block w-full rounded-md bg-white/80 px-2.5 py-1.5 text-left text-xs text-[#737686] hover:bg-[#2563EB]/5 hover:text-[#121C28] transition-colors"
            >
{`\u201C${ex}\u201D`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
