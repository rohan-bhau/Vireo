"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "vireo_theme";

/**
 * Dark theme is only applied on the authenticated app area (dashboard,
 * workspaces, projects, etc.). The public marketing pages keep the light
 * design regardless of the user's theme preference.
 */
function isAppRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  const p = pathname;
  return (
    p === "/dashboard" ||
    p.startsWith("/dashboard/") ||
    p === "/w" ||
    p.startsWith("/w/") ||
    p === "/projects" ||
    p.startsWith("/projects/") ||
    p === "/workspaces" ||
    p.startsWith("/workspaces/") ||
    p === "/task" ||
    p.startsWith("/task/") ||
    p === "/search" ||
    p.startsWith("/search/") ||
    p === "/profile" ||
    p.startsWith("/profile/") ||
    p.startsWith("/ai-assistant") ||
    p === "/admin" ||
    p.startsWith("/admin/") ||
    p === "/notifications" ||
    p.startsWith("/notifications/")
  );
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme;
}

/**
 * Applies the theme to the document root and returns the effective
 * (actually visible) theme, which is always "light" on public pages.
 */
function applyTheme(resolved: "light" | "dark", appRoute: boolean): "light" | "dark" {
  const effective = appRoute ? resolved : "light";
  const html = document.documentElement;
  if (effective === "dark") {
    html.setAttribute("data-theme", "dark");
    html.classList.add("dark");
  } else {
    html.setAttribute("data-theme", "light");
    html.classList.remove("dark");
  }
  return effective;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setResolvedTheme(applyTheme(resolveTheme(theme), isAppRoute(pathname)));
  }, [theme, pathname]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      setResolvedTheme(applyTheme(getSystemTheme(), isAppRoute(pathname)));
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, pathname]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}