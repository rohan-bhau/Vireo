"use client";

import { useState } from "react";
import type { Sprint } from "@/store/sprintApi";
import type { Task } from "@/store/taskApi";
import type { Epic } from "@/store/epicApi";
import { BacklogIssueCard } from "./backlog-issue-card";
import { DroppableContainer } from "./droppable-container";
import { StartSprintDialog } from "./start-sprint-dialog";
import { CompleteSprintDialog } from "./complete-sprint-dialog";
import { clsx } from "clsx";
import { ChevronDown, ChevronRight, Play, CheckCircle2, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateSprintMutation, useDeleteSprintMutation } from "@/store/sprintApi";
import { Dialog } from "@/components/ui/dialog";

interface SprintSectionProps {
  sprint: Sprint;
  tasks: Task[];
  projectId: string;
  workspaceId?: string;
  epics: Epic[];
  allSprints?: Sprint[];
  onTaskClick?: (taskKey: string) => void;
}

export function SprintSection({ sprint, tasks, projectId, workspaceId, epics, allSprints, onTaskClick }: SprintSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [updateSprint] = useUpdateSprintMutation();
  const [deleteSprint] = useDeleteSprintMutation();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(sprint.goal || "");

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const donePoints = tasks.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const progress = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  function findParentEpic(task: Task): Epic | undefined {
    if (!task.parentTask) return undefined;
    return epics.find((e) => e.epicKey === task.parentTask);
  }

  async function handleSaveGoal() {
    try {
      await updateSprint({ sprintId: sprint.id, goal: goalValue || undefined }).unwrap();
      setEditingGoal(false);
    } catch {}
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const sprintContent = (
    <div
      className={clsx(
        "rounded-[3px] border bg-white overflow-hidden",
        sprint.status === "ACTIVE" && "border-[#4C9AFF]",
        sprint.status === "PLANNING" && "border-[#DFE1E6]",
        sprint.status === "COMPLETED" && "border-[#DFE1E6] opacity-70"
      )}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-[#F4F5F7] transition-colors select-none"
      >
        <button className="text-[#5E6C84] flex-shrink-0">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-[#172B4D]">{sprint.name}</h4>
            <span className={clsx(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-[3px]",
              sprint.status === "ACTIVE" && "bg-[#DEEBFF] text-[#0065FF]",
              sprint.status === "PLANNING" && "bg-[#F4F5F7] text-[#5E6C84]",
              sprint.status === "COMPLETED" && "bg-[#E3FCEF] text-[#00875A]"
            )}>
              {sprint.status === "ACTIVE" ? "Active" : sprint.status === "PLANNING" ? "Planning" : "Completed"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#5E6C84] mt-0.5">
            {editingGoal ? (
              <div className="flex items-center gap-1 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <input
                  autoFocus
                  value={goalValue}
                  onChange={(e) => setGoalValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveGoal();
                    if (e.key === "Escape") setEditingGoal(false);
                  }}
                  onBlur={handleSaveGoal}
                  className="rounded-[3px] border border-[#4C9AFF] px-2 py-0.5 text-xs text-[#172B4D] focus:outline-none w-48"
                  placeholder="Sprint goal..."
                />
              </div>
            ) : sprint.goal ? (
              <>
                <span>{sprint.goal}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingGoal(true); setGoalValue(sprint.goal || ""); }}
                  className="text-[#5E6C84] hover:text-[#172B4D] opacity-0 group-hover/section:opacity-100 transition-opacity"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setEditingGoal(true); }}
                className="text-[#8993A4] italic hover:text-[#172B4D]"
              >
                + Add sprint goal
              </button>
            )}
          </div>
        </div>

        {formatDate(sprint.startDate) && (
          <div className="text-[11px] text-[#5E6C84] flex-shrink-0 hidden sm:block">
            {formatDate(sprint.startDate)}{formatDate(sprint.endDate) ? ` — ${formatDate(sprint.endDate)}` : ""}
          </div>
        )}

        <div className="flex items-center gap-3 text-[11px] text-[#5E6C84] flex-shrink-0">
          <span className="font-medium text-[#172B4D]">{tasks.length}</span> issues
          <span className="font-medium text-[#172B4D]">{totalPoints}</span> pts
        </div>

        {sprint.status === "ACTIVE" && (
          <div className="w-20 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 rounded-full bg-[#EBECF0] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0065FF] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-[#5E6C84]">{donePoints}/{totalPoints}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 flex-shrink-0">
          {sprint.status === "PLANNING" && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setShowStartDialog(true); }}
                className="rounded-[3px] px-2 py-1 text-xs font-medium text-[#0065FF] hover:bg-[#DEEBFF] transition-colors"
                title="Start sprint"
              >
                <Play className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                className="rounded-[3px] p-1 text-[#5E6C84] hover:bg-[#FFEBE6] hover:text-[#DE350B] transition-colors"
                title="Delete sprint"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          {sprint.status === "ACTIVE" && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowCompleteDialog(true); }}
              className="rounded-[3px] px-2 py-1 text-xs font-medium text-[#00875A] hover:bg-[#E3FCEF] transition-colors"
              title="Complete sprint"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[#EBECF0]">
          {tasks.length > 0 ? (
            <div>
              {tasks.map((task) => (
                <BacklogIssueCard
                  key={task.taskKey}
                  task={task}
                  parentEpic={findParentEpic(task)}
                  sprints={allSprints}
                  projectId={projectId}
                  workspaceId={workspaceId}
                  onClick={() => onTaskClick?.(task.taskKey)}
                />
              ))}
            </div>
          ) : (
            <p className="px-4 py-3 text-xs text-[#8993A4]">No issues in this sprint</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <DroppableContainer id={sprint.id}>
        {sprintContent}
      </DroppableContainer>

      {showStartDialog && (
        <StartSprintDialog
          sprint={sprint}
          tasks={tasks}
          projectId={projectId}
          onClose={() => setShowStartDialog(false)}
        />
      )}

      {showCompleteDialog && (
        <CompleteSprintDialog
          sprint={sprint}
          tasks={tasks}
          projectId={projectId}
          onClose={() => setShowCompleteDialog(false)}
        />
      )}

      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete sprint"
        className="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#5E6C84]">
            Are you sure you want to delete <strong>{sprint.name}</strong>? All issues will be moved back to the backlog.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={async () => {
                try {
                  await deleteSprint({ sprintId: sprint.id, projectId }).unwrap();
                  setShowDeleteConfirm(false);
                } catch {}
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
