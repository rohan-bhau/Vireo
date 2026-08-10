"use client";

import { RequireAdmin } from "@/lib/settings-context";
import { WorkspaceSettingsVersions } from "@/components/workspace-settings/workspace-settings-versions";

export default function SettingsVersionsPage() {
  return (
    <RequireAdmin message="Only workspace admins can configure Versions">
      <WorkspaceSettingsVersions />
    </RequireAdmin>
  );
}