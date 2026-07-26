"use client";

import { useState } from "react";
import { useGetProjectVersionsQuery, type Version } from "@/store/versionApi";

interface VersionSelectorProps {
  value: string;
  onChange: (version: string) => void;
  projectId?: string;
}

export function VersionSelector({ value, onChange, projectId }: VersionSelectorProps) {
  const { data: versions } = useGetProjectVersionsQuery(projectId || "", { skip: !projectId });
  const [open, setOpen] = useState(false);

  const unreleasedVersions = versions?.filter((v) => v.status === "unreleased") || [];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-[3px] border border-border-input bg-surface px-2.5 py-1.5 text-sm text-text hover:border-border-default transition-colors text-left"
      >
        {value || <span className="text-text-placeholder">None</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-[3px] border border-border-light bg-surface shadow-modal max-h-40 overflow-y-auto">
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-placeholder hover:bg-bg-light"
            >
              None
            </button>
            {unreleasedVersions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-text-placeholder">No versions</div>
            ) : (
              unreleasedVersions.map((v) => (
                <button
                  key={v._id}
                  type="button"
                  onClick={() => { onChange(v.name); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light ${v.name === value ? "bg-bg-light font-medium" : ""}`}
                >
                  {v.name}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface MultiVersionSelectorProps {
  value: string[];
  onChange: (versions: string[]) => void;
  projectId?: string;
}

export function MultiVersionSelector({ value, onChange, projectId }: MultiVersionSelectorProps) {
  const { data: versions } = useGetProjectVersionsQuery(projectId || "", { skip: !projectId });
  const [open, setOpen] = useState(false);

  const unreleasedVersions = versions?.filter((v) => v.status === "unreleased") || [];

  function toggle(version: Version) {
    if (value.includes(version.name)) {
      onChange(value.filter((v) => v !== version.name));
    } else {
      onChange([...value, version.name]);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-[3px] border border-border-input bg-surface px-2.5 py-1.5 text-sm text-text hover:border-border-default transition-colors text-left"
      >
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {value.map((v) => (
              <span key={v} className="rounded bg-bg-light px-1.5 py-0.5 text-[11px] font-medium text-text-secondary">
                {v}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-text-placeholder">None</span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-[3px] border border-border-light bg-surface shadow-modal max-h-40 overflow-y-auto">
            {unreleasedVersions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-text-placeholder">No versions</div>
            ) : (
              unreleasedVersions.map((v) => (
                <button
                  key={v._id}
                  type="button"
                  onClick={() => toggle(v)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light ${value.includes(v.name) ? "bg-bg-light font-medium" : ""}`}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded border border-border-light">
                    {value.includes(v.name) && (
                      <svg className="h-3 w-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </span>
                  {v.name}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
