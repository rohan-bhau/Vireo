"use client";

import { useState, useEffect } from "react";
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useUpdateProjectNotificationOverrideMutation,
  useRemoveProjectNotificationOverrideMutation,
  type NotificationPreferences,
  type ProjectNotificationOverride,
} from "@/store/notificationApi";

interface PreferenceItem {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}

const PREFERENCE_ITEMS: PreferenceItem[] = [
  { key: "email", label: "Email notifications", description: "Receive notifications via email" },
  { key: "push", label: "Push notifications", description: "Receive notifications in-app" },
  { key: "onAssigned", label: "When assigned to an issue", description: "Someone assigns an issue to you" },
  { key: "onMentioned", label: "When mentioned", description: "Someone mentions you in a comment" },
  { key: "onStatusChange", label: "On status changes", description: "Issue status is changed" },
  { key: "onCommented", label: "On comments", description: "Someone comments on an issue you're involved in" },
  { key: "onIssueCreated", label: "On issue creation", description: "A new issue is created in your project" },
  { key: "onSprintEvents", label: "On sprint events", description: "Sprint started or completed" },
];

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email: true,
  push: true,
  onAssigned: true,
  onMentioned: true,
  onStatusChange: true,
  onCommented: true,
  onIssueCreated: true,
  onSprintEvents: true,
};

export function NotificationPreferencesForm() {
  const { data, isLoading: loading } = useGetNotificationPreferencesQuery();
  const [updatePreferences, { isLoading: saving }] = useUpdateNotificationPreferencesMutation();
  const [updateProjectOverride] = useUpdateProjectNotificationOverrideMutation();
  const [removeProjectOverride] = useRemoveProjectNotificationOverrideMutation();

  const [local, setLocal] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [projectOverrides, setProjectOverrides] = useState<ProjectNotificationOverride[]>([]);
  const [success, setSuccess] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setLocal(data.preferences);
      setProjectOverrides(data.projectOverrides || []);
    }
  }, [data]);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-12 rounded-lg bg-gray-100" />
      ))}
    </div>;
  }

  function handleToggle(key: keyof NotificationPreferences) {
    const updated = { ...local, [key]: !local[key] };
    setLocal(updated);
    updatePreferences(updated).unwrap().then(() => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }).catch(() => {});
  }

  function handleProjectOverrideToggle(projectId: string, key: keyof ProjectNotificationOverride) {
    const existing = projectOverrides.find((o) => o.projectId === projectId);
    const currentValue = existing ? existing[key] : local[key as keyof NotificationPreferences];
    const newValue = !currentValue;

    const updated = projectOverrides.map((o) =>
      o.projectId === projectId ? { ...o, [key]: newValue } : o
    );
    if (!existing) {
      updated.push({
        projectId,
        email: local.email,
        onAssigned: local.onAssigned,
        onMentioned: local.onMentioned,
        onStatusChange: local.onStatusChange,
        onCommented: local.onCommented,
        onIssueCreated: local.onIssueCreated,
        onSprintEvents: local.onSprintEvents,
        [key]: newValue,
      } as ProjectNotificationOverride);
    }

    setProjectOverrides(updated);
    updateProjectOverride({ projectId, overrides: { [key]: newValue } as any });
  }

  function handleRemoveOverride(projectId: string) {
    setProjectOverrides((prev) => prev.filter((o) => o.projectId !== projectId));
    removeProjectOverride(projectId);
  }

  const overrideFields = [
    { key: "email" as keyof ProjectNotificationOverride, label: "Email" },
    { key: "onAssigned" as keyof ProjectNotificationOverride, label: "Assigned" },
    { key: "onMentioned" as keyof ProjectNotificationOverride, label: "Mentioned" },
    { key: "onStatusChange" as keyof ProjectNotificationOverride, label: "Status" },
    { key: "onCommented" as keyof ProjectNotificationOverride, label: "Comments" },
    { key: "onIssueCreated" as keyof ProjectNotificationOverride, label: "Created" },
    { key: "onSprintEvents" as keyof ProjectNotificationOverride, label: "Sprints" },
  ];

  return (
    <div className="space-y-6">
      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Preferences saved
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-text mb-3">Global Preferences</h3>
        <div className="space-y-3">
          {PREFERENCE_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-border-light bg-surface px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-text">{item.label}</p>
                <p className="text-xs text-text-placeholder mt-0.5">{item.description}</p>
              </div>
              <button
                onClick={() => handleToggle(item.key)}
                disabled={saving}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  local[item.key] ? "bg-[#2563EB]" : "bg-[#C3C6D7]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    local[item.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {projectOverrides.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text mb-3">Project Overrides</h3>
          <div className="space-y-2">
            {projectOverrides.map((override) => (
              <div key={override.projectId} className="rounded-lg border border-border-light bg-surface">
                <button
                  onClick={() => setExpandedProject(expandedProject === override.projectId ? null : override.projectId)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <span className="text-sm font-medium text-text">{override.projectId}</span>
                  <div className="flex items-center gap-2">
                    {overrideFields.some((f) => !override[f.key]) && (
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                        Some off
                      </span>
                    )}
                    <svg
                      className={`h-4 w-4 text-text-placeholder transition-transform ${
                        expandedProject === override.projectId ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>
                {expandedProject === override.projectId && (
                  <div className="border-t border-border-light px-4 py-3 space-y-2">
                    {overrideFields.map((field) => (
                      <div key={field.key} className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary">{field.label}</span>
                        <button
                          onClick={() => handleProjectOverrideToggle(override.projectId, field.key)}
                          className={`relative h-5 w-9 rounded-full transition-colors ${
                            override[field.key] ? "bg-[#2563EB]" : "bg-[#C3C6D7]"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                              override[field.key] ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleRemoveOverride(override.projectId)}
                      className="mt-2 text-xs text-red-500 hover:text-red-600 transition-colors"
                    >
                      Remove project override
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
