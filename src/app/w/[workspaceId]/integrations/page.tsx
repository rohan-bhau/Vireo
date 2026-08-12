"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  useGetIntegrationsQuery,
  useSaveIntegrationMutation,
  useDeleteIntegrationMutation,
  useToggleIntegrationMutation,
  useTestIntegrationMutation,
  type Integration,
} from "@/store/integrationApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { WebhookConfig } from "@/components/integrations/webhook-config";
import {
  MessageSquare,
  GitBranch,
  Link2,
  Link2Off,
  Trash2,
  CheckCircle2,
  XCircle,
  TestTube,
  Webhook,
  Puzzle,
  Frame,
  GitBranch as GitlabIcon,
  Cloud,
} from "lucide-react";

type FilterType = "all" | "slack" | "github" | "webhook";

interface IntegrationConfigProps {
  type: "slack" | "github";
  integration?: Integration;
  onSave: (config: Record<string, unknown>, name: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onToggle: (enabled: boolean) => Promise<void>;
  onTest: () => Promise<void>;
  testing: boolean;
  saving: boolean;
}

const INTEGRATION_CATALOG = [
  {
    id: "slack",
    name: "Slack",
    description: "Send notifications to your Slack workspace when tasks are created, updated, or completed.",
    icon: MessageSquare,
    color: "#4A154B",
    bgClass: "bg-[#4A154B]/10",
    status: "connected" as const,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Link repositories to track commits, pull requests, and deployments alongside your tasks.",
    icon: GitBranch,
    color: "#24292F",
    bgClass: "bg-[#24292F]/10",
    status: "connected" as const,
  },
  {
    id: "webhook",
    name: "Webhooks",
    description: "Send custom HTTP callbacks when issue events occur in your workspace.",
    icon: Webhook,
    color: "#2563EB",
    bgClass: "bg-[#2563EB]/10",
    status: "available" as const,
  },
  {
    id: "gitlab",
    name: "GitLab",
    description: "Connect GitLab repositories to track merge requests and pipelines.",
    icon: GitlabIcon,
    color: "#E24329",
    bgClass: "bg-[#E24329]/10",
    status: "coming-soon" as const,
  },
  {
    id: "figma",
    name: "Figma",
    description: "Embed Figma designs and prototypes directly on your issues.",
    icon: Frame,
    color: "#1ABCFE",
    bgClass: "bg-[#1ABCFE]/10",
    status: "coming-soon" as const,
  },
  {
    id: "jira",
    name: "Jira",
    description: "Sync issues and projects with your Jira instance.",
    icon: Cloud,
    color: "#0052CC",
    bgClass: "bg-[#0052CC]/10",
    status: "coming-soon" as const,
  },
];

function SlackConfig({ integration, onSave, onDelete, onToggle, onTest, testing, saving }: IntegrationConfigProps) {
  const [webhookUrl, setWebhookUrl] = useState(
    (integration?.config?.webhookUrl as string) || ""
  );
  const [channel, setChannel] = useState(
    (integration?.config?.channel as string) || ""
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await onSave({ webhookUrl: webhookUrl.trim(), channel: channel.trim() }, "Slack");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A154B]/10">
          <MessageSquare className="h-5 w-5 text-[#4A154B]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#121C28]">Slack</h3>
          <p className="text-xs text-[#737686]">
            Send notifications to your Slack workspace when tasks are created, updated, or completed.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <Input
          label="Webhook URL"
          placeholder="https://hooks.slack.com/services/..."
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          type="url"
        />
        <Input
          label="Channel (optional)"
          placeholder="#general"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        />
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" size="sm" isLoading={saving}>
            <Link2 className="mr-1.5 h-4 w-4" />
            {integration ? "Update" : "Connect"}
          </Button>
          {integration && (
            <>
              <Button type="button" variant="outline" size="sm" onClick={onTest} isLoading={testing}>
                <TestTube className="mr-1.5 h-4 w-4" />
                Test
              </Button>
              {integration.enabled ? (
                <Button type="button" variant="outline" size="sm" onClick={() => onToggle(false)}>
                  <Link2Off className="mr-1.5 h-4 w-4" />
                  Disable
                </Button>
              ) : (
                <Button type="button" variant="outline" size="sm" onClick={() => onToggle(true)}>
                  <Link2 className="mr-1.5 h-4 w-4" />
                  Enable
                </Button>
              )}
              <Button type="button" variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700 cursor-pointer">
                <Trash2 className="mr-1.5 h-4 w-4" />
                Remove
              </Button>
            </>
          )}
        </div>
      </form>

      {integration && (
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 font-medium">
            Status:{" "}
            {integration.enabled ? (
              <span className="flex items-center gap-1 text-[#059669]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Enabled
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#737686]">
                <XCircle className="h-3.5 w-3.5" /> Disabled
              </span>
            )}
          </span>
          {integration.lastTestStatus && (
            <span className={`flex items-center gap-1 ${
              integration.lastTestStatus === "success" ? "text-[#059669]" : "text-red-500"
            }`}>
              Last test: {integration.lastTestStatus === "success" ? "Passed" : "Failed"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function GitHubConfig({ integration, onSave, onDelete, onToggle, onTest, testing, saving }: IntegrationConfigProps) {
  const [token, setToken] = useState(
    (integration?.config?.token as string) || ""
  );
  const [repo, setRepo] = useState(
    (integration?.config?.repo as string) || ""
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await onSave({ token: token.trim(), repo: repo.trim() }, "GitHub");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#24292F]/10">
          <GitBranch className="h-5 w-5 text-[#24292F]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#121C28]">GitHub</h3>
          <p className="text-xs text-[#737686]">
            Link repositories to track commits, pull requests, and deployments alongside your tasks.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <Input
          label="Personal Access Token"
          placeholder="ghp_..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          type="password"
        />
        <Input
          label="Repository"
          placeholder="owner/repo"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
        />
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" size="sm" isLoading={saving}>
            <Link2 className="mr-1.5 h-4 w-4" />
            {integration ? "Update" : "Connect"}
          </Button>
          {integration && (
            <>
              <Button type="button" variant="outline" size="sm" onClick={onTest} isLoading={testing}>
                <TestTube className="mr-1.5 h-4 w-4" />
                Test
              </Button>
              {integration.enabled ? (
                <Button type="button" variant="outline" size="sm" onClick={() => onToggle(false)}>
                  <Link2Off className="mr-1.5 h-4 w-4" />
                  Disable
                </Button>
              ) : (
                <Button type="button" variant="outline" size="sm" onClick={() => onToggle(true)}>
                  <Link2 className="mr-1.5 h-4 w-4" />
                  Enable
                </Button>
              )}
              <Button type="button" variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700 cursor-pointer">
                <Trash2 className="mr-1.5 h-4 w-4" />
                Remove
              </Button>
            </>
          )}
        </div>
      </form>

      {integration && (
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 font-medium">
            Status:{" "}
            {integration.enabled ? (
              <span className="flex items-center gap-1 text-[#059669]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Enabled
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#737686]">
                <XCircle className="h-3.5 w-3.5" /> Disabled
              </span>
            )}
          </span>
          {integration.lastTestStatus && (
            <span className={`flex items-center gap-1 ${
              integration.lastTestStatus === "success" ? "text-[#059669]" : "text-red-500"
            }`}>
              Last test: {integration.lastTestStatus === "success" ? "Passed" : "Failed"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "slack", label: "Slack" },
  { key: "github", label: "GitHub" },
  { key: "webhook", label: "Webhook" },
];

export default function IntegrationsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { data: integrations = [], isLoading } = useGetIntegrationsQuery(workspaceId);
  const [saveIntegration, { isLoading: isSaving }] = useSaveIntegrationMutation();
  const [deleteIntegration] = useDeleteIntegrationMutation();
  const [toggleIntegration] = useToggleIntegrationMutation();
  const [testIntegration, { isLoading: isTesting }] = useTestIntegrationMutation();
  const [confirmDeleteType, setConfirmDeleteType] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showCatalog, setShowCatalog] = useState(false);

  const slackIntegration = integrations.find((i) => i.type === "slack");
  const githubIntegration = integrations.find((i) => i.type === "github");

  const [saveError, setSaveError] = useState<string | null>(null);

  const filteredCatalog = useMemo(() => {
    if (activeFilter === "all") return INTEGRATION_CATALOG;
    return INTEGRATION_CATALOG.filter((item) => item.id === activeFilter);
  }, [activeFilter]);

  async function handleSave(type: "slack" | "github" | "webhook", config: Record<string, unknown>, name: string) {
    setSaveError(null);
    try {
      await saveIntegration({
        workspaceId,
        type,
        name,
        config,
        enabled: true,
      }).unwrap();
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message || "Failed to save integration";
      setSaveError(message);
    }
  }

  async function handleDelete(idOrType: string) {
    setConfirmDeleteType(idOrType);
  }

  async function confirmDelete() {
    if (!confirmDeleteType) return;
    const idOrType = confirmDeleteType;
    setConfirmDeleteType(null);
    const types = ["slack", "github"] as const;
    if (types.includes(idOrType as "slack" | "github")) {
      try {
        await deleteIntegration({ workspaceId, type: idOrType as "slack" | "github" }).unwrap();
      } catch {}
    } else {
      try {
        await deleteIntegration({ workspaceId, type: idOrType }).unwrap();
      } catch {}
    }
  }

  async function handleToggle(idOrType: string, enabled: boolean) {
    const types = ["slack", "github"] as const;
    if (types.includes(idOrType as "slack" | "github")) {
      try {
        await toggleIntegration({ workspaceId, type: idOrType as "slack" | "github", enabled }).unwrap();
      } catch {}
    } else {
      try {
        await toggleIntegration({ workspaceId, type: idOrType, enabled }).unwrap();
      } catch {}
    }
  }

  async function handleTest(idOrType: string) {
    const types = ["slack", "github"] as const;
    if (types.includes(idOrType as "slack" | "github")) {
      try {
        await testIntegration({ workspaceId, type: idOrType as "slack" | "github" }).unwrap();
      } catch {}
    } else {
      try {
        await testIntegration({ workspaceId, type: idOrType }).unwrap();
      } catch {}
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-[#121C28]">Integrations</h1>
        <p className="mt-0.5 text-sm text-[#737686]">
          Connect your workspace with external tools and services.
        </p>
      </div>

      {saveError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{saveError}</div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-[#F3F4F6] p-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeFilter === filter.key
                  ? "bg-white text-[#121C28] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                  : "text-[#737686] hover:text-[#121C28]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCatalog(!showCatalog)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
        >
          <Puzzle className="h-3.5 w-3.5" />
          {showCatalog ? "Hide catalog" : "Browse all"}
        </button>
      </div>

      {showCatalog && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCatalog.map((item) => {
            const isConnected = integrations.some((i) => i.type === item.id);
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveFilter(item.id as FilterType);
                  setShowCatalog(false);
                }}
                className={`relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  item.status === "coming-soon"
                    ? "border-dashed border-[#E2E4E9] opacity-60 cursor-not-allowed"
                    : "border-[#E2E4E9] bg-white hover:border-[#2563EB] hover:shadow-[0_2px_8px_rgba(37,99,235,0.08)] cursor-pointer"
                }`}
              >
                {isConnected && (
                  <span className="absolute right-3 top-3 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#059669] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#059669]" />
                  </span>
                )}
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bgClass}`}>
                  <item.icon className="h-5 w-5" style={{ color: item.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#121C28]">{item.name}</h3>
                  <p className="mt-0.5 text-xs text-[#737686] leading-relaxed">{item.description}</p>
                </div>
                {item.status === "coming-soon" && (
                  <span className="mt-1 inline-flex items-center rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#737686]">
                    Coming soon
                  </span>
                )}
                {isConnected && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-medium text-[#059669]">
                    <CheckCircle2 className="h-3 w-3" /> Connected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-6">
        {(activeFilter === "all" || activeFilter === "slack") && (
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <SlackConfig
              type="slack"
              integration={slackIntegration}
              onSave={(config, name) => handleSave("slack", config, name)}
              onDelete={() => handleDelete("slack")}
              onToggle={(enabled) => handleToggle("slack", enabled)}
              onTest={() => handleTest("slack")}
              testing={isTesting}
              saving={isSaving}
            />
          </div>
        )}

        {(activeFilter === "all" || activeFilter === "github") && (
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <GitHubConfig
              type="github"
              integration={githubIntegration}
              onSave={(config, name) => handleSave("github", config, name)}
              onDelete={() => handleDelete("github")}
              onToggle={(enabled) => handleToggle("github", enabled)}
              onTest={() => handleTest("github")}
              testing={isTesting}
              saving={isSaving}
            />
          </div>
        )}

        {(activeFilter === "all" || activeFilter === "webhook") && (
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <WebhookConfig
              integrations={integrations}
              onSave={(config, name) => handleSave("webhook", config, name)}
              onDelete={(id) => handleDelete(id)}
              onToggle={(id, enabled) => handleToggle(id, enabled)}
              onTest={(id) => handleTest(id)}
              testing={isTesting}
              saving={isSaving}
            />
          </div>
        )}
      </div>

      <Dialog open={confirmDeleteType !== null} onClose={() => setConfirmDeleteType(null)} title="Remove integration?">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[#5E6C84]">
            Are you sure you want to remove this integration? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteType(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Remove
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
