"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Play, Shield, X, BarChart3, Columns, Clock } from "lucide-react";

function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-5xl rounded-2xl overflow-hidden bg-black shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              <iframe
                src="https://www.youtube.com/embed/uhM_v2I6lWg?autoplay=1"
                title="Vireo — AI-powered project management"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <div className="flex items-center justify-between bg-[#1a1a1a] px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#004AC6] text-[10px] font-bold text-white">
                  V
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Vireo — AI-powered project management</p>
                  <p className="text-xs text-white/50">Demo: Project Management with Vireo</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function HeroSection() {
  const [demoOpen, setDemoOpen] = useState(false);
  const openDemo = useCallback(() => setDemoOpen(true), []);
  const closeDemo = useCallback(() => setDemoOpen(false), []);

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <DemoModal open={demoOpen} onClose={closeDemo} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#D9DFF5_0%,_transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#004AC6]/[0.03] blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm text-[#5C6274]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          New: AI-Sprint Intelligence is live
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-[#121C28] md:text-5xl lg:text-6xl"
        >
          Plan, track, and manage work with{" "}
          <span className="text-[#004AC6]">Vireo</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#434655] md:text-lg"
        >
          The AI-powered project management platform that combines Jira-class
          rigor with real-time collaboration. Ship faster, track smarter.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="rounded-lg bg-[#004AC6] px-8 py-3.5 text-base font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] transition-all hover:bg-[#003da8]"
          >
            Get started free
          </Link>
          <button
            onClick={openDemo}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#C3C6D7] px-8 py-3.5 text-base font-bold text-[#121C28] transition-colors hover:bg-[#F8F9FF]"
          >
            <Play className="h-4 w-4" />
            Watch demo
          </button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex items-center justify-center gap-2 text-xs font-medium text-[#414752]"
        >
          <Shield className="h-3 w-3 text-[#10B981]" />
          Trusted by 2,500+ engineering leaders. Free 14-day trial, no credit card.
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 mx-auto max-w-4xl"
        >
          <button
            onClick={openDemo}
            className="relative aspect-video w-full rounded-2xl overflow-hidden group cursor-pointer text-left bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-[#334155]/50 shadow-[0_8px_40px_rgba(0,0,0,0.15)]"
          >
            <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_30%_50%,_#004AC6_0%,_transparent_50%),_radial-gradient(circle_at_70%_50%,_#005DA7_0%,_transparent_50%)]" />

            <div className="absolute top-6 left-6 right-6 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 backdrop-blur-sm">
                <div className="flex h-2 w-2 rounded-full bg-[#10B981]" />
                <span className="text-[10px] font-semibold tracking-wider text-white/60 uppercase">Sprint 04</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 backdrop-blur-sm">
                <BarChart3 className="h-3 w-3 text-[#60A5FA]" />
                <span className="text-[10px] font-medium text-white/60">12 issues</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 backdrop-blur-sm">
                <Clock className="h-3 w-3 text-white/40" />
                <span className="text-[10px] font-medium text-white/60">10:49</span>
              </div>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute h-20 w-20 rounded-full bg-[#004AC6]/20 blur-xl"
                />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#004AC6] shadow-[0_0_0_8px_rgba(0,74,198,0.15),0_0_40px_rgba(0,74,198,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_0_12px_rgba(0,74,198,0.2),0_0_60px_rgba(0,74,198,0.4)]">
                  <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
                </div>
              </div>
              <p className="mt-4 text-center text-sm font-medium text-white/70">
                Watch product demo
              </p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004AC6]">
                  <Columns className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Vireo Boards</p>
                  <p className="text-[11px] text-white/50">Drag-and-drop project management</p>
                </div>
              </div>

              <div className="flex -space-x-2">
                {["#60A5FA", "#F472B6", "#34D399"].map((color, i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-[#1E293B]"
                    style={{ backgroundColor: color }}
                  />
                ))}
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1E293B] bg-[#004AC6] text-[9px] font-bold text-white">
                  +3
                </div>
              </div>
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
