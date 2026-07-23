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
    features: [
      { icon: ClipboardList, label: "Backlog management" },
      { icon: LayoutDashboard, label: "Sprint planning" },
      { icon: GitBranch, label: "Epic & story mapping" },
    ],
  },
  {
    title: "Track",
    description: "See work progress in real time with customizable boards and workflows.",
    features: [
      { icon: LayoutDashboard, label: "Kanban & Scrum boards" },
      { icon: RefreshCw, label: "Real-time sync" },
      { icon: BarChart3, label: "Velocity & burndown" },
    ],
  },
  {
    title: "Collaborate",
    description: "Keep everyone aligned with built-in communication and AI assistance.",
    features: [
      { icon: Users, label: "Team chat & comments" },
      { icon: MessagesSquare, label: "Threaded discussions" },
      { icon: Sparkles, label: "AI ticket generation" },
    ],
  },
  {
    title: "Report",
    description: "Make data-driven decisions with comprehensive analytics and dashboards.",
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
          viewport={{ once: false, margin: "-80px" }}
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
          viewport={{ once: false, margin: "-80px" }}
          variants={containerVariants}
          className="grid gap-6 lg:grid-cols-4"
        >
          {categories.map((category) => (
            <motion.div
              key={category.title}
              variants={itemVariants}
              className="rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-6 transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-[#121C28]">
                {category.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#434655]">
                {category.description}
              </p>
              <ul className="mt-5 space-y-2">
                {category.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5 text-sm text-[#434655]">
                    <f.icon className="h-4 w-4 text-[#004AC6]" />
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
