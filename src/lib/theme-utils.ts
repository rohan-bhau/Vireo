import {
  Bug,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Code2,
  Layers,
  ListTodo,
  LucideIcon,
} from "lucide-react";

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface TokenMap<T> {
  [key: string]: T;
}

export const issueTypeIcons: TokenMap<LucideIcon> = {
  epic: Layers,
  story: Code2,
  task: ListTodo,
  bug: Bug,
  subtask: CircleDot,
};

export const issueTypeLabels: TokenMap<string> = {
  epic: "Epic",
  story: "Story",
  task: "Task",
  bug: "Bug",
  subtask: "Sub-task",
};

export const issueTypeColors: TokenMap<string> = {
  epic: "var(--color-issue-epic)",
  story: "var(--color-issue-story)",
  task: "var(--color-issue-task)",
  bug: "var(--color-issue-bug)",
  subtask: "var(--color-issue-subtask)",
};

export interface PriorityConfig {
  icon: LucideIcon;
  label: string;
  color: string;
}

export const priorityMap: TokenMap<PriorityConfig> = {
  highest: {
    icon: ChevronUp as unknown as LucideIcon,
    label: "Highest",
    color: "var(--color-priority-highest)",
  },
  high: {
    icon: ChevronUp as unknown as LucideIcon,
    label: "High",
    color: "var(--color-priority-high)",
  },
  medium: {
    icon: ChevronDown as unknown as LucideIcon,
    label: "Medium",
    color: "var(--color-priority-medium)",
  },
  low: {
    icon: ChevronDown as unknown as LucideIcon,
    label: "Low",
    color: "var(--color-priority-low)",
  },
  lowest: {
    icon: ChevronDown as unknown as LucideIcon,
    label: "Lowest",
    color: "var(--color-priority-lowest)",
  },
};

export const statusColors: TokenMap<string> = {
  "to-do": "var(--color-text-tertiary)",
  "in-progress": "var(--color-warning)",
  "in-review": "var(--color-primary-default)",
  done: "var(--color-success)",
  cancelled: "var(--color-danger)",
};

export const statusLabels: TokenMap<string> = {
  "to-do": "To Do",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done",
  cancelled: "Cancelled",
};
