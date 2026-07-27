"use client";

import { useState, useEffect, useRef } from "react";
import { NotificationItem, groupByDate } from "./notification-item";
import type { Notification } from "@/store/notificationApi";
import { Bell, CheckCheck, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkeletonNotificationItem } from "@/components/ui/skeleton";

export interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  total: number;
  loadedCount: number;
  hasMore: boolean;
  onLoadMore: () => void;
  onMarkRead: (id: string) => void;
  onMarkUnread: (id: string) => void;
  onMarkAllRead: () => void;
  onBulkMarkRead: (ids: string[]) => void;
  onBulkMarkUnread: (ids: string[]) => void;
  unreadCount: number;
  filterTab: string;
  typeFilter?: string;
}

export function NotificationList({
  notifications,
  isLoading,
  total,
  loadedCount,
  hasMore,
  onLoadMore,
  onMarkRead,
  onMarkUnread,
  onMarkAllRead,
  onBulkMarkRead,
  onBulkMarkUnread,
  unreadCount,
  filterTab,
  typeFilter,
}: NotificationListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const groups = groupByDate(notifications);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  useEffect(() => {
    setSelected(new Set());
  }, [filterTab, typeFilter]);

  function handleSelect(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleSelectAll() {
    if (selected.size === notifications.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(notifications.map((n) => n._id)));
    }
  }

  function handleBulkMarkRead() {
    onBulkMarkRead(Array.from(selected));
    setSelected(new Set());
    setBulkMode(false);
  }

  function handleBulkMarkUnread() {
    onBulkMarkUnread(Array.from(selected));
    setSelected(new Set());
    setBulkMode(false);
  }

  if (isLoading && notifications.length === 0) {
    return (
      <div className="space-y-1">
        <SkeletonNotificationItem />
        <SkeletonNotificationItem />
        <SkeletonNotificationItem />
        <SkeletonNotificationItem />
        <SkeletonNotificationItem />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl bg-white p-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF4FF]">
          <Bell className="h-8 w-8 text-[#2563EB]" />
        </div>
        <h2 className="text-lg font-semibold text-[#121C28]">
          {filterTab !== "all" || typeFilter ? "No matching notifications" : "No notifications yet"}
        </h2>
        <p className="mt-2 text-sm text-[#737686]">
          {filterTab !== "all" || typeFilter
            ? "Try changing your filters to see more notifications."
            : "Notifications about task assignments, mentions, and status changes will appear here."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setBulkMode(!bulkMode); setSelected(new Set()); }}
            className={`flex items-center gap-1.5 rounded-[3px] px-2.5 py-1.5 text-xs font-medium transition-colors ${
              bulkMode
                ? "bg-[#2563EB] text-white"
                : "bg-bg-light text-text-secondary hover:bg-border-light"
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Select
          </button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllRead}
            >
              <CheckCheck className="mr-1.5 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
        <span className="text-xs text-text-placeholder">
          {loadedCount < total ? `${loadedCount} of ${total}` : `${total} notification${total !== 1 ? "s" : ""}`}
        </span>
      </div>

      {bulkMode && (
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-bg-light px-4 py-2">
          <input
            type="checkbox"
            checked={selected.size === notifications.length && notifications.length > 0}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-[#C3C6D7] text-[#2563EB] focus:ring-[#2563EB]"
          />
          <span className="text-xs text-text-secondary">
            {selected.size > 0 ? `${selected.size} selected` : "Select all"}
          </span>
          {selected.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleBulkMarkRead}
                className="rounded-[3px] bg-[#2563EB] px-3 py-1 text-xs font-medium text-white hover:bg-[#1d4ed8]"
              >
                Mark read
              </button>
              <button
                onClick={handleBulkMarkUnread}
                className="rounded-[3px] border border-border-light bg-surface px-3 py-1 text-xs font-medium text-text-secondary hover:bg-bg-light"
              >
                Mark unread
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#737686]">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  selected={selected.has(notification._id)}
                  onSelect={bulkMode ? handleSelect : undefined}
                  onMarkRead={onMarkRead}
                  onMarkUnread={onMarkUnread}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
        </div>
      )}

      {!hasMore && notifications.length >= 50 && (
        <p className="mt-6 text-center text-xs text-text-placeholder">
          All notifications loaded
        </p>
      )}
    </div>
  );
}
