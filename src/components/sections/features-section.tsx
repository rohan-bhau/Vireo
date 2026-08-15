"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  LayoutDashboard,
  Users,
  BarChart3,
  Sparkles,
  RefreshCw,
  MessagesSquare,
  GitBranch,
} from "lucide-react";

const categories = [
  {
    title: "Plan",
    description: "Define scope, set priorities, and build roadmaps your team can follow.",
    icon: ClipboardList,
    tile: "from-[#004AC6] to-[#0B82EC]",
    features: [
      { icon: ClipboardList, label: "Backlog management" },
      { icon: LayoutDashboard, label: "Sprint planning" },
      { icon: GitBranch, label: "Epic & story mapping" },
    ],
  },
  {
    title: "Track",
    description: "See work progress in real time with customizable boards and workflows.",
    icon: LayoutDashboard,
    tile: "from-[#D96C00] to-[#F59E0B]",
    features: [
      { icon: LayoutDashboard, label: "Kanban & Scrum boards" },
      { icon: RefreshCw, label: "Real-time sync" },
      { icon: BarChart3, label: "Velocity & burndown" },
    ],
  },
  {
    title: "Collaborate",
    description: "Keep everyone aligned with built-in communication and AI assistance.",
    icon: Users,
    tile: "from-[#10B981] to-[#34D399]",
    features: [
      { icon: Users, label: "Team chat & comments" },
      { icon: MessagesSquare, label: "Threaded discussions" },
      { icon: Sparkles, label: "AI ticket generation" },
    ],
  },
  {
    title: "Report",
    description: "Make data-driven decisions with comprehensive analytics and dashboards.",
    icon: BarChart3,
    tile: "from-[#7C3AED] to-[#A78BFA]",
    features: [
      { icon: BarChart3, label: "Sprint reports" },
      { icon: ClipboardList, label: "DORA metrics" },
      { icon: LayoutDashboard, label: "Custom dashboards" },
    ],
  },
];

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

export function FeaturesSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#005DA7]" />
            Everything your team needs
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
            Plan, track, collaborate, and ship
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#434655]">
            From sprint planning to release notes — one platform replaces your
            entire toolchain without the complexity of traditional enterprise PM.
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
          className="grid gap-6 lg:grid-cols-4"
        >
          {categories.map((category) => (
            <motion.div
              key={category.title}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-[#C3C6D7]/20 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:border-[#C3C6D7]/40 hover:shadow-[0_12px_32px_rgba(16,24,40,0.08)]"
            >
              <div
                className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${category.tile} shadow-[0_4px_12px_rgba(0,74,198,0.18)] transition-transform duration-300 group-hover:scale-110`}
              >
                <category.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#121C28]">
                {category.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#434655]">
                {category.description}
              </p>
              <ul className="mt-5 space-y-2.5">
                {category.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5 text-sm text-[#434655]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#EEF4FF]">
                      <f.icon className="h-3 w-3 text-[#004AC6]" />
                    </span>
                    {f.label}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
