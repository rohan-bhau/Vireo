"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={`flex h-8 w-8 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-bg-light hover:text-text ${className ?? ""}`}
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

export function ThemeMenuItems({ onClose }: { onClose?: () => void }) {
  const { theme, setTheme } = useTheme();

  const items = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ];

  return (
    <div className="py-1">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => {
            setTheme(item.value);
            onClose?.();
          }}
          className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors cursor-pointer ${
            theme === item.value
              ? "text-primary font-medium"
              : "text-text-secondary hover:bg-bg-light"
          }`}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </button>
      ))}
    </div>
  );
}
