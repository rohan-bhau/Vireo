"use client";

import { RequireAdmin } from "@/lib/settings-context";
import { WorkspaceSettingsComponents } from "@/components/workspace-settings/workspace-settings-components";

export default function SettingsComponentsPage() {
  return (
    <RequireAdmin message="Only workspace admins can configure Components">
      <WorkspaceSettingsComponents />
    </RequireAdmin>
  );
}