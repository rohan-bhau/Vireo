"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const columns = [
  {
    title: "Product",
    links: ["Changelog", "Documentation", "Integrations", "Security"],
  },
  {
    title: "Solutions",
    links: ["For Engineers", "For Managers", "For Startups", "Enterprise"],
  },
  {
    title: "Company",
    links: ["About Us", "Blog", "Careers", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "GDPR"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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
      className="border-t border-[#C3C6D7]/20 bg-white py-12"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Image src="/vireo-logo.svg" alt="Vireo" width={120} height={35} className="h-8 w-auto" />
            <p className="mt-3 text-sm text-[#434655]">
              Professional-grade project management for modern software teams.
            </p>
          </motion.div>
          {columns.map((column) => (
            <motion.div key={column.title} variants={itemVariants}>
              <h4 className="mb-3 text-xs font-bold tracking-wider text-[#434655] uppercase">
                {column.title}
              </h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="/login"
                      className="text-sm text-[#5C6274] transition-colors hover:text-[#004AC6]"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#C3C6D7]/20 pt-8 sm:flex-row"
        >
          <p className="text-xs text-[#737686]">
            &copy; 2024 Vireo Pro Systems Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#737686]">
            <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
            System Status: Operational
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
