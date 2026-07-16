"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { AppNavbar } from "./app-navbar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { AuthGuard } from "@/components/auth/auth-guard";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { X } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  sidebarProps?: {
    workspaceId?: string;
    workspaceName?: string;
  };
}

function MobileSidebarDrawer({
  open,
  onClose,
  workspaceId,
  workspaceName,
}: {
  open: boolean;
  onClose: () => void;
  workspaceId?: string;
  workspaceName?: string;
}) {
  const drawerX = useMotionValue(0);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleDragEnd(_: any, info: any) {
    if (info.offset.x < -80) {
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x: drawerX }}
            className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-white shadow-xl md:hidden"
          >
            <div className="flex h-14 items-center justify-between border-b border-[#C3C6D7]/20 px-4">
              <span className="text-sm font-bold text-[#121C28]">Vireo</span>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#737686] hover:bg-[#F8F9FF] transition-colors"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                workspaceId={workspaceId}
                workspaceName={workspaceName}
                onNavigate={onClose}
                embedded
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function AppLayout({ children, sidebarProps }: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-[#F8F9FF]">
        <AppNavbar onMobileMenuToggle={handleMobileMenuToggle} />
        <div className="flex flex-1 min-h-0">
          <div className="hidden md:flex">
            <Sidebar
              workspaceId={sidebarProps?.workspaceId}
              workspaceName={sidebarProps?.workspaceName}
            />
          </div>
          <main className="flex-1 overflow-y-auto min-w-0 pb-16 md:pb-0 px-3 py-4 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav />
      <MobileSidebarDrawer
        open={mobileSidebarOpen}
        onClose={handleMobileMenuClose}
        workspaceId={sidebarProps?.workspaceId}
        workspaceName={sidebarProps?.workspaceName}
      />
    </AuthGuard>
  );
}
