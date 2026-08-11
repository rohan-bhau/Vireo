import {
  Settings2,
  Users,
  ShieldCheck,
  Bell,
  Tag,
  GitBranch,
  List,
  Shield,
  Package,
  Puzzle,
  Zap,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export type SettingsSection =
  | "details"
  | "people"
  | "permissions"
  | "notifications"
  | "issue-types"
  | "workflows"
  | "fields"
  | "roles"
  | "versions"
  | "components"
  | "automation"
  | "billing";

export interface SettingsNavItem {
  id: SettingsSection;
  label: string;
  icon: LucideIcon;
}

export const settingsNavItems: SettingsNavItem[] = [
  { id: "details", label: "Details", icon: Settings2 },
  { id: "people", label: "People / Access", icon: Users },
  { id: "permissions", label: "Permissions", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "issue-types", label: "Issue types", icon: Tag },
  { id: "workflows", label: "Workflows", icon: GitBranch },
  { id: "fields", label: "Fields", icon: List },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "versions", label: "Versions", icon: Package },
  { id: "components", label: "Components", icon: Puzzle },
  { id: "automation", label: "Automation", icon: Zap },
  { id: "billing", label: "Billing & Plan", icon: CreditCard },
];