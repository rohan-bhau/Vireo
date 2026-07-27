"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSuggestSprintPlanMutation } from "@/store/aiApi";
import { Sparkles, Check, RefreshCw } from "lucide-react";

interface AISprintPlannerProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export function AISprintPlanner({ open, onClose, projectId }: AISprintPlannerProps) {
  const [sprintName, setSprintName] = useState("");
  const [sprintCapacity, setSprintCapacity] = useState("20");
  const [plan, { isLoading }] = useSuggestSprintPlanMutation();
  const [result, setResult] = useState<{
    suggestedTasks: { taskKey: string; reason: string }[];
    goal: string;
    estimatedPoints: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTasks, setAcceptedTasks] = useState<Set<number>>(new Set());

  async function handlePlan() {
    if (!sprintName.trim()) return;
    setError(null);
    try {
      const res = await plan({
        projectId,
        sprintName: sprintName.trim(),
        sprintCapacity: parseInt(sprintCapacity, 10) || 20,
      }).unwrap();
      setResult(res);
      setAcceptedTasks(new Set(res.suggestedTasks.map((_, i) => i)));
    } catch {
      setError("Failed to generate sprint plan. Please try again.");
    }
  }

  function toggleTask(index: number) {
    setAcceptedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleAccept() {
    onClose();
  }

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} title="AI Sprint Planner" className="max-w-2xl">
      <div className="flex flex-col gap-4">
        {!result ? (
          <>
            <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#EEF4FF] to-[#F8F9FF] p-3">
              <Sparkles className="h-5 w-5 text-[#2563EB]" />
              <p className="text-xs text-[#737686]">
                AI will analyze your backlog and team velocity to suggest the optimal sprint plan.
              </p>
            </div>
            <Input
              label="Sprint name"
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              placeholder="e.g. Sprint 5"
            />
            <Input
              label="Capacity (story points)"
              type="number"
              value={sprintCapacity}
              onChange={(e) => setSprintCapacity(e.target.value)}
              placeholder="e.g. 20"
            />
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handlePlan} isLoading={isLoading} disabled={!sprintName.trim()}>
                <Sparkles className="h-4 w-4" />
                Generate plan
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#121C28]">{sprintName}</h3>
              </div>
              <button
                onClick={handlePlan}
                disabled={isLoading}
                className="flex items-center gap-1 rounded-lg border border-[#C3C6D7]/30 px-2.5 py-1.5 text-xs font-medium text-[#737686] hover:bg-[#F8F9FF] transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            </div>

            {result.goal && (
              <div className="rounded-lg border border-[#2563EB]/20 bg-[#EEF4FF] p-4">
                <h4 className="mb-1 text-xs font-semibold text-[#2563EB]">Sprint Goal</h4>
                <p className="text-sm text-[#434655]">{result.goal}</p>
              </div>
            )}

            {result.suggestedTasks.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[#121C28]">
                    Suggested Tasks
                  </h4>
                  <span className="text-xs text-[#737686]">
                    {acceptedTasks.size} selected &middot; ~{result.estimatedPoints} pts
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {result.suggestedTasks.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => toggleTask(i)}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                        acceptedTasks.has(i)
                          ? "border-[#2563EB]/30 bg-[#EEF4FF]"
                          : "border-[#C3C6D7]/20 bg-white hover:bg-[#F8F9FF]"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          acceptedTasks.has(i)
                            ? "border-[#2563EB] bg-[#2563EB] text-white"
                            : "border-[#C3C6D7]"
                        }`}
                      >
                        {acceptedTasks.has(i) && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2563EB]">{t.taskKey}</p>
                        <p className="text-xs text-[#737686] mt-0.5 line-clamp-2">{t.reason}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-[#C3C6D7]/20">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleAccept} disabled={acceptedTasks.size === 0}>
                <Check className="h-4 w-4" />
                Accept sprint ({acceptedTasks.size} tasks)
              </Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}