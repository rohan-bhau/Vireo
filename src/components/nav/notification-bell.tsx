"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useGetUnreadCountQuery, useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from "@/store/notificationApi";
import { Bell } from "lucide-react";
import { clsx } from "clsx";

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function NotificationBell() {
  const { data: unreadCount = 0 } = useGetUnreadCountQuery();
  const { data: notifData } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const notifications = notifData?.notifications ?? [];
  const hasUnread = unreadCount > 0;

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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-bg-light hover:text-text"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-[3px] border border-border-light bg-surface shadow-dropdown z-50">
          <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
            <p className="text-sm font-semibold text-text">
              Notifications
            </p>
            {hasUnread && (
              <button
                onClick={() => markAllRead()}
                className="text-xs font-medium text-[#2563EB] hover:text-[#1d4ed8] transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <Bell className="h-8 w-8 text-text-tertiary mb-2" />
                <p className="text-sm text-text-tertiary">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.slice(0, 20).map((notif) => (
                <Link
                  key={notif._id}
                  href={`/task/${notif.taskId}`}
                  onClick={() => {
                    if (!notif.read) markRead(notif._id);
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex items-start gap-3 border-b border-border-light px-4 py-3 transition-colors hover:bg-bg-light",
                    !notif.read && "bg-[#F0F7FF]"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text">
                      <span className="font-semibold">{notif.actorName}</span>{" "}
                      {notif.message}
                    </p>
                    <p className="mt-0.5 text-xs text-text-tertiary">
                      {timeAgo(new Date(notif.createdAt))}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" />
                  )}
                </Link>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-border-light px-4 py-2">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-medium text-[#2563EB] hover:text-[#1d4ed8] transition-colors"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
