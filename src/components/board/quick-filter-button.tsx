"use client";

import { clsx } from "clsx";

interface QuickFilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function QuickFilterButton({ label, active, onClick }: QuickFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-sm px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap",
        active
          ? "bg-primary text-white"
          : "bg-bg-light text-text-secondary hover:bg-bg-neutral"
      )}
    >
      {label}
    </button>
  );
}
