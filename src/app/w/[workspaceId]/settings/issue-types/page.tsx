"use client";

import { RequireAdmin } from "@/lib/settings-context";
import { WorkspaceSettingsIssueTypes } from "@/components/workspace-settings/workspace-settings-issue-types";

export default function SettingsIssueTypesPage() {
  return (
    <RequireAdmin message="Only workspace admins can configure Issue types">
      <WorkspaceSettingsIssueTypes />
    </RequireAdmin>
  );
}