"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, ChevronDown, Check, ArrowRight, Menu, X, ChevronRight, LayoutDashboard } from "lucide-react";
import type { RootState } from "@/store";
import { logout } from "@/store/authSlice";
import { clearTokens } from "@/lib/auth";
import { productCategories, type ProductCategory } from "@/lib/product-data";

const otherNavItems = [
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
];

function ProductMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(productCategories[0]);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleMouseEnter() {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  }

  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }

  function handleCategoryEnter(category: ProductCategory) {
    setActiveCategory(category);
  }

  const isActive = pathname.startsWith("/product");

  return (
    <div
      className="relative"
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href="/product/features"
        className={`text-sm font-semibold transition-colors hover:text-[#004AC6] flex items-center gap-1 ${
          isActive ? "text-[#004AC6]" : "text-[#434655]"
        }`}
      >
        Product
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </Link>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[640px] overflow-hidden rounded-2xl border border-[#C3C6D7]/20 bg-white shadow-xl"
          >
            <div className="flex">
              <div className="w-[200px] shrink-0 border-r border-[#C3C6D7]/10 bg-[#F8F9FF] p-2">
                {productCategories.map((cat) => {
                  const isSelected = activeCategory.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onMouseEnter={() => handleCategoryEnter(cat)}
                      onClick={() => handleCategoryEnter(cat)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-white text-[#004AC6] shadow-sm"
                          : "text-[#434655] hover:bg-white/60 hover:text-[#121C28]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full transition-colors ${
                          isSelected ? "bg-[#004AC6]" : "bg-transparent"
                        }`}
                      />
                      {cat.title}
                    </button>
                  );
                })}
              </div>
              <div className="flex-1 p-3">
                <Link
                  href={`/product/${activeCategory.id}`}
                  className="mb-2 block rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#737686] transition-colors hover:text-[#004AC6]"
                  onClick={() => setOpen(false)}
                >
                  {activeCategory.title}
                  <ArrowRight className="ml-1 inline h-3 w-3" />
                </Link>
                <div className="space-y-0.5">
                  {activeCategory.items.map((item) => {
                    const isItemActive = pathname === `/product/${item.slug}`;
                    return (
                      <Link
                        key={item.slug}
                        href={`/product/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                          isItemActive
                            ? "bg-[#EEF4FF] text-[#004AC6]"
                            : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
                        }`}
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#10B981]" />
                        <div>
                          <p className="text-sm font-semibold">{item.title}</p>
                          <p className="mt-0.5 text-xs text-[#737686] line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileMenu({ close }: { close: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  function handleLogout() {
    dispatch(logout());
    clearTokens();
    close();
    router.push("/");
  }

  function handleNavigate(href: string) {
    close();
    router.push(href);
  }

  const activeCategory = productCategories.find((c) => c.id === selectedCategory);

  function renderAuthButtons() {
    if (isAuthenticated) {
      return (
        <div className="flex gap-3">
          <button
            onClick={() => handleNavigate("/dashboard")}
            className="flex-1 rounded-lg bg-[#004AC6] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#003da8]"
          >
            Workspaces
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-[#C3C6D7]/20 px-4 py-2.5 text-sm font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleNavigate("/login")}
          className="w-full rounded-lg border border-[#C3C6D7]/20 py-2.5 text-sm font-semibold text-[#434655] transition-colors hover:bg-[#F8F9FF]"
        >
          Sign in
        </button>
        <button
          onClick={() => handleNavigate("/register")}
          className="w-full rounded-lg bg-[#004AC6] py-2.5 text-sm font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10)] transition-colors hover:bg-[#003da8]"
        >
          Start free trial
        </button>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 top-16 z-30 bg-black/20 md:hidden"
        onClick={close}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-y-0 right-0 top-16 z-40 w-full max-w-sm bg-white shadow-xl md:hidden"
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {selectedCategory && activeCategory ? (
            <div className="flex flex-1 flex-col">
              <div className="flex-1 px-4 py-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mb-3 flex items-center gap-1.5 text-sm font-medium text-[#737686] transition-colors hover:text-[#004AC6]"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                  All Products
                </button>
                <div className="mb-3 border-b border-[#C3C6D7]/10 pb-3">
                  <Link
                    href={`/product/${activeCategory.id}`}
                    onClick={close}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-semibold text-[#004AC6] transition-colors hover:bg-[#EEF4FF]"
                  >
                    {activeCategory.title}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-0.5">
                  {activeCategory.items.map((item) => {
                    const isItemActive = pathname === `/product/${item.slug}`;
                    return (
                      <button
                        key={item.slug}
                        onClick={() => handleNavigate(`/product/${item.slug}`)}
                        className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                          isItemActive
                            ? "bg-[#EEF4FF] text-[#004AC6]"
                            : "text-[#434655] hover:bg-[#F8F9FF]"
                        }`}
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                        <div>
                          <p className="text-sm font-semibold">{item.title}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-[#C3C6D7]/10 px-4 py-4">
                {renderAuthButtons()}
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 px-4 py-4">
                <div className="mb-4 border-b border-[#C3C6D7]/10 pb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#737686]">Products</p>
                </div>
                <nav className="space-y-0.5">
                  {productCategories.map((cat) => {
                    const isCatActive = pathname === `/product/${cat.id}`;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-base font-semibold transition-colors ${
                          isCatActive
                            ? "text-[#004AC6] bg-[#EEF4FF]"
                            : "text-[#121C28] hover:bg-[#F8F9FF]"
                        }`}
                      >
                        {cat.title}
                        <ChevronRight className="h-4 w-4 text-[#737686]" />
                      </button>
                    );
                  })}

                  <div className="my-3 border-t border-[#C3C6D7]/10" />

                  {[
                    { label: "Solutions", href: "/solutions" },
                    { label: "Pricing", href: "/pricing" },
                    { label: "Docs", href: "/docs" },
                  ].map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavigate(item.href)}
                        className={`flex w-full items-center rounded-lg px-3 py-3 text-left text-base font-semibold transition-colors ${
                          isActive
                            ? "text-[#004AC6] bg-[#EEF4FF]"
                            : "text-[#121C28] hover:bg-[#F8F9FF]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
              <div className="border-t border-[#C3C6D7]/10 px-4 py-4">
                {renderAuthButtons()}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

export function Header() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAvatarOpen, setMobileAvatarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileAvatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileAvatarRef.current && !mobileAvatarRef.current.contains(e.target as Node)) {
        setMobileAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#F8F9FF]/80 backdrop-blur-[12px] border-b border-[#C3C6D7]/20"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
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
            <ProductMenu />
            {otherNavItems.map((item) => {
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

          <div className="flex items-center gap-2 md:gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/notifications"
                  className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-[#434655] transition-colors hover:bg-[#EEF4FF] hover:text-[#004AC6] md:flex"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#004AC6] text-[8px] font-bold text-white">
                    3
                  </span>
                </Link>
                <Link
                  href="/dashboard"
                  className="hidden rounded-lg bg-[#004AC6] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] transition-all hover:bg-[#003da8] md:block"
                >
                  Workspaces
                </Link>
                <div className="relative hidden md:block" ref={dropdownRef}>
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
                        <p className="text-sm font-semibold text-[#121C28]">{user?.name || "User"}</p>
                        <p className="mt-0.5 text-xs text-[#737686]">{user?.email || ""}</p>
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
              </>
            ) : (
              <div className="hidden items-center gap-4 md:flex">
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

            {isAuthenticated && (
              <div className="relative md:hidden" ref={mobileAvatarRef}>
                <button
                  onClick={() => setMobileAvatarOpen(!mobileAvatarOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#004AC6] text-[10px] font-bold text-white transition-colors hover:bg-[#003da8]"
                >
                  {initials}
                </button>
                {mobileAvatarOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-[#C3C6D7]/20 bg-white shadow-lg"
                  >
                    <div className="border-b border-[#C3C6D7]/10 px-4 py-3">
                      <p className="text-sm font-semibold text-[#121C28]">{user?.name || "User"}</p>
                      <p className="mt-0.5 text-xs text-[#737686]">{user?.email || ""}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileAvatarOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF] hover:text-[#004AC6]"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Workspaces
                    </Link>
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
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-[#434655] transition-colors hover:bg-[#EEF4FF] hover:text-[#004AC6] ${
                isAuthenticated ? "" : "md:hidden"
              }`}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {mobileMenuOpen && <MobileMenu close={() => setMobileMenuOpen(false)} />}
    </>
  );
}
