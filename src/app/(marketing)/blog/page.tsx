"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/marketing/page-hero";

const posts = [
  {
    title: "We killed our sprint ceremony (and shipped faster)",
    excerpt: "How a five-person team replaced a full day of planning with a fifteen-minute session and AI-assisted retrospectives.",
    category: "Productivity",
    date: "July 28, 2026",
    readTime: "6 min",
    color: "#004AC6",
  },
  {
    title: "DORA metrics without the busywork",
    excerpt: "Four ways to make deployment frequency, lead time, and change failure rate visible to your whole team — automatically.",
    category: "Engineering",
    date: "July 14, 2026",
    readTime: "8 min",
    color: "#10B981",
  },
  {
    title: "Estimation is about risk, not points",
    excerpt: "Story points were never the point. Here's the estimation framework we use internally and how you can adopt it.",
    category: "Agile",
    date: "June 30, 2026",
    readTime: "5 min",
    color: "#7C3AED",
  },
  {
    title: "The case for smaller, more frequent sprints",
    excerpt: "A look at the data from 1,000+ teams: what happens to cycle time when sprints shrink from two weeks to one.",
    category: "Research",
    date: "June 18, 2026",
    readTime: "7 min",
    color: "#D97706",
  },
  {
    title: "Building a board your team actually uses",
    excerpt: "Six board anti-patterns — from 28-column monsters to statuses that exist only in theory — and how to fix them.",
    category: "Productivity",
    date: "June 4, 2026",
    readTime: "4 min",
    color: "#004AC6",
  },
  {
    title: "On-call handoffs in the issue tracker",
    excerpt: "Connect incident response to your normal workflow without burying your team in noise.",
    category: "Ops",
    date: "May 21, 2026",
    readTime: "6 min",
    color: "#DC2626",
  },
];

export default function BlogPage() {
  return (
    <div>
      <PageHero
        eyebrow="Blog"
        title="Notes from the Vireo team"
        subtitle="Essays on agile practice, engineering productivity, AI, and building tools that respect people's time."
      />
      <section className="border-t border-[#C3C6D7]/20 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, idx) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="group flex flex-col rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-6 transition-all hover:border-[#004AC6]/30 hover:shadow-[0_4px_20px_rgba(0,74,198,0.08)]"
              >
                <Link href="#" className="contents">
                  <span
                    className="mb-4 inline-block w-fit rounded-md px-2 py-0.5 text-[11px] font-bold text-white"
                    style={{ backgroundColor: post.color }}
                  >
                    {post.category}
                  </span>
                  <h2 className="text-lg font-semibold leading-snug text-[#121C28] transition-colors group-hover:text-[#004AC6]">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#434655]">{post.excerpt}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-[#8A8FA3]">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                    <span className="ml-auto flex items-center gap-1 font-semibold text-[#004AC6] opacity-0 transition-opacity group-hover:opacity-100">
                      Read
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}