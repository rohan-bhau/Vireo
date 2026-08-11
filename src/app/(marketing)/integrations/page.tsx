"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, GitBranch, MessageSquare, Palette, Shield, Bug, LineChart, Sparkles } from "lucide-react";
import { PageHero } from "@/components/sections/marketing/page-hero";

interface Integration {
  name: string;
  color: string;
  icon: typeof GitBranch;
  category: string;
  description: string;
  connected: boolean;
}

const integrations: Integration[] = [
  { name: "GitHub", color: "#24292F", icon: GitBranch, category: "Source control", description: "Link branches, commits, and pull requests to issues.", connected: true },
  { name: "GitLab", color: "#FC6D26", icon: GitBranch, category: "Source control", description: "Merge request status and pipeline events on tasks.", connected: true },
  { name: "Bitbucket", color: "#0052CC", icon: GitBranch, category: "Source control", description: "PR checks and branch creation straight from issues.", connected: false },
  { name: "Slack", color: "#4A154B", icon: MessageSquare, category: "Notifications", description: "Push issue updates to channels and direct messages.", connected: true },
  { name: "Discord", color: "#5865F2", icon: MessageSquare, category: "Notifications", description: "Real-time issue and sprint events in your server.", connected: false },
  { name: "Figma", color: "#A259FF", icon: Palette, category: "Design", description: "Attach files and frames directly to issues.", connected: true },
  { name: "Sentry", color: "#362D59", icon: Bug, category: "Monitoring", description: "Auto-create issues from production errors.", connected: false },
  { name: "Datadog", color: "#632CA6", icon: LineChart, category: "Monitoring", description: "Correlate incidents with deployments and boards.", connected: false },
  { name: "PagerDuty", color: "#06AC38", icon: Zap, category: "Ops & on-call", description: "Escalate high-severity issues to your on-call team.", connected: true },
  { name: "Okta", color: "#007DC1", icon: Shield, category: "Identity", description: "SSO and SCIM provisioning for enterprise.", connected: true },
  { name: "Azure AD", color: "#0078D4", icon: Shield, category: "Identity", description: "Enterprise SSO with SAML and automated provisioning.", connected: false },
  { name: "OpenAI", color: "#10A37F", icon: Sparkles, category: "AI", description: "Powers the assistant's estimation and summaries.", connected: true },
];

const categories = [
  { title: "Source control", note: "Branch, commit, and PR context on every issue.", count: 3 },
  { title: "Notifications", note: "Slack and Discord delivery for live updates.", count: 2 },
  { title: "Design", note: "Figma attachments keep specs next to the work.", count: 1 },
  { title: "Monitoring & ops", note: "Sentry, Datadog, and PagerDuty event sync.", count: 3 },
  { title: "Identity", note: "SSO and SCIM for secure access.", count: 2 },
  { title: "AI", note: "Assistant tooling for automation and insights.", count: 1 },
];

export default function IntegrationsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Integrations"
        title="Connect Vireo to your stack"
        subtitle="Work where you work best. Vireo plugs into source control, chat, design, monitoring, and identity tools — 100+ and counting."
      >
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <span key={cat.title} className="rounded-full border border-[#C3C6D7]/30 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#434655] shadow-sm">
              {cat.title}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="border-t border-[#C3C6D7]/20 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration, idx) => {
              const Icon = integration.icon;
              return (
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-5 transition-all hover:border-[#004AC6]/30 hover:shadow-[0_4px_20px_rgba(0,74,198,0.08)]"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ backgroundColor: integration.color }}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#121C28]">{integration.name}</p>
                      <p className="text-xs text-[#737686]">{integration.category}</p>
                    </div>
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        integration.connected ? "bg-[#10B981]/10 text-[#059669]" : "bg-[#F4F6FB] text-[#8A8FA3]"
                      }`}
                    >
                      {integration.connected ? "Connected" : "Available"}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#434655]">{integration.description}</p>
                  <button className="mt-4 flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-[#004AC6] opacity-0 transition-opacity group-hover:opacity-100">
                    Configure
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-14 rounded-2xl bg-gradient-to-br from-[#004AC6] to-[#002e7c] px-8 py-12 text-center"
          >
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Looking for a custom integration?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/70">
              Every public Vireo endpoint is available through the REST API and webhooks. Build exactly what your team needs.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Link href="/docs#api" className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-[#004AC6] transition-all hover:bg-white/90">
                API documentation
              </Link>
              <Link href="/contact" className="rounded-lg border border-white/20 px-6 py-3 text-sm font-bold text-white/90 transition-colors hover:bg-white/10">
                Talk to us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}