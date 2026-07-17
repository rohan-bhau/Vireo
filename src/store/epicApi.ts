import { api } from "./api";

export type EpicStatus = "open" | "in_progress" | "done" | "cancelled";
export type EpicPriority = "lowest" | "low" | "medium" | "high" | "highest";

export interface Epic {
  _id: string;
  epicKey: string;
  name: string;
  description: string;
  projectId: string;
  color: string;
  status: EpicStatus;
  priority: EpicPriority;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

interface EpicResponse {
  status: string;
  data: { epic: Epic };
}

interface EpicsResponse {
  status: string;
  data: { epics: Epic[] };
}

export const epicApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjectEpics: builder.query<Epic[], string>({
      query: (projectId) => `/epics/project/${projectId}`,
      transformResponse: (response: EpicsResponse) => response.data.epics,
      providesTags: (_result, _error, projectId) => [{ type: "Epic", id: `project-${projectId}` }],
    }),
    getWorkspaceEpics: builder.query<Epic[], string>({
      query: (workspaceId) => `/epics/workspace/${workspaceId}`,
      transformResponse: (response: EpicsResponse) => response.data.epics,
      providesTags: (_result, _error, workspaceId) => [{ type: "Epic", id: `workspace-${workspaceId}` }],
    }),
    getEpicByKey: builder.query<Epic, string>({
      query: (epicKey) => `/epics/${epicKey}`,
      transformResponse: (response: EpicResponse) => response.data.epic,
      providesTags: (_result, _error, epicKey) => [{ type: "Epic", id: epicKey }],
    }),
    createEpic: builder.mutation<Epic, { name: string; description?: string; projectId: string; color?: string; priority?: EpicPriority; workspaceId: string }>({
      query: (body) => ({
        url: "/epics",
        method: "POST",
        body,
      }),
      transformResponse: (response: EpicResponse) => response.data.epic,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Epic", id: `project-${projectId}` },
      ],
    }),
    updateEpic: builder.mutation<Epic, { epicKey: string; name?: string; description?: string; color?: string; status?: EpicStatus; priority?: EpicPriority }>({
      query: ({ epicKey, ...body }) => ({
        url: `/epics/${epicKey}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: EpicResponse) => response.data.epic,
      invalidatesTags: (_result, _error, { epicKey }) => [
        { type: "Epic", id: epicKey },
      ],
    }),
    deleteEpic: builder.mutation<void, string>({
      query: (epicKey) => ({
        url: `/epics/${epicKey}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Epic"],
    }),
  }),
});

export const {
  useGetProjectEpicsQuery,
  useGetWorkspaceEpicsQuery,
  useGetEpicByKeyQuery,
  useCreateEpicMutation,
  useUpdateEpicMutation,
  useDeleteEpicMutation,
} = epicApi;
