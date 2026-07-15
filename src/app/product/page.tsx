"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Bug,
  Columns,
  IterationCcw,
  Route,
  BarChart3,
  MessageSquareMore,
  Sparkles,
  RefreshCw,
  Shield,
  ArrowRight,
  Check,
  ChevronDown,
  Users,
  GitBranch,
  Workflow,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/sections/header";
import { FooterSection } from "@/components/sections/footer-section";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const capabilities = [
  {
    title: "Issue & Bug Tracking",
    description:
      "Custom issue types, rich text fields, dependencies, and linked repositories. Keep every detail in one place.",
    icon: Bug,
  },
  {
    title: "Kanban Boards",
    description:
      "Drag-and-drop workflow management with WIP limits, swimlanes, and automation rules for your team's unique process.",
    icon: Columns,
  },
  {
    title: "Scrum Sprints",
    description:
      "Plan sprints with velocity tracking, capacity management, and AI-powered story point estimation.",
    icon: IterationCcw,
  },
  {
    title: "Roadmaps",
    description:
      "Align teams around a shared timeline. Track epics, milestones, and cross-team dependencies at a glance.",
    icon: Route,
  },
  {
    title: "Reports & Analytics",
    description:
      "DORA metrics, burndown charts, cycle time analysis, and custom dashboards for data-driven decisions.",
    icon: BarChart3,
  },
  {
    title: "Team Collaboration",
    description:
      "Threaded issue discussions, real-time mentions, and integrated team chat so context never gets lost.",
    icon: MessageSquareMore,
  },
  {
    title: "AI Assistant",
    description:
      "Generate acceptance criteria, summarise threads, and estimate effort — all from natural language prompts.",
    icon: Sparkles,
  },
  {
    title: "Real-Time Sync",
    description:
      "Multi-user collaboration with instant updates. No page refreshes, no stale data, no friction.",
    icon: RefreshCw,
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Create your workspace",
    description:
      "Set up a dedicated space for your team, configure issue types, and invite members in seconds.",
  },
  {
    step: "02",
    title: "Build your backlog",
    description:
      "Draft issues, prioritise with AI-weighted scoring, and organise into epics and sprints.",
  },
  {
    step: "03",
    title: "Plan a sprint",
    description:
      "Drag issues into a sprint, let AI estimate effort, and assign work based on team capacity.",
  },
  {
    step: "04",
    title: "Track & ship",
    description:
      "Move cards across boards, monitor progress with live reports, and ship with confidence.",
  },
];

const useCases = [
  {
    title: "For Engineering Teams",
    items: [
      "GitHub / GitLab integration with branch linking",
      "CI/CD pipeline status on every issue",
      "Code review checklists and quality gates",
      "Automated sprint retrospection",
    ],
    icon: GitBranch,
  },
  {
    title: "For Product Managers",
    items: [
      "Cross-team roadmap views",
      "AI-powered backlog prioritisation",
      "Stakeholder-friendly report exports",
      "Custom workflow automation rules",
    ],
    icon: Workflow,
  },
  {
    title: "For Leadership",
    items: [
      "DORA metrics and delivery insights",
      "Resource allocation and capacity planning",
      "Portfolio-level program boards",
      "Security and compliance audit trails",
    ],
    icon: Shield,
  },
];

const faqs = [
  {
    q: "How is Vireo different from Jira?",
    a: "Vireo combines the workflow rigor of Jira with modern real-time collaboration and built-in AI assistance — without the complexity of a decade-old codebase.",
  },
  {
    q: "Can I migrate from my current tool?",
    a: "Yes. We offer CSV/JSON import, a REST API for custom migrations, and dedicated support for team-size imports from Jira, Linear, and Trello.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. Our free tier includes unlimited members, 3 active projects, and core board/backlog features. Upgrade when you need advanced reports or AI capabilities.",
  },
  {
    q: "Do you offer on-premise deployment?",
    a: "Enterprise plans include self-hosted options with dedicated infrastructure, SSO, and SLA guarantees. Contact sales for details.",
  },
];

export default function ProductPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FF]">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#D9DFF5_0%,_transparent_60%)]" />
          <div className="relative mx-auto max-w-7xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm text-[#5C6274]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              Built for modern software teams
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-[#121C28] md:text-5xl lg:text-6xl"
            >
              Project management that works the way{" "}
              <span className="text-[#004AC6]">your team does</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#434655] md:text-lg"
            >
              From backlog grooming to sprint retrospectives — Vireo gives your
              team the structure of enterprise tools with the speed and AI
              intelligence of modern software.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex items-center justify-center gap-4"
            >
              <Link
                href="/register"
                className="rounded-lg bg-[#004AC6] px-8 py-3.5 text-base font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] transition-all hover:bg-[#003da8]"
              >
                Start free trial
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-[#C3C6D7] px-8 py-3.5 text-base font-bold text-[#121C28] transition-colors hover:bg-[#F8F9FF]"
              >
                View demo
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 flex items-center justify-center gap-8 text-xs font-medium text-[#414752]"
            >
              <span className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-[#10B981]" />
                SOC 2 compliant
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-[#10B981]" />
                2,500+ teams
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#10B981]" />
                99.9% uptime
              </span>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-[#C3C6D7]/20 bg-white py-12">
          <div className="mx-auto max-w-7xl px-6">
            <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.12em] text-[#737686]">
              Trusted by engineering teams at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40 grayscale">
              {["Linear", "Vercel", "Railway", "Supabase", "PlanetScale"].map(
                (name) => (
                  <span
                    key={name}
                    className="text-sm font-bold text-[#121C28]"
                  >
                    {name}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              className="mb-16 text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#005DA7]" />
                Everything you need
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
                One platform for the full development lifecycle
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[#434655]">
                No more juggling between tools. Vireo brings planning,
                tracking, and shipping into a single, AI-augmented workspace.
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-80px" }}
              variants={containerVariants}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <motion.div
                    key={cap.title}
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="rounded-xl border border-[#C3C6D7]/20 bg-white p-6 transition-all hover:border-[#004AC6]/30 hover:shadow-[0_4px_20px_rgba(0,74,198,0.08)]"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#004A9E]/10 text-[#004A9E]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#121C28]">
                      {cap.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#434655]">
                      {cap.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              className="mb-16 text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#005DA7]" />
                How it works
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
                From idea to production in four steps
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[#434655]">
                A workflow that fits naturally into how your team already
                thinks.
              </p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {workflowSteps.map((step, idx) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-80px" }}
                  transition={{ delay: idx * 0.15 }}
                  className="relative"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#004A9E]/10 text-lg font-bold text-[#004AC6]">
                    {step.step}
                  </div>
                  {idx < workflowSteps.length - 1 && (
                    <div className="absolute left-6 top-12 hidden h-[calc(100%-3rem)] w-px bg-[#C3C6D7]/40 lg:block" />
                  )}
                  <h3 className="mb-2 text-xl font-semibold text-[#121C28]">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#434655]">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              className="mb-16 text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#005DA7]" />
                Built for every role
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
                One tool. Every perspective.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[#434655]">
                Whether you write code, manage priorities, or lead the
                organisation — Vireo adapts to you.
              </p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-3">
              {useCases.map((useCase, idx) => {
                const Icon = useCase.icon;
                return (
                  <motion.div
                    key={useCase.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-80px" }}
                    transition={{ delay: idx * 0.15 }}
                    className="rounded-xl border border-[#C3C6D7]/20 bg-white p-8"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#004A9E]/10 text-[#004A9E]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-4 text-xl font-semibold text-[#121C28]">
                      {useCase.title}
                    </h3>
                    <ul className="space-y-3">
                      {useCase.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-sm text-[#434655]"
                        >
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#10B981]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#121C28] py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/70">
                <Sparkles className="h-3.5 w-3.5 text-[#60A5FA]" />
                AI-powered from day one
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Ship faster with AI that understands your project
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/60">
                Vireo&apos;s AI assistant doesn&apos;t just generate text — it
                learns your team&apos;s patterns, estimates complexity, and
                surfaces risks before they become blockers.
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-80px" }}
              variants={containerVariants}
              className="mt-12 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3"
            >
              {[
                {
                  title: "Smart estimation",
                  desc: "AI assigns story points based on historical velocity and issue complexity, reducing planning overhead.",
                },
                {
                  title: "Auto-prioritisation",
                  desc: "Surface the highest-impact work first using weighted scoring across business value, effort, and dependencies.",
                },
                {
                  title: "Risk detection",
                  desc: "Get alerted when a sprint is at risk due to scope creep, unbalanced assignments, or blocked issues.",
                },
                {
                  title: "Retro insights",
                  desc: "After each sprint, receive an AI-generated retro summary with patterns, bottlenecks, and actionable recommendations.",
                },
                {
                  title: "Standup summaries",
                  desc: "AI compiles individual progress from issue updates into a team-wide standup report — no meetings required.",
                },
                {
                  title: "Natural language search",
                  desc: 'Ask "what issues are blocked in the current sprint?" and get an instant, contextual answer.',
                },
              ].map((ai, idx) => (
                <motion.div
                  key={ai.title}
                  variants={itemVariants}
                  className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <h3 className="mb-2 font-semibold text-white">
                    {ai.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/60">
                    {ai.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              className="mb-16 text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#005DA7]" />
                Integrations
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
                Works with your existing stack
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[#434655]">
                Connect Vireo to the tools your team already uses, so you don&apos;t
                have to change your workflow.
              </p>
            </motion.div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                "GitHub",
                "GitLab",
                "Slack",
                "Discord",
                "Figma",
                "Sentry",
                "Datadog",
                "PagerDuty",
                "Okta",
                "OpenAI",
              ].map((tool, idx) => (
                <motion.div
                  key={tool}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false }}
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
              viewport={{ once: false }}
              className="mt-8 text-center"
            >
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#004AC6] transition-colors hover:text-[#003da8]"
              >
                View all integrations
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              className="mb-16 text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#005DA7]" />
                FAQ
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
                Frequently asked questions
              </h2>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-80px" }}
              variants={containerVariants}
              className="mx-auto max-w-3xl"
            >
              {faqs.map((faq, idx) => (
                <motion.div
                  key={faq.q}
                  variants={itemVariants}
                  className="border-b border-[#C3C6D7]/20 last:border-0"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between py-5 text-left"
                  >
                    <span className="text-base font-semibold text-[#121C28]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-[#737686] transition-transform ${
                        openFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pb-5"
                    >
                      <p className="text-sm leading-relaxed text-[#434655]">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#004AC6] to-[#002e7c] px-8 py-16 text-center md:px-16"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
              <div className="relative">
                <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Ready to move faster?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-white/70">
                  Join 2,500+ engineering teams already using Vireo to plan,
                  track, and ship better software.
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
      </main>
      <FooterSection />
    </div>
  );
}
