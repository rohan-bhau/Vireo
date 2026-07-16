"use client";

export default function BacklogPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <svg className="mb-4 h-16 w-16 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
      <h2 className="text-lg font-semibold text-[#121C28]">Backlog</h2>
      <p className="mt-1 text-sm text-[#737686]">Backlog management coming in Phase 2</p>
    </div>
  );
}
