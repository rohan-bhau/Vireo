"use client";

import { useState } from "react";
import { useGetWorkspacesQuery } from "@/store/workspaceApi";
import {
  useGetIssueSecuritySchemesQuery,
  useCreateIssueSecuritySchemeMutation,
  useDeleteIssueSecuritySchemeMutation,
} from "@/store/permissionApi";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Lock, Trash2 } from "lucide-react";

export default function AdminIssueSecurityPage() {
  const { data: workspaces = [] } = useGetWorkspacesQuery();
  const [selectedWs, setSelectedWs] = useState<string | null>(null);

  const { data: schemes = [], isLoading } = useGetIssueSecuritySchemesQuery(
    selectedWs ?? "", { skip: !selectedWs }
  );
  const [createScheme, { isLoading: isCreating }] = useCreateIssueSecuritySchemeMutation();
  const [deleteScheme] = useDeleteIssueSecuritySchemeMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [schemeName, setSchemeName] = useState("");
  const [schemeDesc, setSchemeDesc] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!schemeName.trim() || !selectedWs) return;
    try {
      await createScheme({
        workspaceId: selectedWs,
        name: schemeName.trim(),
        description: schemeDesc.trim() || undefined,
        levels: [],
      }).unwrap();
      setShowCreate(false);
      setSchemeName("");
      setSchemeDesc("");
    } catch (err: unknown) { setCreateError((err as { data?: { message?: string } })?.data?.message || "Failed"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this issue security scheme?")) return;
    try { await deleteScheme(id).unwrap(); } catch {}
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#121C28]">Issue Security Schemes</h1>
          <p className="mt-1 text-sm text-[#737686]">
            Control which users can view individual issues based on security levels.
          </p>
        </div>
        {selectedWs && (
          <Button onClick={() => setShowCreate(true)}><Plus className="mr-1.5 h-4 w-4" /> Create Scheme</Button>
        )}
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-[#434655]">Workspace</label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => setSelectedWs(ws.id)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                selectedWs === ws.id
                  ? "bg-[#EEF4FF] text-[#004AC6]"
                  : "bg-white text-[#434655] hover:bg-[#F8F9FF] border border-[#C3C6D7]/30"
              }`}
            >
              {ws.name}
            </button>
          ))}
        </div>
      </div>

      {!selectedWs ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <Lock className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <p className="text-sm text-[#737686]">Select a workspace to view issue security schemes</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" /></div>
      ) : schemes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <Lock className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <p className="text-sm text-[#737686]">No issue security schemes yet</p>
          <Button className="mt-4" size="sm" onClick={() => setShowCreate(true)}><Plus className="mr-1.5 h-3.5 w-3.5" /> Create</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {schemes.map((scheme) => (
            <div key={scheme._id} className="flex items-center justify-between rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div>
                <span className="text-sm font-semibold text-[#121C28]">{scheme.name}</span>
                {scheme.description && <p className="mt-0.5 text-xs text-[#737686]">{scheme.description}</p>}
                <p className="mt-1 text-[11px] text-[#C3C6D7]">{scheme.levels.length} level{scheme.levels.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => {}}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(scheme._id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create Issue Security Scheme">
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{createError}</div>}
          <Input label="Scheme name" value={schemeName} onChange={(e) => setSchemeName(e.target.value)} required placeholder="e.g. Confidential" />
          <Input label="Description (optional)" value={schemeDesc} onChange={(e) => setSchemeDesc(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCreating}>Create</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
