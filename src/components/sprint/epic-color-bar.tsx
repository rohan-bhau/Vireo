"use client";

import { clsx } from "clsx";

interface EpicColorBarProps {
  color: string;
  size?: "sm" | "md";
}

export function EpicColorBar({ color, size = "sm" }: EpicColorBarProps) {
  return (
    <div
      className={clsx(
        "flex-shrink-0 rounded-full",
        size === "sm" ? "h-3 w-3" : "h-full w-[3px]"
      )}
      style={{ backgroundColor: color }}
    />
  );
}
