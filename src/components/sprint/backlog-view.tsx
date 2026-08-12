"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useGetProjectSprintsQuery,
  useGetBacklogTasksQuery,
  useCreateSprintMutation,
  useAssignTasksToSprintMutation,
  useRemoveTasksFromSprintMutation,
} from "@/store/sprintApi";
import { useGetProjectQuery } from "@/store/projectApi";
import { useGetWorkspaceTasksQuery } from "@/store/taskApi";
import { useGetProjectEpicsQuery } from "@/store/epicApi";
import type { Task } from "@/store/taskApi";
import type { Epic } from "@/store/epicApi";
import { SprintSection } from "./sprint-section";
import { BacklogIssueCard } from "./backlog-issue-card";
import { DroppableContainer } from "./droppable-container";
import { EpicPanel } from "./epic-panel";
import { CreateSprintDialog } from "./create-sprint-dialog";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { Plus, Target, Search, Layers } from "lucide-react";

export function BacklogView({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { data: project } = useGetProjectQuery(projectId);
  const { data: sprints = [] } = useGetProjectSprintsQuery(projectId);
  const { data: backlogTasks = [] } = useGetBacklogTasksQuery(projectId);
  const { data: allTasks = [] } = useGetWorkspaceTasksQuery(project?.workspaceId ?? "", { skip: !project?.workspaceId });
  const { data: epics = [] } = useGetProjectEpicsQuery(projectId);

  const [createSprint] = useCreateSprintMutation();
  const [assignTasks] = useAssignTasksToSprintMutation();
  const [removeTasks] = useRemoveTasksFromSprintMutation();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreateName, setQuickCreateName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEpicPanel, setShowEpicPanel] = useState(false);
  const [selectedEpicKey, setSelectedEpicKey] = useState<string | null>(null);
  const [activeDragTask, setActiveDragTask] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeSprint = sprints.find((s) => s.status === "ACTIVE");
  const planningSprints = sprints.filter((s) => s.status === "PLANNING");
  const completedSprints = sprints.filter((s) => s.status === "COMPLETED");

  function findParentEpic(task: Task): Epic | undefined {
    if (!task.parentTask) return undefined;
    return epics.find((e) => e.epicKey === task.parentTask);
  }

  function getSprintTasks(sprintId: string): Task[] {
    return allTasks.filter((t) => t.sprintId === sprintId);
  }

  const filteredBacklog = useMemo(() => {
    let tasks = backlogTasks;
    if (selectedEpicKey) {
      tasks = tasks.filter((t) => t.parentTask === selectedEpicKey);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.taskKey.toLowerCase().includes(q) ||
          (t.assignee && t.assignee.toLowerCase().includes(q))
      );
    }
    return tasks;
  }, [backlogTasks, selectedEpicKey, searchQuery]);

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

  function handleDragStart(event: DragStartEvent) {
    setActiveDragTask(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragTask(null);
    if (!over) return;

    const taskKey = active.id as string;
    const overId = over.id as string;
    const task = allTasks.find((t) => t.taskKey === taskKey);
    if (!task) return;

    if (overId === "backlog") {
      if (task.sprintId) {
        try {
          await removeTasks({ sprintId: task.sprintId, taskKeys: [taskKey], projectId }).unwrap();
        } catch {}
      }
      return;
    }

    const targetSprint = sprints.find((s) => s.id === overId);
    if (targetSprint) {
      if (task.sprintId === targetSprint.id) return;
      try {
        await assignTasks({ sprintId: targetSprint.id, taskKeys: [taskKey], projectId }).unwrap();
      } catch {}
    }
  }

  function handleTaskClick(taskKey: string) {
    router.push(`/task/${taskKey}`);
  }

  const activeDragItem = activeDragTask ? allTasks.find((t) => t.taskKey === activeDragTask) : null;

  return (
    <div className="flex h-[calc(100vh-280px)]">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[#172B4D]">Backlog</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8993A4]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search backlog..."
                className="w-56 rounded-[3px] border border-[#DFE1E6] pl-8 pr-3 py-1.5 text-xs text-[#172B4D] placeholder:text-[#8993A4] focus:outline-none focus:ring-1 focus:ring-[#4C9AFF] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEpicPanel(!showEpicPanel)}
              className={clsx(
                "rounded-[3px] px-2.5 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
                showEpicPanel
                  ? "bg-[#DEEBFF] text-[#0065FF]"
                  : "text-[#5E6C84] hover:bg-[#F4F5F7]"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              Epics
              {selectedEpicKey && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#0065FF]" />
              )}
            </button>
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
                    className="w-36 rounded-[3px] border border-[#DFE1E6] px-2.5 py-1.5 text-xs text-[#172B4D] placeholder:text-[#8993A4] focus:outline-none focus:ring-1 focus:ring-[#4C9AFF]"
                  />
                  <Button size="sm" onClick={handleQuickCreateSprint}>Create</Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setShowQuickCreate(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  Quick sprint
                </Button>
              )}
            </div>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Target className="h-3.5 w-3.5" />
              Create sprint
            </Button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {activeSprint && (
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#5E6C84] mb-2">Active Sprint</h3>
                <SprintSection
                  sprint={activeSprint}
                  tasks={getSprintTasks(activeSprint.id)}
                  projectId={projectId}
                  workspaceId={project?.workspaceId}
                  epics={epics}
                  allSprints={sprints}
                  onTaskClick={handleTaskClick}
                />
              </div>
            )}

            {planningSprints.length > 0 && (
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#5E6C84] mb-2">
                  Planning ({planningSprints.length})
                </h3>
                <div className="space-y-3">
                  {planningSprints.map((sprint) => (
                    <SprintSection
                      key={sprint.id}
                      sprint={sprint}
                      tasks={getSprintTasks(sprint.id)}
                      projectId={projectId}
                      workspaceId={project?.workspaceId}
                      epics={epics}
                      allSprints={sprints}
                      onTaskClick={handleTaskClick}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#5E6C84] mb-2">
                Backlog ({filteredBacklog.length}){selectedEpicKey && ` · Filtered by epic`}
              </h3>
              <DroppableContainer id="backlog">
                <div className="rounded-[3px] border border-[#DFE1E6] bg-white overflow-hidden">
                  {filteredBacklog.length > 0 ? (
                    <div>
                      {filteredBacklog.map((task) => (
                        <BacklogIssueCard
                          key={task.taskKey}
                          task={task}
                          parentEpic={findParentEpic(task)}
                          sprints={sprints}
                          projectId={projectId}
                          workspaceId={project?.workspaceId}
                          onClick={() => handleTaskClick(task.taskKey)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-sm text-[#5E6C84]">
                        {selectedEpicKey ? "No issues match this epic" : "Backlog is empty"}
                      </p>
                      <p className="text-xs text-[#8993A4] mt-1">
                        {selectedEpicKey
                          ? "Create an issue with this epic as parent in the backlog"
                          : "All issues have been assigned to a sprint"}
                      </p>
                    </div>
                  )}
                </div>
              </DroppableContainer>
            </div>

            {completedSprints.length > 0 && (
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#5E6C84] mb-2">
                  Completed ({completedSprints.length})
                </h3>
                <div className="space-y-3">
                  {completedSprints.map((sprint) => (
                    <SprintSection
                      key={sprint.id}
                      sprint={sprint}
                      tasks={getSprintTasks(sprint.id)}
                      projectId={projectId}
                      workspaceId={project?.workspaceId}
                      epics={epics}
                      allSprints={sprints}
                      onTaskClick={handleTaskClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeDragItem && (
              <BacklogIssueCard
                task={activeDragItem}
                parentEpic={findParentEpic(activeDragItem)}
                isDragOverlay
              />
            )}
          </DragOverlay>
        </DndContext>

        <CreateSprintDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          projectId={projectId}
        />
      </div>

      {showEpicPanel && project?.workspaceId && (
        <EpicPanel
          projectId={projectId}
          workspaceId={project.workspaceId}
          allTasks={allTasks}
          selectedEpicKey={selectedEpicKey}
          onEpicSelect={setSelectedEpicKey}
        />
      )}
    </div>
  );
}
