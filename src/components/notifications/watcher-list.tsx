"use client";

import { useGetTaskWatchersQuery } from "@/store/watchApi";
import { useGetTaskByKeyQuery } from "@/store/taskApi";

interface WatcherListProps {
  taskKey: string;
}

export function WatcherList({ taskKey }: WatcherListProps) {
  const { data, isLoading } = useGetTaskWatchersQuery(taskKey);

  if (isLoading) return null;

  const users = data?.users || [];
  const watcherIds = data?.watchers || [];

  if (watcherIds.length === 0) return null;

  const visibleUsers = users.slice(0, 3);
  const remaining = watcherIds.length - visibleUsers.length;

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-1.5">
        {visibleUsers.map((user) => (
          <div
            key={user._id}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-bold text-white ring-2 ring-white"
            title={user.name}
          >
            {user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <span className="text-[11px] text-text-placeholder ml-1">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
