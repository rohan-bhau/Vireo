"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, ShieldCheck, UserCheck, Globe, Server, Headset, ChartNoAxesColumn } from "lucide-react";
import { PageHero } from "@/components/sections/marketing/page-hero";
import { FaqSection } from "@/components/sections/marketing/faq-section";

const features = [
  {
    icon: ShieldCheck,
    title: "Advanced security",
    body: "SSO (SAML & OIDC), SCIM provisioning, enforced 2FA, session policies, and IP allowlists — all included.",
  },
  {
    icon: UserCheck,
    title: "Granular governance",
    body: "Custom permission schemes, approval workflows, and a full audit log with role and permission change tracking.",
  },
  {
    icon: Globe,
    title: "Data residency",
    body: "Host your workspace in the EU or US region of your choice, with availability zones and encrypted backups.",
  },
  {
    icon: Server,
    title: "Deployment options",
    body: "Choose Vireo Cloud or self-hosted on your own infrastructure with dedicated hosting and SLA guarantees.",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Executive reporting",
    body: "Portfolio dashboards, DORA metrics, custom reports, and scheduled delivery to stakeholders automatically.",
  },
  {
    icon: Headset,
    title: "Priority support",
    body: "Dedicated success manager, 99.9% uptime SLA, proactive monitoring, and direct lines to our engineers.",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "150+", label: "Enterprise customers" },
  { value: "24h", label: "Security response" },
  { value: "60+", label: "Countries served" },
];

export default function EnterprisePage() {
  return (
    <div>
      <PageHero
        eyebrow="Enterprise"
        title="Vireo at organisational scale"
        subtitle="Deployment, governance, security, and support designed for teams of hundreds — with the speed your developers actually want to use."
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[#C3C6D7]/25 bg-white px-5 py-3 shadow-sm">
              <p className="text-xl font-bold text-[#004AC6]">{stat.value}</p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#737686]">{stat.label}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="border-t border-[#C3C6D7]/20 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: idx * 0.06 }}
                  className="rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-6"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#004A9E]/10 text-[#004A9E]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-[#121C28]">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#434655]">{feature.body}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="mt-16 overflow-hidden rounded-2xl bg-gradient-to-br from-[#004AC6] to-[#002e7c] px-8 py-14 text-center"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
            <div className="relative">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Let&apos;s talk about your setup
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-white/70">
                Get a tailored walkthrough, a migration plan from your current tool, and a security review package.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Link href="/contact" className="rounded-lg bg-white px-8 py-3.5 text-base font-bold text-[#004AC6] transition-all hover:bg-white/90">
                  Contact sales
                </Link>
                <Link href="/pricing" className="rounded-lg border border-white/20 px-8 py-3.5 text-base font-bold text-white/90 transition-colors hover:bg-white/10">
                  Compare plans
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <FaqSection
        faqs={[
          { q: "What's the minimum team size for Enterprise?", a: "Enterprise is designed for organisations with 100+ users, but teams below that can still unlock SSO, audit logs, and self-hosting through a Business plan with an add-on." },
          { q: "Can we migrate from Jira, ServiceNow, or a custom system?", a: "Yes. We provide guided migration tooling, CSV/JSON import, and full REST API access. Our team will build a migration plan alongside yours to minimise downtime." },
          { q: "What deployment options are available?", a: "Vireo Cloud with your choice of EU or US residency, or self-hosted on your own AWS, GCP, Azure, or on-premises infrastructure with dedicated hosting and monitoring." },
          { q: "What does the 99.9% uptime SLA include?", a: "It covers availability of the Vireo cloud service, with credits if we miss the target, plus proactive monitoring and priority incident notification to your team." },
          { q: "Can we keep our data for compliance audits?", a: "Audit logs are retained for 365 days on paid plans, and full workspace exports are available at any time. Data deletion and retention policies can be configured from the admin console." },
        ]}
        eyebrow="Enterprise FAQ"
        title="Questions about going enterprise"
      />
    </div>
  );
}