"use client";

import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";

const benefits = [
  {
    title: "Write better tickets",
    desc: "AI analyzes your intent and generates clear acceptance criteria and technical implementation hints.",
  },
  {
    title: "Summarize sprint status",
    desc: "Get a concise executive summary of your current sprint health and blockers in seconds.",
  },
  {
    title: "Triage bugs automatically",
    desc: "Vireo AI automatically categorizes incoming bugs by severity and suggests the best developer for the fix.",
  },
  {
    title: "Automated sprint planning",
    desc: "Balance workloads and schedule tasks based on historical velocity and priority levels.",
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

export function AIBenefitsSection() {
  return (
    <section className="bg-[#F8F9FF] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            AI everywhere
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
            Intelligence in every action.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#434655]">
            From ticket creation to sprint planning, Vireo AI works alongside
            your team to remove busywork and surface what matters.
          </p>
        </motion.div>
        <div className="grid gap-12 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={containerVariants}
            className="space-y-8"
          >
            {benefits.map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ x: 4 }}
                className="group flex items-start gap-4 rounded-2xl border border-[#C3C6D7]/15 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-[#C3C6D7]/35 hover:shadow-[0_10px_28px_rgba(16,24,40,0.08)]"
              >
                <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#004AC6] to-[#0B82EC] text-[11px] font-bold text-white">
                  ✓
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-[#121C28]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#434655]">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="flex items-center"
          >
            <div className="w-full overflow-hidden rounded-2xl border border-[#C3C6D7]/20 bg-white shadow-[0_8px_10px_rgba(0,0,0,0.06),0_20px_40px_rgba(16,24,40,0.08)]">
              <div className="flex items-center justify-between border-b border-[#C3C6D7]/10 bg-[#F8F9FF] px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#004AC6] to-[#0B82EC] text-white shadow-[0_2px_8px_rgba(0,74,198,0.3)]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-[#121C28]">
                      Vireo AI Assistant
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#10B981]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                      Online
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-[#EEF4FF] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#004AC6]">
                  GPT-4
                </span>
              </div>
              <div className="space-y-4 p-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl rounded-tl-sm bg-[#F8F9FF] p-4 text-sm text-[#434655]"
                >
                  I&apos;ve analyzed the current backlog. We have 3 high-priority
                  bugs affecting checkout. Should I create a hotfix sprint for
                  the Core Team?
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-gradient-to-r from-[#004AC6] to-[#0B82EC] p-4 text-sm text-white shadow-[0_2px_8px_rgba(0,74,198,0.2)]"
                >
                  Yes, please. Include &apos;VI-402&apos; and &apos;VI-398&apos;
                  as well.
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="rounded-xl rounded-tl-sm border border-[#C3C6D7]/20 bg-[#EEF4FF] p-4 text-sm"
                >
                  <div className="flex items-center gap-2 font-semibold text-[#004AC6]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#004AC6] text-[10px] text-white">
                      ✓
                    </span>
                    Sprint created
                  </div>
                  <div className="mt-1 text-[#434655]">
                    Assigned to: @SarahM, @DavidK. Target completion: Friday,
                    4:00 PM.
                  </div>
                </motion.div>
              </div>
              <div className="flex items-center gap-2 border-t border-[#C3C6D7]/10 px-5 py-3">
                <div className="flex-1 rounded-lg bg-[#F8F9FF] px-3 py-2 text-xs text-[#737686]">
                  Ask Vireo AI anything...
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004AC6] text-white">
                  <Send className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
