"use client";

interface VersionProgressProps {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
  percentDone: number;
}

export function VersionProgress({ total, done, inProgress, todo, percentDone }: VersionProgressProps) {
  if (total === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-bg-light" />
        <span className="text-[11px] text-text-placeholder">0%</span>
      </div>
    );
  }

  const doneWidth = (done / total) * 100;
  const inProgressWidth = (inProgress / total) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-bg-light overflow-hidden flex">
        <div className="h-full bg-success transition-all" style={{ width: `${doneWidth}%` }} />
        <div className="h-full bg-warning transition-all" style={{ width: `${inProgressWidth}%` }} />
      </div>
      <span className="text-[11px] font-medium text-text-secondary">{percentDone}%</span>
    </div>
  );
}

export function VersionStats({ total, done, inProgress, todo }: VersionProgressProps) {
  return (
    <div className="flex items-center gap-3 text-[11px] text-text-placeholder">
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-success" />
        {done} done
      </span>
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-warning" />
        {inProgress} in progress
      </span>
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-bg-light" />
        {todo} to do
      </span>
    </div>
  );
}
