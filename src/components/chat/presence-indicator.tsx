"use client";

import { clsx } from "clsx";

interface PresenceIndicatorProps {
  isOnline: boolean;
  className?: string;
}

export function PresenceIndicator({ isOnline, className }: PresenceIndicatorProps) {
  return (
    <span
      className={clsx(
        "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white",
        isOnline ? "bg-green-500" : "bg-gray-400",
        className
      )}
    />
  );
}
