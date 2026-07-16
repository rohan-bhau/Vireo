"use client";

interface PlaceholderTabProps {
  title: string;
  description: string;
  icon: "roadmap" | "reports";
}

function RoadmapIcon() {
  return (
    <svg className="h-12 w-12 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg className="h-12 w-12 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}

export function PlaceholderTab({ title, description, icon }: PlaceholderTabProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon === "roadmap" ? <RoadmapIcon /> : <ReportsIcon />}
      <h2 className="mt-4 text-lg font-semibold text-[#121C28]">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-[#737686]">{description}</p>
      <div className="mt-6 rounded-full bg-[#EEF4FF] px-4 py-1.5 text-xs font-medium text-[#2563EB]">
        Coming in Phase 3
      </div>
    </div>
  );
}
