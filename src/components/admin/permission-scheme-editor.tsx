"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { PERMISSIONS, type PermissionMapping } from "@/store/permissionApi";
import { Plus, Trash2, Check, X } from "lucide-react";

const PERMISSION_LABELS: Record<string, string> = {
  BROWSE_PROJECTS: "Browse Projects",
  CREATE_ISSUES: "Create Issues",
  EDIT_ISSUES: "Edit Issues",
  SCHEDULE_ISSUES: "Schedule Issues",
  MOVE_ISSUES: "Move Issues",
  ASSIGN_ISSUES: "Assign Issues",
  ASSIGN_ISSUES_TO_SELF: "Assign Issues to Self",
  RESOLVE_ISSUES: "Resolve Issues",
  CLOSE_ISSUES: "Close Issues",
  DELETE_ISSUES: "Delete Issues",
  CREATE_ATTACHMENTS: "Create Attachments",
  DELETE_OWN_ATTACHMENTS: "Delete Own Attachments",
  DELETE_ALL_ATTACHMENTS: "Delete All Attachments",
  ADD_COMMENTS: "Add Comments",
  EDIT_OWN_COMMENTS: "Edit Own Comments",
  EDIT_ALL_COMMENTS: "Edit All Comments",
  DELETE_OWN_COMMENTS: "Delete Own Comments",
  DELETE_ALL_COMMENTS: "Delete All Comments",
  MANAGE_SPRINTS: "Manage Sprints",
  MANAGE_WATCHERS: "Manage Watchers",
  MANAGE_PROJECT: "Manage Project",
  ADMINISTER_PROJECT: "Administer Project",
};

const PERMISSION_GROUPS: { label: string; permissions: string[] }[] = [
  {
    label: "Issues",
    permissions: [
      "BROWSE_PROJECTS", "CREATE_ISSUES", "EDIT_ISSUES",
      "SCHEDULE_ISSUES", "MOVE_ISSUES", "ASSIGN_ISSUES",
      "ASSIGN_ISSUES_TO_SELF", "RESOLVE_ISSUES", "CLOSE_ISSUES", "DELETE_ISSUES",
    ],
  },
  {
    label: "Attachments",
    permissions: ["CREATE_ATTACHMENTS", "DELETE_OWN_ATTACHMENTS", "DELETE_ALL_ATTACHMENTS"],
  },
  {
    label: "Comments",
    permissions: ["ADD_COMMENTS", "EDIT_OWN_COMMENTS", "EDIT_ALL_COMMENTS", "DELETE_OWN_COMMENTS", "DELETE_ALL_COMMENTS"],
  },
  {
    label: "Administration",
    permissions: ["MANAGE_SPRINTS", "MANAGE_WATCHERS", "MANAGE_PROJECT", "ADMINISTER_PROJECT"],
  },
];

interface PermissionSchemeEditorProps {
  mappings: PermissionMapping[];
  availableRoles: { _id: string; name: string }[];
  onChange: (mappings: PermissionMapping[]) => void;
  readOnly?: boolean;
}

export function PermissionSchemeEditor({
  mappings,
  availableRoles,
  onChange,
  readOnly = false,
}: PermissionSchemeEditorProps) {
  const [showAddRole, setShowAddRole] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  function handleTogglePermission(roleId: string, permission: string) {
    const updated = mappings.map((m) => {
      if (m.projectRoleId !== roleId) return m;
      const has = m.permissions.includes(permission);
      return {
        ...m,
        permissions: has
          ? m.permissions.filter((p) => p !== permission)
          : [...m.permissions, permission],
      };
    });
    onChange(updated);
  }

  function handleSelectAll(roleId: string) {
    const updated = mappings.map((m) => {
      if (m.projectRoleId !== roleId) return m;
      return { ...m, permissions: [...PERMISSIONS] };
    });
    onChange(updated);
  }

  function handleClearAll(roleId: string) {
    const updated = mappings.map((m) => {
      if (m.projectRoleId !== roleId) return m;
      return { ...m, permissions: [] };
    });
    onChange(updated);
  }

  function handleAddRole() {
    if (!selectedRoleId) return;
    const role = availableRoles.find((r) => r._id === selectedRoleId);
    if (!role) return;
    const exists = mappings.some((m) => m.projectRoleId === selectedRoleId);
    if (exists) return;

    onChange([
      ...mappings,
      { projectRoleId: role._id, projectRoleName: role.name, permissions: [] },
    ]);
    setSelectedRoleId("");
    setShowAddRole(false);
  }

  function handleRemoveRole(roleId: string) {
    onChange(mappings.filter((m) => m.projectRoleId !== roleId));
  }

  const availableToAdd = availableRoles.filter(
    (r) => !mappings.some((m) => m.projectRoleId === r._id)
  );

  return (
    <div className="space-y-6">
      {!readOnly && availableToAdd.length > 0 && (
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => setShowAddRole(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Role Mapping
          </Button>
        </div>
      )}

      {mappings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-light p-8 text-center">
          <p className="text-sm text-text-tertiary">No role mappings yet. Add a role to configure permissions.</p>
        </div>
      ) : (
        mappings.map((mapping) => (
          <div
            key={mapping.projectRoleId}
            className="rounded-xl border border-[#C3C6D7]/20 bg-white p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#121C28]">{mapping.projectRoleName}</h4>
              {!readOnly && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectAll(mapping.projectRoleId)}
                    className="text-xs font-medium text-[#2563EB] hover:text-[#1d4ed8]"
                  >
                    Select All
                  </button>
                  <span className="text-[#C3C6D7]">|</span>
                  <button
                    onClick={() => handleClearAll(mapping.projectRoleId)}
                    className="text-xs font-medium text-[#737686] hover:text-[#121C28]"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => handleRemoveRole(mapping.projectRoleId)}
                    className="ml-2 text-[#C3C6D7] hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#737686]">
                    {group.label}
                  </p>
                  <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                    {group.permissions.map((perm) => {
                      const enabled = mapping.permissions.includes(perm);
                      return (
                        <label
                          key={perm}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                            readOnly
                              ? "cursor-default"
                              : "hover:bg-[#F8F9FF]"
                          } ${
                            enabled
                              ? "border-[#2563EB] bg-[#EEF4FF] text-[#004AC6]"
                              : "border-[#C3C6D7]/30 text-[#434655]"
                          }`}
                        >
                          {readOnly ? (
                            enabled ? (
                              <Check className="h-3.5 w-3.5 text-[#2563EB]" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-[#C3C6D7]" />
                            )
                          ) : (
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={() => handleTogglePermission(mapping.projectRoleId, perm)}
                              className="h-3.5 w-3.5 rounded border-[#C3C6D7] text-[#2563EB] focus:ring-[#2563EB]"
                            />
                          )}
                          {PERMISSION_LABELS[perm]}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <Dialog open={showAddRole} onClose={() => setShowAddRole(false)} title="Add Role Mapping">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]">Select a project role</label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2.5 text-sm text-[#121C28] focus:border-[#2563EB] focus:outline-none"
            >
              <option value="">Choose a role...</option>
              {availableToAdd.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAddRole(false)}>Cancel</Button>
            <Button type="button" onClick={handleAddRole} disabled={!selectedRoleId}>Add</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
