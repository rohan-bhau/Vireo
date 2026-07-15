"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#F8F9FF]/80 backdrop-blur-[12px] border-b border-[#C3C6D7]/20"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/vireo-logo.svg" alt="Vireo" width={100} height={30} className="h-7 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#434655] transition-colors hover:text-[#004AC6]"
          >
            Product
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-[#434655] transition-colors hover:text-[#004AC6]"
          >
            Solutions
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-[#434655] transition-colors hover:text-[#004AC6]"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-[#434655] transition-colors hover:text-[#004AC6]"
          >
            Docs
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#434655] transition-colors hover:text-[#004AC6]"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-[#004AC6] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] transition-all hover:bg-[#003da8]"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
