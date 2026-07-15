"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Shield, Users, Sparkles, Bug, Columns, IterationCcw, Route, BarChart3, MessageSquareMore, RefreshCw, GitBranch, Workflow, Lock, ChevronDown } from "lucide-react";
import { productCategories, getCategoryById, getItemBySlug, getCategoryForSlug } from "@/lib/product-data";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const iconMap: Record<string, typeof Bug> = {
  "issue-tracking": Bug,
  "kanban-boards": Columns,
  "scrum-sprints": IterationCcw,
  "roadmaps": Route,
  "analytics": BarChart3,
  "collaboration": MessageSquareMore,
  "ai-assistant": Sparkles,
  "real-time-sync": RefreshCw,
  "git-integration": GitBranch,
  "code-review": GitBranch,
  "ci-cd": RefreshCw,
  "api": Workflow,
  "roadmap-planning": Route,
  "backlog-prioritization": BarChart3,
  "sprint-management": IterationCcw,
  "stakeholder-reports": BarChart3,
  "security": Lock,
  "sso": Shield,
  "audit": Shield,
  "deployment": Shield,
  "portfolio-management": Workflow,
  "resource-planning": Users,
  "cross-team-collab": MessageSquareMore,
  "service-desk": MessageSquareMore,
  "incident-management": Bug,
  "asset-tracking": Columns,
};

const articleContent: Record<string, { sections: { title: string; content: string; icon?: keyof typeof iconMap }[]; benefits?: string[]; cta?: string }> = {
  "issue-tracking": {
    sections: [
      { title: "Custom Issue Types", content: "Create issue types that match your workflow — from bugs and tasks to epics and custom types. Define custom fields, workflows, and screen schemes for each type." },
      { title: "Rich Text & Attachments", content: "Write detailed issue descriptions with rich text formatting, code blocks, inline images, and file attachments. Keep all context in one place." },
      { title: "Dependencies & Linking", content: "Link issues to show dependencies, blockers, and relationships. Visualise how work is connected across your project." },
      { title: "Repository Integration", content: "Connect your GitHub or GitLab repositories. See branches, commits, and pull requests directly on each issue." },
    ],
    benefits: ["Centralised issue tracking across all projects", "Custom workflows that match your process", "Real-time collaboration on every issue", "Deep integration with your development tools"],
    cta: "Start tracking issues today — free.",
  },
  "kanban-boards": {
    sections: [
      { title: "Drag-and-Drop Workflows", content: "Move cards across columns with smooth drag-and-drop. Customise your workflow stages to match your team's process exactly." },
      { title: "WIP Limits", content: "Set work-in-progress limits per column to prevent bottlenecks and keep your team focused on finishing work before starting new work." },
      { title: "Swimlanes", content: "Organise cards into horizontal swimlanes by team member, priority, or any custom criteria. See the big picture at a glance." },
      { title: "Automation Rules", content: "Automate repetitive actions — auto-close completed issues, assign based on column changes, and send notifications when work is blocked." },
    ],
    benefits: ["Visualise your entire workflow at a glance", "Identify and eliminate bottlenecks immediately", "Enforce WIP limits for better focus", "Automate repetitive board management tasks"],
  },
  "scrum-sprints": {
    sections: [
      { title: "Sprint Planning", content: "Plan sprints with confidence. Use velocity tracking from previous sprints to predict what your team can deliver." },
      { title: "Capacity Management", content: "Track team member availability and assign work based on individual capacity. Avoid overloading your team." },
      { title: "AI-Powered Estimation", content: "Let AI suggest story points based on issue complexity, historical data, and similar completed work. Reduce estimation overhead." },
      { title: "Sprint Retrospectives", content: "After each sprint, receive an AI-generated retro summary with patterns, bottlenecks, and actionable recommendations for improvement." },
    ],
    benefits: ["Data-driven sprint planning and estimation", "AI assistance that learns from your team's history", "Automated retrospectives with actionable insights", "Continuous improvement built into your workflow"],
  },
  "roadmaps": {
    sections: [
      { title: "Timeline View", content: "Visualise your roadmap on a shared timeline. Track epics, milestones, and releases with clear start and end dates." },
      { title: "Dependency Tracking", content: "Map cross-team dependencies directly on your roadmap. Identify risks before they become blockers." },
      { title: "Progress Tracking", content: "See real-time progress on every initiative. Understand which epics are on track, at risk, or behind schedule." },
    ],
    benefits: ["Align your team around a shared timeline", "Identify cross-team dependencies early", "Communicate progress to stakeholders clearly", "Make data-driven roadmap decisions"],
  },
  "analytics": {
    sections: [
      { title: "DORA Metrics", content: "Track deployment frequency, lead time for changes, change failure rate, and time to restore service. Benchmark against industry standards." },
      { title: "Burndown Charts", content: "Monitor sprint progress with real-time burndown and burnup charts. Know early if your sprint is on track." },
      { title: "Cycle Time Analysis", content: "Analyse how long work takes from start to finish. Identify stages where work gets stuck and optimise your process." },
      { title: "Custom Dashboards", content: "Build custom dashboards with the metrics that matter to your team. Share them with stakeholders in a single click." },
    ],
    benefits: ["Industry-standard DORA metrics out of the box", "Real-time visibility into team performance", "Custom dashboards for every audience"],
  },
  "collaboration": {
    sections: [
      { title: "Threaded Discussions", content: "Discuss issues in threaded comments. Mention teammates, share updates, and keep conversations organised." },
      { title: "Real-Time Notifications", content: "Get instant notifications when you're mentioned, assigned, or when issues you follow are updated." },
      { title: "Team Chat Integration", content: "Connect with your team without leaving Vireo. Integrated chat keeps context close to your work." },
    ],
    benefits: ["Context-rich discussions on every issue", "Real-time updates across your team", "Integrated chat keeps conversations in context"],
  },
  "ai-assistant": {
    sections: [
      { title: "Smart Estimation", content: "AI assigns story points based on historical velocity and issue complexity, reducing planning overhead." },
      { title: "Auto-Prioritisation", content: "Surface the highest-impact work first using weighted scoring across business value, effort, and dependencies." },
      { title: "Risk Detection", content: "Get alerted when a sprint is at risk due to scope creep, unbalanced assignments, or blocked issues." },
      { title: "Retro Insights", content: "After each sprint, receive an AI-generated retro summary with patterns, bottlenecks, and actionable recommendations." },
      { title: "Standup Summaries", content: "AI compiles individual progress from issue updates into a team-wide standup report — no meetings required." },
      { title: "Natural Language Search", content: 'Ask "what issues are blocked in the current sprint?" and get an instant, contextual answer.' },
    ],
    benefits: ["Reduce planning overhead with AI estimation", "Catch risks before they become blockers", "Eliminate manual standup meetings", "Get actionable insights from your data"],
  },
  "real-time-sync": {
    sections: [
      { title: "Multi-User Collaboration", content: "Multiple team members can work in the same project simultaneously. Changes sync instantly across all connected clients." },
      { title: "No Page Refreshes", content: "Updates appear in real-time without manual refreshes. Everyone always sees the latest state of your project." },
      { title: "Offline Support", content: "Keep working even when you lose connection. Changes sync automatically when you're back online." },
    ],
    benefits: ["Real-time collaboration at scale", "Zero-friction team updates", "Reliable sync even with spotty connections"],
  },
  "git-integration": {
    sections: [
      { title: "Branch Linking", content: "Create branches directly from issues. Vireo automatically links branches, commits, and pull requests to the right issues." },
      { title: "Commit History", content: "View commit history on every issue. See who changed what and when, with links back to your repository." },
      { title: "Automated Workflows", content: "Automatically transition issues when commits are pushed or PRs are merged. Keep your board in sync with your code." },
    ],
  },
  "ci-cd": {
    sections: [
      { title: "Pipeline Status", content: "View CI/CD pipeline status directly on your issues and boards. See build and deploy status at a glance." },
      { title: "Deployment Tracking", content: "Track deployments across environments. Know which version of your code is in production at all times." },
      { title: "Quality Gates", content: "Set quality gates that prevent issues from moving forward when builds fail or tests don't pass." },
    ],
  },
  "code-review": {
    sections: [
      { title: "Review Checklists", content: "Create custom code review checklists that must be completed before merging. Ensure every PR meets your team's standards." },
      { title: "Quality Gates", content: "Define automated quality gates that block merging until code review is complete and all checks pass." },
    ],
  },
  "api": {
    sections: [
      { title: "REST & GraphQL APIs", content: "Extend Vireo with our comprehensive REST and GraphQL APIs. Build custom integrations, automations, and reports." },
      { title: "Webhooks", content: "Send real-time events to your other tools. Trigger workflows in Slack, Discord, or your own systems." },
      { title: "Custom Automations", content: "Build custom automation rules using our API. Connect Vireo to your existing toolchain and workflow." },
    ],
  },
  "roadmap-planning": {
    sections: [
      { title: "Cross-Team Roadmaps", content: "Build roadmaps that span multiple teams. Track epics, milestones, and dependencies across your entire organisation." },
      { title: "Milestone Tracking", content: "Define milestones and track progress toward them. Communicate timelines and expectations to stakeholders." },
      { title: "What-If Scenarios", content: "Model different scenarios to understand the impact of changes. Make informed decisions about priorities and timelines." },
    ],
  },
  "backlog-prioritization": {
    sections: [
      { title: "AI-Weighted Scoring", content: "Prioritise your backlog using AI-weighted scoring across business value, effort, risk, and dependencies." },
      { title: "Custom Priority Matrices", content: "Define your own prioritisation framework. Weight factors based on what matters most to your organisation." },
    ],
  },
  "sprint-management": {
    sections: [
      { title: "Velocity Tracking", content: "Track team velocity across sprints. Use historical data to predict future capacity and plan more accurately." },
      { title: "Capacity Planning", content: "See team member availability and assign work based on individual capacity and skills." },
    ],
  },
  "stakeholder-reports": {
    sections: [
      { title: "Executive Summaries", content: "Generate stakeholder-friendly reports with burndown charts, cycle time analysis, and delivery insights." },
      { title: "Scheduled Reports", content: "Automatically generate and distribute reports on a schedule. Keep stakeholders informed without manual effort." },
    ],
  },
  "security": {
    sections: [
      { title: "Encryption", content: "All data is encrypted at rest and in transit. SOC 2 compliant infrastructure with end-to-end security." },
      { title: "Access Control", content: "Granular role-based access control. Define who can view, create, edit, or delete work at every level." },
      { title: "Compliance", content: "SOC 2 Type II certified. Regular security audits and penetration testing by third-party firms." },
    ],
  },
  "sso": {
    sections: [
      { title: "Identity Providers", content: "Support for Okta, Azure AD, Google Workspace, and any SAML 2.0 or OIDC provider." },
      { title: "SCIM Provisioning", content: "Automated user provisioning and de-provisioning via SCIM. Keep your team in sync with your identity provider." },
    ],
  },
  "audit": {
    sections: [
      { title: "Immutable Audit Log", content: "Every action is logged with before/after values, timestamp, and actor information. Immutable logs cannot be tampered with." },
      { title: "Activity Monitoring", content: "Monitor user activity across your workspace. Generate compliance reports for internal and external audits." },
    ],
  },
  "deployment": {
    sections: [
      { title: "Self-Hosted", content: "Deploy Vireo on your own infrastructure. Full control over data, updates, and security policies." },
      { title: "Dedicated Support", content: "Enterprise plans include dedicated support with SLA guarantees and a named account manager." },
    ],
  },
  "portfolio-management": {
    sections: [
      { title: "Program Boards", content: "Portfolio-level program boards with cross-project visibility. Track progress across teams and initiatives." },
      { title: "Investment Tracking", content: "Track how resources are allocated across projects. Ensure your investment aligns with strategic priorities." },
    ],
  },
  "resource-planning": {
    sections: [
      { title: "Capacity Overview", content: "See who is working on what across all projects. Identify over-allocated team members and rebalance workloads." },
      { title: "Skill-Based Assignment", content: "Assign work based on skills and expertise. Ensure the right people are working on the right tasks." },
    ],
  },
  "cross-team-collab": {
    sections: [
      { title: "Shared Workspaces", content: "Create shared workspaces where multiple teams can collaborate. See dependencies and shared goals in one place." },
      { title: "Dependency Management", content: "Track and manage dependencies between teams. Get notified when a dependency changes or is at risk." },
    ],
  },
  "service-desk": {
    sections: [
      { title: "Ticketing System", content: "Full-featured ticketing system with SLAs, auto-assignment, and priority queues. Resolve requests faster." },
      { title: "Knowledge Base", content: "Built-in knowledge base so users can find answers without submitting a ticket. Reduce重复requests." },
    ],
  },
  "incident-management": {
    sections: [
      { title: "Incident Tracking", content: "Track incidents from detection to resolution. Severity levels, escalation policies, and status updates." },
      { title: "Post-Mortem Automation", content: "Automated post-incident reviews with timeline reconstruction, impact analysis, and action item generation." },
    ],
  },
  "asset-tracking": {
    sections: [
      { title: "Lifecycle Management", content: "Track hardware and software assets across their entire lifecycle — from procurement to retirement." },
      { title: "CMDB Integration", content: "Integrate with your existing CMDB tools. Keep your asset database in sync without manual data entry." },
    ],
  },
};

export default function ProductArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const category = getCategoryById(slug);
  const item = getItemBySlug(slug);

  if (!category && !item) {
    notFound();
  }

  const relatedItems = item ? getCategoryForSlug(item.slug)?.items.filter((i) => i.slug !== item.slug) : [];
  const allItems = productCategories.flatMap((c) => c.items);

  if (category) {
    return (
      <div>
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#D9DFF5_0%,_transparent_60%)]" />
          <div className="relative mx-auto max-w-7xl px-6">
            <Link
              href="/product/features"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#737686] transition-colors hover:text-[#004AC6]"
            >
              <ArrowLeft className="h-4 w-4" />
              All Products
            </Link>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#005DA7]" />
              {category.title}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl lg:text-5xl"
            >
              {category.heroTitle || category.title}
            </motion.h1>
            {category.heroSubtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 max-w-2xl text-base leading-relaxed text-[#434655] md:text-lg"
              >
                {category.heroSubtitle}
              </motion.p>
            )}
          </div>
        </section>

        <section className="border-y border-[#C3C6D7]/20 bg-white py-12">
          <div className="mx-auto max-w-7xl px-6">
            <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.12em] text-[#737686]">
              What&apos;s included
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {category.items.map((catItem, idx) => {
                const Icon = iconMap[catItem.slug] || Check;
                return (
                  <Link key={catItem.slug} href={`/product/${catItem.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.08 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-5 transition-all hover:border-[#004AC6]/30 hover:shadow-[0_4px_20px_rgba(0,74,198,0.08)]"
                    >
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#004A9E]/10 text-[#004A9E]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-semibold text-[#121C28]">{catItem.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#434655]">
                        {catItem.description}
                      </p>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {category.id === "features" && (
          <>
            <section className="bg-white py-16 md:py-20">
              <div className="mx-auto max-w-7xl px-6">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  variants={sectionVariants}
                  className="mb-12 text-center"
                >
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#005DA7]" />
                    How it works
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
                    From idea to production in four steps
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-[#434655]">
                    A workflow that fits naturally into how your team already thinks.
                  </p>
                </motion.div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    { step: "01", title: "Create your workspace", desc: "Set up a dedicated space for your team, configure issue types, and invite members in seconds." },
                    { step: "02", title: "Build your backlog", desc: "Draft issues, prioritise with AI-weighted scoring, and organise into epics and sprints." },
                    { step: "03", title: "Plan a sprint", desc: "Drag issues into a sprint, let AI estimate effort, and assign work based on team capacity." },
                    { step: "04", title: "Track & ship", desc: "Move cards across boards, monitor progress with live reports, and ship with confidence." },
                  ].map((step, idx) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ delay: idx * 0.15 }}
                      className="relative"
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#004A9E]/10 text-lg font-bold text-[#004AC6]">
                        {step.step}
                      </div>
                      {idx < 3 && <div className="absolute left-6 top-12 hidden h-[calc(100%-3rem)] w-px bg-[#C3C6D7]/40 lg:block" />}
                      <h3 className="mb-2 text-xl font-semibold text-[#121C28]">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-[#434655]">{step.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-[#121C28] py-16 md:py-20">
              <div className="mx-auto max-w-7xl px-6 text-center">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  variants={sectionVariants}
                >
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/70">
                    <Sparkles className="h-3.5 w-3.5 text-[#60A5FA]" />
                    AI-powered from day one
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                    Ship faster with AI that understands your project
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-white/60">
                    Vireo&apos;s AI assistant doesn&apos;t just generate text — it learns your team&apos;s patterns, estimates complexity, and surfaces risks before they become blockers.
                  </p>
                </motion.div>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
                  className="mt-12 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3"
                >
                  {[
                    { title: "Smart estimation", desc: "AI assigns story points based on historical velocity and issue complexity, reducing planning overhead." },
                    { title: "Auto-prioritisation", desc: "Surface the highest-impact work first using weighted scoring across business value, effort, and dependencies." },
                    { title: "Risk detection", desc: "Get alerted when a sprint is at risk due to scope creep, unbalanced assignments, or blocked issues." },
                    { title: "Retro insights", desc: "After each sprint, receive an AI-generated retro summary with patterns, bottlenecks, and actionable recommendations." },
                    { title: "Standup summaries", desc: "AI compiles individual progress from issue updates into a team-wide standup report — no meetings required." },
                    { title: "Natural language search", desc: 'Ask "what issues are blocked in the current sprint?" and get an instant, contextual answer.' },
                  ].map((ai) => (
                    <motion.div
                      key={ai.title}
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                    >
                      <h3 className="mb-2 font-semibold text-white">{ai.title}</h3>
                      <p className="text-sm leading-relaxed text-white/60">{ai.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>

            <section className="border-y border-[#C3C6D7]/20 bg-white py-12">
              <div className="mx-auto max-w-7xl px-6">
                <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.12em] text-[#737686]">
                  Trusted by engineering teams at
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40 grayscale">
                  {["Linear", "Vercel", "Railway", "Supabase", "PlanetScale"].map((name) => (
                    <span key={name} className="text-sm font-bold text-[#121C28]">{name}</span>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-16 md:py-20">
              <div className="mx-auto max-w-7xl px-6">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {["GitHub", "GitLab", "Slack", "Discord", "Figma", "Sentry", "Datadog", "PagerDuty", "Okta", "OpenAI"].map((tool, idx) => (
                    <motion.div
                      key={tool}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-lg border border-[#C3C6D7]/20 bg-white px-5 py-3 text-sm font-semibold text-[#434655] shadow-sm"
                    >
                      {tool}
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mt-8 text-center"
                >
                  <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#004AC6] transition-colors hover:text-[#003da8]">
                    View all integrations
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </section>

            <section className="bg-white py-16 md:py-20">
              <div className="mx-auto max-w-7xl px-6">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  variants={sectionVariants}
                  className="mb-12 text-center"
                >
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#005DA7]" />
                    FAQ
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
                    Frequently asked questions
                  </h2>
                </motion.div>
                {[
                  { q: "How is Vireo different from Jira?", a: "Vireo combines the workflow rigor of Jira with modern real-time collaboration and built-in AI assistance — without the complexity of a decade-old codebase." },
                  { q: "Can I migrate from my current tool?", a: "Yes. We offer CSV/JSON import, a REST API for custom migrations, and dedicated support for team-size imports from Jira, Linear, and Trello." },
                  { q: "Is there a free plan?", a: "Yes. Our free tier includes unlimited members, 3 active projects, and core board/backlog features. Upgrade when you need advanced reports or AI capabilities." },
                  { q: "Do you offer on-premise deployment?", a: "Enterprise plans include self-hosted options with dedicated infrastructure, SSO, and SLA guarantees. Contact sales for details." },
                ].map((faq, idx) => (
                  <motion.div
                    key={faq.q}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="mx-auto max-w-3xl border-b border-[#C3C6D7]/20 py-5 last:border-0"
                  >
                    <details className="group">
                      <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-[#121C28]">
                        {faq.q}
                        <ChevronDown className="h-5 w-5 text-[#737686] transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-[#434655]">{faq.a}</p>
                    </details>
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        )}

        <CTASection />
      </div>
    );
  }

  const content = slug ? articleContent[slug] : undefined;

  return (
    <div>
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#D9DFF5_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6">
          <Link
            href={`/product/${item?.categoryId || ""}`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#737686] transition-colors hover:text-[#004AC6]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {item ? getCategoryById(item.categoryId)?.title : "Products"}
          </Link>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm"
          >
            {item && (() => {
              const Icon = iconMap[item.slug] || Check;
              return <Icon className="h-3.5 w-3.5" />;
            })()}
            {item?.title}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl lg:text-5xl"
          >
            {item?.title}
          </motion.h1>

          {item?.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-lg leading-relaxed text-[#434655]"
            >
              {item.description}
            </motion.p>
          )}
        </div>
      </section>

      {content?.sections && (
        <section className="border-y border-[#C3C6D7]/20 bg-white py-12 md:py-16">
          <div className="mx-auto max-w-4xl px-6">
            <div className="space-y-10">
              {content.sections.map((section, idx) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <h2 className="text-xl font-semibold text-[#121C28] md:text-2xl">
                    {section.title}
                  </h2>
                  <p className="mt-3 leading-relaxed text-[#434655]">{section.content}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {content?.benefits && (
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="mb-8 text-center text-xl font-semibold text-[#121C28] md:text-2xl">
              Key Benefits
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {content.benefits.map((benefit, idx) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-start gap-3 rounded-xl border border-[#C3C6D7]/20 bg-white p-4"
                >
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
                  <span className="text-sm text-[#434655]">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedItems && relatedItems.length > 0 && (
        <section className="bg-white py-12 md:py-16">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="mb-8 text-xl font-semibold text-[#121C28] md:text-2xl">
              Explore more in {getCategoryById(item?.categoryId || "")?.title}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedItems.map((related, idx) => {
                const Icon = iconMap[related.slug] || Check;
                return (
                  <Link key={related.slug} href={`/product/${related.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ delay: idx * 0.08 }}
                      whileHover={{ y: -4 }}
                      className="flex items-start gap-3 rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-5 transition-all hover:border-[#004AC6]/30 hover:shadow-[0_4px_20px_rgba(0,74,198,0.08)]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#004A9E]/10 text-[#004A9E]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#121C28]">{related.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-[#434655]">{related.description}</p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </div>
  );
}

function CTASection() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#004AC6] to-[#002e7c] px-8 py-14 text-center md:px-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Ready to move faster?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              Join 2,500+ engineering teams already using Vireo to plan, track, and ship better software.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-white px-8 py-3.5 text-base font-bold text-[#004AC6] transition-all hover:bg-white/90"
              >
                Start free trial
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-white/20 px-8 py-3.5 text-base font-bold text-white/90 transition-colors hover:bg-white/10"
              >
                Talk to sales
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/50">
              No credit card required. Free tier includes unlimited members.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
