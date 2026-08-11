"use client";

import { motion } from "framer-motion";

export interface Stat {
  value: string;
  label: string;
}

export function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: idx * 0.08 }}
          className="rounded-xl border border-[#C3C6D7]/25 bg-white px-6 py-5 text-center shadow-sm"
        >
          <p className="text-3xl font-bold text-[#004AC6]">{stat.value}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#737686]">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}