"use client";

import { useState } from "react";
import {
  useGetPermissionSchemesQuery,
  useCreatePermissionSchemeMutation,
  useDeletePermissionSchemeMutation,
} from "@/store/permissionApi";
import { useGetWorkspacesQuery } from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Shield, Trash2, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AdminPermissionSchemesPage() {
  const { data: workspaces = [] } = useGetWorkspacesQuery();
  const [selectedWs, setSelectedWs] = useState<string | null>(null);

  const { data: schemes = [], isLoading } = useGetPermissionSchemesQuery(
    selectedWs ?? "",
    { skip: !selectedWs }
  );

  const [createScheme, { isLoading: isCreating }] = useCreatePermissionSchemeMutation();
  const [deleteScheme] = useDeletePermissionSchemeMutation();

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
        mappings: [],
      }).unwrap();
      setShowCreate(false);
      setSchemeName("");
      setSchemeDesc("");
    } catch (err: unknown) {
      setCreateError((err as { data?: { message?: string } })?.data?.message || "Failed to create scheme");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this permission scheme?")) return;
    try {
      await deleteScheme(id).unwrap();
    } catch {}
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#121C28]">Permission Schemes</h1>
          <p className="mt-1 text-sm text-[#737686]">
            Manage permission schemes that control project-level access.
          </p>
        </div>
        {selectedWs && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Create Scheme
          </Button>
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
          <Shield className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <p className="text-sm text-[#737686]">Select a workspace to view its permission schemes</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
        </div>
      ) : schemes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <p className="text-sm text-[#737686]">No permission schemes yet</p>
          <Button className="mt-4 cursor-pointer" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Create first scheme
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {schemes.map((scheme) => (
            <div
              key={scheme._id}
              className="flex items-center justify-between rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#121C28]">{scheme.name}</span>
                  {scheme.isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[10px] font-medium text-[#004AC6]">
                      <CheckCircle className="h-3 w-3" /> Default
                    </span>
                  )}
                </div>
                {scheme.description && (
                  <p className="mt-0.5 text-xs text-[#737686]">{scheme.description}</p>
                )}
                <p className="mt-1 text-[11px] text-[#C3C6D7]">
                  {scheme.mappings.length} role mapping{scheme.mappings.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/permission-schemes/${scheme._id}`}>
                  <Button size="sm" variant="outline">Edit</Button>
                </Link>
                {!scheme.isDefault && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(scheme._id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create Permission Scheme">
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{createError}</div>
          )}
          <Input
            label="Scheme name"
            value={schemeName}
            onChange={(e) => setSchemeName(e.target.value)}
            required
            placeholder="e.g. Strict Permissions"
          />
          <Input
            label="Description (optional)"
            value={schemeDesc}
            onChange={(e) => setSchemeDesc(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCreating}>Create</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
