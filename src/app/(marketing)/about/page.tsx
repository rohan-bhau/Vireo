"use client";

import { motion } from "framer-motion";
import { Compass, Users, HeartHandshake, Sparkles } from "lucide-react";
import { PageHero } from "@/components/sections/marketing/page-hero";

const values = [
  {
    icon: Compass,
    title: "Clarity over complexity",
    body: "Every feature we ship should make the next decision obvious. If it adds cognitive load, it doesn't ship.",
  },
  {
    icon: Users,
    title: "Teams > tooling",
    body: "Tools serve people, not the other way around. We design for the humans at the whiteboard, not the process diagram.",
  },
  {
    icon: HeartHandshake,
    title: "Default to trust",
    body: "We're transparent with customers and each other — honest roadmaps, honest estimates, and no dark patterns.",
  },
  {
    icon: Sparkles,
    title: "Ship the boring parts too",
    body: "Right-click menus, undo, keyboard shortcuts, sensible defaults. Craft is invisible, and it matters as much as the headline feature.",
  },
];

const stats = [
  { value: "2021", label: "Founded in Amsterdam" },
  { value: "60+", label: "People across 12 countries" },
  { value: "2,500+", label: "Engineering teams aboard" },
  { value: "38", label: "Open-source libraries we maintain" },
];

export default function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="About us"
        title="We build the work manager for modern teams"
        subtitle="Vireo was founded on a simple frustration: project tools that started as productivity enablers ended up as productivity taxes. We set out to fix that."
      />
      <section className="border-t border-[#C3C6D7]/20 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
                A tool for the way software is actually built
              </h2>
              <div className="mt-5 space-y-4 leading-relaxed text-[#434655]">
                <p>
                  We built Vireo because every project tracker our team tried spent more time configuring itself than tracking work.
                  Sprints that required a day of ceremony. Boards that fought us on every move.
                </p>
                <p>
                  So we rebuilt it from first principles: real-time, collaborative, and opinionated enough to get out of the way. Then we
                  added AI where it genuinely helps — estimation, prioritisation, and retrospectives — instead of where it&apos;s just a demo.
                </p>
                <p>
                  Today Vireo is used by over 2,500 engineering teams, from two-person startups to financial services companies with
                  thousands of seats. We&apos;re still small enough to care about every detail, and we intend to stay that way.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-[#004AC6]">{stat.value}</p>
                    <p className="mt-1 text-xs font-medium text-[#737686]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2">
              {values.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: idx * 0.06 }}
                    className="rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-6"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#004A9E]/10 text-[#004A9E]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-semibold text-[#121C28]">{value.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#434655]">{value.body}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}