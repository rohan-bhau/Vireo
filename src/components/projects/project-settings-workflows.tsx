"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetProjectQuery } from "@/store/projectApi";
import {
  useGetProjectWorkflowsQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
  useSeedWorkflowMutation,
  useGetProjectSchemesQuery,
  useCreateWorkflowSchemeMutation,
  useUpdateWorkflowSchemeMutation,
  useDeleteWorkflowSchemeMutation,
} from "@/store/workflowApi";
import type { WorkflowStatus, WorkflowTransition, WorkflowScheme } from "@/store/workflowApi";
import { WorkflowList } from "@/components/workflows/workflow-list";
import { WorkflowEditor } from "@/components/workflows/workflow-editor";
import { WorkflowSchemeEditor } from "@/components/workflows/workflow-scheme-editor";

export function ProjectSettingsWorkflows() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: project } = useGetProjectQuery(projectId);
  const { data: workflows = [], isLoading } = useGetProjectWorkflowsQuery(projectId);
  const { data: schemes = [] } = useGetProjectSchemesQuery(projectId, { skip: !projectId });

  const [createWorkflow] = useCreateWorkflowMutation();
  const [updateWorkflow] = useUpdateWorkflowMutation();
  const [deleteWorkflow] = useDeleteWorkflowMutation();
  const [seedWorkflow] = useSeedWorkflowMutation();
  const [createScheme] = useCreateWorkflowSchemeMutation();
  const [updateScheme] = useUpdateWorkflowSchemeMutation();
  const [deleteScheme] = useDeleteWorkflowSchemeMutation();

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [activeTab, setActiveTab] = useState<"workflows" | "scheme">("workflows");

  const selectedWorkflow = workflows.find((w) => w._id === selectedWorkflowId) || workflows[0];

  async function handleSeed() {
    if (!project) return;
    await seedWorkflow({ projectId, workspaceId: project.workspaceId });
  }

  async function handleCreate() {
    if (!newName.trim() || !project) return;
    await createWorkflow({
      name: newName.trim(),
      projectId,
      workspaceId: project.workspaceId,
      statuses: [{ name: "Todo", color: "#6B7280", position: 0, category: "todo" }],
      defaultStatus: "Todo",
    });
    setNewName("");
    setShowCreate(false);
  }

  async function handleSaveWorkflow(id: string, statuses: WorkflowStatus[], transitions: WorkflowTransition[], defaultStatus: string) {
    await updateWorkflow({ id, data: { statuses, transitions, defaultStatus } });
    setEditingWorkflowId(null);
  }

  async function handleDeleteWorkflow(id: string) {
    await deleteWorkflow(id);
    if (selectedWorkflowId === id) setSelectedWorkflowId(null);
  }

  async function handleCreateScheme(data: {
    name: string;
    projectId: string;
    workspaceId: string;
    description?: string;
    mappings: { issueType: string; workflowId: string }[];
    defaultWorkflowId: string;
  }) {
    await createScheme(data);
  }

  async function handleUpdateScheme(id: string, data: Partial<WorkflowScheme>) {
    await updateScheme({ id, data });
  }

  async function handleDeleteScheme(id: string) {
    await deleteScheme(id);
  }

  if (isLoading) {
    return <div className="flex min-h-[400px] items-center justify-center">
      <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#121C28]">Workflows</h2>
          <p className="text-sm text-[#737686]">Manage task status workflows and scheme mapping for this project</p>
        </div>
        <div className="flex gap-2">
          {workflows.length === 0 && (
            <button onClick={handleSeed}
              className="rounded-lg border border-[#C3C6D7] bg-white px-4 py-2 text-sm font-medium text-[#434655] hover:bg-[#F1F2F6] transition-colors">
              Create default workflow
            </button>
          )}
          <button onClick={() => setShowCreate(true)}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors">
            New workflow
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg bg-[#F1F2F6] p-1">
        <button onClick={() => setActiveTab("workflows")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === "workflows" ? "bg-white text-[#121C28] shadow-sm" : "text-[#737686] hover:text-[#121C28]"}`}>
          Workflows ({workflows.length})
        </button>
        <button onClick={() => setActiveTab("scheme")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === "scheme" ? "bg-white text-[#121C28] shadow-sm" : "text-[#737686] hover:text-[#121C28]"}`}>
          Scheme {schemes.length > 0 ? "●" : ""}
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-[#C3C6D7]/20 bg-white p-4 shadow-sm">
          <input autoFocus placeholder="Workflow name" value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowCreate(false); }}
            className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] mb-3" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]">Create</button>
            <button onClick={() => setShowCreate(false)} className="rounded-lg border border-[#C3C6D7] px-4 py-2 text-sm text-[#434655] hover:bg-[#F1F2F6]">Cancel</button>
          </div>
        </div>
      )}

      {activeTab === "workflows" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-text">All Workflows</h3>
            {workflows.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-light py-8 text-center">
                <h3 className="text-sm font-semibold text-text">No workflows yet</h3>
                <p className="mt-1 text-xs text-text-tertiary">Create a workflow or seed the default one</p>
              </div>
            ) : (
              <WorkflowList
                workflows={workflows}
                onEdit={(wf) => { setEditingWorkflowId(wf._id); setSelectedWorkflowId(wf._id); }}
                onDelete={handleDeleteWorkflow}
                onSelect={(wf) => setSelectedWorkflowId(wf._id)}
                selectedId={selectedWorkflowId || undefined}
              />
            )}
          </div>

          <div className="lg:col-span-3">
            {selectedWorkflow ? (
              <div className="rounded-xl border border-[#C3C6D7]/20 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#C3C6D7]/20 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[#121C28]">{selectedWorkflow.name}</h3>
                    {selectedWorkflow.isDefault && (
                      <span className="rounded-md bg-[#DBEAFE] px-2 py-0.5 text-xs font-medium text-[#2563EB]">Default</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingWorkflowId === selectedWorkflow._id ? (
                      <>
                        <button onClick={() => setEditingWorkflowId(null)}
                          className="rounded-lg border border-[#C3C6D7] px-3 py-1.5 text-xs text-[#434655] hover:bg-[#F1F2F6] transition-colors">
                          Done
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setEditingWorkflowId(selectedWorkflow._id)}
                        className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1D4ED8] transition-colors">
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <WorkflowEditor
                    statuses={selectedWorkflow.statuses}
                    transitions={selectedWorkflow.transitions}
                    defaultStatus={selectedWorkflow.defaultStatus}
                    onChange={async (statuses, transitions, defaultStatus) => {
                      if (editingWorkflowId === selectedWorkflow._id) {
                        await handleSaveWorkflow(selectedWorkflow._id, statuses, transitions, defaultStatus);
                      }
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {activeTab === "scheme" && project && (
        <WorkflowSchemeEditor
          schemes={schemes}
          workflows={workflows}
          projectId={projectId}
          workspaceId={project.workspaceId}
          onCreate={handleCreateScheme}
          onUpdate={handleUpdateScheme}
          onDelete={handleDeleteScheme}
        />
      )}
    </div>
  );
}
