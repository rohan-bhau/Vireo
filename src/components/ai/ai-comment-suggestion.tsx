"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useChatWithAIMutation } from "@/store/aiApi";

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
  const [chat, { isLoading }] = useChatWithAIMutation();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSuggest() {
    setError(null);
    try {
      const context = threadContext
        ? `Context: ${threadContext.substring(0, 1000)}\n\n`
        : "";
      const prompt = `You are a professional project management assistant. ${context}Suggest a professional reply for this comment thread on task ${taskKey}. The user is drafting: "${commentText || "(empty - suggest a general response)"}". Provide a single, concise, professional response (2-3 sentences).`;
      const res = await chat({ message: prompt, context: { taskKey } }).unwrap();
      setSuggestion(res.reply);
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