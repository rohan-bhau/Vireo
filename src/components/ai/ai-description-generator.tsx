"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useGenerateTicketDraftMutation } from "@/store/aiApi";

interface AIDescriptionGeneratorProps {
  title: string;
  taskType: string;
  projectId: string;
  onApply: (description: string) => void;
}

export function AIDescriptionGenerator({
  title,
  taskType,
  projectId,
  onApply,
}: AIDescriptionGeneratorProps) {
  const [generate, { isLoading }] = useGenerateTicketDraftMutation();
  const [result, setResult] = useState<{ description: string; acceptanceCriteria: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  async function handleGenerate() {
    setError(null);
    try {
      const res = await generate({
        title: title || "Untitled task",
        type: taskType,
        projectId,
      }).unwrap();
      setResult(res);
      setShowPrompt(false);
    } catch {
      setError("Failed to generate description. Please try again.");
    }
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
        <p className="text-xs text-red-600 flex-1">{error}</p>
        <button onClick={() => { setError(null); setShowPrompt(true); }} className="text-xs font-medium text-red-600 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="rounded-lg border border-[#2563EB]/20 bg-[#EEF4FF] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#2563EB]" />
          <span className="text-sm font-semibold text-[#2563EB]">AI Draft</span>
        </div>
        <div className="rounded-lg bg-white p-3">
          <p className="text-sm text-[#434655] whitespace-pre-wrap">{result.description}</p>
        </div>
        {result.acceptanceCriteria.length > 0 && (
          <div>
            <h4 className="mb-1.5 text-xs font-semibold text-[#737686]">Acceptance Criteria</h4>
            <ul className="list-inside list-disc space-y-0.5">
              {result.acceptanceCriteria.map((c, i) => (
                <li key={i} className="text-sm text-[#434655]">{c}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => {
              onApply(result.description);
              setResult(null);
            }}
            className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1d4ed8] transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => {
              setResult(null);
              setShowPrompt(true);
            }}
            className="rounded-lg border border-[#C3C6D7]/30 px-3 py-1.5 text-xs font-medium text-[#434655] hover:bg-white transition-colors"
          >
            Regenerate
          </button>
        </div>
      </div>
    );
  }

  if (!showPrompt) {
    return (
      <button
        onClick={() => setShowPrompt(true)}
        className="flex items-center gap-1.5 rounded-lg border border-[#C3C6D7]/50 px-3 py-1.5 text-xs font-medium text-[#434655] transition-colors hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#F8F9FF]"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Draft with AI
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-[#2563EB]/20 bg-[#EEF4FF] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#2563EB]" />
        <span className="text-sm font-semibold text-[#2563EB]">Draft with AI</span>
      </div>
      <p className="text-xs text-[#737686]">
        AI will analyze the title &ldquo;{title}&rdquo; and generate a full description with acceptance criteria.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Generate
            </>
          )}
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="rounded-lg border border-[#C3C6D7]/30 px-3 py-1.5 text-xs font-medium text-[#434655] hover:bg-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}