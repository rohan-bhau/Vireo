"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, KeyRound, UserCheck, Database, FileCheck, Globe } from "lucide-react";
import { PageHero } from "@/components/sections/marketing/page-hero";
import { FaqSection } from "@/components/sections/marketing/faq-section";

const pillars = [
  {
    icon: FileCheck,
    title: "SOC 2 Type II",
    body: "Our infrastructure and controls are independently audited against the SOC 2 Type II trust services criteria on an annual basis.",
  },
  {
    icon: Lock,
    title: "Encryption everywhere",
    body: "All traffic is encrypted with TLS 1.2+ in transit, and data is encrypted at rest using AES-256. Backups are encrypted before leaving the data centre.",
  },
  {
    icon: KeyRound,
    title: "SSO & SCIM",
    body: "SAML and OIDC single sign-on with SCIM provisioning for Okta, Azure AD, and Google. Enforced 2FA is available for every plan.",
  },
  {
    icon: Eye,
    title: "Granular permissions",
    body: "Workspace, project, and issue-level permissions built on the principle of least privilege. Roles, groups, and custom permission schemes.",
  },
  {
    icon: UserCheck,
    title: "Identity & sessions",
    body: "Session policies include idle timeouts, IP allowlists, and device management for enterprise workspaces.",
  },
  {
    icon: Database,
    title: "Data residency",
    body: "Choose where your data lives — EU or US regions — with availability zones and a strict no-lock-in export path.",
  },
  {
    icon: Globe,
    title: "Audit log",
    body: "Every significant action is recorded with actor, timestamp, and before/after values, retained for 365 days on paid plans.",
  },
  {
    icon: Shield,
    title: "Vulnerability program",
    body: "Annual penetration tests, responsible-disclosure program with bug bounties, and a 72-hour disclosure policy to affected customers.",
  },
];

export default function SecurityPage() {
  return (
    <div>
      <PageHero
        eyebrow="Security"
        title="Security you can build on"
        subtitle="Vireo treats security as a product discipline. From encryption to audit, we design controls into every layer of the platform."
      />
      <section className="border-t border-[#C3C6D7]/20 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: idx * 0.06 }}
                  className="rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-6"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#059669]/10 text-[#059669]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-[#121C28]">{pillar.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#434655]">{pillar.body}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto mt-16 max-w-3xl rounded-2xl border border-[#C3C6D7]/20 bg-white p-8 text-center"
          >
            <h2 className="text-2xl font-semibold tracking-tight text-[#121C28]">
              Need a security review document?
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-[#434655]">
              Our security team maintains runbooks, sub-processor lists, and answers for vendor due-diligence questionnaires.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {["SOC 2 report", "DPA", "Trust centre", "Sub-processors"].map((item) => (
                <span key={item} className="rounded-full border border-[#C3C6D7]/25 bg-[#F8F9FF] px-4 py-2 text-sm font-semibold text-[#434655]">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-6 text-xs text-[#8A8FA3]">
              Reach out at <span className="font-semibold text-[#004AC6]">security@vireo.app</span> for anything else.
            </p>
          </motion.div>
        </div>
      </section>

      <FaqSection
        faqs={[
          { q: "Where is Vireo hosted and where does my data live?", a: "Vireo runs on AWS and Google Cloud. On Business and Enterprise plans you choose EU or US data residency, with encrypted backups stored across multiple availability zones." },
          { q: "Do you support SSO and SCIM provisioning?", a: "Yes. SAML and OIDC single sign-on with SCIM provisioning is available for Okta, Azure AD, and Google Workspace, plus enforced 2FA on every plan." },
          { q: "How do you handle security vulnerabilities?", a: "We run annual penetration tests and maintain a responsible-disclosure bug bounty program. Critical issues are patched within 72 hours of confirmation." },
          { q: "Can we get a SOC 2 report and DPA?", a: "Yes — the SOC 2 Type II report, DPA, and sub-processor list are available under NDA. Reach out at security@vireo.app for the review package." },
          { q: "Can Vireo be self-hosted for air-gapped environments?", a: "Enterprise self-hosted deployment on your own infrastructure — AWS, GCP, Azure, or on-premises — is available with dedicated hosting and SLA support." },
        ]}
        eyebrow="Security FAQ"
        title="Questions about our security posture"
      />
    </div>
  );
}