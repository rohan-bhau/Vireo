"use client";

import { useState } from "react";
import type { Project } from "@/store/projectApi";
import { useGetWorkspaceNotificationSchemesQuery, useCreateNotificationSchemeMutation, useUpdateNotificationSchemeMutation, useDeleteNotificationSchemeMutation } from "@/store/notificationSchemeApi";
import type { NotificationEvent, RecipientType, NotificationScheme, NotificationSchemeEvent } from "@/store/notificationSchemeApi";
import { useGetNotificationPreferencesQuery, useUpdateProjectNotificationOverrideMutation } from "@/store/notificationApi";
import { Plus, Trash2, Save, Eye, EyeOff, Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const EVENT_LABELS: Record<NotificationEvent, string> = {
  issue_created: "Issue Created",
  issue_updated: "Issue Updated",
  issue_assigned: "Issue Assigned",
  issue_commented: "Issue Commented",
  issue_transitioned: "Issue Transitioned",
  issue_deleted: "Issue Deleted",
  sprint_started: "Sprint Started",
  sprint_completed: "Sprint Completed",
  mentioned: "Mentioned",
};

const RECIPIENT_LABELS: Record<RecipientType, string> = {
  reporter: "Reporter",
  assignee: "Assignee",
  watchers: "Watchers",
  project_lead: "Project Lead",
  all_project_members: "All Project Members",
  custom_role: "Custom Role",
};

export function ProjectSettingsNotifications({ project }: { project: Project }) {
  const { data: schemes, isLoading } = useGetWorkspaceNotificationSchemesQuery(project.workspaceId);
  const { data: prefsData } = useGetNotificationPreferencesQuery();
  const [createScheme] = useCreateNotificationSchemeMutation();
  const [updateScheme] = useUpdateNotificationSchemeMutation();
  const [deleteScheme] = useDeleteNotificationSchemeMutation();
  const [updateProjectOverride] = useUpdateProjectNotificationOverrideMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingScheme, setEditingScheme] = useState<string | null>(null);
  const [editingEvents, setEditingEvents] = useState<NotificationSchemeEvent[]>([]);

  const projectOverride = prefsData?.projectOverrides?.find((o) => o.projectId === project.id);
  const activeOverrideFields = [
    { key: "email" as const, label: "Email" },
    { key: "onAssigned" as const, label: "Assigned" },
    { key: "onMentioned" as const, label: "Mentioned" },
    { key: "onStatusChange" as const, label: "Status" },
    { key: "onCommented" as const, label: "Comments" },
    { key: "onIssueCreated" as const, label: "Created" },
    { key: "onSprintEvents" as const, label: "Sprints" },
  ];

  async function handleCreate() {
    if (!newName.trim()) return;
    await createScheme({ name: newName.trim(), workspaceId: project.workspaceId });
    setNewName("");
    setShowCreate(false);
  }

  function startEdit(scheme: NotificationScheme) {
    setEditingScheme(scheme._id);
    setEditingEvents(scheme.events.map((e) => ({ ...e })));
  }

  async function handleSaveEvents(schemeId: string) {
    await updateScheme({ id: schemeId, data: { events: editingEvents } });
    setEditingScheme(null);
  }

  function toggleRecipient(eventIdx: number, recipient: RecipientType) {
    const updated = [...editingEvents];
    const ev = { ...updated[eventIdx] };
    const idx = ev.recipients.indexOf(recipient);
    if (idx >= 0) {
      ev.recipients = ev.recipients.filter((r: string) => r !== recipient);
    } else {
      ev.recipients = [...ev.recipients, recipient];
    }
    updated[eventIdx] = ev;
    setEditingEvents(updated);
  }

  function toggleEventSetting(eventIdx: number, field: "email" | "inApp") {
    const updated = [...editingEvents];
    updated[eventIdx] = { ...updated[eventIdx], [field]: !updated[eventIdx][field] };
    setEditingEvents(updated);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#121C28]">Notifications</h2>
        <p className="text-sm text-[#737686]">Configure notification schemes and your per-project preferences</p>
      </div>

      <div className="space-y-8">
        {/* Per-project notification overrides */}
        <div>
          <h3 className="text-sm font-semibold text-text mb-3">Your Preferences for This Project</h3>
          <div className="rounded-xl border border-border-light bg-surface p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activeOverrideFields.map((field) => {
                const isActive = projectOverride ? projectOverride[field.key] : true;
                return (
                  <button
                    key={field.key}
                    onClick={() => updateProjectOverride({
                      projectId: project.id,
                      overrides: { [field.key]: !isActive },
                    })}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                      isActive
                        ? "border-[#2563EB] bg-[#EEF4FF] text-[#2563EB]"
                        : "border-border-light text-text-placeholder hover:bg-bg-light"
                    }`}
                  >
                    {isActive ? <Check className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                    {field.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notification schemes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text">Notification Schemes</h3>
            {!showCreate && (
              <Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add scheme
              </Button>
            )}
          </div>

          {showCreate && (
            <div className="mb-4 flex items-center gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Scheme name"
                className="flex-1 rounded-[3px] border border-border-light bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowCreate(false); }}
              />
              <Button size="sm" onClick={handleCreate}>Create</Button>
              <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          )}

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : schemes && schemes.length > 0 ? (
            <div className="space-y-3">
              {schemes.map((scheme) => (
                <div key={scheme._id} className="rounded-xl border border-border-light bg-surface overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text">{scheme.name}</span>
                      {scheme.default && (
                        <span className="rounded bg-[#EEF4FF] px-1.5 py-0.5 text-[10px] font-medium text-[#2563EB]">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingScheme !== scheme._id && (
                        <button
                          onClick={() => startEdit(scheme)}
                          className="text-xs text-[#2563EB] hover:text-[#1d4ed8] transition-colors"
                        >
                          Edit events
                        </button>
                      )}
                      {!scheme.default && (
                        <button
                          onClick={() => deleteScheme(scheme._id)}
                          className="flex h-7 w-7 items-center justify-center rounded text-text-placeholder hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {editingScheme === scheme._id ? (
                    <div className="p-4 space-y-3">
                      {editingEvents.map((ev, idx) => (
                        <div key={ev.event} className="rounded-lg border border-border-light p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-text">
                              {EVENT_LABELS[ev.event as NotificationEvent] || ev.event}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleEventSetting(idx, "email")}
                                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition-colors ${
                                  ev.email ? "bg-[#EEF4FF] text-[#2563EB]" : "text-text-placeholder"
                                }`}
                              >
                                {ev.email ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                Email
                              </button>
                              <button
                                onClick={() => toggleEventSetting(idx, "inApp")}
                                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition-colors ${
                                  ev.inApp ? "bg-[#EEF4FF] text-[#2563EB]" : "text-text-placeholder"
                                }`}
                              >
                                {ev.inApp ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                In-app
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(["reporter", "assignee", "watchers", "project_lead", "all_project_members"] as RecipientType[]).map((r) => (
                              <button
                                key={r}
                                onClick={() => toggleRecipient(idx, r)}
                                className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                                  ev.recipients.includes(r)
                                    ? "bg-[#2563EB] text-white"
                                    : "bg-bg-light text-text-secondary hover:bg-border-light"
                                }`}
                              >
                                {RECIPIENT_LABELS[r]}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" onClick={() => handleSaveEvents(scheme._id)}>
                          <Save className="h-3.5 w-3.5 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingScheme(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {scheme.events.filter((e) => e.inApp).slice(0, 5).map((e) => (
                          <span key={e.event} className="rounded bg-bg-light px-1.5 py-0.5 text-[10px] text-text-secondary">
                            {EVENT_LABELS[e.event as NotificationEvent] || e.event}
                          </span>
                        ))}
                        {scheme.events.filter((e) => e.inApp).length > 5 && (
                          <span className="text-[10px] text-text-placeholder">
                            +{scheme.events.filter((e) => e.inApp).length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-12 text-center">
              <Bell className="h-8 w-8 text-text-placeholder mb-2" />
              <h3 className="text-sm font-semibold text-text">No notification schemes yet</h3>
              <p className="mt-1 text-xs text-text-placeholder">Create a scheme to control how notifications are sent</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
