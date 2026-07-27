"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import type { Project } from "@/store/projectApi";
import type { AutomationRule } from "@/store/automationApi";
import { RuleList } from "@/components/automation/rule-list";
import { RuleBuilder } from "@/components/automation/rule-builder";
import { RuleTemplates } from "@/components/automation/rule-templates";
import { Button } from "@/components/ui/button";

export function ProjectSettingsAutomation({ project }: { project: Project }) {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  function handleCreateClick() {
    setEditingRule(null);
    setShowBuilder(true);
  }

  function handleEdit(rule: AutomationRule) {
    setEditingRule(rule);
    setShowBuilder(true);
  }

  function handleTemplatesClick() {
    setShowTemplates(true);
  }

  function handleBuilderClose() {
    setShowBuilder(false);
    setEditingRule(null);
  }

  function handleTemplateCreated() {
    setShowTemplates(false);
  }

  function handleTemplateCancel() {
    setShowTemplates(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#121C28]">Automation</h2>
          <p className="text-sm text-[#737686]">Automate project workflows with rules</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleTemplatesClick}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Templates
          </Button>
          <Button type="button" onClick={handleCreateClick}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create rule
          </Button>
        </div>
      </div>

      <RuleList projectId={project.id} onEdit={handleEdit} />

      {showBuilder && (
        <RuleBuilder
          open={showBuilder}
          onClose={handleBuilderClose}
          editRule={editingRule || undefined}
          projectId={project.id}
        />
      )}

      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-[3px] bg-white shadow-modal">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
              <h2 className="text-lg font-semibold text-[#121C28]">Rule templates</h2>
              <button
                onClick={handleTemplateCancel}
                className="flex h-9 w-9 items-center justify-center rounded-[3px] text-[#C3C6D7] transition-colors hover:bg-[#F8F9FF] hover:text-[#121C28]"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <RuleTemplates
                workspaceId={workspaceId}
                projectId={project.id}
                onCreated={handleTemplateCreated}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
