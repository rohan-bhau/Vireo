"use client";

export default function TimelinePage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-24 text-center">
      <svg className="mb-3 h-12 w-12 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
      <h3 className="text-base font-semibold text-[#121C28]">Timeline</h3>
      <p className="mt-1 text-sm text-[#737686]">Epic-level roadmap and release planning view. Coming soon.</p>
    </div>
  );
}
