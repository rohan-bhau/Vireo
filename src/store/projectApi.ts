import { api } from "./api";

export type ProjectTemplate = "SCRUM" | "KANBAN" | "BUG_TRACKING" | "PROJECT_MANAGEMENT" | "DEVOPS" | "TASK_TRACKING" | "BLANK";
export type BoardType = "SCRUM" | "KANBAN";

export interface Column {
  id: string;
  name: string;
  position: number;
  boardId: string;
  wipLimit?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BoardConfig {
  swimlanes?: {
    enabled: boolean;
    type: "none" | "assignee" | "epic" | "priority" | "custom";
    customJql?: string;
  };
  cardLayout?: {
    showTypeIcon: boolean;
    showKey: boolean;
    showPriority: boolean;
    showAssignee: boolean;
    showLabels: boolean;
    showDueDate: boolean;
    showStoryPoints: boolean;
    showEpicColor: boolean;
  };
  quickFilters?: {
    id: string;
    name: string;
    jql: string;
  }[];
}

export interface Board {
  id: string;
  name: string;
  type: BoardType;
  projectId: string;
  config: BoardConfig | null;
  createdAt: string;
  updatedAt: string;
  columns: Column[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  key: string;
  workspaceId: string;
  ownerId: string;
  template: ProjectTemplate;
  avatar: string | null;
  isTeamManaged: boolean;
  permissionSchemeId?: string;
  issueSecuritySchemeId?: string;
  enabledIssueTypes?: string[];
  createdAt: string;
  updatedAt: string;
  boards: Board[];
}

interface ProjectListResponse {
  status: string;
  data: { projects: Project[] };
}

interface ProjectResponse {
  status: string;
  data: { project: Project };
}

interface BoardResponse {
  status: string;
  data: { board: Board };
}

interface BoardsResponse {
  status: string;
  data: { boards: Board[] };
}

interface ColumnResponse {
  status: string;
  data: { column: Column };
}

interface ColumnsResponse {
  status: string;
  data: { columns: Column[] };
}

export const projectApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaceProjects: builder.query<Project[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/projects`,
      transformResponse: (response: ProjectListResponse) => response.data.projects,
      providesTags: (_result, _error, workspaceId) => [{ type: "Project", id: `workspace-${workspaceId}` }],
    }),
    getProject: builder.query<Project, string>({
      query: (projectId) => `/projects/${projectId}`,
      transformResponse: (response: ProjectResponse) => response.data.project,
      providesTags: (_result, _error, projectId) => [{ type: "Project", id: projectId }],
    }),
    getOrSeedDefaultProject: builder.mutation<Project, string>({
      query: (workspaceId) => ({
        url: `/workspaces/${workspaceId}/default-project`,
        method: "GET",
      }),
      transformResponse: (response: { status: string; data: { project: Project } }) => response.data.project,
      invalidatesTags: (_result, _error, workspaceId) => [
        { type: "Project", id: `workspace-${workspaceId}` },
      ],
    }),
    createProject: builder.mutation<Project, {
      workspaceId: string;
      name: string;
      key: string;
      description?: string;
      template?: ProjectTemplate;
      avatar?: string;
      isTeamManaged?: boolean;
    }>({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/projects`,
        method: "POST",
        body: { ...body, workspaceId },
      }),
      transformResponse: (response: ProjectResponse) => response.data.project,
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Project", id: `workspace-${workspaceId}` },
      ],
    }),
    updateProject: builder.mutation<Project, {
      workspaceId: string;
      projectId: string;
      name?: string;
      description?: string;
      key?: string;
      avatar?: string;
      isTeamManaged?: boolean;
    }>({
      query: ({ workspaceId, projectId, ...body }) => ({
        url: `/workspaces/${workspaceId}/projects/${projectId}`,
        method: "PUT",
        body: { ...body, workspaceId },
      }),
      transformResponse: (response: ProjectResponse) => response.data.project,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Project", id: projectId },
      ],
    }),
    deleteProject: builder.mutation<void, { workspaceId: string; projectId: string }>({
      query: ({ workspaceId, projectId }) => ({
        url: `/workspaces/${workspaceId}/projects/${projectId}`,
        method: "DELETE",
        body: { workspaceId },
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Project", id: `workspace-${workspaceId}` },
      ],
    }),
    setEnabledIssueTypes: builder.mutation<Project, { workspaceId: string; projectId: string; enabledIssueTypes: string[] }>({
      query: ({ workspaceId, projectId, enabledIssueTypes }) => ({
        url: `/workspaces/${workspaceId}/projects/${projectId}/issue-types`,
        method: "PATCH",
        body: { enabledIssueTypes },
      }),
      transformResponse: (response: ProjectResponse) => response.data.project,
      invalidatesTags: (_result, _error, { workspaceId, projectId }) => [
        { type: "Project", id: projectId },
        { type: "Project", id: `workspace-${workspaceId}` },
      ],
    }),

    getProjectBoards: builder.query<Board[], string>({
      query: (projectId) => `/projects/${projectId}/boards`,
      transformResponse: (response: BoardsResponse) => response.data.boards,
      providesTags: (_result, _error, projectId) => [{ type: "Board", id: `project-${projectId}` }],
    }),
    getBoard: builder.query<Board, string>({
      query: (boardId) => `/boards/${boardId}`,
      transformResponse: (response: BoardResponse) => response.data.board,
      providesTags: (_result, _error, id) => [{ type: "Board", id }],
    }),
    createBoard: builder.mutation<Board, { workspaceId: string; projectId: string; name: string; type?: BoardType }>({
      query: ({ workspaceId, projectId, ...body }) => ({
        url: `/workspaces/${workspaceId}/projects/${projectId}/boards`,
        method: "POST",
        body: { ...body, workspaceId },
      }),
      transformResponse: (response: BoardResponse) => response.data.board,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Board", id: `project-${projectId}` },
      ],
    }),
    addColumn: builder.mutation<Column, { boardId: string; name: string; position?: number; wipLimit?: number }>({
      query: ({ boardId, ...body }) => ({
        url: `/boards/${boardId}/columns`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ColumnResponse) => response.data.column,
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Board", id: boardId },
      ],
    }),
    updateColumn: builder.mutation<Column, { boardId: string; columnId: string; name?: string; position?: number; wipLimit?: number | null }>({
      query: ({ boardId, columnId, ...body }) => ({
        url: `/boards/${boardId}/columns/${columnId}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ColumnResponse) => response.data.column,
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Board", id: boardId },
      ],
    }),
    removeColumn: builder.mutation<void, { boardId: string; columnId: string }>({
      query: ({ boardId, columnId }) => ({
        url: `/boards/${boardId}/columns/${columnId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Board", id: boardId },
      ],
    }),
    reorderColumns: builder.mutation<Column[], { boardId: string; projectId: string; columnIds: string[] }>({
      query: ({ boardId, projectId, columnIds }) => {
        void projectId;
        return {
          url: `/boards/${boardId}/columns/reorder`,
          method: "PUT",
          body: { columnIds },
        };
      },
      transformResponse: (response: ColumnsResponse) => response.data.columns,
      invalidatesTags: (_result, _error, { boardId, projectId }) => [
        { type: "Board", id: boardId },
        { type: "Board", id: `project-${projectId}` },
      ],
    }),
    updateBoardConfig: builder.mutation<Board, { boardId: string; config: Partial<BoardConfig> }>({
      query: ({ boardId, config }) => ({
        url: `/boards/${boardId}/config`,
        method: "PUT",
        body: { config },
      }),
      transformResponse: (response: BoardResponse) => response.data.board,
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Board", id: boardId },
      ],
    }),
  }),
});

export const {
  useGetWorkspaceProjectsQuery,
  useGetProjectQuery,
  useGetOrSeedDefaultProjectMutation,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useSetEnabledIssueTypesMutation,
  useGetProjectBoardsQuery,
  useGetBoardQuery,
  useCreateBoardMutation,
  useAddColumnMutation,
  useUpdateColumnMutation,
  useRemoveColumnMutation,
  useReorderColumnsMutation,
  useUpdateBoardConfigMutation,
} = projectApi;
