"use client";

import { RequireAdmin } from "@/lib/settings-context";
import { WorkspaceSettingsWorkflows } from "@/components/workspace-settings/workspace-settings-workflows";

export default function SettingsWorkflowsPage() {
  return (
    <RequireAdmin message="Only workspace admins can configure Workflows">
      <WorkspaceSettingsWorkflows />
    </RequireAdmin>
  );
}