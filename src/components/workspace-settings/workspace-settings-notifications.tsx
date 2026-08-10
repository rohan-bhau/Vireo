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
import {
  useGetWorkspaceNotificationPreferenceQuery,
  useUpdateWorkspaceNotificationPreferenceMutation,
} from "@/store/notificationApi";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell, Check, Loader2 } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { useSettings } from "@/lib/settings-context";
import { SkeletonSettingsPage } from "@/components/ui/skeleton";
import { clsx } from "clsx";

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
  const { isAdmin } = useSettings();

  const { data: schemes = [], isLoading } = useGetWorkspaceNotificationSchemesQuery(workspaceId);
  const [createScheme, { isLoading: creating }] = useCreateNotificationSchemeMutation();
  const [updateScheme, { isLoading: saving }] = useUpdateNotificationSchemeMutation();

  const {
    data: pref,
    isLoading: prefLoading,
  } = useGetWorkspaceNotificationPreferenceQuery(workspaceId, { skip: !workspaceId });
  const [updatePref, { isLoading: savingPref }] = useUpdateWorkspaceNotificationPreferenceMutation();

  const [events, setEvents] = useState<NotificationSchemeEvent[]>([]);
  const [lastSynced, setLastSynced] = useState<string>("");

  const scheme = schemes.find((s) => s.default) || schemes[0];

  if (scheme && lastSynced !== scheme._id) {
    setLastSynced(scheme._id);
    setEvents(scheme.events.map((e) => ({ ...e, recipients: [...e.recipients] })));
  }

  const possibleEvents = scheme?.events.length
    ? (scheme.events.map((e) => e.event) as NotificationEvent[])
    : (Object.keys(EVENT_LABELS) as NotificationEvent[]);

  const enabledEvents = pref ? pref.events : possibleEvents;

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

  async function handleTogglePersonal(event: NotificationEvent) {
    try {
      const next = enabledEvents.includes(event)
        ? enabledEvents.filter((e) => e !== event)
        : [...enabledEvents, event];
      await updatePref({ workspaceId, events: next }).unwrap();
    } catch {
      toastError("Could not update your notification preferences");
    }
  }

  if (isLoading || prefLoading) {
    return <SkeletonSettingsPage />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-text">Notifications</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          Control what you get notified about in this workspace.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-border-light bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border-light px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-text">
              My notifications in this workspace
            </h3>
            <p className="mt-0.5 text-xs text-text-tertiary">
              Turn an event off and you won&apos;t receive it here — by email or in-app.
            </p>
          </div>
          {savingPref && <Loader2 className="h-4 w-4 animate-spin text-text-tertiary" />}
        </div>
        <ul className="divide-y divide-border-light">
          {possibleEvents.map((event) => (
            <li key={event} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 shrink-0 text-text-tertiary" />
                <p className="text-sm font-medium text-text">{EVENT_LABELS[event] || event.replace(/_/g, " ")}</p>
              </div>
              <Switch
                checked={enabledEvents.includes(event)}
                onChange={() => handleTogglePersonal(event)}
                disabled={prefLoading || savingPref}
                aria-label={`Toggle ${EVENT_LABELS[event] || event}`}
              />
            </li>
          ))}
        </ul>
      </section>

      {isAdmin && (
        <section className={clsx("overflow-hidden rounded-xl border border-border-light bg-surface")}>
          <div className="border-b border-border-light px-5 py-4">
            <h3 className="text-sm font-semibold text-text">Workspace-wide scheme</h3>
            <p className="mt-0.5 text-xs text-text-tertiary">
              Admins control which events reach members and through which channels. Members can still switch any event off for
              themselves above.
            </p>
          </div>

          {!scheme ? (
            <div className="p-6">
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
          ) : (
            <>
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
              <div className="flex items-center gap-3 border-t border-border-light px-5 py-4">
                <Button onClick={handleSave} isLoading={saving}>
                  <Check className="mr-1.5 h-4 w-4" /> Save preferences
                </Button>
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-text-tertiary" />}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}