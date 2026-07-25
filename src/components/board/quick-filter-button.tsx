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
        "rounded-[3px] px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap",
        active
          ? "bg-[#0052CC] text-white"
          : "bg-[#F1F2F6] text-[#42526E] hover:bg-[#DFE1E6]"
      )}
    >
      {label}
    </button>
  );
}
