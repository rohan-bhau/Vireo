"use client";

import { useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import type { Task } from "@/store/taskApi";
import type { WorkspaceMember } from "@/store/workspaceApi";
import { TypeIcon } from "@/components/tasks/type-icons";
import { useDropdown, DropdownPanel } from "@/components/ui/dropdown";

const EPIC_COLORS = [
  "#4F46E5", "#7C3AED", "#0052CC", "#059669",
  "#D97706", "#DE350B", "#DB2777", "#00B8D9",
];

interface IssueCardProps {
  task: Task;
  onClick?: () => void;
  isOver?: boolean;
  assigneeName?: string | null;
  members?: WorkspaceMember[];
  onAssigneeChange?: (userId: string | null) => void;
}

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || "?";
  const second = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : "";
  return (first + second).toUpperCase();
}

export function IssueCard({ task, onClick, assigneeName, members = [], onAssigneeChange }: IssueCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    isOver: dropOver,
  } = useSortable({ id: task.taskKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const epicIndex = task.labels.filter((l) => l.startsWith("epic:")).length > 0
    ? task.labels.findIndex((l) => l.startsWith("epic:"))
    : -1;
  const epicColor = epicIndex >= 0 ? EPIC_COLORS[epicIndex % EPIC_COLORS.length] : null;

  const isFlagged = task.labels.includes("flagged");
  const isDone = task.status === "done";
  const isSubtask = task.type === "subtask";
  const displayName = assigneeName || task.assignee || "";
  const suppressClickUntil = useRef(0);

  useEffect(() => {
    if (isDragging) suppressClickUntil.current = Date.now() + 300;
  }, [isDragging]);

  function handleTitleClick(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation();
    if (Date.now() < suppressClickUntil.current) return;
    onClick?.();
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        "relative rounded-lg bg-white text-left shadow-card border border-[#C3C6D7]/30 group p-2.5 touch-action-manipulation [-webkit-tap-highlight-color:transparent]",
        dropOver && !isDragging && "border-t-2 border-t-[#2563EB]"
      )}
    >
      {epicColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
          style={{ backgroundColor: epicColor }}
        />
      )}

      <p
        onClick={handleTitleClick}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className={clsx(
          "text-sm font-medium text-[#121C28] line-clamp-2 cursor-pointer hover:text-[#2563EB] select-none",
          isSubtask && "text-xs ml-2",
          isDone && "line-through text-[#737686]"
        )}
      >
        {task.title}
      </p>

      <div className="mt-1 flex items-center gap-1">
        <TypeIcon type={task.type} className="h-3.5 w-3.5 shrink-0" />
        <span className={clsx("font-mono font-medium text-[#737686]", isSubtask ? "text-[10px]" : "text-[11px]")}>
          {task.taskKey}
        </span>
        {isFlagged && (
          <span className="text-[#FF5630] text-[11px]" title="Flagged">🚩</span>
        )}
        {task.storyPoints && (
          <span className="rounded bg-[#F4F5F7] px-1.5 py-0.5 text-[10px] font-medium text-[#737686]">
            {task.storyPoints}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          {isDone && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#36B37E] text-white" title="Done">
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
          )}
          {onAssigneeChange ? (
            <CardAssignee
              task={task}
              members={members}
              displayName={displayName}
              onChange={onAssigneeChange}
            />
          ) : (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-semibold text-white flex-shrink-0"
              title={displayName}
            >
              {getInitials(displayName)}
            </span>
          )}
        </div>
      </div>

      {task.dueDate && (
        <p className={clsx(
          "mt-0.5 text-[10px]",
          new Date(task.dueDate) < new Date() && !isDone
            ? "text-[#FF5630] font-medium"
            : "text-[#737686]"
        )}>
          {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}
    </div>
  );
}

function CardAssignee({
  task,
  members,
  displayName,
  onChange,
}: {
  task: Task;
  members: WorkspaceMember[];
  displayName: string;
  onChange: (userId: string | null) => void;
}) {
  const { open, setOpen, triggerRef } = useDropdown();

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        title={displayName || "Unassigned"}
        className={clsx(
          "flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold transition-opacity",
          task.assignee
            ? "bg-[#2563EB] text-white hover:opacity-80"
            : "bg-[#F4F5F7] text-[#737686] hover:bg-[#E7E9F2]"
        )}
      >
        {task.assignee ? (
          getInitials(displayName)
        ) : (
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
          </svg>
        )}
      </button>

      <DropdownPanel open={open} triggerRef={triggerRef} onClose={() => setOpen(false)} width={192}>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setOpen(false);
          }}
          className={clsx(
            "w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#F6F9FF] text-left",
            !task.assignee && "bg-[#F0F6FF] font-medium"
          )}
        >
          <svg className="h-3.5 w-3.5 text-[#737686]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
          </svg>
          Unassigned
        </button>
        {members.map((m) => (
          <button
            key={m.userId}
            type="button"
            onClick={() => {
              onChange(m.userId);
              setOpen(false);
            }}
            className={clsx(
              "w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#F6F9FF] text-left",
              task.assignee === m.userId && "bg-[#F0F6FF] font-medium"
            )}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[8px] font-semibold text-white">
              {getInitials(m.user?.name || "")}
            </span>
            <span className="truncate">{m.user?.name || "Unknown"}</span>
          </button>
        ))}
      </DropdownPanel>
    </div>
  );
}

export function IssueCardOverlay({ task }: { task: Task }) {
  return (
    <div className="rounded-lg bg-white p-2.5 shadow-lg border border-[#2563EB]/30 w-68 max-sm:w-60 opacity-90">
      <p className="text-sm font-medium text-[#121C28] line-clamp-2">{task.title}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <TypeIcon type={task.type} className="h-3.5 w-3.5" />
        <span className="text-[11px] font-mono font-medium text-[#737686]">{task.taskKey}</span>
      </div>
    </div>
  );
}