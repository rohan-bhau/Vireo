"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { taskApi } from "@/store/taskApi";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useGetProjectBoardsQuery, useReorderColumnsMutation, useAddColumnMutation } from "@/store/projectApi";
import { useGetBoardTasksQuery, useMoveTaskMutation, useUpdateTaskMutation } from "@/store/taskApi";
import { useGetSprintQuery, useGetSprintTasksQuery, useCompleteSprintMutation } from "@/store/sprintApi";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import { BoardSwitcher } from "./board-switcher";
import { BoardHeader } from "./board-header";
import { BoardFilterBar } from "./board-filter-bar";
import { BoardColumn } from "./board-column";
import { IssueCardOverlay } from "./issue-card";
import { SwimlaneRow } from "./swimlane-row";
import { BoardConfigPanel } from "./board-config-panel";
import { toastError } from "@/lib/toast";
import {
  connectSocket,
  joinWorkspaceRoom,
  leaveWorkspaceRoom,
  onBoardColumnsReordered,
  onTaskCreated,
  onTaskUpdated,
  onTaskMoved,
  onTaskDeleted,
  onTaskReordered,
} from "@/lib/socket";
import type { Task } from "@/store/taskApi";
import type { Board, Column } from "@/store/projectApi";

interface BoardViewProps {
  projectId: string;
  workspaceId: string;
  boardId?: string;
  sprintId?: string;
  onBack?: () => void;
}

const DEFAULT_COLUMNS: { id: string; name: string; wipLimit: number | null }[] = [
  { id: "todo", name: "Todo", wipLimit: null },
  { id: "in_progress", name: "In Progress", wipLimit: null },
  { id: "in_review", name: "In Review", wipLimit: null },
  { id: "done", name: "Done", wipLimit: null },
];

export function BoardView({ projectId, workspaceId, boardId: initialBoardId, sprintId, onBack }: BoardViewProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

  const { data: boards = [], refetch: refetchBoards } = useGetProjectBoardsQuery(projectId);

  const [activeBoardId, setActiveBoardId] = useState<string | undefined>(initialBoardId);
  const [prevActiveBoardId, setPrevActiveBoardId] = useState<string | undefined>(initialBoardId);
  const [columnOrderOverride, setColumnOrderOverride] = useState<string[] | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0] || null;

  const { data: boardTasks = [], isLoading: tasksLoading, refetch: refetchBoardTasks } = useGetBoardTasksQuery(activeBoardId ?? "", { skip: !activeBoardId || !!sprintId });
  const { data: sprintTasks = [], isLoading: sprintTasksLoading } = useGetSprintTasksQuery(sprintId ?? "", { skip: !sprintId });
  const { data: sprint } = useGetSprintQuery(sprintId ?? "", { skip: !sprintId });

  const tasks = sprintId ? sprintTasks : boardTasks;

  const [moveTask] = useMoveTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [reorderColumns] = useReorderColumnsMutation();
  const [addColumn] = useAddColumnMutation();
  const [completeSprint] = useCompleteSprintMutation();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverColumnId, setHoverColumnId] = useState<string | null>(null);
  const [createColumnId, setCreateColumnId] = useState<string>("");

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [, setJqlQuery] = useState("");
  const [swimlaneType, setSwimlaneType] = useState<string>("none");
  const [now] = useState(() => Date.now());

  const { data: members = [] } = useGetMembersQuery(workspaceId);
  const currentMember = members.find((m) => m.userId === currentUserId);
  const canCreate = currentMember ? currentMember.role !== "VIEW" : false;
  const membersMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of members) {
      if (m.user?.name) map[m.userId] = m.user.name;
    }
    return map;
  }, [members]);

  useEffect(() => {
    if (!activeBoardId) return;
    const socket = connectSocket();
    socket.emit("join-board", activeBoardId);
    joinWorkspaceRoom(workspaceId);
    return () => {
      socket.emit("leave-board", activeBoardId);
      leaveWorkspaceRoom(workspaceId);
    };
  }, [activeBoardId, workspaceId]);

  if (!activeBoardId && boards.length > 0 && prevActiveBoardId !== boards[0].id) {
    setPrevActiveBoardId(boards[0].id);
    setActiveBoardId(boards[0].id);
  }

  useEffect(() => {
    if (!activeBoardId) return;
    const off = onBoardColumnsReordered((data) => {
      if (data.boardId !== activeBoardId) return;
      const incoming = data.columns.map((c) => c.id);
      setColumnOrderOverride(incoming);
      refetchBoards();
    });
    return off;
  }, [activeBoardId, refetchBoards]);

  useEffect(() => {
    if (!activeBoardId || sprintId) return;
    const refresh = () => {
      if (refetchBoardTasks) refetchBoardTasks();
    };
    const offs = [
      onTaskCreated((data) => { if (data.actorId !== currentUserId) refresh(); }),
      onTaskUpdated((data) => { if (data.actorId !== currentUserId) refresh(); }),
      onTaskMoved((data) => { if (data.actorId !== currentUserId) refresh(); }),
      onTaskDeleted((data) => { if (data.actorId !== currentUserId) refresh(); }),
      onTaskReordered((data) => { if ((data as { actorId?: string }).actorId !== currentUserId) refresh(); }),
    ];
    return () => offs.forEach((off) => off());
  }, [activeBoardId, sprintId, refetchBoardTasks, currentUserId]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 10 } })
  );

  const boardConfig = activeBoard?.config;

  const columns: { id: string; name: string; wipLimit: number | null }[] = useMemo(() => {
    if (activeBoard?.columns && activeBoard.columns.length > 0) {
      const sorted = [...activeBoard.columns]
        .sort((a, b) => a.position - b.position)
        .map((c: Column) => ({ id: c.id, name: c.name, wipLimit: c.wipLimit ?? null }));
      if (columnOrderOverride && columnOrderOverride.length === sorted.length) {
        const byId = new Map(sorted.map((c) => [c.id, c]));
        const reordered = columnOrderOverride.map((id) => byId.get(id)).filter(Boolean) as typeof sorted;
        if (reordered.length === sorted.length) return reordered;
      }
      return sorted;
    }
    return DEFAULT_COLUMNS;
  }, [activeBoard, columnOrderOverride]);

  const collisionDetection = useCallback<CollisionDetection>(
    (args) => {
      const activeId = args.active.id as string;
      const isColumnDrag = columns.some((c) => c.id === activeId);
      const candidates = args.droppableContainers.filter((dc) => {
        if (isColumnDrag) {
          return columns.some((c) => c.id === dc.id);
        }
        return dc.id !== activeId;
      });
      const filteredArgs = { ...args, droppableContainers: candidates };
      const pointer = pointerWithin(filteredArgs);
      if (pointer.length > 0) return pointer;
      return rectIntersection(filteredArgs);
    },
    [columns]
  );

  const columnIds = columns.map((c) => c.id);

  function getColumnTasks(columnId: string): Task[] {
    return tasks
      .filter((t) => {
        const taskColId = t.columnId || defaultColumnId(t.status);
        return taskColId === columnId;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  function defaultColumnId(status: string): string {
    switch (status) {
      case "todo": return columns[0]?.id || "todo";
      case "in_progress": return columns[1]?.id || "in_progress";
      case "in_review": return columns[2]?.id || "in_review";
      case "done": return columns[3]?.id || "done";
      default: return columns[0]?.id || "todo";
    }
  }

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (activeFilters.includes("my-issues")) {
      result = result.filter((t) => t.assignee === "currentUser");
    }
    if (activeFilters.includes("unassigned")) {
      result = result.filter((t) => !t.assignee);
    }
    if (activeFilters.includes("recently-updated")) {
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      result = result.filter((t) => new Date(t.updatedAt) >= sevenDaysAgo);
    }
    if (assigneeFilter.length > 0) {
      result = result.filter((t) => t.assignee && assigneeFilter.includes(t.assignee));
    }
    return result;
  }, [tasks, activeFilters, assigneeFilter, now]);

  function handleToggleFilter(filterId: string) {
    setActiveFilters((prev) =>
      prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]
    );
  }

  function handleToggleAssignee(userId: string) {
    setAssigneeFilter((prev) =>
      prev.includes(userId) ? prev.filter((u) => u !== userId) : [...prev, userId]
    );
  }

  function handleClearFilters() {
    setActiveFilters([]);
    setAssigneeFilter([]);
    setJqlQuery("");
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const activeIdStr = active.id as string;
    const overId = over?.id as string | undefined;

    const isColumnDrag = columns.some((c) => c.id === activeIdStr);

    if (isColumnDrag && overId && activeBoard?.columns) {
      const currentOrder = columnOrderOverride ?? [...activeBoard.columns].sort((a, b) => a.position - b.position).map((c) => c.id);
      const oldIndex = currentOrder.indexOf(activeIdStr);
      const newIndex = currentOrder.indexOf(overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setColumnOrderOverride(arrayMove(currentOrder, oldIndex, newIndex));
      }
      setHoverColumnId(overId);
      return;
    }

    if (overId && columns.some((c) => c.id === overId)) {
      setHoverColumnId(overId);
    } else if (overId) {
      const overTask = tasks.find((t) => t.taskKey === overId);
      if (overTask) {
        setHoverColumnId(overTask.columnId || defaultColumnId(overTask.status));
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setHoverColumnId(null);
    if (!over) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    const isColumn = columns.some((c) => c.id === activeIdStr);
    if (isColumn) {
      if (!activeBoard || !activeBoard.columns) return;
      const newOrder = columnOrderOverride ?? [...activeBoard.columns].sort((a, b) => a.position - b.position).map((c) => c.id);
      setColumnOrderOverride(newOrder);
      await reorderColumns({ boardId: activeBoard.id, projectId, columnIds: newOrder });
      return;
    }

    const activeTask = tasks.find((t) => t.taskKey === activeIdStr);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t.taskKey === overIdStr);
    let targetColumnId: string;
    if (overTask) {
      targetColumnId = overTask.columnId || defaultColumnId(overTask.status);
    } else if (columns.some((c) => c.id === overIdStr)) {
      targetColumnId = overIdStr;
    } else {
      return;
    }

    const currentColId = activeTask.columnId || defaultColumnId(activeTask.status);
    if (currentColId === targetColumnId) return;

    if (activeBoardId) {
      dispatch(
        taskApi.util.updateQueryData("getBoardTasks", activeBoardId, (draft) => {
          const idx = draft.findIndex((t) => t.taskKey === activeIdStr);
          if (idx === -1) return draft;
          draft[idx] = { ...draft[idx], columnId: targetColumnId };
          return draft;
        })
      );
    }

    try {
      await moveTask({ taskKey: activeIdStr, columnId: targetColumnId, position: 0, boardId: activeBoardId }).unwrap();
      const children = tasks.filter((t) => t.parentTask === activeIdStr);
      for (const child of children) {
        try {
          await moveTask({ taskKey: child.taskKey, columnId: targetColumnId, position: 0, boardId: activeBoardId }).unwrap();
        } catch {
          // child may not be movable by this user; skip without reverting the parent move
        }
      }
    } catch (e) {
      toastError((e as { data?: { message?: string }; message?: string })?.data?.message ||
        (e as { message?: string })?.message ||
        "Could not move task");
      if (refetchBoardTasks) refetchBoardTasks();
    }
  }

  async function handleAddColumn() {
    if (!newColumnName.trim() || !activeBoard) return;
    await addColumn({ boardId: activeBoard.id, name: newColumnName.trim() });
    setNewColumnName("");
    setShowAddColumn(false);
  }

  async function handleCompleteSprint() {
    if (!sprintId) return;
    try {
      await completeSprint({ sprintId, projectId }).unwrap();
      router.push(`/p/${projectId}/backlog`);
    } catch {}
  }

  function handleCreateTask(colId: string) {
    setCreateColumnId((prev) => (prev === colId ? "" : colId));
  }

  async function handleAssigneeChange(taskKey: string, userId: string | null) {
    if (!activeBoardId) return;
    try {
      await updateTask({
        taskKey,
        data: { assignee: userId },
        workspaceId,
        boardId: activeBoardId,
      }).unwrap();
    } catch (e) {
      toastError(
        (e as { data?: { message?: string }; message?: string })?.data?.message ||
        (e as { message?: string })?.message ||
        "Could not update assignee"
      );
    }
  }

  const isLoading = tasksLoading || sprintTasksLoading;
  const boardForConfig = activeBoard as Board | null;

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const donePoints = tasks.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const donePercent = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  // Swimlane grouping
  const swimlaneGroups = useMemo(() => {
    if (swimlaneType === "none") return null;
    const groups: Record<string, Task[]> = {};
    for (const task of filteredTasks) {
      let key = "Other";
      if (swimlaneType === "assignee") key = task.assignee || "Unassigned";
      else if (swimlaneType === "epic") {
        const epicLabel = task.labels.find((l) => l.startsWith("epic:"));
        key = epicLabel ? epicLabel.replace("epic:", "") : "No epic";
      }
      else if (swimlaneType === "priority") key = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTasks, swimlaneType]);

  return (
    <div className="flex flex-1 flex-col h-full">
      {sprint && (
        <div className="flex items-center justify-between mb-4 px-1 max-sm:flex-col max-sm:items-start max-sm:gap-2 bg-surface rounded-lg border border-border-light p-4 shadow-card">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-light transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold text-text-primary">{sprint.name}</h2>
              <p className="text-xs text-text-tertiary">
                {sprint.goal && `Goal: ${sprint.goal}`}
                {sprint.startDate && ` · ${new Date(sprint.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                {sprint.endDate && ` — ${new Date(sprint.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 max-sm:w-full max-sm:justify-between">
            {totalPoints > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-bg-neutral overflow-hidden max-sm:w-16">
                  <div className="h-full rounded-full bg-success transition-all" style={{ width: `${donePercent}%` }} />
                </div>
                <span className="text-xs text-text-tertiary whitespace-nowrap">
                  <span className="font-medium text-text-primary">{donePoints}/{totalPoints}</span> pts
                </span>
              </div>
            )}
            {sprint.status === "ACTIVE" && (
              <Button size="sm" variant="outline" onClick={handleCompleteSprint}>
                <svg className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
                </svg>
                Complete sprint
              </Button>
            )}
          </div>
        </div>
      )}

      {!sprintId && (
        <div className="mb-3 space-y-3">
          {boards.length > 1 && (
            <BoardSwitcher boards={boards} activeBoardId={activeBoardId || boards[0]?.id || ""} onSelect={setActiveBoardId} />
          )}
          {activeBoard && (
            <BoardHeader board={activeBoard} boardCount={boards.length} onOpenConfig={() => setShowConfig(true)} />
          )}
        </div>
      )}

      <div className="mb-4">
        <BoardFilterBar
          quickFilters={boardConfig?.quickFilters?.map((f) => ({ id: f.id, label: f.name, jql: f.jql })) || []}
          activeFilters={activeFilters}
          onToggleFilter={handleToggleFilter}
          onJqlSearch={setJqlQuery}
          assigneeFilter={assigneeFilter}
          onToggleAssignee={handleToggleAssignee}
          onClearFilters={handleClearFilters}
          swimlaneType={swimlaneType}
          onSwimlaneChange={setSwimlaneType}
        />
      </div>

        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <svg className="h-6 w-6 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : swimlaneType !== "none" && swimlaneGroups ? (
            <div className="overflow-y-auto h-full pb-4">
              {swimlaneGroups.map(([groupName, groupTasks]) => (
                <SwimlaneRow
                  key={groupName}
                  name={groupName}
                  tasks={groupTasks}
                  columns={columns}
                  onTaskClick={(taskKey) => router.push(`/task/${taskKey}`)}
                  onAssigneeChange={handleAssigneeChange}
                  members={members}
                  membersMap={membersMap}
                />
              ))}
              {swimlaneGroups.length === 0 && (
                <div className="flex items-center justify-center h-32 text-sm text-text-tertiary">
                  No issues match the current filters
                </div>
              )}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={collisionDetection}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
<div className="scrollbar-hide flex gap-3 overflow-x-auto pb-4 h-full items-start">
                <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                  {columns.map((column) => (
                    <BoardColumn
                      key={column.id}
                      column={column}
                      tasks={getColumnTasks(column.id)}
                      onTaskClick={(taskKey) => router.push(`/task/${taskKey}`)}
                      onCreateTask={handleCreateTask}
                      isOver={hoverColumnId === column.id}
                      workspaceId={workspaceId}
                      projectId={projectId}
                      boardId={activeBoard?.id || ""}
                      membersMap={membersMap}
                      members={members}
                      onAssigneeChange={handleAssigneeChange}
                      quickCreating={createColumnId === column.id}
                      canCreate={canCreate}
                    />
                  ))}
                </SortableContext>

                {canCreate && (
                <div className="flex-shrink-0 w-72">
                  {showAddColumn ? (
                    <div className="rounded-lg bg-surface p-3 shadow-card border border-border-light">
                      <input
                        autoFocus placeholder="Column name"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddColumn();
                          if (e.key === "Escape") setShowAddColumn(false);
                        }}
                        className="w-full rounded-sm border border-border-input px-3 py-2 text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-2"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddColumn}>Add</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowAddColumn(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddColumn(true)}
                      className="flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-border-light p-4 text-sm font-medium text-text-tertiary transition-colors hover:border-primary hover:text-primary hover:bg-primary-bg/30"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Add column
                    </button>
                  )}
                </div>
                )}
              </div>

              <DragOverlay>
                {activeId && columns.some((c) => c.id === activeId) ? (
                  <div className="rounded-lg bg-surface px-4 py-3 shadow-lg border border-primary/40 w-72 cursor-grabbing">
                    <p className="text-sm font-medium text-text-primary">{columns.find((c) => c.id === activeId)?.name}</p>
                  </div>
                ) : activeId && tasks.find((t) => t.taskKey === activeId) ? (
                  <IssueCardOverlay task={tasks.find((t) => t.taskKey === activeId)!} />
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

      {boardForConfig && (
        <BoardConfigPanel open={showConfig} onClose={() => setShowConfig(false)} board={boardForConfig} projectId={projectId} />
      )}
    </div>
  );
}
