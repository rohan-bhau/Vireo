"use client";

import { useState } from "react";
import type { Project } from "@/store/projectApi";
import { useGetPermissionSchemesQuery, useAssignPermissionSchemeToProjectMutation, PERMISSIONS } from "@/store/permissionApi";
import { Check, ChevronDown, Shield } from "lucide-react";

const PERMISSION_LABELS: Record<string, string> = {
  BROWSE_PROJECTS: "Browse projects",
  CREATE_ISSUES: "Create issues",
  EDIT_ISSUES: "Edit issues",
  SCHEDULE_ISSUES: "Schedule issues",
  MOVE_ISSUES: "Move issues",
  ASSIGN_ISSUES: "Assign issues",
  ASSIGN_ISSUES_TO_SELF: "Assign issues to self",
  RESOLVE_ISSUES: "Resolve issues",
  CLOSE_ISSUES: "Close issues",
  DELETE_ISSUES: "Delete issues",
  CREATE_ATTACHMENTS: "Create attachments",
  DELETE_OWN_ATTACHMENTS: "Delete own attachments",
  DELETE_ALL_ATTACHMENTS: "Delete all attachments",
  ADD_COMMENTS: "Add comments",
  EDIT_OWN_COMMENTS: "Edit own comments",
  EDIT_ALL_COMMENTS: "Edit all comments",
  DELETE_OWN_COMMENTS: "Delete own comments",
  DELETE_ALL_COMMENTS: "Delete all comments",
  MANAGE_SPRINTS: "Manage sprints",
  MANAGE_WATCHERS: "Manage watchers",
  MANAGE_PROJECT: "Manage project",
  ADMINISTER_PROJECT: "Administer project",
};

export function ProjectSettingsPermissions({ project }: { project: Project }) {
  const { data: schemes, isLoading } = useGetPermissionSchemesQuery(project.workspaceId);
  const [assignScheme] = useAssignPermissionSchemeToProjectMutation();
  const [selectedSchemeId, setSelectedSchemeId] = useState(project.permissionSchemeId || "");
  const [saving, setSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedScheme = schemes?.find((s) => s._id === selectedSchemeId);

  async function handleAssign(id: string) {
    setSelectedSchemeId(id);
    setShowDropdown(false);
    setSaving(true);
    await assignScheme({ projectId: project.id, permissionSchemeId: id });
    setSaving(false);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#121C28]">Permissions</h2>
        <p className="text-sm text-[#737686]">Control what project roles can do</p>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-[#434655] mb-1.5 block">Permission scheme</label>
        <div className="relative max-w-sm">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex w-full items-center justify-between rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] hover:border-[#2563EB]/40 transition-colors"
          >
            <span>{selectedScheme?.name || "Select a scheme..."}</span>
            <ChevronDown className="h-4 w-4 text-[#737686]" />
          </button>
          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-[#C3C6D7] bg-white shadow-lg">
              {isLoading ? (
                <div className="p-3 text-sm text-[#737686]">Loading...</div>
              ) : (
                schemes?.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => handleAssign(s._id)}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[#121C28] hover:bg-[#F8F9FF] transition-colors text-left"
                  >
                    <span className="flex-1">{s.name}</span>
                    {s.isDefault && <span className="text-[11px] text-[#737686]">Default</span>}
                    {s._id === selectedSchemeId && <Check className="h-4 w-4 text-[#2563EB]" />}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {saving && <p className="mt-1 text-xs text-[#737686]">Saving...</p>}
      </div>

      {selectedScheme ? (
        <div className="overflow-x-auto rounded-xl border border-[#C3C6D7]/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F9FF] text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">
                <th className="px-4 py-3 border-b border-[#C3C6D7]/20">Permission</th>
                {selectedScheme.mappings.map((m) => (
                  <th key={m.projectRoleId} className="px-4 py-3 border-b border-[#C3C6D7]/20 text-center">
                    {m.projectRoleName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C3C6D7]/10">
              {PERMISSIONS.map((perm) => (
                <tr key={perm} className="hover:bg-[#F8F9FF] transition-colors">
                  <td className="px-4 py-2.5 text-[#121C28] font-medium whitespace-nowrap">
                    {PERMISSION_LABELS[perm] || perm}
                  </td>
                  {selectedScheme.mappings.map((m) => (
                    <td key={m.projectRoleId} className="px-4 py-2.5 text-center">
                      {m.permissions.includes(perm) ? (
                        <Check className="mx-auto h-4 w-4 text-[#36B37E]" />
                      ) : (
                        <span className="text-[#C3C6D7]">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-16 text-center">
          <Shield className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <h3 className="text-base font-semibold text-[#121C28]">No scheme selected</h3>
          <p className="mt-1 text-sm text-[#737686]">Select a permission scheme above to view its matrix</p>
        </div>
      )}
    </div>
  );
}
