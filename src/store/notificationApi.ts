import { api } from "./api";

export type NotificationType = "assigned" | "mentioned" | "status_changed" | "commented";

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  taskId: string;
  taskTitle: string;
  actorId: string;
  actorName: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  status: string;
  data: {
    notifications: Notification[];
    unreadCount: number;
  };
}

interface UnreadCountResponse {
  status: string;
  data: { count: number };
}

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<{ notifications: Notification[]; unreadCount: number }, void>({
      query: () => "/notifications",
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
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
