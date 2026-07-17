"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSummarizeThreadMutation } from "@/store/aiApi";

interface AISummarizerProps {
  taskKey: string;
}

export function AISummarizer({ taskKey }: AISummarizerProps) {
  const [summarize, { isLoading }] = useSummarizeThreadMutation();
  const [result, setResult] = useState<{ summary: string; keyPoints: string[]; suggestedAction: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSummarize() {
    setError(null);
    try {
      const res = await summarize(taskKey).unwrap();
      setResult(res);
    } catch {
      setError("Failed to summarize thread. Please try again.");
    }
  }

  function handleOpen() {
    setOpen(true);
    handleSummarize();
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-lg border border-[#C3C6D7]/50 px-3 py-1.5 text-xs font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        AI Summarize
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="AI Thread Summary" className="max-w-2xl">
        <div className="flex flex-col gap-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
              <p className="mt-3 text-sm text-[#737686]">Analyzing thread...</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}
          {result && !isLoading && !error && (
            <>
              <div className="rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] p-4">
                <h4 className="mb-2 text-sm font-semibold text-[#121C28]">Summary</h4>
                <p className="text-sm text-[#434655]">{result.summary}</p>
              </div>
              {result.keyPoints.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-[#121C28]">Key Points</h4>
                  <ul className="list-inside list-disc space-y-1">
                    {result.keyPoints.map((point, i) => (
                      <li key={i} className="text-sm text-[#434655]">{point}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.suggestedAction && (
                <div className="rounded-lg border border-[#2563EB]/20 bg-[#EEF4FF] p-3">
                  <h4 className="mb-1 text-xs font-semibold text-[#2563EB]">Suggested Action</h4>
                  <p className="text-sm text-[#434655]">{result.suggestedAction}</p>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}