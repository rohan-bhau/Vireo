"use client";

import { motion } from "framer-motion";
import { Sparkles, Rocket, Shield, Wrench } from "lucide-react";
import { PageHero } from "@/components/sections/marketing/page-hero";

const releases = [
  {
    version: "v2.5.0",
    date: "July 22, 2026",
    tag: "New",
    tagColor: "#004AC6",
    icon: Rocket,
    title: "Sprint capacity planner & retro summaries",
    items: [
      "Capacity planner shows availability across team members before you build a sprint.",
      "Automated AI retrospective summaries written when a sprint is completed.",
      "New story point presets (0.5, 2, 5, 8, 13) with velocity recalculation.",
      "Sprint health widget now live on the project home.",
    ],
  },
  {
    version: "v2.4.0",
    date: "June 20, 2026",
    tag: "AI",
    tagColor: "#7C3AED",
    icon: Sparkles,
    title: "AI prioritisation & assistant",
    items: [
      "AI priority scoring for backlog ranking — value, effort, risk, and dependencies.",
      "AI assistant drafts issue descriptions and summaries comments.",
      "Auto-suggested assignees based on workload and skill.",
      "Improve search relevance with understanding of issue synonyms.",
    ],
  },
  {
    version: "v2.3.1",
    date: "June 2, 2026",
    tag: "Fix",
    tagColor: "#D97706",
    icon: Wrench,
    title: "Stability & performance",
    items: [
      "Reduced initial board load time by 40% on large projects.",
      "Fixed drag-and-drop flicker in Safari on the backlog.",
      "Webhook delivery retries now use exponential backoff.",
      "Resolved duplicate notifications when multiple sessions were open.",
    ],
  },
  {
    version: "v2.3.0",
    date: "May 18, 2026",
    tag: "Security",
    tagColor: "#059669",
    icon: Shield,
    title: "Enterprise security pack",
    items: [
      "SCIM provisioning for Okta and Azure AD.",
      "Session policies: enforce 2FA, idle timeout, and IP allowlists.",
      "Audit log now records role and permission changes with before/after values.",
      "Data residency selection for EU and US regions.",
    ],
  },
  {
    version: "v2.2.0",
    date: "April 10, 2026",
    tag: "New",
    tagColor: "#004AC6",
    icon: Rocket,
    title: "Roadmap timeline view",
    items: [
      "Drag-and-drop scheduling on a new timeline view grouped by epic or version.",
      "Automatic dependency arrow rendering between issues.",
      "Read-only share links for stakeholders.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div>
      <PageHero
        eyebrow="Changelog"
        title="Product updates, shipped"
        subtitle="A running log of everything we ship. New features, improvements, and fixes — straight from the team."
      />
      <section className="border-t border-[#C3C6D7]/20 bg-white py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="relative space-y-10 border-l border-[#C3C6D7]/30 pl-8">
            {releases.map((release, idx) => {
              const Icon = release.icon;
              return (
                <motion.article
                  key={release.version}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative"
                >
                  <span
                    className="absolute -left-[2.45rem] top-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-[#F8F9FF]"
                    style={{ backgroundColor: release.tagColor }}
                  />
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8A8FA3]">{release.date}</span>
                    <span className="rounded-md px-2 py-0.5 text-[11px] font-bold text-white" style={{ backgroundColor: release.tagColor }}>
                      {release.tag}
                    </span>
                    <span className="font-mono text-sm font-semibold text-[#121C28]">{release.version}</span>
                  </div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-[#121C28] md:text-2xl">
                    <Icon className="h-5 w-5 text-[#004AC6]" />
                    {release.title}
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {release.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#434655]">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#004AC6]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}