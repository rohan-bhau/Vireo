"use client";

import { motion } from "framer-motion";

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
          <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
            Intelligence in every action.
          </h2>
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
                className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              >
                <h3 className="text-lg font-semibold text-[#121C28]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#434655]">
                  {item.desc}
                </p>
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
            <div className="w-full rounded-2xl bg-white p-6 shadow-[0_8px_10px_rgba(0,0,0,0.10),0_20px_25px_rgba(0,0,0,0.10)]">
              <div className="mb-4 text-sm font-bold text-[#004AC6]">
                Vireo AI Assistant
              </div>
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl bg-[#F8F9FF] p-4 text-sm text-[#434655]"
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
                  className="rounded-xl bg-[#004AC6] p-4 text-sm text-white"
                >
                  Yes, please. Include &apos;VI-402&apos; and &apos;VI-398&apos;
                  as well.
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="rounded-xl bg-[#EEF4FF] p-4 text-sm"
                >
                  <div className="font-semibold text-[#004AC6]">
                    Sprint created
                  </div>
                  <div className="mt-1 text-[#434655]">
                    Assigned to: @SarahM, @DavidK. Target completion: Friday,
                    4:00 PM.
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
