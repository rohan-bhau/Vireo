"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ExternalLink, BookOpen, Blocks, Shield, Zap, Workflow, BarChart3, Bell, Database, GitBranch, Rocket, Columns3 } from "lucide-react";
import { PageHero } from "@/components/sections/marketing/page-hero";

interface DocSection {
  id: string;
  title: string;
  icon: typeof BookOpen;
  lead: string;
  items: string[];
  tips?: string[];
}

const sections: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting started",
    icon: Rocket,
    lead: "Vireo is a project management platform for software teams. Sign up, create a workspace, and your projects in minutes — no configuration required.",
    items: [
      "Create your account with email, Google, or GitHub OAuth.",
      "On first login, a demo workspace is created so you can explore safely.",
      "Create or pick a workspace, then start your first project from a template (Scrum, Kanban, or Bug tracking).",
      "Everything syncs in real time across your whole team.",
    ],
    tips: [
      "Keep an eye on the onboarding checklist in your workspace — it guides you through the first project.",
      "You can undo most actions; deleted issues and boards can be restored from the audit log.",
    ],
  },
  {
    id: "workspaces",
    title: "Workspaces & teams",
    icon: Columns3,
    lead: "A workspace groups the projects, members, and roles for one organisation or team.",
    items: [
      "Invite members by email or a shareable invite link from the Members page.",
      "Assign roles — Owner, Admin, Lead, or Member — to control who can change what.",
      "Members can belong to multiple groups; permissions are inherited from workspace roles and groups.",
      "Use the People page to manage seats, groups, and role assignments in one place.",
    ],
  },
  {
    id: "projects",
    title: "Projects",
    icon: Blocks,
    lead: "Projects are where your team plans and tracks work. Each project has its own issue types, workflow, board, and backlog.",
    items: [
      "Create a project from a team-managed or company-managed template.",
      "Customise allowed issue types: Story, Task, Bug, Epic, and Sub-tasks.",
      "Set up components and versions to organise related work and releases.",
      "Project settings control permissions, workflows, and notification behaviour per project.",
    ],
  },
  {
    id: "issues",
    title: "Issues & boards",
    icon: Workflow,
    lead: "Issues are the work items in Vireo — stories, tasks, bugs, and epics. Boards visualise where each issue is in your workflow.",
    items: [
      "Create issues with a full-screen editor: rich description, priorities, story points, custom fields, and attachments.",
      "Drag and drop issues between board columns to move them through the workflow.",
      "Use filters or search to find issues across projects, assignees, and statuses.",
      "Comment, @-mention, and react to keep discussion in context on every issue.",
    ],
  },
  {
    id: "backlog-sprints",
    title: "Backlog & sprints",
    icon: Zap,
    lead: "The backlog holds everything your team hasn't started. Sprints are time-boxed iterations of planned work.",
    items: [
      "Rank the backlog by dragging issues up or down, or let AI priority scores suggest an order.",
      "Create a sprint, drag issues in, and set the sprint start and goal.",
      "Track sprint health with capacity, velocity, and included-vs-done counts in real time.",
      "When a sprint ends, complete it to surface the automated retrospective summary.",
    ],
  },
  {
    id: "roadmap",
    title: "Roadmap & timeline",
    icon: GitBranch,
    lead: "Roadmaps and timelines give leadership a view of planned work over time, across epics and releases.",
    items: [
      "Drag issues onto the timeline to schedule start and target dates.",
      "Group by epic, assignee, or fix version to see the plan from different angles.",
      "Dependencies between issues are drawn automatically; track them from the dependency sidebar.",
    ],
  },
  {
    id: "automation-ai",
    title: "Automation & AI",
    icon: Zap,
    lead: "Vireo ships with native automations and an AI assistant to remove repetitive work.",
    items: [
      "Rule-based automation: move issues, assign them, or post comments when events fire.",
      "The AI assistant drafts issue descriptions, summarises comments, and estimates points.",
      "Enable AI prioritisation to get a suggested ordering for your entire backlog.",
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: GitBranch,
    lead: "Connect Vireo to the tools your team already uses.",
    items: [
      "Source control: GitHub, GitLab, and Bitbucket branch/PR linking.",
      "Alerts: Slack, Discord, and email notifications.",
      "Design: attach Figma files and frames directly to issues.",
      "Monitoring and ops: Sentry, Datadog, PagerDuty, Opsgenie.",
      "Identity: Okta and Google SSO (enterprise).",
    ],
  },
  {
    id: "reports",
    title: "Reports & analytics",
    icon: BarChart3,
    lead: "Understand your delivery process with built-in reports and custom dashboards.",
    items: [
      "Burndown, velocity, cumulative flow, and cycle time charts out of the box.",
      "DORA metrics: deployment frequency, lead time, change failure rate.",
      "Build custom dashboards from any saved filter and share them with stakeholders.",
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    lead: "Stay on top of what matters without the noise.",
    items: [
      "The bell shows a live unread badge; open it to review and mark notifications read.",
      "Fine-tune email, push, and in-app alerts per event and per project.",
      "Mention someone to hand them context — they'll be notified instantly.",
      "Older notifications live on the dedicated Notifications page, never auto-deleted.",
    ],
  },
  {
    id: "api",
    title: "API & webhooks",
    icon: Database,
    lead: "Everything you can do in the UI you can do with the Vireo REST API.",
    items: [
      "REST endpoints for issues, projects, sprints, boards, and users.",
      "Webhooks push events to your systems the moment they happen.",
      "Scoped API tokens for safer automation and third-party tools.",
    ],
  },
  {
    id: "security",
    title: "Security",
    icon: Shield,
    lead: "Your data is encrypted in transit and at rest, and access is controlled with the principle of least privilege.",
    items: [
      "SOC 2 Type II audited infrastructure.",
      "SSO (SAML & OIDC), SCIM provisioning, and enforced 2FA for enterprise.",
      "Granular project and workspace permissions with a full audit log.",
    ],
  },
];

export default function DocsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Documentation"
        title="Everything you need to build with Vireo"
        subtitle="Guides, references, and best practices for setting up your workspace, planning work, and shipping software faster."
      />

      <section className="border-t border-[#C3C6D7]/20 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#737686]">
                On this page
              </p>
              <nav className="space-y-1 border-l border-[#C3C6D7]/20">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex cursor-pointer items-center gap-2.5 rounded-r-lg border-l-2 border-transparent px-3 py-2 text-sm font-medium text-[#5C6274] transition-colors hover:border-[#004AC6] hover:bg-[#F8F9FF] hover:text-[#004AC6]"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {section.title}
                    </a>
                  );
                })}
              </nav>
              <div className="mt-6 rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-4">
                <p className="text-sm font-semibold text-[#121C28]">Need a hand?</p>
                <p className="mt-1 text-xs leading-relaxed text-[#434655]">
                  Walk through the whole product hands-on in the interactive guide.
                </p>
                <Link
                  href="/guide"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#004AC6] transition-colors hover:text-[#003da8]"
                >
                  Open the guide
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </aside>

            <div className="min-w-0 space-y-14">
              {sections.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.id}
                    id={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: idx * 0.03 }}
                    className="scroll-mt-24"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#004A9E]/10 text-[#004A9E]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h2 className="text-2xl font-semibold tracking-tight text-[#121C28]">
                        {section.title}
                      </h2>
                    </div>
                    <p className="mb-4 leading-relaxed text-[#434655]">{section.lead}</p>
                    <ul className="space-y-2.5">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#434655]">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    {section.tips && (
                      <div className="mt-4 rounded-xl border border-[#004AC6]/15 bg-[#EEF4FF] p-4">
                        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#004AC6]">
                          Pro tip
                        </p>
                        <ul className="space-y-1.5 text-sm leading-relaxed text-[#33415C]">
                          {section.tips.map((tip) => (
                            <li key={tip}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-gradient-to-br from-[#004AC6] to-[#002e7c] p-8 text-center"
              >
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Learn by doing — in under 10 minutes
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-sm text-white/70">
                  Follow the guided tour to create a workspace, a project, and your first sprint with sample data.
                </p>
                <Link
                  href="/guide"
                  className="mt-6 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-bold text-[#004AC6] transition-all hover:bg-white/90"
                >
                  Take the guided tour
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}