"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSuggestSprintPlanMutation } from "@/store/aiApi";
import { Sparkles } from "lucide-react";

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
    } catch {
      setError("Failed to generate sprint plan. Please try again.");
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="AI Sprint Planner" className="max-w-2xl">
      <div className="flex flex-col gap-4">
        {!result ? (
          <>
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
            {result.goal && (
              <div className="rounded-lg border border-[#2563EB]/20 bg-[#EEF4FF] p-4">
                <h4 className="mb-1 text-xs font-semibold text-[#2563EB]">Sprint Goal</h4>
                <p className="text-sm text-[#434655]">{result.goal}</p>
              </div>
            )}
            {result.suggestedTasks.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-[#121C28]">
                  Suggested Tasks ({result.estimatedPoints} pts)
                </h4>
                <div className="flex flex-col gap-2">
                  {result.suggestedTasks.map((t, i) => (
                    <div key={i} className="rounded-lg border border-[#C3C6D7]/20 bg-white p-3">
                      <p className="text-sm font-medium text-[#2563EB]">{t.taskKey}</p>
                      <p className="text-xs text-[#737686] mt-0.5">{t.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}