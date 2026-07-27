import { api } from "./api";

export type NotificationEvent =
  | "issue_created"
  | "issue_updated"
  | "issue_assigned"
  | "issue_commented"
  | "issue_transitioned"
  | "issue_deleted"
  | "sprint_started"
  | "sprint_completed"
  | "mentioned";

export type RecipientType =
  | "reporter"
  | "assignee"
  | "watchers"
  | "project_lead"
  | "all_project_members"
  | "custom_role";

export interface NotificationSchemeEvent {
  event: NotificationEvent;
  recipients: RecipientType[];
  email: boolean;
  inApp: boolean;
}

export interface NotificationScheme {
  _id: string;
  name: string;
  workspaceId: string;
  description?: string;
  default: boolean;
  events: NotificationSchemeEvent[];
  createdAt: string;
  updatedAt: string;
}

export const notificationSchemeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaceNotificationSchemes: builder.query<NotificationScheme[], string>({
      query: (workspaceId) => `/notification-schemes/workspace/${workspaceId}`,
      transformResponse: (response: any) => response.data.schemes,
      providesTags: (result, error, workspaceId) => [{ type: "NotificationScheme", id: `workspace-${workspaceId}` }],
    }),
    getNotificationScheme: builder.query<NotificationScheme, string>({
      query: (id) => `/notification-schemes/${id}`,
      transformResponse: (response: any) => response.data.scheme,
      providesTags: (result, error, id) => [{ type: "NotificationScheme", id }],
    }),
    createNotificationScheme: builder.mutation<NotificationScheme, {
      name: string;
      workspaceId: string;
      description?: string;
      events?: NotificationSchemeEvent[];
    }>({
      query: (body) => ({
        url: "/notification-schemes",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response.data.scheme,
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: "NotificationScheme", id: `workspace-${workspaceId}` },
      ],
    }),
    updateNotificationScheme: builder.mutation<NotificationScheme, { id: string; data: Partial<NotificationScheme> }>({
      query: ({ id, data }) => ({
        url: `/notification-schemes/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: any) => response.data.scheme,
      invalidatesTags: (result, error, { id }) => [{ type: "NotificationScheme", id }],
    }),
    deleteNotificationScheme: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notification-schemes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["NotificationScheme"],
    }),
  }),
});

export const {
  useGetWorkspaceNotificationSchemesQuery,
  useGetNotificationSchemeQuery,
  useCreateNotificationSchemeMutation,
  useUpdateNotificationSchemeMutation,
  useDeleteNotificationSchemeMutation,
} = notificationSchemeApi;
