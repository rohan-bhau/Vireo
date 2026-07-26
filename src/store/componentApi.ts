import { api } from "./api";

export interface Component {
  _id: string;
  name: string;
  description: string;
  projectId: string;
  lead: string | null;
  defaultAssignee: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ComponentResponse {
  status: string;
  data: { component: Component };
}

interface ComponentsResponse {
  status: string;
  data: { components: Component[] };
}

interface CreateComponentInput {
  name: string;
  description?: string;
  projectId: string;
  lead?: string;
  defaultAssignee?: string;
}

interface UpdateComponentInput {
  name?: string;
  description?: string;
  lead?: string | null;
  defaultAssignee?: string | null;
}

export const componentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjectComponents: builder.query<Component[], string>({
      query: (projectId) => `/components/project/${projectId}`,
      transformResponse: (response: ComponentsResponse) => response.data.components,
      providesTags: (_result, _error, projectId) => [{ type: "Component", id: `project-${projectId}` }],
    }),
    getComponent: builder.query<Component, string>({
      query: (id) => `/components/${id}`,
      transformResponse: (response: ComponentResponse) => response.data.component,
      providesTags: (_result, _error, id) => [{ type: "Component", id }],
    }),
    createComponent: builder.mutation<Component, CreateComponentInput>({
      query: (body) => ({
        url: "/components",
        method: "POST",
        body,
      }),
      transformResponse: (response: ComponentResponse) => response.data.component,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Component", id: `project-${projectId}` },
      ],
    }),
    updateComponent: builder.mutation<Component, { id: string; data: UpdateComponentInput }>({
      query: ({ id, data }) => ({
        url: `/components/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ComponentResponse) => response.data.component,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Component", id },
      ],
    }),
    deleteComponent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/components/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Component"],
    }),
  }),
});

export const {
  useGetProjectComponentsQuery,
  useGetComponentQuery,
  useCreateComponentMutation,
  useUpdateComponentMutation,
  useDeleteComponentMutation,
} = componentApi;
