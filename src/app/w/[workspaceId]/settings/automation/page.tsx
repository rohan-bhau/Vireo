"use client";

import { RequireAdmin } from "@/lib/settings-context";
import { WorkspaceSettingsAutomation } from "@/components/workspace-settings/workspace-settings-automation";

export default function SettingsAutomationPage() {
  return (
    <RequireAdmin message="Only workspace admins can configure Automation">
      <WorkspaceSettingsAutomation />
    </RequireAdmin>
  );
}