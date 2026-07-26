"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { WorkflowStatus, WorkflowTransition } from "@/store/workflowApi";
import { WorkflowNode } from "./workflow-node";
import { StatusDialog } from "./status-dialog";
import { TransitionDialog } from "./transition-dialog";

interface WorkflowEditorProps {
  statuses: WorkflowStatus[];
  transitions: WorkflowTransition[];
  defaultStatus: string;
  onChange: (statuses: WorkflowStatus[], transitions: WorkflowTransition[], defaultStatus: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: any = { workflowNode: WorkflowNode };

export function WorkflowEditor({ statuses, transitions, defaultStatus, onChange }: WorkflowEditorProps) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<WorkflowStatus | null>(null);
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [editTransition, setEditTransition] = useState<WorkflowTransition | null>(null);
  const [pendingConnection, setPendingConnection] = useState<{ from: string; to: string } | null>(null);

  const initialNodes: Node[] = useMemo(() => {
    const grouped = statuses.reduce((acc, s) => {
      const cat = s.category || "todo";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
      return acc;
    }, {} as Record<string, WorkflowStatus[]>);

    Object.keys(grouped).forEach((cat) => {
      grouped[cat].sort((a, b) => a.position - b.position);
    });

    const nodes: Node[] = [];
    const xOffset: Record<string, number> = { todo: 50, in_progress: 350, done: 650 };

    statuses.forEach((s) => {
      const cat = s.category || "todo";
      const colIndex = grouped[cat]?.indexOf(s) || 0;
      nodes.push({
        id: s.name,
        type: "workflowNode",
        position: { x: xOffset[cat] || 50, y: 60 + colIndex * 120 },
        data: {
          label: s.name,
          color: s.color,
          category: s.category || "todo",
          isDefault: s.name === defaultStatus,
        },
      });
    });

    return nodes;
  }, [statuses, defaultStatus]);

  const initialEdges: Edge[] = useMemo(() => {
    return transitions.map((t, i) => ({
      id: `e-${i}`,
      source: t.from,
      target: t.to,
      label: t.name,
      type: "smoothstep" as const,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: "#2563EB" },
      style: { stroke: "#2563EB", strokeWidth: 2 },
      labelStyle: { fill: "#434655", fontSize: 11, fontWeight: 500 },
    }));
  }, [transitions]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    setPendingConnection({ from: connection.source, to: connection.target });
    setTransitionDialogOpen(true);
  }, []);

  function handleAddTransition(transition: WorkflowTransition) {
    const newTransitions = [...transitions, transition];
    onChange(statuses, newTransitions, defaultStatus);
    setPendingConnection(null);
  }

  function handleEditTransition(transition: WorkflowTransition) {
    const idx = transitions.findIndex((t) => t.from === editTransition?.from && t.to === editTransition?.to);
    if (idx !== -1) {
      const newTransitions = [...transitions];
      newTransitions[idx] = transition;
      onChange(statuses, newTransitions, defaultStatus);
    }
    setEditTransition(null);
  }

  function handleDeleteTransition(edgeId: string) {
    const idx = parseInt(edgeId.replace("e-", ""));
    if (!isNaN(idx) && idx < transitions.length) {
      const newTransitions = transitions.filter((_, i) => i !== idx);
      onChange(statuses, newTransitions, defaultStatus);
    }
  }

  function handleAddStatus(status: WorkflowStatus) {
    const newStatuses = [...statuses, { ...status, position: statuses.length }];
    onChange(newStatuses, transitions, defaultStatus);
  }

  function handleEditStatus(status: WorkflowStatus) {
    const newStatuses = statuses.map((s) => s.name === editStatus?.name ? status : s);
    onChange(newStatuses, transitions, defaultStatus);
    setEditStatus(null);
  }

  function handleNodeClick(_event: React.MouseEvent, node: Node) {
    const status = statuses.find((s) => s.name === node.id);
    if (status) {
      setEditStatus(status);
      setStatusDialogOpen(true);
    }
  }

  function handleEdgeClick(_event: React.MouseEvent, edge: Edge) {
    const idx = parseInt(edge.id.replace("e-", ""));
    if (!isNaN(idx) && idx < transitions.length) {
      setEditTransition(transitions[idx]);
      setTransitionDialogOpen(true);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setStatusDialogOpen(true)}
          className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1D4ED8] transition-colors">
          + Add Status
        </button>
        <button onClick={() => setTransitionDialogOpen(true)}
          className="rounded-lg border border-[#C3C6D7] px-3 py-1.5 text-xs font-medium text-[#434655] hover:bg-[#F1F2F6] transition-colors">
          + Add Transition
        </button>
        <span className="text-xs text-[#737686] ml-2">
          {statuses.length} statuses · {transitions.length} transitions · Drag nodes to reposition
        </span>
      </div>

      <div className="h-[400px] rounded-xl border border-[#C3C6D7]/20 bg-white">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode="Delete"
          onEdgesDelete={(edges) => edges.forEach((e) => handleDeleteTransition(e.id))}
        >
          <Background gap={20} size={1} color="#E5E7EB" />
          <Controls showInteractive={false} className="!rounded-lg !border !border-[#C3C6D7]/20" />
          <MiniMap
            nodeColor={(node) => String(node.data?.color || "#6B7280")}
            maskColor="rgba(0,0,0,0.08)"
            className="!rounded-lg !border !border-[#C3C6D7]/20"
          />
        </ReactFlow>
      </div>

      <StatusDialog
        open={statusDialogOpen}
        onClose={() => { setStatusDialogOpen(false); setEditStatus(null); }}
        onSave={editStatus ? handleEditStatus : handleAddStatus}
        editStatus={editStatus}
      />

      <TransitionDialog
        open={transitionDialogOpen}
        onClose={() => { setTransitionDialogOpen(false); setEditTransition(null); setPendingConnection(null); }}
        onSave={editTransition ? handleEditTransition : handleAddTransition}
        statuses={statuses}
        editTransition={editTransition}
        from={pendingConnection?.from}
        to={pendingConnection?.to}
      />
    </div>
  );
}
