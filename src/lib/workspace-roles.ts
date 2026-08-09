import type { Role, WorkspaceMember } from "@/store/workspaceApi";

export type AssignableRole = "ADMIN" | "EDIT" | "VIEW";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  EDIT: "Edit",
  VIEW: "View",
};

export const ROLE_BADGE: Record<Role, string> = {
  ADMIN: "bg-primary-bg text-primary",
  EDIT: "bg-bg-light text-text-secondary",
  VIEW: "bg-[#F5F3FF] text-[#6D28D9]",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN:
    "Full workspace management: settings, members, invites. Cannot delete the workspace or change the owner's role.",
  EDIT:
    "Can create, edit, update, and delete tasks they created across projects. No access to workspace settings or member management.",
  VIEW:
    "Read-only access. Can view boards, tasks, and comments but cannot modify anything.",
};

export const OWNER_DESCRIPTION =
  "Full control: settings, members, invites, workspace deletion, and transferring ownership. Set automatically to the workspace creator — it cannot be changed or removed by an Admin.";

export const SYSTEM_ROLES: {
  id: "OWNER" | Role;
  label: string;
  description: string;
  badge: string;
}[] = [
  {
    id: "OWNER",
    label: "Owner",
    description: OWNER_DESCRIPTION,
    badge: "bg-[#F0FDF4] text-[#15803D]",
  },
  {
    id: "ADMIN",
    label: ROLE_LABELS.ADMIN,
    description: ROLE_DESCRIPTIONS.ADMIN,
    badge: ROLE_BADGE.ADMIN,
  },
  {
    id: "EDIT",
    label: ROLE_LABELS.EDIT,
    description: ROLE_DESCRIPTIONS.EDIT,
    badge: ROLE_BADGE.EDIT,
  },
  {
    id: "VIEW",
    label: ROLE_LABELS.VIEW,
    description: ROLE_DESCRIPTIONS.VIEW,
    badge: ROLE_BADGE.VIEW,
  },
];

export type MatrixCell = "Yes" | "No" | "Own only";

export const ROLE_MATRIX: {
  action: string;
  owner: MatrixCell;
  admin: MatrixCell;
  edit: MatrixCell;
  view: MatrixCell;
}[] = [
  { action: "Delete workspace", owner: "Yes", admin: "No", edit: "No", view: "No" },
  { action: "Transfer / change owner", owner: "Yes", admin: "No", edit: "No", view: "No" },
  { action: "Edit workspace settings", owner: "Yes", admin: "Yes", edit: "No", view: "No" },
  {
    action: "Invite / remove members, change roles",
    owner: "Yes",
    admin: "Yes",
    edit: "No",
    view: "No",
  },
  { action: "Create tasks", owner: "Yes", admin: "Yes", edit: "Yes", view: "No" },
  {
    action: "Edit / update / delete a task",
    owner: "Yes",
    admin: "Yes",
    edit: "Own only",
    view: "No",
  },
  {
    action: "View boards, tasks, comments",
    owner: "Yes",
    admin: "Yes",
    edit: "Yes",
    view: "Yes",
  },
  { action: "Comment on tasks", owner: "Yes", admin: "Yes", edit: "Yes", view: "No" },
];

export function canManageMember(
  member: Pick<WorkspaceMember, "userId" | "role">,
  ctx: { currentUserId?: string; ownerId?: string; isAdmin: boolean; isOwner: boolean }
): boolean {
  if (member.userId === ctx.currentUserId) return false;
  if (member.userId === ctx.ownerId) return false;
  if (!ctx.isAdmin) return false;
  if (member.role === "ADMIN" && !ctx.isOwner) return false;
  return true;
}

export function roleModalOptions(
  member: Pick<WorkspaceMember, "role">,
  isOwner: boolean
): Role[] {
  if (isOwner) return ["ADMIN", "EDIT", "VIEW"];
  return ["EDIT", "VIEW"];
}