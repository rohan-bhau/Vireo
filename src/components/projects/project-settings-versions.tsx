"use client";

import { useState } from "react";
import type { Project } from "@/store/projectApi";
import {
  useGetProjectVersionsQuery,
  useCreateVersionMutation,
  useUpdateVersionMutation,
  useDeleteVersionMutation,
  useReleaseVersionMutation,
  useGetVersionProgressQuery,
  type Version,
  type VersionStatus,
} from "@/store/versionApi";
import { VersionProgress, VersionStats } from "./version-progress";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProjectSettingsVersions({ project }: { project: Project }) {
  const { data: versions, isLoading } = useGetProjectVersionsQuery(project.id);
  const [createVersion] = useCreateVersionMutation();
  const [updateVersion] = useUpdateVersionMutation();
  const [deleteVersion] = useDeleteVersionMutation();
  const [releaseVersion] = useReleaseVersionMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", startDate: "", releaseDate: "" });

  const statusColors: Record<VersionStatus, string> = {
    unreleased: "bg-[#EEF4FF] text-[#2563EB]",
    released: "bg-[#E3FCEF] text-[#36B37E]",
    archived: "bg-[#F8F9FF] text-[#737686]",
  };

  function resetForm() {
    setForm({ name: "", description: "", startDate: "", releaseDate: "" });
  }

  async function handleCreate() {
    if (!form.name.trim()) return;
    await createVersion({ name: form.name.trim(), description: form.description || undefined, projectId: project.id, startDate: form.startDate || undefined, releaseDate: form.releaseDate || undefined });
    resetForm();
    setShowCreate(false);
  }

  async function handleUpdate(id: string) {
    await updateVersion({ id, data: { name: form.name || undefined, description: form.description || undefined, startDate: form.startDate || null, releaseDate: form.releaseDate || null } });
    setEditingId(null);
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this version?")) return;
    await deleteVersion(id);
  }

  async function handleRelease(id: string) {
    if (!confirm("Release this version?")) return;
    await releaseVersion(id);
  }

  function startEdit(v: Version) {
    setEditingId(v._id);
    setForm({ name: v.name, description: v.description || "", startDate: v.startDate ? v.startDate.split("T")[0] : "", releaseDate: v.releaseDate ? v.releaseDate.split("T")[0] : "" });
  }

  function ProgressCell({ versionId }: { versionId: string }) {
    const { data: progress } = useGetVersionProgressQuery(versionId);
    if (!progress) return <span className="text-xs text-[#737686]">-</span>;
    return (
      <div className="flex flex-col gap-1">
        <VersionProgress {...progress} />
        <VersionStats {...progress} />
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-sm text-[#737686] py-8 text-center">Loading releases...</div>;
  }

  const unreleased = versions?.filter((v) => v.status === "unreleased") || [];
  const released = versions?.filter((v) => v.status === "released") || [];
  const archived = versions?.filter((v) => v.status === "archived") || [];

  function renderVersionTable(title: string, list: Version[], emptyMsg: string) {
    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#121C28] mb-3">{title} ({list.length})</h3>
        {list.length === 0 ? (
          <p className="text-xs text-[#737686] py-4">{emptyMsg}</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#C3C6D7]/20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="bg-[#F8F9FF] text-left text-xs font-medium uppercase tracking-wider text-[#737686]">
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Release date</th>
                  <th className="px-4 py-2.5 w-72">Progress</th>
                  <th className="px-4 py-2.5 w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C3C6D7]/10">
                {list.map((v) => (
                  <tr key={v._id} className="hover:bg-[#F8F9FF] transition-colors">
                    {editingId === v._id ? (
                      <>
                        <td className="px-4 py-2">
                          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-[#C3C6D7] bg-white px-2 py-1 text-xs text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium ${statusColors[v.status]}`}>{v.status}</span>
                        </td>
                        <td className="px-4 py-2">
                          <input type="date" value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} className="w-full rounded-lg border border-[#C3C6D7] bg-white px-2 py-1 text-xs text-[#121C28] focus:outline-none" />
                        </td>
                        <td className="px-4 py-2"><ProgressCell versionId={v._id} /></td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleUpdate(v._id)} className="text-xs font-medium text-[#2563EB] hover:text-[#1d4ed8]">Save</button>
                            <button onClick={() => { setEditingId(null); resetForm(); }} className="text-xs text-[#737686] hover:text-[#121C28]">Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2.5 text-[#121C28] font-medium">{v.name}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium ${statusColors[v.status]}`}>{v.status}</span>
                        </td>
                        <td className="px-4 py-2.5 text-[#737686] text-xs">{v.releaseDate ? new Date(v.releaseDate).toLocaleDateString() : "-"}</td>
                        <td className="px-4 py-2.5"><ProgressCell versionId={v._id} /></td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            {v.status === "unreleased" && (
                              <button onClick={() => handleRelease(v._id)} className="text-xs text-[#36B37E] hover:text-[#2a9d6e]">Release</button>
                            )}
                            <button onClick={() => startEdit(v)} className="text-xs text-[#2563EB] hover:text-[#1d4ed8]">Edit</button>
                            <button onClick={() => handleDelete(v._id)} className="text-xs text-[#FF5630] hover:text-[#d94a2c]">Delete</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#121C28]">Versions / Releases</h2>
          <p className="text-sm text-[#737686]">Manage release versions for this project</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowCreate(true); }}>
          <Plus className="h-4 w-4 mr-1" />
          Create version
        </Button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-4">
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Version name *" className="rounded-lg border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" autoFocus />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="rounded-lg border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} placeholder="Start date" className="rounded-lg border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            <input type="date" value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} placeholder="Release date" className="rounded-lg border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" onClick={handleCreate} disabled={!form.name.trim()}>Create</Button>
            <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {(!versions || versions.length === 0) && !showCreate ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-24 text-center">
          <Package className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <h3 className="text-base font-semibold text-[#121C28]">No releases yet</h3>
          <p className="mt-1 text-sm text-[#737686]">Create versions to track when issues are shipped</p>
        </div>
      ) : (
        <>
          {renderVersionTable("Unreleased", unreleased, "No unreleased versions")}
          {released.length > 0 && renderVersionTable("Released", released, "")}
          {archived.length > 0 && renderVersionTable("Archived", archived, "")}
        </>
      )}
    </div>
  );
}
