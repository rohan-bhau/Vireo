"use client";

import { useState } from "react";
import type { Workflow } from "@/store/workflowApi";
import { useCopyWorkflowMutation, useGetWorkflowUsageQuery } from "@/store/workflowApi";

interface WorkflowListProps {
  workflows: Workflow[];
  defaultWorkflowId?: string;
  onEdit: (workflow: Workflow) => void;
  onDelete: (id: string) => Promise<void>;
  onSelect: (workflow: Workflow) => void;
  selectedId?: string;
}

export function WorkflowList({ workflows, onEdit, onDelete, onSelect, selectedId }: WorkflowListProps) {
  const [copyWorkflow] = useCopyWorkflowMutation();
  const [copiedWorkflowId, setCopiedWorkflowId] = useState<string | null>(null);

  async function handleCopy(wf: Workflow) {
    const name = `${wf.name} (Copy)`;
    try {
      await copyWorkflow({ id: wf._id, name }).unwrap();
      setCopiedWorkflowId(wf._id);
      setTimeout(() => setCopiedWorkflowId(null), 2000);
    } catch {
      alert("Failed to copy workflow");
    }
  }

  return (
    <div className="space-y-2">
      {workflows.map((wf) => (
        <WorkflowListItem
          key={wf._id}
          workflow={wf}
          isSelected={selectedId === wf._id}
          onSelect={() => onSelect(wf)}
          onEdit={() => onEdit(wf)}
          onDelete={() => onDelete(wf._id)}
          onCopy={() => handleCopy(wf)}
          copiedWorkflowId={copiedWorkflowId}
        />
      ))}
    </div>
  );
}

function WorkflowListItem({
  workflow,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onCopy,
  copiedWorkflowId,
}: {
  workflow: Workflow;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  copiedWorkflowId: string | null;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: usage } = useGetWorkflowUsageQuery(workflow._id);

  const isInUse = usage && usage.usedBySchemes > 0;

  return (
    <div
      className={`rounded-xl border cursor-pointer transition-all ${isSelected ? "border-[#2563EB] bg-[#EFF6FF] shadow-sm" : "border-[#C3C6D7]/20 bg-white hover:border-[#C3C6D7]/40 hover:shadow-sm"}`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1">
            {workflow.statuses.slice(0, 4).map((s) => (
              <div key={s.name} className="h-4 w-4 rounded-full border-2 border-white" style={{ backgroundColor: s.color }} title={s.name} />
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#121C28]">{workflow.name}</span>
              {workflow.isDefault && (
                <span className="rounded-md bg-[#DBEAFE] px-1.5 py-0.5 text-[10px] font-medium text-[#2563EB]">Default</span>
              )}
            </div>
            <span className="text-xs text-[#737686]">{workflow.statuses.length} statuses · {workflow.transitions.length} transitions</span>
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className="rounded-lg px-2 py-1 text-xs text-[#434655] hover:bg-[#F1F2F6] transition-colors" title="Edit">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
          <button onClick={onCopy} className="rounded-lg px-2 py-1 text-xs text-[#434655] hover:bg-[#F1F2F6] transition-colors" title="Copy">
            {copiedWorkflowId === workflow._id ? (
              <svg className="h-4 w-4 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
            )}
          </button>
          {!workflow.isDefault && !isInUse && (
            <button onClick={() => setConfirmDelete(true)} className="rounded-lg px-2 py-1 text-xs text-[#737686] hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
            </button>
          )}
          {isInUse && (
            <span className="text-[10px] text-[#737686] px-2">In use</span>
          )}
        </div>
      </div>
      {confirmDelete && (
        <div className="border-t border-[#C3C6D7]/20 px-4 py-3">
          <p className="mb-2 text-xs text-[#737686]">Are you sure you want to delete &quot;{workflow.name}&quot;? This action cannot be undone.</p>
          <div className="flex gap-2">
            <button onClick={() => { onDelete(); setConfirmDelete(false); }} className="rounded-lg bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 transition-colors">Delete</button>
            <button onClick={() => setConfirmDelete(false)} className="rounded-lg border border-[#C3C6D7] px-3 py-1 text-xs text-[#434655] hover:bg-[#F1F2F6] transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
