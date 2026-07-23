"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { useLogoutMutation } from "@/store/authApi";
import { logout } from "@/store/authSlice";
import { clearTokens } from "@/lib/auth";
import { User, Settings, LogOut } from "lucide-react";
import { ThemeMenuItems } from "@/components/theme/theme-toggle";

export function UserAvatarMenu() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [doLogout] = useLogoutMutation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function handleLogout() {
    try {
      await doLogout();
    } catch {}
    clearTokens();
    dispatch(logout());
    router.replace("/login");
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-primary text-[10px] md:text-xs font-bold text-white hover:bg-primary-dark transition-colors"
        title={user?.name || "User menu"}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-[3px] border border-border-light bg-surface shadow-dropdown z-50">
          <div className="border-b border-border-light px-4 py-3">
            <p className="text-sm font-semibold text-text">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-text-tertiary truncate">
              {user?.email || ""}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-light transition-colors cursor-pointer"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
          </div>

          <div className="border-t border-border-light">
            <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              Theme
            </div>
            <ThemeMenuItems onClose={() => setOpen(false)} />
          </div>

          <div className="border-t border-border-light py-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
