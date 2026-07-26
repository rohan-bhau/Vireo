import { api } from "./api";

interface PermissionMapping {
  projectRoleId: string;
  projectRoleName: string;
  permissions: string[];
}

interface PermissionScheme {
  _id: string;
  name: string;
  description?: string;
  workspaceId: string;
  isDefault: boolean;
  mappings: PermissionMapping[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectRoleMember {
  userId: string;
  addedBy: string;
  addedAt: string;
}

interface ProjectRole {
  _id: string;
  name: string;
  description?: string;
  projectId: string;
  workspaceId: string;
  isSystem: boolean;
  members: ProjectRoleMember[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface IssueSecurityLevel {
  _id?: string;
  name: string;
  description?: string;
  members: { userId?: string; projectRoleId?: string }[];
}

interface IssueSecurityScheme {
  _id: string;
  name: string;
  description?: string;
  workspaceId: string;
  levels: IssueSecurityLevel[];
  defaultLevelId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const PERMISSIONS = [
  "BROWSE_PROJECTS", "CREATE_ISSUES", "EDIT_ISSUES", "SCHEDULE_ISSUES",
  "MOVE_ISSUES", "ASSIGN_ISSUES", "ASSIGN_ISSUES_TO_SELF",
  "RESOLVE_ISSUES", "CLOSE_ISSUES", "DELETE_ISSUES",
  "CREATE_ATTACHMENTS", "DELETE_OWN_ATTACHMENTS", "DELETE_ALL_ATTACHMENTS",
  "ADD_COMMENTS", "EDIT_OWN_COMMENTS", "EDIT_ALL_COMMENTS",
  "DELETE_OWN_COMMENTS", "DELETE_ALL_COMMENTS",
  "MANAGE_SPRINTS", "MANAGE_WATCHERS", "MANAGE_PROJECT", "ADMINISTER_PROJECT",
] as const;

export const permissionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPermissionSchemes: builder.query<PermissionScheme[], string>({
      query: (workspaceId) => `/admin/workspaces/${workspaceId}/permission-schemes`,
      transformResponse: (response: { status: string; data: { schemes: PermissionScheme[] } }) =>
        response.data.schemes,
      providesTags: ["PermissionScheme"],
    }),
    getPermissionScheme: builder.query<PermissionScheme, string>({
      query: (id) => `/admin/permission-schemes/${id}`,
      transformResponse: (response: { status: string; data: { scheme: PermissionScheme } }) =>
        response.data.scheme,
      providesTags: (_result, _error, id) => [{ type: "PermissionScheme", id }],
    }),
    createPermissionScheme: builder.mutation<
      PermissionScheme,
      {
        workspaceId: string;
        name: string;
        description?: string;
        mappings: PermissionMapping[];
      }
    >({
      query: ({ workspaceId, ...body }) => ({
        url: `/admin/workspaces/${workspaceId}/permission-schemes`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { status: string; data: { scheme: PermissionScheme } }) =>
        response.data.scheme,
      invalidatesTags: ["PermissionScheme"],
    }),
    updatePermissionScheme: builder.mutation<
      PermissionScheme,
      {
        id: string;
        name?: string;
        description?: string;
        mappings?: PermissionMapping[];
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/permission-schemes/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: { status: string; data: { scheme: PermissionScheme } }) =>
        response.data.scheme,
      invalidatesTags: (_result, _error, { id }) => [
        "PermissionScheme",
        { type: "PermissionScheme", id },
      ],
    }),
    deletePermissionScheme: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/permission-schemes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PermissionScheme"],
    }),

    getProjectRoles: builder.query<ProjectRole[], string>({
      query: (projectId) => `/admin/projects/${projectId}/roles`,
      transformResponse: (response: { status: string; data: { roles: ProjectRole[] } }) =>
        response.data.roles,
      providesTags: ["ProjectRole"],
    }),
    createProjectRole: builder.mutation<
      ProjectRole,
      { projectId: string; workspaceId: string; name: string; description?: string }
    >({
      query: ({ projectId, ...body }) => ({
        url: `/admin/projects/${projectId}/roles`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { status: string; data: { role: ProjectRole } }) =>
        response.data.role,
      invalidatesTags: ["ProjectRole"],
    }),
    updateProjectRole: builder.mutation<ProjectRole, { id: string; name?: string; description?: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/project-roles/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: { status: string; data: { role: ProjectRole } }) =>
        response.data.role,
      invalidatesTags: (_result, _error, { id }) => ["ProjectRole", { type: "ProjectRole", id }],
    }),
    deleteProjectRole: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/project-roles/${id}`, method: "DELETE" }),
      invalidatesTags: ["ProjectRole"],
    }),
    addMemberToProjectRole: builder.mutation<ProjectRole, { roleId: string; userId: string }>({
      query: ({ roleId, ...body }) => ({
        url: `/admin/project-roles/${roleId}/members`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProjectRole"],
    }),
    removeMemberFromProjectRole: builder.mutation<void, { roleId: string; userId: string }>({
      query: ({ roleId, userId }) => ({
        url: `/admin/project-roles/${roleId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProjectRole"],
    }),

    getIssueSecuritySchemes: builder.query<IssueSecurityScheme[], string>({
      query: (workspaceId) => `/admin/workspaces/${workspaceId}/issue-security-schemes`,
      transformResponse: (response: { status: string; data: { schemes: IssueSecurityScheme[] } }) =>
        response.data.schemes,
      providesTags: ["IssueSecurity"],
    }),
    getIssueSecurityScheme: builder.query<IssueSecurityScheme, string>({
      query: (id) => `/admin/issue-security-schemes/${id}`,
      transformResponse: (response: { status: string; data: { scheme: IssueSecurityScheme } }) =>
        response.data.scheme,
      providesTags: (_result, _error, id) => [{ type: "IssueSecurity", id }],
    }),
    createIssueSecurityScheme: builder.mutation<
      IssueSecurityScheme,
      { workspaceId: string; name: string; description?: string; levels: IssueSecurityLevel[] }
    >({
      query: ({ workspaceId, ...body }) => ({
        url: `/admin/workspaces/${workspaceId}/issue-security-schemes`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { status: string; data: { scheme: IssueSecurityScheme } }) =>
        response.data.scheme,
      invalidatesTags: ["IssueSecurity"],
    }),
    updateIssueSecurityScheme: builder.mutation<
      IssueSecurityScheme,
      { id: string; name?: string; description?: string; levels?: IssueSecurityLevel[]; defaultLevelId?: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/issue-security-schemes/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: { status: string; data: { scheme: IssueSecurityScheme } }) =>
        response.data.scheme,
      invalidatesTags: (_result, _error, { id }) => ["IssueSecurity", { type: "IssueSecurity", id }],
    }),
    assignPermissionSchemeToProject: builder.mutation<any, { projectId: string; permissionSchemeId: string }>({
      query: ({ projectId, ...body }) => ({
        url: `/admin/projects/${projectId}/permission-scheme`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PermissionScheme", "Project"],
    }),
    deleteIssueSecurityScheme: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/issue-security-schemes/${id}`, method: "DELETE" }),
      invalidatesTags: ["IssueSecurity"],
    }),
  }),
});

export const {
  useGetPermissionSchemesQuery,
  useGetPermissionSchemeQuery,
  useCreatePermissionSchemeMutation,
  useUpdatePermissionSchemeMutation,
  useDeletePermissionSchemeMutation,
  useGetProjectRolesQuery,
  useCreateProjectRoleMutation,
  useUpdateProjectRoleMutation,
  useDeleteProjectRoleMutation,
  useAddMemberToProjectRoleMutation,
  useRemoveMemberFromProjectRoleMutation,
  useGetIssueSecuritySchemesQuery,
  useGetIssueSecuritySchemeQuery,
  useCreateIssueSecuritySchemeMutation,
  useUpdateIssueSecuritySchemeMutation,
  useDeleteIssueSecuritySchemeMutation,
  useAssignPermissionSchemeToProjectMutation,
} = permissionApi;

export type { PermissionScheme, ProjectRole, IssueSecurityScheme, IssueSecurityLevel, PermissionMapping };
export { PERMISSIONS };
