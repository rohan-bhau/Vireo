"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Shield, Users, Sparkles, Bug, Columns, IterationCcw, Route, BarChart3, MessageSquareMore, RefreshCw, GitBranch, Workflow, Lock, ChevronDown, Code, Building2, Server, LineChart, Rocket, GraduationCap } from "lucide-react";
import { solutionCategories, getSolutionCategoryById, getSolutionItemBySlug, getSolutionCategoryForSlug } from "@/lib/solutions-data";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const iconMap: Record<string, typeof Code> = {
  "agile-development": IterationCcw,
  "code-quality-review": Code,
  "cicd-pipeline": RefreshCw,
  "developer-experience": GitBranch,
  "product-planning": Route,
  "stakeholder-communication": BarChart3,
  "cross-team-alignment": Workflow,
  "it-service-desk": MessageSquareMore,
  "incident-response": Bug,
  "asset-management": Columns,
  "portfolio-oversight": Workflow,
  "resource-optimisation": Users,
  "executive-reporting": BarChart3,
  "fast-onboarding": Rocket,
  "lean-workflows": IterationCcw,
  "growth-analytics": LineChart,
};

const articleContent: Record<string, { sections: { title: string; content: string }[]; benefits?: string[]; cta?: string }> = {
  "agile-development": {
    sections: [
      { title: "Scrum & Sprint Planning", content: "Plan sprints with confidence using velocity tracking from previous sprints. Let AI estimate story points based on task complexity and historical data." },
      { title: "Kanban Workflows", content: "Visualise your workflow with drag-and-drop Kanban boards. Set WIP limits, create swimlanes, and automate repetitive board management tasks." },
      { title: "Hybrid Methodologies", content: "Mix Scrum and Kanban to create a workflow that fits your team. Use sprints for planned work and Kanban for incoming requests." },
      { title: "Retrospectives & Improvement", content: "After each sprint, receive an AI-generated retro summary with patterns, bottlenecks, and actionable recommendations for improvement." },
    ],
    benefits: ["Data-driven sprint planning and estimation", "Flexible workflows that adapt to your team", "AI assistance that learns from your team's history", "Continuous improvement built into your process"],
    cta: "Start shipping better software today — free.",
  },
  "code-quality-review": {
    sections: [
      { title: "Review Checklists", content: "Create custom code review checklists that must be completed before merging. Ensure every PR meets your team's standards." },
      { title: "Quality Gates", content: "Define automated quality gates that block merging until code review is complete and all checks pass." },
      { title: "Integration with GitHub & GitLab", content: "See branch, commit, and PR status directly on tasks. Automatically transition tasks when PRs are merged." },
    ],
    benefits: ["Consistent code quality across your team", "Automated enforcement of review standards", "Deep integration with your existing git workflow"],
  },
  "cicd-pipeline": {
    sections: [
      { title: "Pipeline Visibility", content: "View CI/CD pipeline status directly on your tasks and boards. See build and deploy status at a glance without switching tools." },
      { title: "Deployment Tracking", content: "Track deployments across environments. Know which version of your code is in production at all times." },
      { title: "Quality Gates", content: "Set quality gates that prevent tasks from moving forward when builds fail or tests don't pass. Automate your release criteria." },
    ],
    benefits: ["End-to-end pipeline visibility from your project board", "Automated quality gates that enforce release criteria", "Deployment history and environment tracking"],
  },
  "developer-experience": {
    sections: [
      { title: "Git Integration", content: "Create branches directly from tasks. Vireo automatically links branches, commits, and pull requests to the right tasks." },
      { title: "Real-Time Sync", content: "Multiple team members can work in the same project simultaneously. Changes sync instantly across all connected clients." },
      { title: "API & Extensibility", content: "Extend Vireo with REST and GraphQL APIs, webhooks, and custom automations. Connect to your existing toolchain." },
    ],
    benefits: ["Deep git integration that keeps context in your workflow", "Real-time collaboration without page refreshes", "Extensible platform that fits your toolchain"],
  },
  "product-planning": {
    sections: [
      { title: "Roadmap Planning", content: "Build cross-team roadmaps with epics, milestones, and dependency tracking. Communicate strategy clearly to stakeholders." },
      { title: "Backlog Prioritisation", content: "Prioritise your backlog using AI-weighted scoring across business value, effort, risk, and dependencies." },
      { title: "Sprint Management", content: "Plan sprints with velocity tracking, capacity management, and automated sprint retrospection." },
    ],
    benefits: ["AI-powered backlog prioritisation", "Clear roadmap visibility for all stakeholders", "Data-driven sprint planning"],
  },
  "stakeholder-communication": {
    sections: [
      { title: "Executive Summaries", content: "Generate stakeholder-friendly reports with burndown charts, cycle time analysis, and delivery insights." },
      { title: "Scheduled Reports", content: "Automatically generate and distribute reports on a schedule. Keep stakeholders informed without manual effort." },
      { title: "Real-Time Dashboards", content: "Build custom dashboards with the metrics that matter to your team. Share them with stakeholders in a single click." },
    ],
    benefits: ["Automated stakeholder reporting", "Custom dashboards for every audience", "Real-time visibility into team performance"],
  },
  "cross-team-alignment": {
    sections: [
      { title: "Shared Workspaces", content: "Create shared workspaces where multiple teams can collaborate. See dependencies and shared goals in one place." },
      { title: "Dependency Management", content: "Track and manage dependencies between teams. Get notified when a dependency changes or is at risk." },
      { title: "Portfolio Visibility", content: "Portfolio-level program boards with cross-project visibility. Track progress across teams and initiatives." },
    ],
    benefits: ["Break down silos between teams", "Real-time dependency tracking and alerts", "Portfolio-level visibility for leadership"],
  },
  "it-service-desk": {
    sections: [
      { title: "Ticketing System", content: "Full-featured ticketing system with SLAs, auto-assignment, and priority queues. Resolve requests faster." },
      { title: "Knowledge Base", content: "Built-in knowledge base so users can find answers without submitting a ticket. Reduce repeat requests." },
      { title: "SLA Management", content: "Define and track SLAs for different request types. Get alerted when tickets are approaching their SLA deadline." },
    ],
    benefits: ["Faster ticket resolution with auto-assignment", "Reduced ticket volume through self-service knowledge base", "SLA tracking and compliance reporting"],
  },
  "incident-response": {
    sections: [
      { title: "Incident Tracking", content: "Track incidents from detection to resolution. Severity levels, escalation policies, and status updates keep everyone informed." },
      { title: "Post-Mortem Automation", content: "Automated post-incident reviews with timeline reconstruction, impact analysis, and action item generation." },
      { title: "On-Call Management", content: "Integrate with PagerDuty and Opsgenie. Automatically escalate incidents based on severity and response time." },
    ],
    benefits: ["Structured incident response from detection to resolution", "Automated post-mortems with actionable insights", "Integration with on-call and alerting tools"],
  },
  "asset-management": {
    sections: [
      { title: "Lifecycle Management", content: "Track hardware and software assets across their entire lifecycle — from procurement to retirement." },
      { title: "CMDB Integration", content: "Integrate with your existing CMDB tools. Keep your asset database in sync without manual data entry." },
      { title: "Procurement Tracking", content: "Manage procurement requests, approvals, and vendor relationships directly within Vireo." },
    ],
  },
  "portfolio-oversight": {
    sections: [
      { title: "Program Boards", content: "Portfolio-level program boards with cross-project visibility. Track progress across teams and initiatives." },
      { title: "Investment Tracking", content: "Track how resources are allocated across projects. Ensure your investment aligns with strategic priorities." },
      { title: "Risk Management", content: "Identify and track risks across your portfolio. Get early warnings when projects are at risk of missing goals." },
    ],
    benefits: ["Cross-project visibility at the portfolio level", "Resource allocation aligned with strategy", "Early risk detection across your entire portfolio"],
  },
  "resource-optimisation": {
    sections: [
      { title: "Capacity Overview", content: "See who is working on what across all projects. Identify over-allocated team members and rebalance workloads." },
      { title: "Skill-Based Assignment", content: "Assign work based on skills and expertise. Ensure the right people are working on the right tasks." },
      { title: "Forecasting", content: "Predict future resource needs based on upcoming work. Plan hiring and reallocation before bottlenecks form." },
    ],
  },
  "executive-reporting": {
    sections: [
      { title: "Executive Dashboards", content: "High-level dashboards that give executives a real-time view of delivery progress, team health, and portfolio status." },
      { title: "Automated Reports", content: "Schedule automated report generation and distribution. Keep leadership informed without manual effort." },
      { title: "OKR Tracking", content: "Connect project work to company objectives. Track progress toward key results directly from your project data." },
    ],
  },
  "fast-onboarding": {
    sections: [
      { title: "Pre-Built Templates", content: "Get started in minutes with pre-built templates for common workflows — Scrum, Kanban, bug tracking, and more." },
      { title: "Instant Invites", content: "Invite team members with a single link. No complex setup or configuration required." },
      { title: "Guided Setup", content: "Step-by-step onboarding wizard that helps you configure your workspace, task types, and workflow in minutes." },
    ],
    benefits: ["Go from signup to shipping in under 10 minutes", "Pre-built templates for common workflows", "Zero-configuration team invites"],
  },
  "lean-workflows": {
    sections: [
      { title: "Simple Kanban", content: "Start with a simple Kanban board. Add columns, customise workflows, and invite your team in minutes." },
      { title: "Lightweight Task Tracking", content: "Track bugs, tasks, and ideas without complex configuration. Add custom fields as your needs grow." },
      { title: "Scales With You", content: "Start simple and add complexity as your team grows. Enable sprints, roadmaps, and analytics when you need them." },
    ],
  },
  "growth-analytics": {
    sections: [
      { title: "Velocity Trends", content: "Track how your team's velocity changes over time. Understand your true delivery capacity as you scale." },
      { title: "Cycle Time Analysis", content: "Analyse how long work takes from start to finish. Identify stages where work gets stuck as your team grows." },
      { title: "Team Health Metrics", content: "Monitor team health with metrics like burnout risk, workload balance, and delivery consistency." },
    ],
  },
};

export default function SolutionsArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const category = getSolutionCategoryById(slug);
  const item = getSolutionItemBySlug(slug);

  if (!category && !item) {
    notFound();
  }

  const relatedItems = item ? getSolutionCategoryForSlug(item.slug)?.items.filter((i) => i.slug !== item.slug) : [];
  const allItems = solutionCategories.flatMap((c) => c.items);

  if (category) {
    return (
      <div>
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#D9DFF5_0%,_transparent_60%)]" />
          <div className="relative mx-auto max-w-7xl px-6">
            <Link
              href="/solutions"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#737686] transition-colors hover:text-[#004AC6]"
            >
              <ArrowLeft className="h-4 w-4" />
              All Solutions
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
                  <Link key={catItem.slug} href={`/solutions/${catItem.slug}`}>
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
                Why Vireo
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
                Purpose-built for {category.title.toLowerCase()}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[#434655]">
                Every feature in Vireo is designed to help {category.title.toLowerCase()} achieve more with less friction.
              </p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "AI-Powered Automation", desc: "Let AI handle estimation, prioritisation, and reporting so your team can focus on what matters." },
                { title: "Real-Time Collaboration", desc: "Work together in real time with instant sync, threaded discussions, and live updates across your team." },
                { title: "Enterprise Security", desc: "SOC 2 compliant with end-to-end encryption, SSO, and granular access controls." },
                { title: "Deep Integrations", desc: "Connect with GitHub, GitLab, Slack, Figma, and 100+ other tools your team already uses." },
                { title: "Custom Workflows", desc: "Tailor Vireo to match your exact process with custom fields, workflows, and automation rules." },
                { title: "Actionable Analytics", desc: "DORA metrics, burndown charts, and custom dashboards that help you make data-driven decisions." },
              ].map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: idx * 0.08 }}
                  className="rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-6"
                >
                  <h3 className="mb-2 text-base font-semibold text-[#121C28]">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-[#434655]">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#C3C6D7]/20 bg-white py-12">
          <div className="mx-auto max-w-7xl px-6">
            <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.12em] text-[#737686]">
              Trusted by teams at
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
            href={`/solutions/${item?.categoryId || ""}`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#737686] transition-colors hover:text-[#004AC6]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {item ? getSolutionCategoryById(item.categoryId)?.title : "Solutions"}
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
              Explore more in {getSolutionCategoryById(item?.categoryId || "")?.title}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedItems.map((related, idx) => {
                const Icon = iconMap[related.slug] || Check;
                return (
                  <Link key={related.slug} href={`/solutions/${related.slug}`}>
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
