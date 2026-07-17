import { api } from "./api";

export interface WorkflowStatus {
  name: string;
  color: string;
  position: number;
  description?: string;
}

export interface WorkflowTransition {
  from: string;
  to: string;
  name: string;
  requiredRole?: string[];
  conditions?: { field: string; operator: string; value: string }[];
}

export interface Workflow {
  _id: string;
  name: string;
  projectId: string;
  workspaceId: string;
  statuses: WorkflowStatus[];
  transitions: WorkflowTransition[];
  defaultStatus: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowResponse {
  status: string;
  data: { workflow: Workflow };
}

interface WorkflowsResponse {
  status: string;
  data: { workflows: Workflow[] };
}

export const workflowApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjectWorkflows: builder.query<Workflow[], string>({
      query: (projectId) => `/workflows/project/${projectId}`,
      transformResponse: (response: WorkflowsResponse) => response.data.workflows,
      providesTags: (_result, _error, projectId) => [{ type: "Project", id: `workflow-${projectId}` }],
    }),
    getWorkspaceWorkflows: builder.query<Workflow[], string>({
      query: (workspaceId) => `/workflows/workspace/${workspaceId}`,
      transformResponse: (response: WorkflowsResponse) => response.data.workflows,
    }),
    getDefaultWorkflow: builder.query<Workflow, string>({
      query: (projectId) => `/workflows/project/${projectId}/default`,
      transformResponse: (response: WorkflowResponse) => response.data.workflow,
    }),
    getWorkflow: builder.query<Workflow, string>({
      query: (id) => `/workflows/${id}`,
      transformResponse: (response: WorkflowResponse) => response.data.workflow,
    }),
    createWorkflow: builder.mutation<Workflow, { projectId: string; workspaceId: string; name: string; statuses: WorkflowStatus[]; transitions?: WorkflowTransition[]; defaultStatus: string }>({
      query: (body) => ({
        url: "/workflows",
        method: "POST",
        body,
      }),
      transformResponse: (response: WorkflowResponse) => response.data.workflow,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Project", id: `workflow-${projectId}` },
      ],
    }),
    updateWorkflow: builder.mutation<Workflow, { id: string; data: Partial<Workflow> }>({
      query: ({ id, data }) => ({
        url: `/workflows/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: WorkflowResponse) => response.data.workflow,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Project", id: `workflow-${id}` },
      ],
    }),
    deleteWorkflow: builder.mutation<void, string>({
      query: (id) => ({
        url: `/workflows/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),
    seedWorkflow: builder.mutation<Workflow, { projectId: string; workspaceId: string }>({
      query: (body) => ({
        url: "/workflows/seed",
        method: "POST",
        body,
      }),
      transformResponse: (response: WorkflowResponse) => response.data.workflow,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Project", id: `workflow-${projectId}` },
      ],
    }),
  }),
});

export const {
  useGetProjectWorkflowsQuery,
  useGetWorkspaceWorkflowsQuery,
  useGetDefaultWorkflowQuery,
  useGetWorkflowQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
  useSeedWorkflowMutation,
} = workflowApi;
