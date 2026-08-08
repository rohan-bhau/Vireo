"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import type { NotificationType } from "@/store/notificationApi";
import { typeConfig } from "./notification-item";

export type FilterTab = "all" | "unread" | "read";

const TYPE_FILTERS: { value: NotificationType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "assigned", label: "Assigned" },
  { value: "commented", label: "Comments" },
  { value: "mentioned", label: "Mentions" },
  { value: "status_changed", label: "Status changes" },
  { value: "issue_created", label: "Issue created" },
  { value: "issue_updated", label: "Issue updated" },
  { value: "issue_deleted", label: "Issue deleted" },
  { value: "sprint_started", label: "Sprint started" },
  { value: "sprint_completed", label: "Sprint completed" },
  { value: "member_added", label: "Member added" },
  { value: "role_changed", label: "Role changed" },
  { value: "invited", label: "Invited" },
  { value: "due_date", label: "Due date" },
  { value: "issue_completed", label: "Completed" },
];

interface ProjectOption {
  id: string;
  name: string;
  key: string;
}

export interface NotificationFiltersState {
  filterTab: FilterTab;
  typeFilter: NotificationType | "";
  projectFilter: string;
}

interface NotificationFiltersProps {
  filters: NotificationFiltersState;
  onFiltersChange: (filters: NotificationFiltersState) => void;
  projects?: ProjectOption[];
}

export function NotificationFilters({ filters, onFiltersChange, projects }: NotificationFiltersProps) {
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showProjectFilter, setShowProjectFilter] = useState(false);

  const { filterTab, typeFilter, projectFilter } = filters;

  function update(partial: Partial<NotificationFiltersState>) {
    onFiltersChange({ ...filters, ...partial });
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {(["all", "unread", "read"] as FilterTab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => update({ filterTab: tab })}
          className={`rounded-[3px] px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
            filterTab === tab
              ? "bg-[#2563EB] text-white"
              : "bg-bg-light text-text-secondary hover:bg-border-light"
          }`}
        >
          {tab === "all" ? "All" : tab}
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowTypeFilter(!showTypeFilter)}
          className={`flex items-center gap-1.5 rounded-[3px] px-3 py-1.5 text-xs font-medium transition-colors ${
            typeFilter
              ? "bg-[#2563EB] text-white"
              : "bg-bg-light text-text-secondary hover:bg-border-light"
          }`}
        >
          <Filter className="h-3 w-3" />
          {typeFilter ? typeConfig[typeFilter]?.label || typeFilter : "Type"}
        </button>
        {showTypeFilter && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowTypeFilter(false)} />
            <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-[3px] border border-border-light bg-surface shadow-modal">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => { update({ typeFilter: f.value }); setShowTypeFilter(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light ${
                    typeFilter === f.value ? "bg-bg-light font-medium" : ""
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {projects && projects.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowProjectFilter(!showProjectFilter)}
            className={`flex items-center gap-1.5 rounded-[3px] px-3 py-1.5 text-xs font-medium transition-colors ${
              projectFilter
                ? "bg-[#2563EB] text-white"
                : "bg-bg-light text-text-secondary hover:bg-border-light"
            }`}
          >
            <Filter className="h-3 w-3" />
            {projectFilter
              ? projects.find((p) => p.id === projectFilter)?.name || projectFilter
              : "Project"}
          </button>
          {showProjectFilter && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProjectFilter(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-[3px] border border-border-light bg-surface shadow-modal max-h-60 overflow-y-auto">
                <button
                  onClick={() => { update({ projectFilter: "" }); setShowProjectFilter(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light ${
                    !projectFilter ? "bg-bg-light font-medium" : ""
                  }`}
                >
                  All projects
                </button>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { update({ projectFilter: p.id }); setShowProjectFilter(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light ${
                      projectFilter === p.id ? "bg-bg-light font-medium" : ""
                    }`}
                  >
                    <span className="font-mono text-[10px] text-text-placeholder">{p.key}</span>
                    {p.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {(typeFilter || projectFilter) && (
        <button
          onClick={() => update({ typeFilter: "", projectFilter: "" })}
          className="flex items-center gap-1 rounded-[3px] px-2 py-1.5 text-xs text-text-placeholder hover:text-text transition-colors"
        >
          <X className="h-3 w-3" />
          Clear all
        </button>
      )}
    </div>
  );
}
