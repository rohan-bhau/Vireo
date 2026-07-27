"use client";

import { useState } from "react";
import type { Project } from "@/store/projectApi";
import { Code, GitBranch, ExternalLink, Unlink, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Integration {
  id: string;
  name: string;
  icon: typeof GitBranch;
  description: string;
  connected: boolean;
  repoUrl?: string;
}

export function ProjectSettingsDevTools({ project }: { project: Project }) {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: "github", name: "GitHub", icon: GitBranch, description: "Connect your GitHub repositories to link commits and branches to issues", connected: false },
    { id: "gitlab", name: "GitLab", icon: Code, description: "Connect your GitLab repositories to link commits and branches to issues", connected: false },
  ]);
  const [connecting, setConnecting] = useState<string | null>(null);

  function handleConnect(id: string) {
    setConnecting(id);
    setTimeout(() => {
      setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, connected: true, repoUrl: `https://${id === "github" ? "github.com" : "gitlab.com"}/user/${project.key.toLowerCase()}` } : i));
      setConnecting(null);
    }, 1200);
  }

  function handleDisconnect(id: string) {
    if (!confirm(`Disconnect ${id === "github" ? "GitHub" : "GitLab"} from this project?`)) return;
    setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, connected: false, repoUrl: undefined } : i));
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#121C28]">Development tools</h2>
        <p className="text-sm text-[#737686]">Connect your project to version control and CI/CD tools</p>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <div key={integration.id} className="rounded-xl border border-[#C3C6D7]/20 bg-white p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${integration.connected ? "bg-[#EEF4FF]" : "bg-[#F8F9FF]"}`}>
                    <Icon className={`h-6 w-6 ${integration.connected ? "text-[#2563EB]" : "text-[#C3C6D7]"}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#121C28]">{integration.name}</h3>
                    <p className="text-xs text-[#737686] mt-0.5 max-w-md">{integration.description}</p>
                    {integration.connected && integration.repoUrl && (
                      <a href={integration.repoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1d4ed8] transition-colors">
                        <ExternalLink className="h-3 w-3" />
                        {integration.repoUrl}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {integration.connected ? (
                    <>
                      <span className="flex items-center gap-1 text-xs font-medium text-[#36B37E]">
                        <Check className="h-3.5 w-3.5" />
                        Connected
                      </span>
                      <Button size="sm" variant="outline" onClick={() => handleDisconnect(integration.id)}>
                        <Unlink className="h-3.5 w-3.5 mr-1" />
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => handleConnect(integration.id)} isLoading={connecting === integration.id}>
                      {connecting === integration.id ? (
                        <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <Code className="h-3.5 w-3.5 mr-1" />
                      )}
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
