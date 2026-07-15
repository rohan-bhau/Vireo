"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, ChevronDown } from "lucide-react";
import type { RootState } from "@/store";
import { logout } from "@/store/authSlice";
import { clearTokens } from "@/lib/auth";

const navItems = [
  { label: "Product", href: "/product" },
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
];

export function Header() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    dispatch(logout());
    clearTokens();
    setDropdownOpen(false);
    router.push("/");
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#F8F9FF]/80 backdrop-blur-[12px] border-b border-[#C3C6D7]/20"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <Image
            src="/vireo-logo.svg"
            alt="Vireo"
            width={100}
            height={30}
            className="h-7 w-auto"
          />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold transition-colors hover:text-[#004AC6] ${
                  isActive ? "text-[#004AC6]" : "text-[#434655]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <Link
              href="/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#434655] transition-colors hover:bg-[#EEF4FF] hover:text-[#004AC6]"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#004AC6] text-[8px] font-bold text-white">
                3
              </span>
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-[#004AC6] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] transition-all hover:bg-[#003da8]"
            >
              Workspaces
            </Link>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-[#C3C6D7]/20 bg-white px-3 py-2 transition-colors hover:border-[#C3C6D7]/40"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#004AC6] text-[11px] font-bold text-white">
                  {initials}
                </div>
                <ChevronDown className={`h-4 w-4 text-[#737686] transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-[#C3C6D7]/20 bg-white shadow-lg"
                >
                  <div className="border-b border-[#C3C6D7]/10 px-4 py-3">
                    <p className="text-sm font-semibold text-[#121C28]">
                      {user?.name || "User"}
                    </p>
                    <p className="mt-0.5 text-xs text-[#737686]">
                      {user?.email || ""}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF] hover:text-[#DC2626]"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </motion.header>
  );
}
