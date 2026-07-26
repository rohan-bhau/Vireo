"use client";

import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

export type WorkflowNodeType = Node<{ label: string; color: string; category: string; issueCount?: number; isDefault?: boolean }, "workflowNode">;

export const WorkflowNode = memo(({ data, selected }: NodeProps<WorkflowNodeType>) => {
  return (
    <div className={`relative rounded-xl border-2 px-4 py-3 shadow-sm transition-all min-w-[140px] ${selected ? "border-[#2563EB] shadow-md" : "border-[#C3C6D7]/40"}`}
      style={{ backgroundColor: data.color + "15", borderColor: selected ? "#2563EB" : data.color + "40" }}>
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white !bg-[#2563EB]" />
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="text-sm font-semibold text-[#121C28]">{data.label}</span>
          {data.isDefault && <span className="text-[10px] text-[#737686]">(default)</span>}
        </div>
        <div className="mt-1 flex items-center justify-center gap-3 text-[10px] text-[#737686]">
          <span className="capitalize">{data.category.replace("_", " ")}</span>
          {data.issueCount !== undefined && <span>{data.issueCount} issues</span>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white !bg-[#2563EB]" />
    </div>
  );
});

WorkflowNode.displayName = "WorkflowNode";
