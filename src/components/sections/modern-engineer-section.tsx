"use client";

import { motion } from "framer-motion";
import { MessageSquareMore, Sparkles, IterationCcw } from "lucide-react";

const items = [
  {
    title: "Real-time Collaboration",
    desc: "Work together seamlessly with live updates and integrated team chat so everyone stays aligned, no matter where they are.",
    icon: MessageSquareMore,
  },
  {
    title: "AI-Assisted Tickets",
    desc: "Draft high-quality issues and bug reports in seconds with our contextual AI assistant that learns your project structure.",
    icon: Sparkles,
  },
  {
    title: "Agile Sprint Planning",
    desc: "Optimize your capacity with data-driven sprint recommendations and velocity tracking for consistent delivery.",
    icon: IterationCcw,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function ModernEngineerSection() {
  return (
    <section className="bg-[#FCF9F7] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
            Built for the Modern Engineer
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#434655]">
            Stop wasting hours on administrative overhead. Let AI handle the
            documentation while you write the code.
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-80px" }}
          variants={containerVariants}
          className="grid gap-8 md:grid-cols-3"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className="rounded-xl bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D3E3FF] text-[#004AC6]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#1B1C1B]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#434655]">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
