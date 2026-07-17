"use client";

import { useState } from "react";
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
import {
  ExternalLink,
  MessageSquare,
  GitBranch,
  Link2,
  Link2Off,
  Trash2,
  CheckCircle2,
  XCircle,
  Plug,
  TestTube,
} from "lucide-react";

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
              <Button type="button" variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
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
              <Button type="button" variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
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

export default function IntegrationsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { data: integrations = [], isLoading } = useGetIntegrationsQuery(workspaceId);
  const [saveIntegration, { isLoading: isSaving }] = useSaveIntegrationMutation();
  const [deleteIntegration] = useDeleteIntegrationMutation();
  const [toggleIntegration] = useToggleIntegrationMutation();
  const [testIntegration, { isLoading: isTesting }] = useTestIntegrationMutation();

  const slackIntegration = integrations.find((i) => i.type === "slack");
  const githubIntegration = integrations.find((i) => i.type === "github");

  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave(type: "slack" | "github", config: Record<string, unknown>, name: string) {
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

  async function handleDelete(type: "slack" | "github") {
    try {
      await deleteIntegration({ workspaceId, type }).unwrap();
    } catch {}
  }

  async function handleToggle(type: "slack" | "github", enabled: boolean) {
    try {
      await toggleIntegration({ workspaceId, type, enabled }).unwrap();
    } catch {}
  }

  async function handleTest(type: "slack" | "github") {
    try {
      await testIntegration({ workspaceId, type }).unwrap();
    } catch {}
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

      {integrations.length === 0 && (
        <div className="mb-6 rounded-xl bg-[#F8F9FF] p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <Plug className="h-7 w-7 text-[#2563EB]" />
          </div>
          <h2 className="text-base font-semibold text-[#121C28]">No integrations yet</h2>
          <p className="mt-1 text-sm text-[#737686]">
            Connect Slack for notifications or GitHub for repo tracking.
          </p>
        </div>
      )}

      <div className="space-y-6">
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
      </div>
    </div>
  );
}
