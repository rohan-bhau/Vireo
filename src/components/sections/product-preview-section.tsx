"use client";

import { motion } from "framer-motion";
import { Search, Plus, Columns } from "lucide-react";

type CardWithTag = {
  id: string;
  title: string;
  tag: string;
  done: boolean;
  tags?: never;
};

type CardWithTags = {
  id: string;
  title: string;
  tag?: never;
  done: boolean;
  tags: { label: string; value: string | null; highlight: boolean }[];
};

type Card = CardWithTag | CardWithTags;

const columns: { title: string; count: number; cards: Card[] }[] = [
  {
    title: "TO DO",
    count: 2,
    cards: [
      {
        id: "VIR-105",
        title: "AI Sprint Planning",
        tag: "Feature",
        done: false,
      },
      {
        id: "VIR-108",
        title: "Implement Webhooks for Slack",
        tag: "Integrations",
        done: false,
      },
    ],
  },
  {
    title: "IN PROGRESS",
    count: 1,
    cards: [
      {
        id: "VIR-102",
        title: "Refactor API Authentication Layer",
        tags: [
          { label: "AI Complexity Score", value: "8/10", highlight: true },
          { label: "High Impact", value: null, highlight: false },
        ],
        done: false,
      },
    ],
  },
  {
    title: "DONE",
    count: 1,
    cards: [
      {
        id: "VIR-98",
        title: "Security Patch v2.1.0",
        tag: "Completed",
        done: true,
      },
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ProductPreviewSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
          className="overflow-hidden rounded-2xl bg-[#F6F3F1] shadow-[0_25px_50px_rgba(0,74,198,0.05)]"
        >
          <div className="p-6 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <motion.div variants={itemVariants} className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-[#1B1C1B]">
                  Vireo Boards
                </h2>
                <span className="rounded-md bg-[#1B1C1B]/10 px-2 py-0.5 text-xs font-medium text-[#1B1C1B]">
                  SPRINT-04
                </span>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-md border border-[#C3C6D7]/40 bg-white px-3 py-1.5 text-sm text-[#6B7280]">
                  <Search className="h-4 w-4" />
                  <span>Search issues...</span>
                </div>
                <button className="flex items-center gap-1.5 rounded-md bg-[#005DA7] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#004d8e]">
                  <Plus className="h-3.5 w-3.5" />
                  Create
                </button>
              </motion.div>
            </div>
          </div>

          <div className="grid gap-4 p-6 pt-2 lg:grid-cols-3">
            {columns.map((column, colIdx) => (
              <motion.div
                key={column.title}
                variants={itemVariants}
                className="rounded-xl bg-white/50 p-4"
              >
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#414752]">
                  <Columns className="h-3 w-3" />
                  {column.title}
                  <span className="ml-auto rounded-full bg-[#414752]/10 px-1.5 py-0.5 text-[10px] font-medium">
                    {column.count}
                  </span>
                </div>
                <div className="space-y-3">
                  {column.cards.map((card, cardIdx) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: cardIdx * 0.1 + colIdx * 0.15 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className={`rounded-lg border border-[#C3C6D7]/20 p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-md ${
                        card.done ? "bg-[#EAE8E6]" : "bg-[#FCF9F7]"
                      }`}
                    >
                      <div className="font-mono text-[11px] font-medium text-[#615E59]">
                        {card.id}
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-[#1B1C1B]">
                        {card.title}
                      </div>
                      {"tag" in card && card.tag && (
                        <span
                          className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            card.done
                              ? "bg-[#414752]/10 text-[#414752]"
                              : "bg-[#EEF4FF] text-[#004AC6]"
                          }`}
                        >
                          {card.tag}
                        </span>
                      )}
                      {"tags" in card && card.tags && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {card.tags.map((tag) => (
                            <span
                              key={tag.label}
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                tag.highlight
                                  ? "bg-[#EEF4FF] text-[#005DA7] font-bold"
                                  : "bg-[#414752]/10 text-[#414752]"
                              }`}
                            >
                              {tag.label}
                              {tag.value && ` ${tag.value}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
