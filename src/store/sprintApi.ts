import { api } from "./api";
import type { Task } from "./taskApi";

interface Sprint {
  id: string;
  name: string;
  goal: string | null;
  projectId: string;
  status: "PLANNING" | "ACTIVE" | "COMPLETED";
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SprintResponse {
  status: string;
  data: { sprint: Sprint };
}

interface SprintsResponse {
  status: string;
  data: { sprints: Sprint[] };
}

interface SprintTasksResponse {
  status: string;
  data: { tasks: Task[] };
}

interface AssignResult {
  matchedCount: number;
  modifiedCount: number;
}

interface AssignResponse {
  status: string;
  data: { result: AssignResult };
}

export const sprintApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjectSprints: builder.query<Sprint[], string>({
      query: (projectId) => `/sprints/project/${projectId}`,
      transformResponse: (response: SprintsResponse) => response.data.sprints,
      providesTags: (_result, _error, projectId) => [{ type: "Sprint", id: `project-${projectId}` }],
    }),
    getSprint: builder.query<Sprint, string>({
      query: (sprintId) => `/sprints/${sprintId}`,
      transformResponse: (response: SprintResponse) => response.data.sprint,
      providesTags: (_result, _error, sprintId) => [{ type: "Sprint", id: sprintId }],
    }),
    getSprintTasks: builder.query<Task[], string>({
      query: (sprintId) => `/sprints/${sprintId}/tasks`,
      transformResponse: (response: SprintTasksResponse) => response.data.tasks,
      providesTags: (_result, _error, sprintId) => [{ type: "Sprint", id: sprintId }, "Task"],
    }),
    getBacklogTasks: builder.query<Task[], string>({
      query: (projectId) => `/sprints/project/${projectId}/backlog`,
      transformResponse: (response: SprintTasksResponse) => response.data.tasks,
      providesTags: (_result, _error, projectId) => [{ type: "Sprint", id: `project-${projectId}` }, "Task"],
    }),
    createSprint: builder.mutation<Sprint, { name: string; goal?: string; projectId: string; startDate?: string; endDate?: string }>({
      query: (body) => ({
        url: "/sprints",
        method: "POST",
        body,
      }),
      transformResponse: (response: SprintResponse) => response.data.sprint,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Sprint", id: `project-${projectId}` },
      ],
    }),
    updateSprint: builder.mutation<Sprint, { sprintId: string; name?: string; goal?: string; startDate?: string; endDate?: string }>({
      query: ({ sprintId, ...body }) => ({
        url: `/sprints/${sprintId}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: SprintResponse) => response.data.sprint,
      invalidatesTags: (_result, _error, { sprintId }) => [
        { type: "Sprint", id: sprintId },
      ],
    }),
    deleteSprint: builder.mutation<void, { sprintId: string; projectId: string }>({
      query: ({ sprintId }) => ({
        url: `/sprints/${sprintId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Sprint", id: `project-${projectId}` },
      ],
    }),
    startSprint: builder.mutation<Sprint, { sprintId: string; projectId: string }>({
      query: ({ sprintId }) => ({
        url: `/sprints/${sprintId}/start`,
        method: "POST",
      }),
      transformResponse: (response: SprintResponse) => response.data.sprint,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Sprint", id: `project-${projectId}` },
      ],
    }),
    completeSprint: builder.mutation<Sprint, { sprintId: string; projectId: string }>({
      query: ({ sprintId }) => ({
        url: `/sprints/${sprintId}/complete`,
        method: "POST",
      }),
      transformResponse: (response: SprintResponse) => response.data.sprint,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Sprint", id: `project-${projectId}` },
      ],
    }),
    assignTasksToSprint: builder.mutation<AssignResult, { sprintId: string; taskKeys: string[]; projectId: string }>({
      query: ({ sprintId, taskKeys }) => ({
        url: `/sprints/${sprintId}/assign-tasks`,
        method: "POST",
        body: { taskKeys },
      }),
      transformResponse: (response: AssignResponse) => response.data.result,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Sprint", id: `project-${projectId}` },
        "Task",
      ],
    }),
    removeTasksFromSprint: builder.mutation<AssignResult, { sprintId: string; taskKeys: string[]; projectId: string }>({
      query: ({ sprintId, taskKeys }) => ({
        url: `/sprints/${sprintId}/remove-tasks`,
        method: "POST",
        body: { taskKeys },
      }),
      transformResponse: (response: AssignResponse) => response.data.result,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Sprint", id: `project-${projectId}` },
        "Task",
      ],
    }),
  }),
});

export const {
  useGetProjectSprintsQuery,
  useGetSprintQuery,
  useGetSprintTasksQuery,
  useGetBacklogTasksQuery,
  useCreateSprintMutation,
  useUpdateSprintMutation,
  useDeleteSprintMutation,
  useStartSprintMutation,
  useCompleteSprintMutation,
  useAssignTasksToSprintMutation,
  useRemoveTasksFromSprintMutation,
} = sprintApi;

export type { Sprint };
