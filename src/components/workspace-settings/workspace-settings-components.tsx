"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetWorkspaceProjectsQuery, type Project } from "@/store/projectApi";
import {
  useGetProjectComponentsQuery,
  useCreateComponentMutation,
  type Component,
} from "@/store/componentApi";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Puzzle, Plus } from "lucide-react";
import { toastSuccess } from "@/lib/toast";

export function WorkspaceSettingsComponents() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { data: projects = [], isLoading } = useGetWorkspaceProjectsQuery(workspaceId);
  const { data: members = [] } = useGetMembersQuery(workspaceId);

  const userLookup = new Map(
    members.map((m) => [m.userId, { name: m.user?.name, email: m.user?.email, avatar: m.user?.avatar }])
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text">Components</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          Components are sub-sections of a project; issues can belong to multiple. Listed per project.
        </p>
      </div>

      {projects.length === 0 && (
        <div className="rounded-xl border border-border-light bg-surface">
          <EmptyState icon={<Puzzle className="h-8 w-8" />} title="No projects" message="Create a project to manage components." />
        </div>
      )}

      {projects.map((project) => (
        <ProjectComponentsSection key={project.id} project={project} userLookup={userLookup} />
      ))}
    </div>
  );
}

function ProjectComponentsSection({
  project,
  userLookup,
}: {
  project: Project;
  userLookup: Map<string, { name?: string; email?: string; avatar?: string } | undefined>;
}) {
  const { data: components = [], isLoading } = useGetProjectComponentsQuery(project.id);
  const [createComponent, { isLoading: creating }] = useCreateComponentMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lead, setLead] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Component name is required");
      return;
    }
    try {
      await createComponent({
        projectId: project.id,
        name: name.trim(),
        description: description.trim() || undefined,
        lead: lead || undefined,
      }).unwrap();
      toastSuccess("Component created");
      setName("");
      setDescription("");
      setLead("");
      setShowCreate(false);
    } catch (err: unknown) {
      setError((err as { data?: { message?: string } })?.data?.message || "Could not create component");
    }
  }

  const leadOptions = Array.from(userLookup.entries());

  return (
    <div className="rounded-xl border border-border-light bg-surface">
      <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
            <Puzzle className="h-4 w-4 text-text-tertiary" />
            {project.name}
            <span className="text-xs font-normal text-text-tertiary">({project.key})</span>
          </h3>
          <p className="text-xs text-text-tertiary">{components.length} component{components.length !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setError(null); setShowCreate(true); }}>
          <Plus className="h-3.5 w-3.5" /> Add component
        </Button>
      </div>

      <div className="divide-y divide-border-light">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        {!isLoading && components.length === 0 && (
          <div className="py-8 text-center text-sm text-text-tertiary">No components yet.</div>
        )}
        {components.map((component) => (
          <ComponentRow key={component._id} component={component} userLookup={userLookup} />
        ))}
      </div>

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title={`Add component · ${project.key}`} className="max-w-sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Frontend" error={error || undefined} autoFocus />
          <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div>
            <label className="text-xs font-semibold text-text-secondary">Lead</label>
            <select
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              className="mt-1.5 w-full rounded-[3px] border border-border-light bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            >
              <option value="">No lead</option>
              {leadOptions.map(([userId, u]) => (
                <option key={userId} value={userId}>{u?.name || u?.email || userId.slice(0, 8)}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" isLoading={creating}>Add component</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function ComponentRow({
  component,
  userLookup,
}: {
  component: Component;
  userLookup: Map<string, { name?: string; email?: string; avatar?: string } | undefined>;
}) {
  const lead = component.lead ? userLookup.get(component.lead) : undefined;
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text">{component.name}</p>
        {component.description && <p className="truncate text-xs text-text-tertiary">{component.description}</p>}
      </div>
      {lead ? (
        <div className="flex shrink-0 items-center gap-2">
          <Avatar name={lead.name} email={lead.email} avatar={lead.avatar} size="sm" />
          <div>
            <p className="text-xs font-medium text-text">{lead.name || lead.email}</p>
            <p className="text-[10px] text-text-tertiary">Lead</p>
          </div>
        </div>
      ) : (
        <span className="shrink-0 text-xs text-text-tertiary">No lead</span>
      )}
    </div>
  );
}