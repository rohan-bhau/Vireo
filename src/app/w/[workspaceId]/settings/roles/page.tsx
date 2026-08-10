"use client";

import { RequireAdmin } from "@/lib/settings-context";
import { WorkspaceSettingsRoles } from "@/components/workspace-settings/workspace-settings-roles";

export default function SettingsRolesPage() {
  return (
    <RequireAdmin message="Only workspace admins can configure Roles">
      <WorkspaceSettingsRoles />
    </RequireAdmin>
  );
}