"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Mail,
} from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Changelog", href: "/changelog" },
      { label: "Documentation", href: "/docs" },
      { label: "Integrations", href: "/integrations" },
      { label: "Security", href: "/security" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "For Engineers", href: "/solutions/engineering-teams" },
      { label: "For Managers", href: "/solutions/product-teams" },
      { label: "For Startups", href: "/solutions/startups" },
      { label: "Enterprise", href: "/enterprise" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "GDPR", href: "/gdpr" },
    ],
  },
];

const socials = [
  {
    label: "GitHub",
    href: "https://github.com",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://twitter.com",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function FooterSection() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={containerVariants}
      className="relative border-t border-[#C3C6D7]/20 bg-[#FBFBFF]"
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={itemVariants}
          className="relative -mt-8 mb-14 overflow-hidden rounded-2xl border border-[#C3C6D7]/20 bg-gradient-to-br from-[#004AC6] via-[#005DA7] to-[#0B82EC] p-8 shadow-[0_16px_48px_rgba(0,74,198,0.25)] md:p-10"
        >
          <div className="pointer-events-none absolute -top-16 right-0 h-[280px] w-[420px] rounded-full bg-white/[0.08] blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Ship faster with Vireo
              </h3>
              <p className="mt-2 text-sm text-[#D3E3FF]">
                Join 2,500+ teams already planning, tracking, and shipping with AI. Start your free 14-day trial today.
              </p>
            </div>
            <div className="flex w-full max-w-md items-center gap-2 rounded-xl bg-white/10 p-1.5 ring-1 ring-white/20 backdrop-blur-md">
              <Mail className="ml-2 h-4 w-4 shrink-0 text-white/70" />
              <input
                type="email"
                placeholder="Enter your work email"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
              <button className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#004AC6] transition-all hover:bg-gray-50">
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-6">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Image src="/vireo-logo.svg" alt="Vireo" width={120} height={35} className="h-8 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#434655]">
              Professional-grade project management for modern software teams.
              Built for speed, designed for clarity.
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#C3C6D7]/30 bg-white text-[#434655] transition-all hover:-translate-y-0.5 hover:border-[#004AC6]/40 hover:text-[#004AC6] hover:shadow-[0_4px_12px_rgba(0,74,198,0.15)]"
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </motion.div>

          {columns.map((column) => (
            <motion.div key={column.title} variants={itemVariants}>
              <h4 className="mb-4 text-xs font-bold tracking-wider text-[#121C28] uppercase">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-block text-sm text-[#5C6274] transition-all duration-200 hover:translate-x-0.5 hover:text-[#004AC6]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-between gap-4 border-t border-[#C3C6D7]/20 py-7 sm:flex-row"
        >
          <p className="text-xs text-[#737686]">
            &copy; 2026 Vireo Pro Systems Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 rounded-full border border-[#C3C6D7]/20 bg-white px-3.5 py-1.5 text-xs text-[#737686]">
            <span className="flex h-2 w-2">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#22C55E] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
            </span>
            System Status: Operational
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#737686]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
            SOC 2 Type II Compliant
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}