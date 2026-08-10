"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetWorkspaceProjectsQuery, type Project } from "@/store/projectApi";
import {
  useGetProjectVersionsQuery,
  useCreateVersionMutation,
  useGetVersionProgressQuery,
  type Version,
} from "@/store/versionApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Package, Plus } from "lucide-react";
import { toastSuccess } from "@/lib/toast";
import { clsx } from "clsx";
import { SkeletonSettingsPage } from "@/components/ui/skeleton";

export function WorkspaceSettingsVersions() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { data: projects = [], isLoading } = useGetWorkspaceProjectsQuery(workspaceId);

  if (isLoading) {
    return <SkeletonSettingsPage />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text">Versions</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          Versions group issues for a release. Listed per project.
        </p>
      </div>

      {projects.length === 0 && (
        <div className="rounded-xl border border-border-light bg-surface">
          <EmptyState icon={<Package className="h-8 w-8" />} title="No projects" message="Create a project to manage versions." />
        </div>
      )}

      {projects.map((project) => (
        <ProjectVersionsSection key={project.id} project={project} />
      ))}
    </div>
  );
}

function ProjectVersionsSection({ project }: { project: Project }) {
  const { data: versions = [], isLoading } = useGetProjectVersionsQuery(project.id);
  const [createVersion, { isLoading: creating }] = useCreateVersionMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Version name is required");
      return;
    }
    try {
      await createVersion({
        projectId: project.id,
        name: name.trim(),
        description: description.trim() || undefined,
        releaseDate: releaseDate || undefined,
      }).unwrap();
      toastSuccess("Version created");
      setName("");
      setDescription("");
      setReleaseDate("");
      setShowCreate(false);
    } catch (err: unknown) {
      setError((err as { data?: { message?: string } })?.data?.message || "Could not create version");
    }
  }

  return (
    <div className="rounded-xl border border-border-light bg-surface">
      <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
            <Package className="h-4 w-4 text-text-tertiary" />
            {project.name}
            <span className="text-xs font-normal text-text-tertiary">({project.key})</span>
          </h3>
          <p className="text-xs text-text-tertiary">{versions.length} version{versions.length !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setError(null); setShowCreate(true); }}>
          <Plus className="h-3.5 w-3.5" /> Create version
        </Button>
      </div>

      <div className="divide-y divide-border-light">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        {!isLoading && versions.length === 0 && (
          <div className="py-8 text-center text-sm text-text-tertiary">No versions yet.</div>
        )}
        {versions.map((version) => (
          <VersionRow key={version._id} version={version} />
        ))}
      </div>

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title={`Create version · ${project.key}`} className="max-w-sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="1.0.0" error={error || undefined} autoFocus />
          <Input label="Release date" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
          <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What ships in this version?" />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" isLoading={creating}>Create version</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function VersionRow({ version }: { version: Version }) {
  const { data: progress } = useGetVersionProgressQuery(version._id);
  const percent = progress?.percentDone ?? 0;
  const date = version.releaseDate
    ? new Date(version.releaseDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <div className="flex flex-wrap items-center gap-4 px-5 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text">{version.name}</p>
        <p className="text-xs text-text-tertiary">
          {date ? `Releases ${date}` : "No release date set"}
        </p>
      </div>
      <div className="flex w-40 flex-col gap-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-light">
          <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-[10px] text-text-tertiary">{percent}% complete</p>
      </div>
      <span
        className={clsx(
          "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
          version.status === "released"
            ? "bg-[#F0FDF4] text-[#15803D]"
            : version.status === "archived"
              ? "bg-[#F0F0F5] text-[#737686]"
              : "bg-[#EFF6FF] text-[#004AC6]"
        )}
      >
        {version.status}
      </span>
    </div>
  );
}