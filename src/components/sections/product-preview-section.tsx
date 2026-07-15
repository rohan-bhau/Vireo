"use client";

import { motion } from "framer-motion";
import { Search, Plus, Columns, ArrowRight } from "lucide-react";
import Link from "next/link";

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
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#EEF4FF_0%,_transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          className="mb-14 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#005DA7]" />
            Visual project management
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
            Boards your team will love
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#434655]">
            Drag-and-drop kanban boards with AI-powered insights. See the big
            picture without losing the details.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-80px" }}
          variants={containerVariants}
          className="overflow-hidden rounded-2xl border border-[#C3C6D7]/20 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="border-b border-[#C3C6D7]/10 px-6 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <motion.div variants={itemVariants} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004A9E]/10 text-[#004A9E]">
                  <Columns className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold text-[#121C28]">
                  Vireo Boards
                </h3>
                <span className="rounded-md bg-[#004A9E]/10 px-2.5 py-0.5 text-xs font-semibold text-[#004A9E]">
                  SPRINT-04
                </span>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-[#C3C6D7]/30 bg-[#F8F9FF] px-3 py-2 text-sm text-[#6B7280] transition-colors hover:border-[#C3C6D7]/50">
                  <Search className="h-4 w-4" />
                  <span>Search issues...</span>
                </div>
                <button className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#005DA7] px-4 py-2 text-xs font-bold text-white shadow-[0_2px_8px_rgba(0,74,198,0.25)] transition-all hover:shadow-[0_4px_12px_rgba(0,74,198,0.35)] hover:brightness-110">
                  <Plus className="h-3.5 w-3.5" />
                  Create
                </button>
              </motion.div>
            </div>
          </div>

          <div className="grid gap-4 p-6 lg:grid-cols-3">
            {columns.map((column, colIdx) => (
              <motion.div
                key={column.title}
                variants={itemVariants}
                className="rounded-xl bg-[#F8F9FF] p-4"
              >
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#414752]">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      column.title === "TO DO"
                        ? "bg-[#6B7280]"
                        : column.title === "IN PROGRESS"
                          ? "bg-[#005DA7]"
                          : "bg-[#10B981]"
                    }`}
                  />
                  {column.title}
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#414752]/10 text-[10px] font-semibold text-[#414752]">
                    {column.count}
                  </span>
                </div>
                <div className="space-y-3">
                  {column.cards.map((card, cardIdx) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: cardIdx * 0.1 + colIdx * 0.15 }}
                      whileHover={{ y: -2 }}
                      className={`rounded-lg border p-3.5 shadow-sm transition-all ${
                        card.done
                          ? "border-[#10B981]/20 bg-[#F0FDF4]"
                          : "border-[#C3C6D7]/20 bg-white hover:border-[#C3C6D7]/40 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            card.done ? "text-[#10B981]" : "text-[#6B7280]"
                          }`}
                        >
                          {card.id}
                        </span>
                        {card.done && (
                          <span className="rounded-full bg-[#10B981]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#10B981]">
                            Done
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-[#121C28]">
                        {card.title}
                      </div>

                      {"tag" in card && card.tag && (
                        <span
                          className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            card.done
                              ? "bg-[#10B981]/10 text-[#10B981]"
                              : "bg-[#EEF4FF] text-[#004AC6]"
                          }`}
                        >
                          {card.tag}
                        </span>
                      )}
                      {"tags" in card && card.tags && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {card.tags.map((tag) => (
                            <span
                              key={tag.label}
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                tag.highlight
                                  ? "bg-[#EEF4FF] text-[#004AC6]"
                                  : "bg-[#F3F4F6] text-[#6B7280]"
                              }`}
                            >
                              {tag.label}
                              {tag.value && (
                                <span className="ml-0.5 font-bold">
                                  {tag.value}
                                </span>
                              )}
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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            href="/w"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#004AC6] transition-colors hover:text-[#003da8]"
          >
            Explore all board features
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
