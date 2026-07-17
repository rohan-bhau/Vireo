import { api } from "./api";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members?: WorkspaceMember[];
}

interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: "ADMIN" | "MEMBER";
  joinedAt: string;
  invitedBy: string | null;
}

interface Invitation {
  id: string;
  workspaceId: string;
  inviterId: string;
  inviteeEmail: string;
  role: "ADMIN" | "MEMBER";
  token: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  expiresAt: string;
  createdAt: string;
}

interface WorkspaceListResponse {
  status: string;
  data: { workspaces: Workspace[] };
}

interface WorkspaceResponse {
  status: string;
  data: { workspace: Workspace };
}

interface MembersResponse {
  status: string;
  data: { members: WorkspaceMember[] };
}

interface InvitationsResponse {
  status: string;
  data: { invitations: Invitation[] };
}

export const workspaceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaces: builder.query<Workspace[], void>({
      query: () => "/workspaces",
      transformResponse: (response: WorkspaceListResponse) => response.data.workspaces,
      providesTags: ["Workspace"],
    }),
    getWorkspace: builder.query<Workspace, string>({
      query: (workspaceId) => `/workspaces/${workspaceId}`,
      transformResponse: (response: WorkspaceResponse) => response.data.workspace,
      providesTags: (_result, _error, id) => [{ type: "Workspace", id }],
    }),
    createWorkspace: builder.mutation<Workspace, { name: string; description?: string }>({
      query: (body) => ({
        url: "/workspaces",
        method: "POST",
        body,
      }),
      transformResponse: (response: WorkspaceResponse) => response.data.workspace,
      invalidatesTags: ["Workspace"],
    }),
    updateWorkspace: builder.mutation<Workspace, { workspaceId: string; name?: string; description?: string }>({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: WorkspaceResponse) => response.data.workspace,
      invalidatesTags: (_result, _error, { workspaceId }) => [
        "Workspace",
        { type: "Workspace", id: workspaceId },
      ],
    }),
    deleteWorkspace: builder.mutation<void, string>({
      query: (workspaceId) => ({
        url: `/workspaces/${workspaceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Workspace"],
    }),
    getMembers: builder.query<WorkspaceMember[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/members`,
      transformResponse: (response: MembersResponse) => response.data.members,
      providesTags: (_result, _error, id) => [{ type: "Members", id }],
    }),
    removeMember: builder.mutation<void, { workspaceId: string; userId: string }>({
      query: ({ workspaceId, userId }) => ({
        url: `/workspaces/${workspaceId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Members", id: workspaceId },
      ],
    }),
    updateMemberRole: builder.mutation<WorkspaceMember, { workspaceId: string; userId: string; role: "ADMIN" | "MEMBER" }>({
      query: ({ workspaceId, userId, ...body }) => ({
        url: `/workspaces/${workspaceId}/members/${userId}/role`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: { status: string; data: { member: WorkspaceMember } }) => response.data.member,
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Members", id: workspaceId },
      ],
    }),
    getInvitations: builder.query<Invitation[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/invitations`,
      transformResponse: (response: InvitationsResponse) => response.data.invitations,
      providesTags: (_result, _error, id) => [{ type: "Invitations", id }],
    }),
    createInvitation: builder.mutation<Invitation, { workspaceId: string; inviteeEmail: string; role?: "ADMIN" | "MEMBER"; message?: string }>({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/invitations`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { status: string; data: { invitation: Invitation } }) => response.data.invitation,
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Invitations", id: workspaceId },
      ],
    }),
    cancelInvitation: builder.mutation<void, { workspaceId: string; invitationId: string }>({
      query: ({ workspaceId, invitationId }) => ({
        url: `/workspaces/${workspaceId}/invitations/${invitationId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Invitations", id: workspaceId },
      ],
    }),
    acceptInvitation: builder.mutation<void, string>({
      query: (token) => ({
        url: `/invitations/${token}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["Invitations", "Members"],
    }),
    declineInvitation: builder.mutation<void, string>({
      query: (token) => ({
        url: `/invitations/${token}/decline`,
        method: "POST",
      }),
      invalidatesTags: ["Invitations"],
    }),
  }),
});

export const {
  useGetWorkspacesQuery,
  useGetWorkspaceQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useGetMembersQuery,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
  useGetInvitationsQuery,
  useCreateInvitationMutation,
  useCancelInvitationMutation,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
} = workspaceApi;
