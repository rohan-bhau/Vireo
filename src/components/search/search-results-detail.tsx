"use client";

import type { Task } from "@/store/taskApi";
import { TypeIcon } from "@/components/tasks/type-icons";

interface SearchResultsDetailProps {
  task: Task | null;
  onClose: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  todo: "bg-[#F1F2F6] text-[#737686]",
  in_progress: "bg-[#DBEAFE] text-[#2563EB]",
  in_review: "bg-[#FEF3C7] text-[#D97706]",
  done: "bg-[#D1FAE5] text-[#059669]",
};

const STATUS_LABELS: Record<string, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

const PRIORITY_ICONS: Record<string, string> = {
  highest: "🔴", high: "🟠", medium: "🟡", low: "🟢", lowest: "⚪",
};

export function SearchResultsDetail({ task, onClose }: SearchResultsDetailProps) {
  if (!task) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto mb-2 h-8 w-8 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          <p className="text-xs text-[#737686]">Select an issue to view details</p>
        </div>
      </div>
    );
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#DFE1E6] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-[#2563EB]">{task.taskKey}</span>
          <div className="flex items-center gap-1 text-[11px] text-[#737686]">
            <TypeIcon type={task.type} className="h-3.5 w-3.5" />
            <span className="capitalize">{task.type}</span>
          </div>
        </div>
        <button onClick={onClose} className="text-[#737686] hover:text-[#121C28] transition-colors">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <h2 className="text-base font-semibold text-[#121C28]">{task.title}</h2>

        {task.description && (
          <div className="rounded-[3px] border border-[#DFE1E6] bg-[#FAFBFC] p-3">
            <p className="text-xs text-[#434655] whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <DetailField label="Status">
            <span className={`inline-block rounded-[3px] px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[task.status] || STATUS_STYLES.todo}`}>
              {STATUS_LABELS[task.status] || task.status}
            </span>
          </DetailField>
          <DetailField label="Priority">
            <span className="text-xs">{PRIORITY_ICONS[task.priority] || "⚪"} {task.priority}</span>
          </DetailField>
          <DetailField label="Assignee">
            <span className="text-xs">{task.assignee || <span className="text-[#C3C6D7]">Unassigned</span>}</span>
          </DetailField>
          <DetailField label="Reporter">
            <span className="text-xs">{task.reporter || <span className="text-[#C3C6D7]">Unknown</span>}</span>
          </DetailField>
          {task.labels && task.labels.length > 0 && (
            <DetailField label="Labels">
              <div className="flex flex-wrap gap-1">
                {task.labels.map((l) => (
                  <span key={l} className="inline-block rounded-[2px] bg-[#EEF4FF] px-1.5 py-0.5 text-[10px] font-medium text-[#2563EB]">
                    {l}
                  </span>
                ))}
              </div>
            </DetailField>
          )}
          {task.storyPoints !== null && task.storyPoints !== undefined && (
            <DetailField label="Story Points">
              <span className="text-xs">{task.storyPoints}</span>
            </DetailField>
          )}
          {task.dueDate && (
            <DetailField label="Due Date">
              <span className="text-xs">{new Date(task.dueDate).toLocaleDateString()}</span>
            </DetailField>
          )}
        </div>

        <div className="border-t border-[#DFE1E6] pt-3">
          <div className="space-y-1 text-[11px] text-[#737686]">
            <div>Created: {formatDate(task.createdAt)}</div>
            <div>Updated: {formatDate(task.updatedAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#737686]">{label}</div>
      <div>{children}</div>
    </div>
  );
}
