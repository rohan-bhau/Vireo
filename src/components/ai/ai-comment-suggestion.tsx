"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useSuggestCommentReplyMutation } from "@/store/aiApi";

interface AICommentSuggestionProps {
  taskKey: string;
  commentText: string;
  threadContext?: string;
  onApply: (suggestion: string) => void;
}

export function AICommentSuggestion({
  taskKey,
  commentText,
  threadContext,
  onApply,
}: AICommentSuggestionProps) {
  const [suggest, { isLoading }] = useSuggestCommentReplyMutation();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSuggest() {
    setError(null);
    try {
      const res = await suggest({
        taskKey,
        commentText,
        threadContext: threadContext || "",
      }).unwrap();
      setSuggestion(cleanSuggestion(res.reply));
    } catch {
      setError("Failed to generate suggestion.");
    }
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-xs text-red-500">{error}</p>
        <button onClick={handleSuggest} className="text-xs text-red-500 hover:underline">
          Retry
        </button>
      </div>
    );
  }

  if (suggestion) {
    return (
      <div className="rounded-lg border border-[#2563EB]/20 bg-[#EEF4FF] p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
          <span className="text-xs font-semibold text-[#2563EB]">Suggested Reply</span>
        </div>
        <p className="text-sm text-[#434655] whitespace-pre-wrap">{suggestion}</p>
        <div className="flex gap-2">
          <button
            onClick={() => { onApply(suggestion); setSuggestion(null); }}
            className="rounded bg-[#2563EB] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#1d4ed8] transition-colors"
          >
            Use this
          </button>
          <button
            onClick={() => setSuggestion(null)}
            className="rounded border border-[#C3C6D7]/30 px-2.5 py-1 text-xs font-medium text-[#434655] hover:bg-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSuggest}
      disabled={isLoading}
      className="flex items-center gap-1.5 rounded border border-[#C3C6D7]/40 px-2.5 py-1.5 text-xs font-medium text-[#737686] transition-colors hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#F8F9FF] disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
          Thinking...
        </>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5" />
          Suggest reply
        </>
      )}
    </button>
  );
}

function cleanSuggestion(text: string): string {
  let value = text.trim();
  const preamblePatterns = [
    /^(here(?:'s| is) (?:a |an )?(?:professional|suggested|polite)?[\s\S]{0,80}?[:.]\s*)/i,
    /^(you can (?:use|say)[\s\S]{0,60}?[:.]\s*)/i,
    /^(sure,?\s+|absolutely[.,]?\s+)/i,
    /^(reply:?\s*)/i,
    /^(suggested reply:?\s*)/i,
  ];
  for (const pattern of preamblePatterns) {
    value = value.replace(pattern, "");
  }
  value = value.replace(/^["'`]+/, "").replace(/["'`]+$/, "").trim();
  if (value.length === 0) return text.trim();
  return value;
}