"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { AppNavbar } from "./app-navbar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { AuthGuard } from "@/components/auth/auth-guard";
import { NotificationListener } from "@/components/notifications/notification-listener";
import { WorkspaceListener } from "@/components/notifications/workspace-listener";
import { AIChatPanel } from "@/components/ai/ai-chat-panel";
import { ErrorBoundary } from "./error-boundary";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { X } from "lucide-react";
import { useHotkey, useHotkeySequence } from "@/hooks/use-hotkeys";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { toggleSidebar } from "@/store/sidebarSlice";

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
            className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-surface shadow-xl md:hidden"
          >
            <div className="flex h-14 items-center justify-between border-b border-border-light px-4">
              <span className="text-sm font-bold text-text">Vireo</span>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-bg-light transition-colors"
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
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleMobileMenuToggle = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  const handleToggleChat = useCallback(() => {
    setChatPanelOpen((prev) => !prev);
  }, []);

  // Global keyboard shortcuts
  useHotkey("c", () => {
    const tag = document.activeElement?.tagName;
    if (tag !== "INPUT" && tag !== "TEXTAREA") {
      document.dispatchEvent(new CustomEvent("vireo:create-issue"));
    }
  });

  // N/P - next/previous issue navigation (ignored while typing in inputs)
  useHotkey("n", () => {
    document.dispatchEvent(new CustomEvent("vireo:next-issue"));
  });

  useHotkey("p", () => {
    document.dispatchEvent(new CustomEvent("vireo:prev-issue"));
  });

  // G+ sequence shortcuts
  useHotkeySequence(["g", "d"], () => router.push("/dashboard"));
  useHotkeySequence(["g", "p"], () => router.push("/projects"));
  useHotkeySequence(["g", "i"], () => router.push("/search"));
  useHotkeySequence(["g", "b"], () => {
    if (sidebarProps?.workspaceId) {
      router.push(`/w/${sidebarProps.workspaceId}/board`);
    }
  });
  useHotkeySequence(["g", "a"], () => {
    if (sidebarProps?.workspaceId) {
      router.push(`/w/${sidebarProps.workspaceId}/backlog`);
    }
  });
  useHotkeySequence(["g", "r"], () => {
    if (sidebarProps?.workspaceId) {
      router.push(`/w/${sidebarProps.workspaceId}/reports`);
    }
  });
  useHotkeySequence(["g", "t"], () => {
    if (sidebarProps?.workspaceId) {
      router.push(`/w/${sidebarProps.workspaceId}/timeline`);
    }
  });

  useEffect(() => {
    function handleShiftA(e: KeyboardEvent) {
      if (e.shiftKey && e.key === "A" && !e.metaKey && !e.ctrlKey) {
        const tag = document.activeElement?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          setChatPanelOpen((prev) => !prev);
        }
      }
    }
    document.addEventListener("keydown", handleShiftA);
    return () => document.removeEventListener("keydown", handleShiftA);
  }, []);

  return (
    <AuthGuard>
      <NotificationListener />
      <WorkspaceListener />
      <div className="flex min-h-screen flex-col bg-bg-light">
        <AppNavbar onMobileMenuToggle={handleMobileMenuToggle} onToggleChat={handleToggleChat} />
        <div className="flex flex-1 min-h-0">
          <div className="hidden md:flex">
            <Sidebar
              workspaceId={sidebarProps?.workspaceId}
              workspaceName={sidebarProps?.workspaceName}
            />
          </div>
          <main className="flex-1 overflow-y-auto min-w-0 px-3 pt-4 pb-10 md:px-8 md:py-8 md:pb-12">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <AIChatPanel
        open={chatPanelOpen}
        onClose={() => setChatPanelOpen(false)}
        context={sidebarProps?.workspaceId ? { workspaceId: sidebarProps.workspaceId } : undefined}
      />
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
