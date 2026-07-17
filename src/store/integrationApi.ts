import { api } from "./api";

export interface Integration {
  _id: string;
  workspaceId: string;
  type: "slack" | "github";
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
  configuredBy: string;
  lastTestedAt: string | null;
  lastTestStatus: "success" | "failure" | null;
  createdAt: string;
  updatedAt: string;
}

interface IntegrationsResponse {
  status: string;
  data: { integrations: Integration[] };
}

interface IntegrationResponse {
  status: string;
  data: { integration: Integration };
}

interface TestResponse {
  status: string;
  data: { success: boolean; status: string };
}

export const integrationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getIntegrations: builder.query<Integration[], string>({
      query: (workspaceId) => `/integrations/${workspaceId}`,
      transformResponse: (response: IntegrationsResponse) => response.data.integrations,
      providesTags: ["Integration"],
    }),
    getIntegration: builder.query<Integration, { workspaceId: string; type: string }>({
      query: ({ workspaceId, type }) => `/integrations/${workspaceId}/${type}`,
      transformResponse: (response: IntegrationResponse) => response.data.integration,
      providesTags: (_result, _error, { type }) => [{ type: "Integration", id: type }],
    }),
    saveIntegration: builder.mutation<Integration, { workspaceId: string; type: string; name: string; config: Record<string, unknown>; enabled?: boolean }>({
      query: ({ workspaceId, type, ...body }) => ({
        url: `/integrations/${workspaceId}/${type}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: IntegrationResponse) => response.data.integration,
      invalidatesTags: ["Integration"],
    }),
    deleteIntegration: builder.mutation<void, { workspaceId: string; type: string }>({
      query: ({ workspaceId, type }) => ({
        url: `/integrations/${workspaceId}/${type}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Integration"],
    }),
    toggleIntegration: builder.mutation<Integration, { workspaceId: string; type: string; enabled: boolean }>({
      query: ({ workspaceId, type, enabled }) => ({
        url: `/integrations/${workspaceId}/${type}/toggle`,
        method: "PATCH",
        body: { enabled },
      }),
      transformResponse: (response: IntegrationResponse) => response.data.integration,
      invalidatesTags: ["Integration"],
    }),
    testIntegration: builder.mutation<{ success: boolean; status: string }, { workspaceId: string; type: string }>({
      query: ({ workspaceId, type }) => ({
        url: `/integrations/${workspaceId}/${type}/test`,
        method: "POST",
      }),
      transformResponse: (response: TestResponse) => response.data,
      invalidatesTags: ["Integration"],
    }),
  }),
});

export const {
  useGetIntegrationsQuery,
  useGetIntegrationQuery,
  useSaveIntegrationMutation,
  useDeleteIntegrationMutation,
  useToggleIntegrationMutation,
  useTestIntegrationMutation,
} = integrationApi;
