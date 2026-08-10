"use client";

import { RequireAdmin } from "@/lib/settings-context";
import { WorkspaceSettingsPermissions } from "@/components/workspace-settings/workspace-settings-permissions";

export default function SettingsPermissionsPage() {
  return (
    <RequireAdmin message="Only workspace admins can configure Permissions">
      <WorkspaceSettingsPermissions />
    </RequireAdmin>
  );
}