import { api } from "./api";

export type NotificationType =
  | "assigned"
  | "mentioned"
  | "status_changed"
  | "commented"
  | "issue_created"
  | "issue_updated"
  | "issue_deleted"
  | "sprint_started"
  | "sprint_completed"
  | "member_added"
  | "role_changed"
  | "invited"
  | "due_date"
  | "issue_completed";

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  taskId?: string;
  taskTitle?: string;
  actorId: string;
  actorName: string;
  message: string;
  read: boolean;
  projectId?: string;
  workspaceId?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  onAssigned: boolean;
  onMentioned: boolean;
  onStatusChange: boolean;
  onCommented: boolean;
  onIssueCreated: boolean;
  onSprintEvents: boolean;
}

export interface ProjectNotificationOverride {
  projectId: string;
  email: boolean;
  onAssigned: boolean;
  onMentioned: boolean;
  onStatusChange: boolean;
  onCommented: boolean;
  onIssueCreated: boolean;
  onSprintEvents: boolean;
}

interface NotificationsResponse {
  status: string;
  data: {
    notifications: Notification[];
    total: number;
    unreadCount: number;
  };
}

interface UnreadCountResponse {
  status: string;
  data: { count: number };
}

interface NotificationPreferencesResponse {
  status: string;
  data: {
    preferences: NotificationPreferences;
    projectOverrides: ProjectNotificationOverride[];
  };
}

interface ProjectOverridesResponse {
  status: string;
  data: { projectOverrides: ProjectNotificationOverride[] };
}

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      { notifications: Notification[]; total: number; unreadCount: number },
      { type?: string; projectId?: string; read?: boolean; limit?: number; offset?: number } | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params.type) searchParams.set("type", params.type);
          if (params.projectId) searchParams.set("projectId", params.projectId);
          if (params.read !== undefined) searchParams.set("read", String(params.read));
          if (params.limit) searchParams.set("limit", String(params.limit));
          if (params.offset) searchParams.set("offset", String(params.offset));
        }
        const qs = searchParams.toString();
        return `/notifications${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: NotificationsResponse) => response.data,
      providesTags: ["Notifications"],
    }),
    getUnreadCount: builder.query<number, void>({
      query: () => "/notifications/unread-count",
      transformResponse: (response: UnreadCountResponse) => response.data.count,
      providesTags: ["Notifications"],
    }),
    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markNotificationUnread: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/unread`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
    getNotificationPreferences: builder.query<{
      preferences: NotificationPreferences;
      projectOverrides: ProjectNotificationOverride[];
    }, void>({
      query: () => "/notification-preferences",
      transformResponse: (response: NotificationPreferencesResponse) => response.data,
      providesTags: ["NotificationPreferences"],
    }),
    updateNotificationPreferences: builder.mutation<
      { preferences: NotificationPreferences; projectOverrides: ProjectNotificationOverride[] },
      Partial<NotificationPreferences>
    >({
      query: (body) => ({
        url: "/notification-preferences",
        method: "PUT",
        body,
      }),
      transformResponse: (response: NotificationPreferencesResponse) => response.data,
      invalidatesTags: ["NotificationPreferences"],
    }),
    updateProjectNotificationOverride: builder.mutation<
      { projectOverrides: ProjectNotificationOverride[] },
      { projectId: string; overrides: Partial<ProjectNotificationOverride> }
    >({
      query: ({ projectId, overrides }) => ({
        url: `/notification-preferences/project/${projectId}`,
        method: "PUT",
        body: overrides,
      }),
      transformResponse: (response: ProjectOverridesResponse) => response.data,
      invalidatesTags: ["NotificationPreferences"],
    }),
    removeProjectNotificationOverride: builder.mutation<
      { projectOverrides: ProjectNotificationOverride[] },
      string
    >({
      query: (projectId) => ({
        url: `/notification-preferences/project/${projectId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ProjectOverridesResponse) => response.data,
      invalidatesTags: ["NotificationPreferences"],
    }),
    getWorkspaceNotificationPreference: builder.query<{ events: string[] }, string>({
      query: (workspaceId) => `/notification-preferences/workspace/${workspaceId}`,
      transformResponse: (response: { data: { events: string[] } }) => response.data,
      providesTags: ["NotificationPreferences"],
    }),
    updateWorkspaceNotificationPreference: builder.mutation<
      { events: string[] },
      { workspaceId: string; events: string[] }
    >({
      query: ({ workspaceId, events }) => ({
        url: `/notification-preferences/workspace/${workspaceId}`,
        method: "PUT",
        body: { events },
      }),
      transformResponse: (response: { data: { events: string[] } }) => response.data,
      invalidatesTags: ["NotificationPreferences"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkNotificationUnreadMutation,
  useMarkAllNotificationsReadMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useUpdateProjectNotificationOverrideMutation,
  useRemoveProjectNotificationOverrideMutation,
  useGetWorkspaceNotificationPreferenceQuery,
  useUpdateWorkspaceNotificationPreferenceMutation,
} = notificationApi;
