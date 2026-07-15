"use client";

import { motion } from "framer-motion";
import {
  Bug,
  Columns,
  IterationCcw,
  Route,
  RefreshCw,
  BarChart3,
  MessageSquareMore,
  Sparkles,
} from "lucide-react";

const features = [
  {
    title: "Issue tracking",
    description:
      "Rapid issue creation with custom fields, dependencies, and markdown support.",
    icon: Bug,
  },
  {
    title: "Kanban",
    description:
      "Visualise your flow. Fully customizable swimlanes and automation triggers.",
    icon: Columns,
  },
  {
    title: "Scrum sprints",
    description:
      "Iterative planning with velocity tracking and capacity management.",
    icon: IterationCcw,
  },
  {
    title: "Roadmaps",
    description:
      "Strategic alignment across teams with multi-project timeline views.",
    icon: Route,
  },
  {
    title: "AI ticket writing",
    description:
      "Generate detailed technical specs and ACs from a single prompt.",
    icon: Sparkles,
  },
  {
    title: "Real-time sync",
    description:
      "Instant updates across all users. No refreshing, just building.",
    icon: RefreshCw,
  },
  {
    title: "Reports",
    description:
      "DORA metrics, burndown charts, and custom data exports.",
    icon: BarChart3,
  },
  {
    title: "Team chat",
    description:
      "Threaded discussions integrated directly into every issue card.",
    icon: MessageSquareMore,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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
          <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
            Engineering-first features
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#434655]">
            Everything you need to manage complex software lifecycles without
            the bloat of traditional tools.
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className="rounded-xl bg-[#EEF4FF] p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#004A9E]/10 text-[#004A9E]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-[#121C28]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#434655]">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
