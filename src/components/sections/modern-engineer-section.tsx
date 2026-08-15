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
    desc: "Draft high-quality tasks and bug reports in seconds with our contextual AI assistant that learns your project structure.",
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
          viewport={{ once: true, margin: "-80px" }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered workflows
          </div>
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
          viewport={{ once: true, margin: "-80px" }}
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
                className="group rounded-2xl bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_16px_40px_rgba(16,24,40,0.10)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#004AC6] to-[#0B82EC] text-white shadow-[0_4px_12px_rgba(0,74,198,0.2)] transition-transform duration-300 group-hover:scale-110">
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
