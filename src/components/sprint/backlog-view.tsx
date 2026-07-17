"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetProjectSprintsQuery,
  useGetBacklogTasksQuery,
  useGetSprintTasksQuery,
  useCreateSprintMutation,
  useDeleteSprintMutation,
  useStartSprintMutation,
  useCompleteSprintMutation,
  useAssignTasksToSprintMutation,
  useRemoveTasksFromSprintMutation,
  type Sprint,
} from "@/store/sprintApi";
import { useGetProjectQuery } from "@/store/projectApi";
import { useGetWorkspaceTasksQuery, type Task } from "@/store/taskApi";
import { CreateSprintDialog } from "./create-sprint-dialog";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ChevronDown, ChevronRight, Plus, Play, CheckCircle2, Trash2, GripVertical, Target } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

export function BacklogView({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { data: project } = useGetProjectQuery(projectId);
  const { data: sprints = [] } = useGetProjectSprintsQuery(projectId);
  const { data: backlogTasks = [] } = useGetBacklogTasksQuery(projectId);
  const { data: allTasks = [] } = useGetWorkspaceTasksQuery(project?.workspaceId ?? "", { skip: !project?.workspaceId });

  const [createSprint] = useCreateSprintMutation();
  const [deleteSprint] = useDeleteSprintMutation();
  const [startSprint] = useStartSprintMutation();
  const [completeSprint] = useCompleteSprintMutation();
  const [assignTasks] = useAssignTasksToSprintMutation();
  const [removeTasks] = useRemoveTasksFromSprintMutation();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({});
  const [activeDragTask, setActiveDragTask] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreateName, setQuickCreateName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeSprint = sprints.find((s) => s.status === "ACTIVE");
  const planningSprints = sprints.filter((s) => s.status === "PLANNING");
  const completedSprints = sprints.filter((s) => s.status === "COMPLETED");

  const totalBacklogPoints = backlogTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  function toggleSprint(sprintId: string) {
    setExpandedSprints((prev) => ({
      ...prev,
      [sprintId]: !prev[sprintId],
    }));
  }

  async function handleQuickCreateSprint() {
    if (!quickCreateName.trim()) return;
    try {
      await createSprint({
        name: quickCreateName.trim(),
        projectId,
      }).unwrap();
      setQuickCreateName("");
      setShowQuickCreate(false);
    } catch {}
  }

  async function handleStartSprint(sprintId: string) {
    try {
      await startSprint({ sprintId, projectId }).unwrap();
    } catch {}
  }

  async function handleCompleteSprint(sprintId: string) {
    try {
      await completeSprint({ sprintId, projectId }).unwrap();
    } catch {}
  }

  async function handleDeleteSprint(sprintId: string) {
    try {
      await deleteSprint({ sprintId, projectId }).unwrap();
      setShowDeleteConfirm(null);
    } catch {}
  }

  function findSprintForTask(taskKey: string): Sprint | undefined {
    for (const sprint of sprints) {
      const sprintTasks = allTasks.filter((t) => t.sprintId === sprint.id);
      if (sprintTasks.some((t) => t.taskKey === taskKey)) return sprint;
    }
    return undefined;
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function sprintProgress(sprintId: string): number {
    const sprintTasks = allTasks.filter((t) => t.sprintId === sprintId);
    if (sprintTasks.length === 0) return 0;
    const done = sprintTasks.filter((t) => t.status === "done").length;
    return Math.round((done / sprintTasks.length) * 100);
  }

  function SprintCard({ sprint, tasks }: { sprint: Sprint; tasks: Task[] }) {
    const isExpanded = expandedSprints[sprint.id] ?? true;
    const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const donePoints = tasks.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    return (
      <div className={clsx(
        "rounded-xl border bg-white overflow-hidden transition-all",
        sprint.status === "ACTIVE" && "border-[#2563EB]/30 shadow-[0_0_0_1px_#2563EB]/10",
        sprint.status === "PLANNING" && "border-[#C3C6D7]/20",
        sprint.status === "COMPLETED" && "border-green-200 bg-green-50/30",
      )}>
        <div
          onClick={() => toggleSprint(sprint.id)}
          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F8F9FF] transition-colors"
        >
          <button className="text-[#737686]">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-[#121C28]">{sprint.name}</h4>
              <span className={clsx(
                "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                sprint.status === "ACTIVE" && "bg-blue-100 text-blue-700",
                sprint.status === "PLANNING" && "bg-gray-100 text-gray-600",
                sprint.status === "COMPLETED" && "bg-green-100 text-green-700",
              )}>
                {sprint.status === "ACTIVE" ? "Active" : sprint.status === "PLANNING" ? "Planning" : "Completed"}
              </span>
            </div>
            <p className="text-xs text-[#737686] mt-0.5">
              {formatDate(sprint.startDate)} — {formatDate(sprint.endDate)}
              {sprint.goal && ` · ${sprint.goal}`}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#737686]">
            <span>{tasks.length} tasks</span>
            <span>{totalPoints} pts</span>
          </div>
          {sprint.status === "ACTIVE" && (
            <div className="w-20">
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-[#E5E7EF] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2563EB] transition-all"
                    style={{ width: `${sprintProgress(sprint.id)}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-[#737686]">{sprintProgress(sprint.id)}%</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1">
            {sprint.status === "PLANNING" && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleStartSprint(sprint.id); }}
                  className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Play className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(sprint.id); }}
                  className="rounded p-1 text-[#737686] hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            {sprint.status === "ACTIVE" && (
              <button
                onClick={(e) => { e.stopPropagation(); handleCompleteSprint(sprint.id); }}
                className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
            )}
            {sprint.status === "ACTIVE" && (
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/p/${projectId}/sprint/${sprint.id}`); }}
                className="rounded px-2 py-1 text-xs font-medium text-[#2563EB] hover:bg-[#EEF4FF] transition-colors"
              >
                Board
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-[#C3C6D7]/10">
            {tasks.length > 0 ? (
              <div className="divide-y divide-[#C3C6D7]/10">
                {tasks.map((task) => (
                  <div
                    key={task.taskKey}
                    className="flex items-center gap-2 px-4 py-2 pl-12 text-sm hover:bg-[#F8F9FF] transition-colors cursor-pointer"
                    onClick={() => router.push(`/task/${task.taskKey}`)}
                  >
                    <span className="text-[10px] font-mono font-medium text-[#2563EB] w-20">{task.taskKey}</span>
                    <span className={clsx("flex-1 truncate", task.status === "done" && "line-through text-[#C3C6D7]")}>
                      {task.title}
                    </span>
                    {task.storyPoints && (
                      <span className="text-[11px] text-[#737686] bg-[#F1F2F6] rounded px-1.5 py-0.5">{task.storyPoints}pts</span>
                    )}
                    <span className={clsx(
                      "text-[11px] px-1.5 py-0.5 rounded",
                      task.status === "todo" && "text-gray-500",
                      task.status === "in_progress" && "text-blue-600 bg-blue-50",
                      task.status === "in_review" && "text-amber-600 bg-amber-50",
                      task.status === "done" && "text-green-600 bg-green-50",
                    )}>
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-3 pl-12 text-xs text-[#C3C6D7]">No tasks in this sprint</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#121C28]">Backlog</h2>
          <p className="text-sm text-[#737686]">{backlogTasks.length} unassigned tasks · {totalBacklogPoints} story points</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            {showQuickCreate ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  placeholder="Sprint name..."
                  value={quickCreateName}
                  onChange={(e) => setQuickCreateName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleQuickCreateSprint();
                    if (e.key === "Escape") setShowQuickCreate(false);
                  }}
                  className="w-40 rounded-lg border border-[#C3C6D7] px-3 py-1.5 text-sm text-[#121C28] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
                <Button size="sm" onClick={handleQuickCreateSprint}>Create</Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowQuickCreate(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Quick sprint
              </Button>
            )}
          </div>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Target className="h-3.5 w-3.5 mr-1" />
            New sprint
          </Button>
        </div>
      </div>

      {activeSprint && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737686] mb-3">Active Sprint</h3>
          <SprintCard
            sprint={activeSprint}
            tasks={allTasks.filter((t) => t.sprintId === activeSprint.id)}
          />
        </div>
      )}

      {planningSprints.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737686] mb-3">
            Planning ({planningSprints.length})
          </h3>
          <div className="space-y-3">
            {planningSprints.map((sprint) => (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                tasks={allTasks.filter((t) => t.sprintId === sprint.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737686] mb-3">
          Unassigned Tasks ({backlogTasks.length})
        </h3>
        {backlogTasks.length > 0 ? (
          <div className="rounded-xl border border-[#C3C6D7]/20 bg-white divide-y divide-[#C3C6D7]/10">
            {backlogTasks.map((task) => (
              <div
                key={task.taskKey}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#F8F9FF] transition-colors cursor-pointer group"
                onClick={() => router.push(`/task/${task.taskKey}`)}
              >
                <span className="text-[10px] font-mono font-medium text-[#2563EB] w-20">{task.taskKey}</span>
                <span className="flex-1 truncate text-[#121C28]">{task.title}</span>
                {task.storyPoints && (
                  <span className="text-[11px] text-[#737686] bg-[#F1F2F6] rounded px-1.5 py-0.5">{task.storyPoints}pts</span>
                )}
                <span className="text-xs text-[#737686] capitalize">{task.type}</span>
                {task.assignee && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-semibold text-white">
                    {task.assignee.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#C3C6D7]/30 bg-white py-12 text-center">
            <svg className="mb-3 h-10 w-10 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            <p className="text-sm text-[#737686]">Backlog is empty</p>
            <p className="text-xs text-[#C3C6D7] mt-1">All tasks have been assigned to sprints</p>
          </div>
        )}
      </div>

      {completedSprints.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737686] mb-3">
            Completed ({completedSprints.length})
          </h3>
          <div className="space-y-3">
            {completedSprints.map((sprint) => (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                tasks={allTasks.filter((t) => t.sprintId === sprint.id)}
              />
            ))}
          </div>
        </div>
      )}

      <CreateSprintDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        projectId={projectId}
      />

      <Dialog
        open={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete sprint"
        className="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#737686]">
            Are you sure you want to delete this sprint? Tasks will be moved back to the backlog.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => showDeleteConfirm && handleDeleteSprint(showDeleteConfirm)}>
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
