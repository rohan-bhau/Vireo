"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useGetWorkspaceNotificationSchemesQuery,
  useCreateNotificationSchemeMutation,
  useUpdateNotificationSchemeMutation,
  type NotificationEvent,
  type NotificationSchemeEvent,
} from "@/store/notificationSchemeApi";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell, Check, Loader2 } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";

const EVENT_LABELS: Partial<Record<NotificationEvent, string>> = {
  issue_created: "Issue created",
  issue_updated: "Issue updated",
  issue_assigned: "You're assigned",
  issue_commented: "Issue commented",
  issue_transitioned: "Status changed",
  issue_deleted: "Issue deleted",
  sprint_started: "Sprint starting",
  sprint_completed: "Sprint completed",
  mentioned: "You're mentioned",
};

export function WorkspaceSettingsNotifications() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { data: schemes = [], isLoading } = useGetWorkspaceNotificationSchemesQuery(workspaceId);
  const [createScheme, { isLoading: creating }] = useCreateNotificationSchemeMutation();
  const [updateScheme, { isLoading: saving }] = useUpdateNotificationSchemeMutation();

  const [events, setEvents] = useState<NotificationSchemeEvent[]>([]);
  const [lastSynced, setLastSynced] = useState<string>("");

  const scheme = schemes.find((s) => s.default) || schemes[0];

  if (scheme && lastSynced !== scheme._id) {
    setLastSynced(scheme._id);
    setEvents(scheme.events.map((e) => ({ ...e, recipients: [...e.recipients] })));
  }

  function patchEvent(event: NotificationEvent, patch: Partial<NotificationSchemeEvent>) {
    setEvents((prev) => prev.map((e) => (e.event === event ? { ...e, ...patch } : e)));
  }

  async function handleEnable() {
    try {
      await createScheme({ name: "Default", workspaceId }).unwrap();
      toastSuccess("Notifications enabled");
    } catch (err: unknown) {
      toastError((err as { data?: { message?: string } })?.data?.message || "Could not enable notifications");
    }
  }

  async function handleSave() {
    if (!scheme) return;
    try {
      await updateScheme({ id: scheme._id, data: { events } }).unwrap();
      toastSuccess("Notification preferences saved");
    } catch (err: unknown) {
      toastError((err as { data?: { message?: string } })?.data?.message || "Could not save preferences");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-text">Notifications</h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            Control which events notify workspace members, and how.
          </p>
        </div>
        <div className="rounded-xl border border-border-light bg-surface">
          <EmptyState
            icon={<Bell className="h-8 w-8" />}
            title="No notification scheme yet"
            message="Enable notifications to configure what members get notified about."
            action={
              <Button onClick={handleEnable} isLoading={creating}>
                Enable notifications
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text">Notifications</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          These preferences apply workspace-wide. Toggle each event and delivery channel on or off.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-light bg-surface">
        <div className="border-b border-border-light px-5 py-3">
          <h3 className="text-sm font-semibold text-text">Event types</h3>
          <p className="mt-0.5 text-xs text-text-tertiary">
            Scheme: <strong className="text-text-secondary">{scheme.name}</strong>
          </p>
        </div>
        <ul className="divide-y divide-border-light">
          {events.map((e) => (
            <li key={e.event} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text">
                  {EVENT_LABELS[e.event] || e.event.replace(/_/g, " ")}
                </p>
              </div>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 text-xs text-text-secondary">
                  In-app
                  <Switch
                    checked={e.inApp}
                    onChange={(v) => patchEvent(e.event, { inApp: v })}
                    aria-label={`In-app toggle for ${e.event}`}
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-text-secondary">
                  Email
                  <Switch
                    checked={e.email}
                    onChange={(v) => patchEvent(e.event, { email: v })}
                    aria-label={`Email toggle for ${e.event}`}
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {saving && (
        <p className="flex items-center gap-1.5 text-xs text-text-tertiary">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} isLoading={saving}>
          <Check className="mr-1.5 h-4 w-4" /> Save preferences
        </Button>
      </div>
    </div>
  );
}