"use client";

import { useState } from "react";
import type { Sprint } from "@/store/sprintApi";
import type { Task } from "@/store/taskApi";
import { useStartSprintMutation } from "@/store/sprintApi";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, AlertTriangle } from "lucide-react";

interface StartSprintDialogProps {
  sprint: Sprint;
  tasks: Task[];
  projectId: string;
  onClose: () => void;
}

export function StartSprintDialog({ sprint, tasks, projectId, onClose }: StartSprintDialogProps) {
  const [startSprint] = useStartSprintMutation();
  const [submitting, setSubmitting] = useState(false);

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const hasUnestimated = tasks.some((t) => !t.storyPoints);

  async function handleStart() {
    setSubmitting(true);
    try {
      await startSprint({ sprintId: sprint.id, projectId }).unwrap();
      onClose();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onClose={onClose} title="Start sprint" className="max-w-md">
      <div className="space-y-4">
        <div className="rounded-[3px] border border-[#DFE1E6] bg-[#F4F5F7] p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#5E6C84]">Sprint</span>
            <span className="font-medium text-[#172B4D]">{sprint.name}</span>
          </div>
          {sprint.goal && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#5E6C84]">Goal</span>
              <span className="text-[#172B4D]">{sprint.goal}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#5E6C84]">Issues</span>
            <span className="font-medium text-[#172B4D]">{tasks.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#5E6C84]">Story points</span>
            <span className="font-medium text-[#172B4D]">{totalPoints}</span>
          </div>
        </div>

        {hasUnestimated && (
          <div className="flex items-start gap-2 rounded-[3px] border border-[#FFE380] bg-[#FFF8E6] p-3 text-sm text-[#172B4D]">
            <AlertTriangle className="h-4 w-4 text-[#FF8B00] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Unestimated issues</p>
              <p className="text-xs text-[#5E6C84] mt-0.5">
                {tasks.filter((t) => !t.storyPoints).length} issue{tasks.filter((t) => !t.storyPoints).length !== 1 ? "s" : ""} {" "}
                without story points won't count toward velocity.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleStart} disabled={submitting} isLoading={submitting}>
            <Play className="h-3.5 w-3.5" />
            Start sprint
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
