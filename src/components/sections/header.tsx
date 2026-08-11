"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown, Check, ArrowRight, Menu, X, ChevronRight, LayoutDashboard, Code, Route, Server, ChartNoAxesColumn, Rocket, Boxes, Code2, NotebookPen, ShieldCheck, Building2, ServerCog } from "lucide-react";
import type { RootState } from "@/store";
import { logout } from "@/store/authSlice";
import { clearTokens } from "@/lib/auth";
import { productCategories, type ProductCategory } from "@/lib/product-data";
import { solutionCategories, type SolutionCategory } from "@/lib/solutions-data";
import { NotificationBell } from "@/components/nav/notification-bell";

const otherNavItems = [
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Guide", href: "/guide" },
];

const productMenuConfig: Record<string, { icon: typeof Boxes; color: string; gradient: string }> = {
  features: { icon: Boxes, color: "#2563EB", gradient: "from-[#2563EB] to-[#1d4ed8]" },
  developers: { icon: Code2, color: "#0EA5E9", gradient: "from-[#0EA5E9] to-[#0284c7]" },
  "product-manager": { icon: NotebookPen, color: "#7C3AED", gradient: "from-[#7C3AED] to-[#6d28d9]" },
  "it-professionals": { icon: ShieldCheck, color: "#059669", gradient: "from-[#059669] to-[#047857]" },
  "business-teams": { icon: Building2, color: "#D97706", gradient: "from-[#D97706] to-[#b45309]" },
  "it-teams": { icon: ServerCog, color: "#DB2777", gradient: "from-[#DB2777] to-[#be185d]" },
};

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
  const activeConfig = productMenuConfig[activeCategory.id] || productMenuConfig["features"];

  return (
    <div
      className="relative"
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href="/product/features"
        className={`cursor-pointer text-sm font-semibold transition-colors hover:text-[#004AC6] flex items-center gap-1 ${
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
            className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[720px] overflow-hidden rounded-2xl border border-[#C3C6D7]/20 bg-white shadow-xl"
          >
            <div className="flex max-h-[min(520px,calc(100vh-120px))]">
              <div className="w-[240px] shrink-0 border-r border-[#C3C6D7]/10 bg-[#F8F9FF] p-2">
                <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-[#737686]">
                  Products
                </p>
                {productCategories.map((cat) => {
                  const config = productMenuConfig[cat.id] || productMenuConfig["features"];
                  const Icon = config.icon;
                  const isSelected = activeCategory.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onMouseEnter={() => handleCategoryEnter(cat)}
                      onClick={() => handleCategoryEnter(cat)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-white text-[#121C28] shadow-sm"
                          : "text-[#434655] hover:bg-white/60 hover:text-[#121C28]"
                      }`}
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors"
                        style={{
                          backgroundColor: isSelected ? config.color : "#EAEDF4",
                          color: isSelected ? "#FFFFFF" : "#737686",
                        }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {cat.title}
                    </button>
                  );
                })}
              </div>
              <div className="min-w-0 flex-1 p-4">
                <div className="relative flex h-full flex-col overflow-hidden rounded-xl bg-[#F1F4FB] p-5">
                  <div
                    className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full opacity-15"
                    style={{ backgroundColor: activeConfig.color }}
                  />
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
                        style={{ backgroundColor: activeConfig.color }}
                      >
                        <activeConfig.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#737686]">Product</p>
                        <h3 className="text-base font-bold leading-tight text-[#121C28]">{activeCategory.title}</h3>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[#434655]">
                      {activeCategory.heroSubtitle || activeCategory.description}
                    </p>
                    <Link
                      href={`/product/${activeCategory.id}`}
                      onClick={() => setOpen(false)}
                      className={`mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${activeConfig.gradient} px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90`}
                    >
                      Explore {activeCategory.title}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {activeCategory.items.map((item) => {
                      const isItemActive = pathname === `/product/${item.slug}`;
                      return (
                        <Link
                          key={item.slug}
                          href={`/product/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 transition-colors ${
                            isItemActive
                              ? "bg-[#EEF4FF]"
                              : "hover:bg-[#F8F9FF]"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: activeConfig.color }} />
                          <span className="truncate text-[13px] font-semibold text-[#434655]">{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                  <Link
                    href={`/product/${activeCategory.id}`}
                    onClick={() => setOpen(false)}
                    className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-semibold text-[#004AC6] transition-colors hover:text-[#003da8]"
                  >
                    View all {activeCategory.title}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const solutionMenuConfig: Record<string, { icon: typeof Code; color: string; gradient: string }> = {
  "engineering-teams": { icon: Code, color: "#2563EB", gradient: "from-[#2563EB] to-[#1d4ed8]" },
  "product-teams": { icon: Route, color: "#7C3AED", gradient: "from-[#7C3AED] to-[#6d28d9]" },
  "it-operations": { icon: Server, color: "#059669", gradient: "from-[#059669] to-[#047857]" },
  "business-leaders": { icon: ChartNoAxesColumn, color: "#D97706", gradient: "from-[#D97706] to-[#b45309]" },
  startups: { icon: Rocket, color: "#DB2777", gradient: "from-[#DB2777] to-[#be185d]" },
};

function SolutionsMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SolutionCategory>(solutionCategories[0]);
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

  function handleCategoryEnter(category: SolutionCategory) {
    setActiveCategory(category);
  }

  const isActive = pathname.startsWith("/solutions");
  const activeConfig = solutionMenuConfig[activeCategory.id] || solutionMenuConfig["engineering-teams"];

  return (
    <div
      className="relative"
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href="/solutions"
        className={`cursor-pointer text-sm font-semibold transition-colors hover:text-[#004AC6] flex items-center gap-1 ${
          isActive ? "text-[#004AC6]" : "text-[#434655]"
        }`}
      >
        Solutions
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </Link>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[680px] overflow-hidden rounded-2xl border border-[#C3C6D7]/20 bg-white shadow-xl"
          >
            <div className="flex">
              <div className="w-[240px] shrink-0 border-r border-[#C3C6D7]/10 bg-[#F8F9FF] p-2">
                <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-[#737686]">
                  Solutions
                </p>
                {solutionCategories.map((cat) => {
                  const config = solutionMenuConfig[cat.id] || solutionMenuConfig["engineering-teams"];
                  const Icon = config.icon;
                  const isSelected = activeCategory.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onMouseEnter={() => handleCategoryEnter(cat)}
                      onClick={() => handleCategoryEnter(cat)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-white text-[#121C28] shadow-sm"
                          : "text-[#434655] hover:bg-white/60 hover:text-[#121C28]"
                      }`}
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors"
                        style={{
                          backgroundColor: isSelected ? config.color : "#EAEDF4",
                          color: isSelected ? "#FFFFFF" : "#737686",
                        }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {cat.title}
                    </button>
                  );
                })}
              </div>
              <div className="flex-1 p-4">
                <div className="relative h-full overflow-hidden rounded-xl bg-[#F1F4FB] p-6">
                  <div
                    className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full opacity-15"
                    style={{ backgroundColor: activeConfig.color }}
                  />
                  <div
                    className="pointer-events-none absolute -right-6 top-8 h-24 w-24 rounded-full opacity-10 blur-sm"
                    style={{ backgroundColor: activeConfig.color }}
                  />
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                        style={{ backgroundColor: activeConfig.color }}
                      >
                        <activeConfig.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#737686]">Best fit for</p>
                        <h3 className="text-lg font-bold leading-tight text-[#121C28]">{activeCategory.title}</h3>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-[#434655]">
                      {activeCategory.heroSubtitle || activeCategory.description}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/solutions/${activeCategory.id}`}
                        onClick={() => setOpen(false)}
                        className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${activeConfig.gradient} px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90`}
                      >
                        Explore {activeCategory.title}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/solutions"
                        onClick={() => setOpen(false)}
                        className="text-sm font-semibold text-[#737686] transition-colors hover:text-[#004AC6]"
                      >
                        View all solutions
                      </Link>
                    </div>
                  </div>
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
  const [solutionsOpen, setSolutionsOpen] = useState(false);

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
            className="flex-1 cursor-pointer rounded-lg bg-[#004AC6] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#003da8]"
          >
            Workspaces
          </button>
          <button
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#C3C6D7]/20 px-4 py-2.5 text-sm font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]"
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
          className="w-full cursor-pointer rounded-lg border border-[#C3C6D7]/20 py-2.5 text-sm font-semibold text-[#434655] transition-colors hover:bg-[#F8F9FF]"
        >
          Sign in
        </button>
        <button
          onClick={() => handleNavigate("/register")}
          className="w-full cursor-pointer rounded-lg bg-[#004AC6] py-2.5 text-sm font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10)] transition-colors hover:bg-[#003da8]"
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
                  className="mb-3 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[#737686] transition-colors hover:text-[#004AC6]"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                  All Products
                </button>
                <div className="mb-3 border-b border-[#C3C6D7]/10 pb-3">
                  <Link
                    href={`/product/${activeCategory.id}`}
                    onClick={close}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-base font-semibold text-[#004AC6] transition-colors hover:bg-[#EEF4FF]"
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
                        className={`flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
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
                    const isCatActive = pathname === `/product/${cat.id}` || cat.items.some(item => pathname === `/product/${item.slug}`);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-3 text-left text-base font-semibold transition-colors ${
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

                  <button
                    onClick={() => setSolutionsOpen(!solutionsOpen)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-3 text-left text-base font-semibold transition-colors ${
                      pathname.startsWith("/solutions")
                        ? "text-[#004AC6] bg-[#EEF4FF]"
                        : "text-[#121C28] hover:bg-[#F8F9FF]"
                    }`}
                  >
                    Solutions
                    <ChevronDown className={`h-4 w-4 text-[#737686] transition-transform ${solutionsOpen ? "rotate-180" : ""}`} />
                  </button>
                  {solutionsOpen && (
                    <div className="ml-4 space-y-0.5 border-l border-[#C3C6D7]/10 pl-3">
                      {solutionCategories.map((cat) => {
                        const isCatActive = pathname === `/solutions/${cat.id}`;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => handleNavigate(`/solutions/${cat.id}`)}
                            className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                              isCatActive
                                ? "text-[#004AC6] bg-[#EEF4FF]"
                                : "text-[#434655] hover:bg-[#F8F9FF]"
                            }`}
                          >
                            {cat.title}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handleNavigate("/solutions")}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-[#737686] transition-colors hover:bg-[#F8F9FF] hover:text-[#004AC6]"
                      >
                        View all solutions
                      </button>
                    </div>
                  )}

                  {[
                    { label: "Pricing", href: "/pricing" },
                    { label: "Docs", href: "/docs" },
                    { label: "Guide", href: "/guide" },
                  ].map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavigate(item.href)}
                        className={`flex w-full cursor-pointer items-center rounded-lg px-3 py-3 text-left text-base font-semibold transition-colors ${
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
            href="/"
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
            <SolutionsMenu />
            {otherNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`cursor-pointer text-sm font-semibold transition-colors hover:text-[#004AC6] ${
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
                <div className="hidden md:block">
                  <NotificationBell limit={4} />
                </div>
                <Link
                  href="/dashboard"
                  className="hidden cursor-pointer rounded-lg bg-[#004AC6] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] transition-all hover:bg-[#003da8] md:block"
                >
                  Workspaces
                </Link>
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    title={user?.name || "User menu"}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#004AC6] text-xs font-bold text-white transition-colors hover:bg-[#003da8]"
                  >
                    {initials}
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
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF] hover:text-[#DC2626]"
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
                  className="cursor-pointer text-sm font-semibold text-[#434655] transition-colors hover:text-[#004AC6]"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="cursor-pointer rounded-lg bg-[#004AC6] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] transition-all hover:bg-[#003da8]"
                >
                  Start free trial
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="relative md:hidden" ref={mobileAvatarRef}>
                <button
                  onClick={() => setMobileAvatarOpen(!mobileAvatarOpen)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#004AC6] text-[10px] font-bold text-white transition-colors hover:bg-[#003da8]"
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
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF] hover:text-[#004AC6]"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Workspaces
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF] hover:text-[#DC2626]"
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
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#434655] transition-colors hover:bg-[#EEF4FF] hover:text-[#004AC6] md:hidden"
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
