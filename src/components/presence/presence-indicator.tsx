"use client";

import { useMemo } from "react";
import { clsx } from "clsx";

interface PresenceIndicatorProps {
  isOnline: boolean;
  lastSeen?: string | null;
  showText?: boolean;
  className?: string;
  dotClassName?: string;
}

function formatLastSeen(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function PresenceIndicator({
  isOnline,
  lastSeen,
  showText,
  className,
  dotClassName,
}: PresenceIndicatorProps) {
  const lastSeenText = useMemo(
    () => (lastSeen ? formatLastSeen(lastSeen) : null),
    [lastSeen]
  );

  return (
    <div className={clsx("flex items-center gap-1.5", className)}>
      <span
        className={clsx(
          "h-2 w-2 rounded-full",
          isOnline ? "bg-green-500" : "bg-gray-400",
          dotClassName
        )}
      />
      {showText && (
        <span className="text-[11px] text-[#A0A3B1]">
          {isOnline ? "Online" : lastSeenText ? `Last seen ${lastSeenText}` : "Offline"}
        </span>
      )}
    </div>
  );
}
