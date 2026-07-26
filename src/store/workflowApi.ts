import { api } from "./api";

export interface WorkflowStatus {
  name: string;
  color: string;
  position: number;
  description?: string;
  category: "todo" | "in_progress" | "done";
}

export interface TransitionCondition {
  type: "role" | "assignee" | "reporter" | "project_admin";
  role?: string;
}

export interface TransitionValidator {
  field: string;
  operator: "not_empty" | "equals" | "not_equals";
  value?: string;
}

export interface TransitionPostFunction {
  type: "update_field" | "add_comment" | "send_notification";
  field?: string;
  value?: string;
  comment?: string;
}

export interface WorkflowTransition {
  from: string;
  to: string;
  name: string;
  conditions: TransitionCondition[];
  validators: TransitionValidator[];
  postFunctions: TransitionPostFunction[];
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

export interface WorkflowSchemeMapping {
  issueType: string;
  workflowId: string;
}

export interface WorkflowScheme {
  _id: string;
  name: string;
  projectId: string;
  workspaceId: string;
  description?: string;
  mappings: WorkflowSchemeMapping[];
  defaultWorkflowId: string;
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

interface WorkflowSchemeResponse {
  status: string;
  data: { scheme: WorkflowScheme };
}

interface WorkflowSchemesResponse {
  status: string;
  data: { schemes: WorkflowScheme[] };
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
    getWorkflowUsage: builder.query<{ usedBySchemes: number; schemes: { id: string; name: string }[]; issueTypes: string[] }, string>({
      query: (id) => `/workflows/${id}/usage`,
      transformResponse: (response: any) => response.data,
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
    copyWorkflow: builder.mutation<Workflow, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/workflows/${id}/copy`,
        method: "POST",
        body: { name },
      }),
      transformResponse: (response: WorkflowResponse) => response.data.workflow,
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
    validateTransition: builder.mutation<{ valid: boolean; errors: string[] }, { workflowId: string; transitionName: string; taskKey: string }>({
      query: ({ workflowId, ...body }) => ({
        url: `/workflows/${workflowId}/validate`,
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response.data,
    }),
    executeTransition: builder.mutation<any, { workflowId: string; transitionName: string; taskKey: string }>({
      query: ({ workflowId, ...body }) => ({
        url: `/workflows/${workflowId}/execute`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Task"],
    }),
    getProjectSchemes: builder.query<WorkflowScheme[], string>({
      query: (projectId) => `/workflow-schemes/project/${projectId}`,
      transformResponse: (response: WorkflowSchemesResponse) => response.data.schemes,
    }),
    getWorkflowScheme: builder.query<WorkflowScheme, string>({
      query: (id) => `/workflow-schemes/${id}`,
      transformResponse: (response: WorkflowSchemeResponse) => response.data.scheme,
    }),
    createWorkflowScheme: builder.mutation<WorkflowScheme, {
      name: string;
      projectId: string;
      workspaceId: string;
      description?: string;
      mappings: WorkflowSchemeMapping[];
      defaultWorkflowId: string;
    }>({
      query: (body) => ({
        url: "/workflow-schemes",
        method: "POST",
        body,
      }),
      transformResponse: (response: WorkflowSchemeResponse) => response.data.scheme,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Project", id: `scheme-${projectId}` },
      ],
    }),
    updateWorkflowScheme: builder.mutation<WorkflowScheme, { id: string; data: Partial<WorkflowScheme> }>({
      query: ({ id, data }) => ({
        url: `/workflow-schemes/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: WorkflowSchemeResponse) => response.data.scheme,
      invalidatesTags: ["Project"],
    }),
    deleteWorkflowScheme: builder.mutation<void, string>({
      query: (id) => ({
        url: `/workflow-schemes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),
  }),
});

export const {
  useGetProjectWorkflowsQuery,
  useGetWorkspaceWorkflowsQuery,
  useGetDefaultWorkflowQuery,
  useGetWorkflowQuery,
  useGetWorkflowUsageQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
  useCopyWorkflowMutation,
  useSeedWorkflowMutation,
  useValidateTransitionMutation,
  useExecuteTransitionMutation,
  useGetProjectSchemesQuery,
  useGetWorkflowSchemeQuery,
  useCreateWorkflowSchemeMutation,
  useUpdateWorkflowSchemeMutation,
  useDeleteWorkflowSchemeMutation,
} = workflowApi;
