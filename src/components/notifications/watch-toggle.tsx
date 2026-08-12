"use client";

import { useWatchTaskMutation, useUnwatchTaskMutation, useGetIsWatchingQuery } from "@/store/watchApi";
import { Eye, EyeOff } from "lucide-react";

interface WatchToggleProps {
  taskKey: string;
}

export function WatchToggle({ taskKey }: WatchToggleProps) {
  const { data: isWatching, isLoading: checking } = useGetIsWatchingQuery(taskKey);
  const [watchTask, { isLoading: watching }] = useWatchTaskMutation();
  const [unwatchTask, { isLoading: unwatching }] = useUnwatchTaskMutation();

  const loading = watching || unwatching || checking;

  async function handleToggle() {
    if (isWatching) {
      await unwatchTask(taskKey);
    } else {
      await watchTask(taskKey);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        isWatching
          ? "border-[#2563EB] bg-[#EEF4FF] text-[#2563EB] hover:bg-[#DBE8FF]"
          : "border-border-light text-text-secondary hover:bg-bg-light"
      }`}
      title={isWatching ? "Stop watching" : "Watch this issue"}
    >
      {isWatching ? (
        <Eye className="h-3.5 w-3.5" />
      ) : (
        <EyeOff className="h-3.5 w-3.5" />
      )}
      {isWatching ? "Watching" : "Watch"}
    </button>
  );
}
