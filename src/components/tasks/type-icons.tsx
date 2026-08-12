export const TYPE_COLORS: Record<string, string> = {
  epic: "#8777D9",
  story: "#36B37E",
  task: "#0052CC",
  bug: "#FF5630",
  subtask: "#42526E",
};

export const TYPE_LABELS: Record<string, string> = {
  task: "Task",
  bug: "Bug",
  epic: "Epic",
  story: "Story",
  subtask: "Sub-task",
};

export function TypeIcon({ type, className }: { type: string; className?: string }) {
  const color = TYPE_COLORS[type] || TYPE_COLORS.task;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className || "h-3.5 w-3.5"}
      style={{ color }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {type === "bug" ? (
        <>
          <circle cx="12" cy="11" r="5.5" />
          <path d="M6.5 11L3.5 9M17.5 11l3-2M6.5 14l-3 2.5M17.5 14l3 2.5M12 16.5V20M9.5 20h5" />
        </>
      ) : type === "epic" ? (
        <>
          <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
        </>
      ) : type === "story" ? (
        <>
          <path d="M4 4h10a4 4 0 014 4v12H8a4 4 0 01-4-4V4z" />
          <path d="M14 4a4 4 0 014 4v12" />
          <path d="M7 9h6M7 13h6" />
        </>
      ) : type === "subtask" ? (
        <>
          <path d="M8 4h8a3 3 0 013 3v4M8 4L4 8l4 4M8 4v0" />
          <path d="M12 13v4" />
          <path d="M12 17l4 3-4 3" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9 12l2.2 2.2L15.5 9.8" />
        </>
      )}
    </svg>
  );
}

export function IssueTypeIcon({ type, size = "sm" }: { type: string; size?: "sm" | "md" | "lg" }) {
  const config = TYPE_COLORS[type] || TYPE_COLORS.task;
  const label = TYPE_LABELS[type] || "Task";
  const dims = size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6";
  return (
    <span
      className={`inline-flex items-center justify-center rounded ${dims}`}
      style={{ color: config, backgroundColor: `${config}1A` }}
      title={label}
    >
      <TypeIcon type={type} className="h-[70%] w-[70%]" />
    </span>
  );
}
