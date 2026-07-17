"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetSprintQuery,
  useGetSprintTasksQuery,
  useCompleteSprintMutation,
} from "@/store/sprintApi";
import { useGetProjectQuery } from "@/store/projectApi";
import { useMoveTaskMutation, type Task } from "@/store/taskApi";
import { EpicSidebar } from "./epic-sidebar";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle2, ArrowLeft } from "lucide-react";

interface ScrumBoardProps {
  projectId: string;
  sprintId: string;
}

const COLUMNS = [
  { id: "todo", name: "Todo" },
  { id: "in_progress", name: "In Progress" },
  { id: "in_review", name: "In Review" },
  { id: "done", name: "Done" },
];

const COLORS = {
  todo: { bg: "#F1F2F6", dot: "#C3C6D7" },
  in_progress: { bg: "#EEF4FF", dot: "#2563EB" },
  in_review: { bg: "#FEF3C7", dot: "#D97706" },
  done: { bg: "#D1FAE5", dot: "#059669" },
};

export function ScrumBoard({ projectId, sprintId }: ScrumBoardProps) {
  const router = useRouter();
  const { data: sprint } = useGetSprintQuery(sprintId);
  const { data: tasks = [] } = useGetSprintTasksQuery(sprintId);
  const { data: project } = useGetProjectQuery(projectId);
  const [completeSprint] = useCompleteSprintMutation();
  const [moveTask] = useMoveTaskMutation();
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function getColumnTasks(columnId: string): Task[] {
    return tasks.filter((t) => {
      if (t.columnId) {
        const col = COLUMNS.find((c) => c.id === t.columnId);
        return col?.id === columnId;
      }
      return t.status === columnId;
    });
  }

  function defaultColumnId(status: string): string {
    return status;
  }

  function mapColumnIdToStatus(columnId: string): Task["status"] {
    return columnId as Task["status"];
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTask(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeKey = active.id as string;
    const overId = over.id as string;

    const targetColumn = COLUMNS.find((c) => c.id === overId);
    if (!targetColumn) return;

    const task = tasks.find((t) => t.taskKey === activeKey);
    if (!task) return;

    const currentStatus = task.columnId || task.status;
    if (currentStatus === targetColumn.id) return;

    try {
      await moveTask({
        taskKey: activeKey,
        columnId: targetColumn.id,
        position: 0,
      }).unwrap();
    } catch {
      // silent
    }
  }

  async function handleCompleteSprint() {
    try {
      await completeSprint({ sprintId, projectId }).unwrap();
      router.push(`/p/${projectId}/backlog`);
    } catch {}
  }

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const donePoints = tasks.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  return (
    <div className="flex h-[calc(100vh-280px)]">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/p/${projectId}/backlog`)}
              className="rounded-lg p-1.5 text-[#737686] hover:bg-[#F1F2F6] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-base font-semibold text-[#121C28]">{sprint?.name || "Sprint"}</h2>
              <p className="text-xs text-[#737686]">
                {sprint?.goal && `Goal: ${sprint.goal}`}
                {sprint?.startDate && ` · ${new Date(sprint.startDate).toLocaleDateString()}`}
                {sprint?.endDate && ` — ${new Date(sprint.endDate).toLocaleDateString()}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-[#737686]">
              <span className="font-medium text-[#121C28]">{tasks.length}</span> tasks
              <span className="mx-1.5">·</span>
              <span className="font-medium text-[#121C28]">{donePoints}/{totalPoints}</span> pts done
            </div>
            {sprint?.status === "ACTIVE" && (
              <Button size="sm" variant="outline" onClick={() => setShowComplete(true)}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Complete sprint
              </Button>
            )}
          </div>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((column) => {
              const columnTasks = getColumnTasks(column.id);
              return (
                <div key={column.id} className="flex w-72 flex-shrink-0 flex-col rounded-xl"
                  style={{ backgroundColor: COLORS[column.id as keyof typeof COLORS].bg }}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: COLORS[column.id as keyof typeof COLORS].dot }} />
                      <h3 className="text-sm font-semibold text-[#121C28]">{column.name}</h3>
                      <span className="rounded-md bg-white/60 px-1.5 py-0.5 text-[11px] font-medium text-[#737686]">
                        {columnTasks.length}
                      </span>
                    </div>
                  </div>

                  <SortableContext items={columnTasks.map((t) => t.taskKey)} strategy={verticalListSortingStrategy}>
                    <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.taskKey}
                          task={task}
                          onClick={() => router.push(`/task/${task.taskKey}`)}
                        />
                      ))}
                      {columnTasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <p className="text-xs text-[#737686]">No tasks</p>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask && tasks.find((t) => t.taskKey === activeTask) ? (
              <div className="rounded-lg bg-white p-3 shadow-lg border border-[#2563EB]/30 w-72">
                <p className="text-sm font-medium text-[#121C28]">
                  {tasks.find((t) => t.taskKey === activeTask)?.title}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {project?.workspaceId && (
        <EpicSidebar projectId={projectId} workspaceId={project.workspaceId} />
      )}
    </div>
  );
}

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: task.taskKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx(
        "cursor-pointer rounded-lg bg-white p-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#C3C6D7]/20 hover:border-[#2563EB]/30 hover:shadow-md transition-all touch-none select-none",
        isOver && !isDragging && "border-t-2 border-t-[#2563EB]",
        task.status === "done" && "bg-green-50/50"
      )}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[11px] font-mono font-medium text-[#2563EB]">{task.taskKey}</span>
      </div>
      <p className={clsx(
        "text-sm font-medium text-[#121C28] line-clamp-2",
        task.status === "done" && "line-through"
      )}>
        {task.title}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {task.storyPoints && (
          <span className="rounded bg-[#F1F2F6] px-1.5 py-0.5 text-[10px] font-medium text-[#737686]">
            {task.storyPoints}pts
          </span>
        )}
        {task.assignee && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-semibold text-white ml-auto">
            {task.assignee.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
