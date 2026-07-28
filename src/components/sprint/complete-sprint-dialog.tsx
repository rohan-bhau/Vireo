"use client";

import { useState } from "react";
import type { Sprint } from "@/store/sprintApi";
import type { Task } from "@/store/taskApi";
import { useCompleteSprintMutation, useGetProjectSprintsQuery } from "@/store/sprintApi";
import { useCreateSprintMutation } from "@/store/sprintApi";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Plus } from "lucide-react";

interface CompleteSprintDialogProps {
  sprint: Sprint;
  tasks: Task[];
  projectId: string;
  onClose: () => void;
}

export function CompleteSprintDialog({ sprint, tasks, projectId, onClose }: CompleteSprintDialogProps) {
  const [completeSprint] = useCompleteSprintMutation();
  const [createSprint] = useCreateSprintMutation();
  const { data: allSprints = [] } = useGetProjectSprintsQuery(projectId);
  const [submitting, setSubmitting] = useState(false);
  const [goalCompleted, setGoalCompleted] = useState(false);
  const [unfinishedAction, setUnfinishedAction] = useState<"backlog" | "new-sprint">("backlog");
  const [newSprintName, setNewSprintName] = useState("");

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const donePoints = tasks.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const incompleteTasks = tasks.filter((t) => t.status !== "done");
  const plannedSprints = allSprints.filter((s) => s.status === "PLANNING");

  async function handleComplete() {
    setSubmitting(true);
    try {
      let moveToSprintId: string | undefined;
      if (unfinishedAction === "new-sprint" && newSprintName.trim()) {
        const newSprint = await createSprint({
          name: newSprintName.trim(),
          projectId,
        }).unwrap();
        moveToSprintId = newSprint.id;
      }
      await completeSprint({
        sprintId: sprint.id,
        projectId,
        goalCompleted: goalCompleted || undefined,
        moveToSprintId,
      }).unwrap();
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
          {sprint.goal && (
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={goalCompleted}
                onChange={(e) => setGoalCompleted(e.target.checked)}
                className="rounded border-[#DFE1E6] text-[#0065FF] focus:ring-[#4C9AFF]"
              />
              <span className="text-sm text-[#172B4D]">Sprint goal completed</span>
            </label>
          )}
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
          <div className="rounded-[3px] border border-[#DFE1E6] p-3 space-y-3">
            <p className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wider">
              Unfinished issues ({incompleteTasks.length})
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="unfinished-action"
                  checked={unfinishedAction === "backlog"}
                  onChange={() => setUnfinishedAction("backlog")}
                  className="border-[#DFE1E6] text-[#0065FF] focus:ring-[#4C9AFF]"
                />
                <div className="text-sm text-[#172B4D]">
                  <span className="font-medium">Move to backlog</span>
                  <p className="text-xs text-[#5E6C84]">Issues returned to the backlog</p>
                </div>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="unfinished-action"
                  checked={unfinishedAction === "new-sprint"}
                  onChange={() => setUnfinishedAction("new-sprint")}
                  className="mt-0.5 border-[#DFE1E6] text-[#0065FF] focus:ring-[#4C9AFF]"
                />
                <div className="flex-1 text-sm text-[#172B4D]">
                  <span className="font-medium">Move to new sprint</span>
                  {unfinishedAction === "new-sprint" && (
                    <div className="flex items-center gap-2 mt-1.5">
                      {plannedSprints.length > 0 && (
                        <select
                          value={newSprintName}
                          onChange={(e) => setNewSprintName(e.target.value)}
                          className="flex-1 rounded-[3px] border border-[#DFE1E6] px-2.5 py-1.5 text-xs text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#4C9AFF]"
                        >
                          <option value="">Create new...</option>
                          {plannedSprints.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      )}
                      <input
                        placeholder="Sprint name"
                        value={newSprintName}
                        onChange={(e) => setNewSprintName(e.target.value)}
                        className="flex-1 rounded-[3px] border border-[#DFE1E6] px-2.5 py-1.5 text-xs text-[#172B4D] placeholder:text-[#8993A4] focus:outline-none focus:ring-1 focus:ring-[#4C9AFF]"
                      />
                      <Plus className="h-3.5 w-3.5 text-[#5E6C84]" />
                    </div>
                  )}
                </div>
              </label>
            </div>
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
