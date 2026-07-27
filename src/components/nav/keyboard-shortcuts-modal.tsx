"use client";

import { Dialog } from "@/components/ui/dialog";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Shortcut[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["/"], description: "Focus global search" },
      { keys: ["G", "D"], description: "Go to Dashboard" },
      { keys: ["G", "P"], description: "Go to Projects" },
      { keys: ["G", "I"], description: "Go to Issues / Issue Navigator" },
      { keys: ["G", "B"], description: "Go to Board" },
      { keys: ["G", "A"], description: "Go to Backlog" },
      { keys: ["G", "R"], description: "Go to Reports" },
      { keys: ["G", "T"], description: "Go to Timeline" },
      { keys: ["J"], description: "Navigate down in list" },
      { keys: ["K"], description: "Navigate up in list" },
      { keys: ["N"], description: "Next issue (detail view)" },
      { keys: ["P"], description: "Previous issue (detail view)" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["C"], description: "Create issue" },
      { keys: ["M"], description: "Open status transitions" },
      { keys: ["E"], description: "Edit summary (inline)" },
      { keys: ["A"], description: "Open assignee picker" },
      { keys: ["."], description: "Open priority dropdown" },
      { keys: ["Shift", "I"], description: "Open labels" },
      { keys: ["S"], description: "Focus JQL search (search page)" },
    ],
  },
  {
    title: "Issue Detail",
    shortcuts: [
      { keys: ["Shift", "F"], description: "Focus comment input" },
      { keys: ["Ctrl", "Enter"], description: "Submit comment" },
    ],
  },
  {
    title: "Modals & UI",
    shortcuts: [
      { keys: ["?"], description: "Open keyboard shortcuts" },
      { keys: ["."], description: "Open keyboard shortcuts" },
      { keys: ["Shift", "/"], description: "Open keyboard shortcuts" },
      { keys: ["Escape"], description: "Close modal / panel / dropdown" },
      { keys: ["Shift", "A"], description: "Toggle AI assistant" },
    ],
  },
];

function Kbd({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        <span key={i} className="flex items-center gap-0.5">
          <kbd className="inline-flex min-w-[22px] items-center justify-center rounded-[3px] border border-border-light bg-bg-light px-1.5 py-0.5 text-[11px] font-medium text-text-secondary font-mono">
            {key === " " ? "Space" : key}
          </kbd>
          {i < keys.length - 1 && (
            <span className="text-text-tertiary text-[10px] mx-0.5">+</span>
          )}
        </span>
      ))}
    </div>
  );
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
        {shortcutGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              {group.title}
            </p>
            <div className="space-y-2">
              {group.shortcuts.map((shortcut) => (
                <div
                  key={shortcut.keys.join("+")}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-sm text-text-secondary">
                    {shortcut.description}
                  </span>
                  <Kbd keys={shortcut.keys} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
