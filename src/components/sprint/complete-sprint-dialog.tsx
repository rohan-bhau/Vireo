"use client";

import { useState } from "react";
import type { Sprint } from "@/store/sprintApi";
import type { Task } from "@/store/taskApi";
import { useCompleteSprintMutation } from "@/store/sprintApi";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface CompleteSprintDialogProps {
  sprint: Sprint;
  tasks: Task[];
  projectId: string;
  onClose: () => void;
}

export function CompleteSprintDialog({ sprint, tasks, projectId, onClose }: CompleteSprintDialogProps) {
  const [completeSprint] = useCompleteSprintMutation();
  const [submitting, setSubmitting] = useState(false);
  const [returnToBacklog, setReturnToBacklog] = useState(true);

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const donePoints = tasks.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const incompleteTasks = tasks.filter((t) => t.status !== "done");

  async function handleComplete() {
    setSubmitting(true);
    try {
      await completeSprint({ sprintId: sprint.id, projectId }).unwrap();
      onClose();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onClose={onClose} title="Complete sprint" className="max-w-md">
      <div className="space-y-4">
        <div className="rounded-[3px] border border-[#DFE1E6] bg-[#F4F5F7] p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#5E6C84]">Sprint</span>
            <span className="font-medium text-[#172B4D]">{sprint.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#5E6C84]">Planned</span>
            <span className="font-medium text-[#172B4D]">{tasks.length} issues · {totalPoints} pts</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#5E6C84] text-green-700">Completed</span>
            <span className="font-medium text-green-700">{doneTasks} issues · {donePoints} pts</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#5E6C84] text-[#DE350B]">Incomplete</span>
            <span className="font-medium text-[#DE350B]">{incompleteTasks.length} issues · {totalPoints - donePoints} pts</span>
          </div>

          <div className="pt-2 border-t border-[#DFE1E6]">
            <div className="h-2 rounded-full bg-[#EBECF0] overflow-hidden flex">
              <div
                className="h-full bg-[#00875A] transition-all"
                style={{ width: `${totalPoints > 0 ? (donePoints / totalPoints) * 100 : 0}%` }}
              />
              <div
                className="h-full bg-[#FF8F5E] transition-all"
                style={{ width: `${totalPoints > 0 ? ((totalPoints - donePoints) / totalPoints) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1 text-[10px] text-[#00875A]">
                <span className="h-2 w-2 rounded-sm bg-[#00875A]" /> Done
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#FF8F5E]">
                <span className="h-2 w-2 rounded-sm bg-[#FF8F5E]" /> Incomplete
              </div>
            </div>
          </div>
        </div>

        {incompleteTasks.length > 0 && (
          <div className="rounded-[3px] border border-[#DFE1E6] p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={returnToBacklog}
                onChange={(e) => setReturnToBacklog(e.target.checked)}
                className="rounded border-[#DFE1E6] text-[#0065FF] focus:ring-[#4C9AFF]"
              />
              <div className="text-sm text-[#172B4D]">
                <span className="font-medium">Move unfinished to backlog</span>
                <p className="text-xs text-[#5E6C84]">{incompleteTasks.length} issue{incompleteTasks.length !== 1 ? "s" : ""} will be returned</p>
              </div>
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleComplete} disabled={submitting} isLoading={submitting}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Complete
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
