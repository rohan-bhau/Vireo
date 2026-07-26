import { api } from "./api";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminOverview {
  totalUsers: number;
  adminUsers: number;
  totalWorkspaces: number;
  totalProjects: number;
  totalPermissionSchemes: number;
}

interface AdminGroup {
  _id: string;
  name: string;
  description?: string;
  workspaceId: string;
  members: { userId: string; addedAt: string }[];
  createdBy: string;
  createdAt: string;
}

interface UserListResponse {
  status: string;
  data: {
    users: AdminUser[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverview: builder.query<AdminOverview, void>({
      query: () => "/admin/overview",
      transformResponse: (response: { status: string; data: AdminOverview }) =>
        response.data,
    }),
    getAdminUsers: builder.query<
      { users: AdminUser[]; total: number; page: number; totalPages: number },
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 20, search } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.set("search", search);
        return `/admin/users?${params.toString()}`;
      },
      transformResponse: (response: UserListResponse) => response.data,
      providesTags: ["User"],
    }),
    updateUserRole: builder.mutation<AdminUser, { userId: string; role: "user" | "admin" }>({
      query: ({ userId, ...body }) => ({
        url: `/admin/users/${userId}/role`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: { status: string; data: { user: AdminUser } }) =>
        response.data.user,
      invalidatesTags: ["User"],
    }),
    getAdminGroups: builder.query<AdminGroup[], void>({
      query: () => "/admin/groups",
      transformResponse: (response: { status: string; data: { groups: AdminGroup[] } }) =>
        response.data.groups,
    }),
    createAdminGroup: builder.mutation<AdminGroup, { name: string; description?: string; workspaceId: string }>({
      query: (body) => ({
        url: `/admin/workspaces/${body.workspaceId}/groups`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { status: string; data: { group: AdminGroup } }) =>
        response.data.group,
      invalidatesTags: ["User"],
    }),
    deleteAdminGroup: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/groups/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
    addMemberToGroup: builder.mutation<AdminGroup, { groupId: string; userId: string }>({
      query: ({ groupId, ...body }) => ({
        url: `/admin/groups/${groupId}/members`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    removeMemberFromGroup: builder.mutation<void, { groupId: string; userId: string }>({
      query: ({ groupId, userId }) => ({
        url: `/admin/groups/${groupId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetAdminOverviewQuery,
  useGetAdminUsersQuery,
  useUpdateUserRoleMutation,
  useGetAdminGroupsQuery,
  useCreateAdminGroupMutation,
  useDeleteAdminGroupMutation,
  useAddMemberToGroupMutation,
  useRemoveMemberFromGroupMutation,
} = adminApi;

export type { AdminUser, AdminOverview, AdminGroup };
