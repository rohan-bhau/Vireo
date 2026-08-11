"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Home, Boxes, Route, Plus, ArrowRight, ChevronDown, X, BadgeDollarSign, BookOpen, Compass } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { productCategories } from "@/lib/product-data";
import { solutionCategories } from "@/lib/solutions-data";
import type { RootState } from "@/store";

type Sheet = "product" | "solutions" | "more" | null;

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function MobileMarketingNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function openSheet(next: Exclude<Sheet, null>) {
    setSheet((prev) => (prev === next ? null : next));
    setExpandedId(null);
  }

  function closeSheets() {
    setSheet(null);
    setExpandedId(null);
  }

  const productActive = pathname === "/product" || pathname.startsWith("/product/");
  const solutionsActive = pathname === "/solutions" || pathname.startsWith("/solutions/");
  const moreActive = ["/pricing", "/docs", "/guide"].some((h) => isActive(h, pathname));

  const sheetTab = (label: string, Icon: typeof Home, active: boolean, sheetId: Exclude<Sheet, null>) => (
    <button
      onClick={() => openSheet(sheetId)}
      className={clsx(
        "relative flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
        active ? "text-[#004AC6]" : "text-[#737686] hover:text-[#121C28]"
      )}
    >
      {active && <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-[#004AC6]" />}
      <Icon className="h-5 w-5" />
      <span className="max-w-full truncate leading-tight">{label}</span>
    </button>
  );

  return (
    <>
      <nav className="fixed inset-x-3 bottom-3 z-50 md:hidden">
        <div className="flex items-center justify-around gap-1 rounded-2xl border border-[#C3C6D7]/25 bg-white/95 px-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur pb-[env(safe-area-inset-bottom)]">
          <Link
            href="/"
            onClick={closeSheets}
            className={clsx(
              "relative flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
              pathname === "/" ? "text-[#004AC6]" : "text-[#737686] hover:text-[#121C28]"
            )}
          >
            {pathname === "/" && <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-[#004AC6]" />}
            <Home className="h-5 w-5" />
            <span className="max-w-full truncate leading-tight">Home</span>
          </Link>

          {sheetTab("Product", Boxes, productActive, "product")}
          {sheetTab("Solutions", Route, solutionsActive, "solutions")}
          {sheetTab("More", Plus, moreActive, "more")}

          <Link
            href={isAuthenticated ? "/dashboard" : "/register"}
            onClick={closeSheets}
            className="flex flex-col items-center justify-center gap-0.5 px-2 text-[10px] font-bold min-h-[48px] min-w-[64px]"
          >
            <span className="-mt-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#004AC6] text-white shadow-lg ring-4 ring-white">
              <ArrowRight className="h-5 w-5" />
            </span>
            <span className="leading-tight text-[#004AC6]">
              {isAuthenticated ? "Dashboard" : "Get started"}
            </span>
          </Link>
        </div>
      </nav>

      <AnimatePresence>
        {sheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={closeSheets}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:hidden"
            >
              <div className="flex items-center justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-[#C3C6D7]" />
              </div>
              <div className="flex items-center justify-between px-5 pb-2">
                <h3 className="text-base font-semibold text-[#121C28]">
                  {sheet === "product" ? "Products" : sheet === "solutions" ? "Solutions" : "More"}
                </h3>
                <button onClick={closeSheets} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#737686] transition-colors hover:bg-[#F8F9FF] hover:text-[#004AC6]" aria-label="Close menu">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto px-3">
                {sheet === "product" && (
                  <div className="space-y-1">
                    {productCategories.map((cat) => {
                      const categoryActive = pathname.startsWith("/product");
                      const expanded = expandedId === cat.id;
                      return (
                        <div key={cat.id} className="overflow-hidden rounded-xl">
                          <div className="flex items-center">
                            <Link
                              href={`/product/${cat.id}`}
                              onClick={closeSheets}
                              className={clsx(
                                "flex flex-1 cursor-pointer items-center rounded-l-xl px-4 py-3 text-sm font-semibold transition-colors",
                                categoryActive ? "text-[#004AC6]" : "text-[#121C28] hover:bg-[#F8F9FF]"
                              )}
                            >
                              {cat.title}
                            </Link>
                            <button
                              onClick={() => setExpandedId(expanded ? null : cat.id)}
                              className="flex h-full w-10 cursor-pointer items-center justify-center rounded-r-xl text-[#737686] transition-colors hover:bg-[#F8F9FF]"
                              aria-label={`Toggle ${cat.title} items`}
                            >
                              <ChevronDown className={clsx("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                            </button>
                          </div>
                          <AnimatePresence>
                            {expanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="border-l-2 border-[#004AC6]/20 pl-4">
                                  {cat.items.map((item) => (
                                    <Link
                                      key={item.slug}
                                      href={`/product/${item.slug}`}
                                      onClick={closeSheets}
                                      className={clsx(
                                        "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
                                        pathname === `/product/${item.slug}`
                                          ? "bg-[#EEF4FF] font-semibold text-[#004AC6]"
                                          : "text-[#434655] hover:bg-[#F8F9FF]"
                                      )}
                                    >
                                      {item.title}
                                    </Link>
                                  ))}
                                  <Link
                                    href={`/product/${cat.id}`}
                                    onClick={closeSheets}
                                    className="flex cursor-pointer items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-[#737686] transition-colors hover:text-[#004AC6]"
                                  >
                                    View all in {cat.title}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </Link>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}

                {sheet === "solutions" && (
                  <div className="space-y-1">
                    {solutionCategories.map((cat) => {
                      const expanded = expandedId === cat.id;
                      return (
                        <div key={cat.id} className="overflow-hidden rounded-xl">
                          <div className="flex items-center">
                            <Link
                              href={`/solutions/${cat.id}`}
                              onClick={closeSheets}
                              className={clsx(
                                "flex flex-1 cursor-pointer items-center rounded-l-xl px-4 py-3 text-sm font-semibold transition-colors",
                                pathname.startsWith("/solutions") ? "text-[#004AC6]" : "text-[#121C28] hover:bg-[#F8F9FF]"
                              )}
                            >
                              {cat.title}
                            </Link>
                            <button
                              onClick={() => setExpandedId(expanded ? null : cat.id)}
                              className="flex h-full w-10 cursor-pointer items-center justify-center rounded-r-xl text-[#737686] transition-colors hover:bg-[#F8F9FF]"
                              aria-label={`Toggle ${cat.title} items`}
                            >
                              <ChevronDown className={clsx("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                            </button>
                          </div>
                          <AnimatePresence>
                            {expanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="border-l-2 border-[#004AC6]/20 pl-4">
                                  {cat.items.map((item) => (
                                    <Link
                                      key={item.slug}
                                      href={`/solutions/${item.slug}`}
                                      onClick={closeSheets}
                                      className={clsx(
                                        "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
                                        pathname === `/solutions/${item.slug}`
                                          ? "bg-[#EEF4FF] font-semibold text-[#004AC6]"
                                          : "text-[#434655] hover:bg-[#F8F9FF]"
                                      )}
                                    >
                                      {item.title}
                                    </Link>
                                  ))}
                                  <Link
                                    href={`/solutions/${cat.id}`}
                                    onClick={closeSheets}
                                    className="flex cursor-pointer items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-[#737686] transition-colors hover:text-[#004AC6]"
                                  >
                                    View all in {cat.title}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </Link>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                    <Link
                      href="/solutions"
                      onClick={closeSheets}
                      className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] px-4 py-3 text-sm font-semibold text-[#121C28] transition-colors hover:bg-white"
                    >
                      View all solutions
                      <ArrowRight className="h-4 w-4 text-[#737686]" />
                    </Link>
                  </div>
                )}

                {sheet === "more" && (
                  <div className="space-y-1">
                    {[
                      { label: "Pricing", href: "/pricing", icon: BadgeDollarSign },
                      { label: "Docs", href: "/docs", icon: BookOpen },
                      { label: "Guide", href: "/guide", icon: Compass },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeSheets}
                          className={clsx(
                            "flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                            active ? "bg-[#EEF4FF] font-semibold text-[#004AC6]" : "text-[#434655] hover:bg-[#F8F9FF]"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                          {active && <span className="ml-auto text-[11px] font-medium text-[#004AC6]">Active</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}