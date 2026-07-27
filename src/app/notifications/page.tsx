"use client";

import { useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkNotificationUnreadMutation,
  useMarkAllNotificationsReadMutation,
} from "@/store/notificationApi";
import { useGetWorkspaceProjectsQuery } from "@/store/projectApi";
import { AppLayout } from "@/components/layout/app-layout";
import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationFilters, type FilterTab } from "@/components/notifications/notification-filters";
import type { NotificationType } from "@/store/notificationApi";

const PAGE_SIZE = 50;

export default function NotificationsPage() {
  const workspaceId = useSelector((state: RootState) => state.workspace.activeWorkspaceId);
  const { data: projects } = useGetWorkspaceProjectsQuery(workspaceId || "", { skip: !workspaceId });

  const [filters, setFilters] = useState({
    filterTab: "all" as FilterTab,
    typeFilter: "" as NotificationType | "",
    projectFilter: "",
  });

  const [offset, setOffset] = useState(0);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);

  const queryParams = useMemo(() => {
    const params: any = { limit: PAGE_SIZE, offset: 0 };
    if (filters.filterTab === "unread") params.read = false;
    if (filters.filterTab === "read") params.read = true;
    if (filters.typeFilter) params.type = filters.typeFilter;
    if (filters.projectFilter) params.projectId = filters.projectFilter;
    return params;
  }, [filters]);

  const { data, isLoading } = useGetNotificationsQuery(queryParams);
  const [markRead] = useMarkNotificationReadMutation();
  const [markUnread] = useMarkNotificationUnreadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  const notifications = data?.notifications || [];
  const total = data?.total || 0;
  const unreadCount = data?.unreadCount || 0;

  const handleLoadMore = useCallback(() => {
    setOffset((prev) => prev + PAGE_SIZE);
  }, []);

  function handleBulkMarkRead(ids: string[]) {
    ids.forEach((id) => markRead(id));
  }

  function handleBulkMarkUnread(ids: string[]) {
    ids.forEach((id) => markUnread(id));
  }

  const projectOptions = useMemo(() => {
    if (!projects) return undefined;
    return projects.map((p) => ({ id: p.id, name: p.name, key: p.key }));
  }, [projects]);

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-[#121C28]">Notifications</h1>
            <p className="mt-0.5 text-sm text-[#737686]">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
          </div>
        </div>

        <NotificationFilters
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            setOffset(0);
          }}
          projects={projectOptions}
        />

        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          total={total}
          loadedCount={notifications.length}
          hasMore={notifications.length < total}
          onLoadMore={handleLoadMore}
          onMarkRead={(id) => markRead(id)}
          onMarkUnread={(id) => markUnread(id)}
          onMarkAllRead={() => markAllRead()}
          onBulkMarkRead={handleBulkMarkRead}
          onBulkMarkUnread={handleBulkMarkUnread}
          unreadCount={unreadCount}
          filterTab={filters.filterTab}
          typeFilter={filters.typeFilter}
        />
      </div>
    </AppLayout>
  );
}
