"use client";

import { useEffect, useCallback } from "react";
import { Dialog } from "@/components/ui/dialog";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const shortcutGroups = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["/"], description: "Focus search bar" },
      { keys: ["G", "D"], description: "Go to Dashboard" },
      { keys: ["G", "P"], description: "Go to Projects" },
      { keys: ["G", "I"], description: "Go to Issues" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["C"], description: "Create issue" },
      { keys: ["M"], description: "Toggle sidebar" },
      { keys: [","], description: "Open settings" },
    ],
  },
  {
    title: "Modals",
    shortcuts: [
      { keys: ["?"], description: "Open this help" },
      { keys: ["Escape"], description: "Close dialog / Cancel" },
      { keys: ["Enter"], description: "Submit form" },
    ],
  },
];

export function KeyboardShortcutsModal({
  open,
  onClose,
}: KeyboardShortcutsModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "?" && !open) {
        return;
      }
    },
    [open]
  );

  useEffect(() => {
    if (open) {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }
  }, [open, onClose]);

  return (
    <Dialog open={open} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-6">
        {shortcutGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              {group.title}
            </p>
            <div className="space-y-2">
              {group.shortcuts.map((shortcut) => (
                <div
                  key={shortcut.keys.join("+")}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-text-secondary">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key) => (
                      <kbd
                        key={key}
                        className="inline-flex min-w-[22px] items-center justify-center rounded-[3px] border border-border-light bg-bg-light px-1.5 py-0.5 text-[11px] font-medium text-text-secondary"
                      >
                        {key === " " ? "Space" : key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
