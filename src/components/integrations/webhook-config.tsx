"use client";

import { useState } from "react";
import type { Integration, WebhookConfig as WebhookConfigType } from "@/store/integrationApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Webhook,
  Link2,
  Link2Off,
  Trash2,
  CheckCircle2,
  XCircle,
  TestTube,
  Activity,
} from "lucide-react";

const AVAILABLE_EVENTS = [
  { value: "issue.created", label: "Issue Created" },
  { value: "issue.updated", label: "Issue Updated" },
  { value: "issue.commented", label: "Issue Commented" },
  { value: "issue.deleted", label: "Issue Deleted" },
];

interface WebhookConfigProps {
  integrations: Integration[];
  onSave: (config: Record<string, unknown>, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, enabled: boolean) => Promise<void>;
  onTest: (id: string) => Promise<void>;
  testing: boolean;
  saving: boolean;
}

function WebhookForm({ onSave, saving }: { onSave: WebhookConfigProps["onSave"]; saving: boolean }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  function toggleEvent(event: string) {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || selectedEvents.length === 0) return;
    const config: Record<string, unknown> = {
      url: url.trim(),
      events: selectedEvents,
    };
    if (secret.trim()) {
      config.secret = secret.trim();
    }
    await onSave(config, name.trim() || "Webhook");
    setName("");
    setUrl("");
    setSecret("");
    setSelectedEvents([]);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name" placeholder="My Webhook" value={name} onChange={(e) => setName(e.target.value)} />
      <Input
        label="URL *"
        placeholder="https://example.com/webhook"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        type="url"
        required
      />
      <div>
        <label className="text-xs font-semibold text-[#737686]">Events *</label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {AVAILABLE_EVENTS.map((event) => (
            <label
              key={event.value}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-[#E2E4E9] px-3 py-2 text-sm text-[#121C28] transition-colors hover:bg-[#F8F9FF] has-[:checked]:border-[#2563EB] has-[:checked]:bg-[#EFF6FF]"
            >
              <input
                type="checkbox"
                checked={selectedEvents.includes(event.value)}
                onChange={() => toggleEvent(event.value)}
                className="h-4 w-4 rounded border-[#D0D5DD] text-[#2563EB] focus:ring-[#2563EB]"
              />
              {event.label}
            </label>
          ))}
        </div>
      </div>
      <Input label="Secret Token (optional)" placeholder="••••••••" value={secret} onChange={(e) => setSecret(e.target.value)} type="password" />
      <Button type="submit" size="sm" isLoading={saving} disabled={!url.trim() || selectedEvents.length === 0}>
        <Webhook className="mr-1.5 h-4 w-4" />
        Add Webhook
      </Button>
    </form>
  );
}

function WebhookListItem({
  webhook,
  onDelete,
  onToggle,
  onTest,
  testing,
}: {
  webhook: Integration;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, enabled: boolean) => Promise<void>;
  onTest: (id: string) => Promise<void>;
  testing: boolean;
}) {
  const config = webhook.config as unknown as WebhookConfigType;
  const truncatedUrl =
    config.url.length > 40 ? config.url.slice(0, 40) + "..." : config.url;

  return (
    <div className="rounded-lg border border-[#E2E4E9] bg-[#FAFBFC] p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#121C28]">{webhook.name}</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                webhook.enabled
                  ? "bg-[#ECFDF5] text-[#059669]"
                  : "bg-[#F3F4F6] text-[#737686]"
              }`}
            >
              {webhook.enabled ? "Active" : "Disabled"}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#737686] font-mono">{truncatedUrl}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {config.events.map((event) => (
              <span
                key={event}
                className="inline-flex items-center rounded-md bg-[#EFF6FF] px-2 py-0.5 text-xs font-medium text-[#2563EB]"
              >
                {event}
              </span>
            ))}
          </div>
          {config.lastDelivery && (
            <p className="mt-2 flex items-center gap-1 text-xs text-[#737686]">
              <Activity className="h-3 w-3" />
              Last delivery:{" "}
              <span
                className={
                  config.lastDelivery.status === "success"
                    ? "text-[#059669]"
                    : "text-red-500"
                }
              >
                {config.lastDelivery.status === "success" ? "Success" : "Failed"}
              </span>
              {" · "}
              {new Date(config.lastDelivery.timestamp).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button type="button" variant="outline" size="sm" onClick={() => onTest(webhook._id)} isLoading={testing}>
            <TestTube className="h-3.5 w-3.5" />
          </Button>
          {webhook.enabled ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onToggle(webhook._id, false)}>
              <Link2Off className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => onToggle(webhook._id, true)}>
              <Link2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(webhook._id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {webhook.lastTestedAt && (
        <div className="mt-2 flex items-center gap-4 text-xs">
          <span className={`flex items-center gap-1 ${
            webhook.lastTestStatus === "success" ? "text-[#059669]" : "text-red-500"
          }`}>
            <CheckCircle2 className="h-3 w-3" />
            Last test: {webhook.lastTestStatus === "success" ? "Passed" : "Failed"}
          </span>
          <span className="text-[#737686]">
            {new Date(webhook.lastTestedAt).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

export function WebhookConfig({ integrations, onSave, onDelete, onToggle, onTest, testing, saving }: WebhookConfigProps) {
  const webhooks = integrations.filter((i) => i.type === "webhook");

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB]/10">
          <Webhook className="h-5 w-5 text-[#2563EB]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#121C28]">Webhooks</h3>
          <p className="text-xs text-[#737686]">
            Send custom HTTP callbacks when issue events occur in your workspace.
          </p>
        </div>
      </div>

      <WebhookForm onSave={onSave} saving={saving} />

      {webhooks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#737686]">
            Configured Webhooks ({webhooks.length})
          </h4>
          {webhooks.map((webhook) => (
            <WebhookListItem
              key={webhook._id}
              webhook={webhook}
              onDelete={onDelete}
              onToggle={onToggle}
              onTest={onTest}
              testing={testing}
            />
          ))}
        </div>
      )}
    </div>
  );
}
