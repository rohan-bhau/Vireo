"use client";

import { useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation, type Notification } from "@/store/notificationApi";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { SkeletonNotificationItem } from "@/components/ui/skeleton";
import { Bell, CheckCheck, ChevronRight, AtSign, UserPlus, ArrowRightLeft, MessageSquare } from "lucide-react";
import Link from "next/link";

const typeConfig = {
  assigned: { icon: UserPlus, color: "text-[#2563EB] bg-[#EEF4FF]" },
  mentioned: { icon: AtSign, color: "text-[#7C3AED] bg-[#F3EEFF]" },
  status_changed: { icon: ArrowRightLeft, color: "text-[#D97706] bg-[#FFFBEB]" },
  commented: { icon: MessageSquare, color: "text-[#059669] bg-[#ECFDF5]" },
};

function timeAgo(dateStr: string) {
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

function groupByDate(notifications: Notification[]) {
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

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const groups = groupByDate(notifications);

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-[#121C28]">Notifications</h1>
            <p className="mt-0.5 text-sm text-[#737686]">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              isLoading={isMarkingAll}
              onClick={() => markAllRead()}
            >
              <CheckCheck className="mr-1.5 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-1">
            <SkeletonNotificationItem />
            <SkeletonNotificationItem />
            <SkeletonNotificationItem />
            <SkeletonNotificationItem />
            <SkeletonNotificationItem />
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl bg-white p-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF4FF]">
              <Bell className="h-8 w-8 text-[#2563EB]" />
            </div>
            <h2 className="text-lg font-semibold text-[#121C28]">No notifications yet</h2>
            <p className="mt-2 text-sm text-[#737686]">
              Notifications about task assignments, mentions, and status changes will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.label}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#737686]">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.items.map((notification) => {
                    const config = typeConfig[notification.type];
                    const Icon = config.icon;
                    return (
                      <div
                        key={notification._id}
                        className={`group flex items-start gap-3 rounded-xl p-4 transition-colors ${
                          notification.read
                            ? "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                            : "bg-[#EEF4FF] shadow-[0_1px_2px_rgba(37,99,235,0.08)]"
                        }`}
                      >
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
                              {!notification.read && (
                                <button
                                  onClick={() => markRead(notification._id)}
                                  className="flex h-6 w-6 items-center justify-center rounded text-[#737686] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-[#2563EB]"
                                  title="Mark as read"
                                >
                                  <CheckCheck className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/task/${notification.taskId}`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#737686] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-[#2563EB]"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
