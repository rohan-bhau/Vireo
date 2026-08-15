"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  IterationCcw,
  Columns,
  Bug,
  Briefcase,
  ArrowRight,
} from "lucide-react";

const templates = [
  {
    title: "Scrum",
    description: "Sprint-based development with backlog, boards, and velocity tracking.",
    icon: IterationCcw,
    color: "bg-[#E8F0FE] text-[#004AC6]",
    badge: "Most popular",
  },
  {
    title: "Kanban",
    description: "Continuous flow with WIP limits, swimlanes, and cumulative flow diagrams.",
    icon: Columns,
    color: "bg-[#FEF3E8] text-[#D96C00]",
    badge: null,
  },
  {
    title: "Bug tracking",
    description: "Triage, prioritise, and resolve defects with automated severity routing.",
    icon: Bug,
    color: "bg-[#FEE8E8] text-[#DC2626]",
    badge: null,
  },
  {
    title: "Project management",
    description: "Track tasks, milestones, and deliverables across any non-software initiative.",
    icon: Briefcase,
    color: "bg-[#E8F8F0] text-[#10B981]",
    badge: null,
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function TemplateShowcaseSection() {
  return (
    <section className="bg-[#F8F9FF] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="mb-14 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#005DA7]" />
            Battle-tested workflows
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
            Start with a template
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#434655]">
            Pre-configured boards, workflows, and issue types for every
            methodology. Customise as you grow.
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {templates.map((template) => (
            <motion.div
              key={template.title}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group relative cursor-pointer rounded-2xl border border-[#C3C6D7]/20 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-1 hover:border-[#C3C6D7]/40 hover:shadow-[0_16px_40px_rgba(16,24,40,0.10)]"
            >
              {template.badge && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-[#004AC6] to-[#0B82EC] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_2px_8px_rgba(0,74,198,0.35)]">
                  {template.badge}
                </span>
              )}
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${template.color}`}
              >
                <template.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#121C28]">
                {template.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#434655]">
                {template.description}
              </p>
              <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-[#004AC6] opacity-0 transition-opacity group-hover:opacity-100">
                View template
                <ArrowRight className="h-3 w-3" />
              </div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#004AC6] transition-colors hover:text-[#003da8]"
          >
            See all templates
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
