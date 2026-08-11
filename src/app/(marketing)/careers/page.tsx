"use client";

import { motion } from "framer-motion";
import { Globe, Users, Lightbulb, MapPin, ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/sections/marketing/page-hero";

const roles = [
  {
    title: "Senior Product Engineer",
    team: "Engineering",
    location: "Remote · EU",
    type: "Full-time",
    color: "#004AC6",
  },
  {
    title: "Staff Full-Stack Engineer",
    team: "Engineering",
    location: "Amsterdam",
    type: "Full-time",
    color: "#004AC6",
  },
  {
    title: "Product Designer",
    team: "Design",
    location: "Remote · EU",
    type: "Full-time",
    color: "#7C3AED",
  },
  {
    title: "Customer Reliability Engineer",
    team: "Support",
    location: "Remote · Global",
    type: "Full-time",
    color: "#10B981",
  },
  {
    title: "Developer Advocate",
    team: "Marketing",
    location: "Remote · Global",
    type: "Full-time",
    color: "#D97706",
  },
];

const perks = [
  {
    icon: Globe,
    title: "Remote-first",
    body: "Work from anywhere in your timezone. Async by default, with a few well-placed windows for real-time collaboration.",
  },
  {
    icon: Users,
    title: "Small, senior teams",
    body: "We hire specialists and give them ownership. No managers-of-managers, no decision-by-committee.",
  },
  {
    icon: Lightbulb,
    title: "You ship your work",
    body: "From design review to release notes to the changelog — you'll see your features through, not throw them over a wall.",
  },
];

export default function CareersPage() {
  return (
    <div>
      <PageHero
        eyebrow="Careers"
        title="Build the work tools you wish existed"
        subtitle="We're a small, senior, fully-distributed team. If you care about craft, latency, and honestly-good products, come build with us."
      />
      <section className="border-t border-[#C3C6D7]/20 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 grid gap-5 md:grid-cols-3">
            {perks.map((perk, idx) => {
              const Icon = perk.icon;
              return (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: idx * 0.06 }}
                  className="rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-6"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#004A9E]/10 text-[#004A9E]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-[#121C28]">{perk.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#434655]">{perk.body}</p>
                </motion.div>
              );
            })}
          </div>

          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#121C28]">Open roles</h2>
          <div className="space-y-4">
            {roles.map((role, idx) => (
              <motion.button
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: idx * 0.05 }}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-5 text-left transition-all hover:border-[#004AC6]/30 hover:shadow-[0_4px_20px_rgba(0,74,198,0.08)]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: role.color }}>
                  <span className="text-xs font-bold">{role.team[0]}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-[#121C28] group-hover:text-[#004AC6]">{role.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#737686]">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {role.location}
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 font-medium">{role.type}</span>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-[#8A8FA3] transition-colors group-hover:text-[#004AC6]" />
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 rounded-2xl border border-dashed border-[#C3C6D7]/40 bg-[#F8F9FF] p-8 text-center"
          >
            <p className="text-lg font-semibold text-[#121C28]">Don&apos;t see your role?</p>
            <p className="mt-1 text-sm text-[#434655]">We&apos;re always interested in exceptional people. Tell us what you&apos;d build.</p>
            <button className="mt-5 cursor-pointer rounded-lg bg-[#004AC6] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#003da8]">
              Write to us
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}