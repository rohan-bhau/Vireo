"use client";

interface SprintOverlayProps {
  sprints: {
    id: string;
    name: string;
    startDate: string | null;
    endDate: string | null;
  }[];
  timelineStart: Date;
  totalMs: number;
}

const SPRINT_COLORS = [
  "rgba(99, 102, 241, 0.06)",
  "rgba(59, 130, 246, 0.06)",
  "rgba(139, 92, 246, 0.06)",
];

export function SprintOverlay({
  sprints,
  timelineStart,
  totalMs,
}: SprintOverlayProps) {
  if (!sprints.length) return null;

  return (
    <>
      {sprints.map((sprint, i) => {
        if (!sprint.startDate || !sprint.endDate) return null;
        const start = new Date(sprint.startDate).getTime();
        const end = new Date(sprint.endDate).getTime();
        if (end < timelineStart.getTime()) return null;

        const left = Math.max(0, ((start - timelineStart.getTime()) / totalMs) * 1200);
        const width = ((end - start) / totalMs) * 1200;

        if (width < 5) return null;

        return (
          <div
            key={sprint.id}
            className="absolute inset-y-0 flex items-start pointer-events-none"
            style={{
              left,
              width: Math.max(width, 10),
              backgroundColor: SPRINT_COLORS[i % SPRINT_COLORS.length],
              borderLeft: "2px solid rgba(99, 102, 241, 0.15)",
              borderRight: "2px solid rgba(99, 102, 241, 0.15)",
            }}
          >
            {width > 60 && (
              <span className="px-2 py-1 text-[10px] font-medium text-[#6366f1]/60 truncate w-full">
                {sprint.name}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
}
