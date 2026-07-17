"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGenerateTicketDraftMutation } from "@/store/aiApi";
import { Sparkles } from "lucide-react";

interface AITicketWriterProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onApply: (result: { description: string; acceptanceCriteria: string[]; suggestedLabels: string[] }) => void;
}

const TYPES = [
  { value: "task", label: "Task" },
  { value: "bug", label: "Bug" },
  { value: "story", label: "Story" },
  { value: "subtask", label: "Sub-task" },
];

export function AITicketWriter({ open, onClose, projectId, onApply }: AITicketWriterProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("task");
  const [generate, { isLoading }] = useGenerateTicketDraftMutation();
  const [result, setResult] = useState<{ description: string; acceptanceCriteria: string[]; suggestedLabels: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!title.trim()) return;
    setError(null);
    try {
      const res = await generate({ title: title.trim(), type, projectId }).unwrap();
      setResult(res);
    } catch {
      setError("Failed to generate ticket draft. Please try again.");
    }
  }

  function handleApply() {
    if (result) {
      onApply(result);
      onClose();
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="AI Ticket Writer" className="max-w-2xl">
      <div className="flex flex-col gap-4">
        {!result ? (
          <>
            <Input
              label="Ticket title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Add dark mode support"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434655]">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleGenerate} isLoading={isLoading} disabled={!title.trim()}>
                <Sparkles className="h-4 w-4" />
                Generate
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] p-4">
              <h4 className="mb-2 text-sm font-semibold text-[#121C28]">Description</h4>
              <p className="text-sm text-[#434655] whitespace-pre-wrap">{result.description}</p>
            </div>
            {result.acceptanceCriteria.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-[#121C28]">Acceptance Criteria</h4>
                <ul className="list-inside list-disc space-y-1">
                  {result.acceptanceCriteria.map((c, i) => (
                    <li key={i} className="text-sm text-[#434655]">{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.suggestedLabels.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-[#121C28]">Suggested Labels</h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.suggestedLabels.map((label) => (
                    <span key={label} className="rounded-full bg-[#EEF4FF] px-2.5 py-0.5 text-xs font-medium text-[#2563EB]">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={handleApply}>
                Apply to task
              </Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}