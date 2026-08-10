"use client";

import { RequireAdmin } from "@/lib/settings-context";
import { WorkspaceSettingsFields } from "@/components/workspace-settings/workspace-settings-fields";

export default function SettingsFieldsPage() {
  return (
    <RequireAdmin message="Only workspace admins can configure Fields">
      <WorkspaceSettingsFields />
    </RequireAdmin>
  );
}