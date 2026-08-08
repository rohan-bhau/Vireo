"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { useSummarizeThreadMutation } from "@/store/aiApi";

interface AISummaryCardProps {
  taskKey: string;
}

export function AISummaryCard({ taskKey }: AISummaryCardProps) {
  const [summarize, { isLoading }] = useSummarizeThreadMutation();
  const [result, setResult] = useState<{
    summary: string;
    keyPoints: string[];
    suggestedAction: string;
  } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSummarize() {
    setError(null);
    try {
      const res = await summarize(taskKey).unwrap();
      setResult(res);
      setLoaded(true);
    } catch {
      setError("Failed to summarize. Please try again.");
    }
  }

  async function handleRegenerate() {
    setResult(null);
    await handleSummarize();
  }

  if (!loaded && !isLoading && !error) {
    return (
      <button
        onClick={handleSummarize}
        className="flex w-full items-center gap-2 rounded-lg border border-[#2563EB]/20 bg-gradient-to-r from-[#EEF4FF] to-[#F8F9FF] px-4 py-3 text-sm font-medium text-[#2563EB] transition-colors hover:border-[#2563EB]/40"
      >
        <Sparkles className="h-4 w-4" />
        Generate AI Summary
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#2563EB]/20 bg-gradient-to-r from-[#EEF4FF] to-[#F8F9FF] px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-[#2563EB]" />
          <span className="text-sm font-semibold text-[#2563EB]">AI Summary</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#737686]">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
          Analyzing thread...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-red-600">{error}</p>
          <button onClick={handleSummarize} className="text-xs font-medium text-red-600 hover:underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="rounded-lg border border-[#2563EB]/20 bg-gradient-to-r from-[#EEF4FF] to-[#F8F9FF]">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setCollapsed(!collapsed)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setCollapsed(!collapsed);
          }
        }}
        className="flex w-full items-center justify-between px-4 py-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#2563EB]" />
          <span className="text-sm font-semibold text-[#2563EB]">AI Summary</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleRegenerate(); }}
            className="flex h-6 w-6 items-center justify-center rounded text-[#737686] hover:bg-white/50 transition-colors"
            title="Regenerate"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          {collapsed ? (
            <ChevronDown className="h-4 w-4 text-[#737686]" />
          ) : (
            <ChevronUp className="h-4 w-4 text-[#737686]" />
          )}
        </div>
      </div>
      {!collapsed && (
        <div className="border-t border-[#2563EB]/10 px-4 py-3 space-y-3">
          <p className="text-sm text-[#434655] leading-relaxed">{result.summary}</p>
          {result.keyPoints.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-xs font-semibold text-[#737686]">Key Points</h4>
              <ul className="space-y-1">
                {result.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#434655]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.suggestedAction && (
            <div className="rounded-lg bg-white/60 px-3 py-2">
              <span className="text-xs font-semibold text-[#2563EB]">Suggested: </span>
              <span className="text-sm text-[#434655]">{result.suggestedAction}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}