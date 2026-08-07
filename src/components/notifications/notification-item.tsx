"use client";

import Link from "next/link";
import {
  Bell, CheckCheck, ChevronRight, AtSign, UserPlus,
  ArrowRightLeft, MessageSquare, Plus, RefreshCw, Trash2, Play, CheckSquare,
  UserPlus2, Shield, CalendarClock, PartyPopper,
} from "lucide-react";
import type { Notification, NotificationType } from "@/store/notificationApi";

export const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; label: string }> = {
  assigned: { icon: UserPlus, color: "text-[#2563EB] bg-[#EEF4FF]", label: "Assigned" },
  mentioned: { icon: AtSign, color: "text-[#7C3AED] bg-[#F3EEFF]", label: "Mentioned" },
  status_changed: { icon: ArrowRightLeft, color: "text-[#D97706] bg-[#FFFBEB]", label: "Status changed" },
  commented: { icon: MessageSquare, color: "text-[#059669] bg-[#ECFDF5]", label: "Commented" },
  issue_created: { icon: Plus, color: "text-[#2563EB] bg-[#EEF4FF]", label: "Issue created" },
  issue_updated: { icon: RefreshCw, color: "text-[#737686] bg-[#F5F5F5]", label: "Issue updated" },
  issue_deleted: { icon: Trash2, color: "text-[#EF4444] bg-[#FEF2F2]", label: "Issue deleted" },
  sprint_started: { icon: Play, color: "text-[#059669] bg-[#ECFDF5]", label: "Sprint started" },
  sprint_completed: { icon: CheckSquare, color: "text-[#7C3AED] bg-[#F3EEFF]", label: "Sprint completed" },
  member_added: { icon: UserPlus2, color: "text-[#2563EB] bg-[#EEF4FF]", label: "Member added" },
  role_changed: { icon: RefreshCw, color: "text-[#7C3AED] bg-[#F3EEFF]", label: "Role changed" },
  invited: { icon: UserPlus2, color: "text-[#059669] bg-[#ECFDF5]", label: "Invited" },
  due_date: { icon: CalendarClock, color: "text-[#D97706] bg-[#FFFBEB]", label: "Due date" },
  issue_completed: { icon: PartyPopper, color: "text-[#059669] bg-[#ECFDF5]", label: "Completed" },
};

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function groupByDate(notifications: Notification[]) {
  const groups: { label: string; items: Notification[] }[] = [];
  let currentLabel = "";
  let currentItems: Notification[] = [];

  for (const n of notifications) {
    const date = new Date(n.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    let label: string;
    if (diffDays === 0) label = "Today";
    else if (diffDays === 1) label = "Yesterday";
    else if (diffDays < 7) label = "This week";
    else label = "Earlier";

    if (label !== currentLabel) {
      if (currentItems.length) groups.push({ label: currentLabel, items: currentItems });
      currentLabel = label;
      currentItems = [];
    }
    currentItems.push(n);
  }
  if (currentItems.length) groups.push({ label: currentLabel, items: currentItems });
  return groups;
}

export interface NotificationItemProps {
  notification: Notification;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
}

export function NotificationItem({
  notification,
  selected,
  onSelect,
  onMarkRead,
  onMarkUnread,
}: NotificationItemProps) {
  const config = typeConfig[notification.type] || typeConfig.assigned;
  const Icon = config.icon;

  return (
    <div
      className={`group flex items-start gap-3 rounded-xl p-4 transition-colors ${
        notification.read
          ? "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          : "bg-[#EEF4FF] shadow-[0_1px_2px_rgba(37,99,235,0.08)]"
      } ${selected ? "ring-2 ring-[#2563EB]" : ""}`}
    >
      {onSelect && (
        <div className="flex h-9 items-center shrink-0">
          <input
            type="checkbox"
            checked={!!selected}
            onChange={(e) => onSelect(notification._id, e.target.checked)}
            className="h-4 w-4 rounded border-[#C3C6D7] text-[#2563EB] focus:ring-[#2563EB]"
          />
        </div>
      )}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm text-[#434655]">
              <span className="font-semibold text-[#121C28]">{notification.actorName}</span>{" "}
              {notification.message}
            </p>
            <p className="mt-0.5 text-xs text-[#737686] line-clamp-1">
              {notification.taskTitle}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[#737686] whitespace-nowrap">
              {timeAgo(notification.createdAt)}
            </span>
            {!notification.read && onMarkRead ? (
              <button
                onClick={() => onMarkRead(notification._id)}
                className="flex h-6 w-6 items-center justify-center rounded text-[#737686] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-[#2563EB]"
                title="Mark as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </button>
            ) : onMarkUnread ? (
              <button
                onClick={() => onMarkUnread(notification._id)}
                className="flex h-6 w-6 items-center justify-center rounded text-[#737686] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-[#7C3AED]"
                title="Mark as unread"
              >
                <span className="h-2 w-2 rounded-full border border-current" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <Link
        href={notification.taskId ? `/task/${notification.taskId}` : notification.workspaceId ? `/w/${notification.workspaceId}` : "#"}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#737686] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-[#2563EB]"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
