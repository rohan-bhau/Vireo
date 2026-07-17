"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSmartTriageMutation } from "@/store/aiApi";
import { Sparkles } from "lucide-react";

interface AITriageProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  onApply: (result: {
    suggestedAssignee: string | null;
    suggestedPriority: string;
    suggestedLabels: string[];
    suggestedType: string;
  }) => void;
}

export function AITriage({ open, onClose, workspaceId, onApply }: AITriageProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [triage, { isLoading }] = useSmartTriageMutation();
  const [result, setResult] = useState<{
    suggestedAssignee: string | null;
    suggestedPriority: string;
    suggestedLabels: string[];
    suggestedType: string;
    reasoning: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleTriage() {
    if (!taskTitle.trim()) return;
    setError(null);
    try {
      const res = await triage({ taskTitle: taskTitle.trim(), taskDescription, workspaceId }).unwrap();
      setResult(res);
    } catch {
      setError("Failed to analyze task. Please try again.");
    }
  }

  function handleApply() {
    if (result) {
      onApply(result);
      onClose();
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="AI Smart Triage" className="max-w-2xl">
      <div className="flex flex-col gap-4">
        {!result ? (
          <>
            <Input
              label="Task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Enter task title"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434655]">Description (optional)</label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Describe the task..."
                rows={3}
                className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
              />
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleTriage} isLoading={isLoading} disabled={!taskTitle.trim()}>
                <Sparkles className="h-4 w-4" />
                Analyze
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] p-4">
              <h4 className="mb-2 text-sm font-semibold text-[#121C28]">AI Analysis</h4>
              <p className="text-sm text-[#434655]">{result.reasoning}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#C3C6D7]/20 p-3">
                <p className="text-xs text-[#737686]">Suggested Type</p>
                <p className="mt-1 text-sm font-semibold text-[#121C28] capitalize">{result.suggestedType}</p>
              </div>
              <div className="rounded-lg border border-[#C3C6D7]/20 p-3">
                <p className="text-xs text-[#737686]">Suggested Priority</p>
                <p className="mt-1 text-sm font-semibold text-[#121C28] capitalize">{result.suggestedPriority}</p>
              </div>
            </div>
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
            {result.suggestedAssignee && (
              <div className="rounded-lg border border-[#C3C6D7]/20 p-3">
                <p className="text-xs text-[#737686]">Suggested Assignee</p>
                <p className="mt-1 text-sm font-semibold text-[#121C28]">{result.suggestedAssignee}</p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleApply}>
                Apply suggestions
              </Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}