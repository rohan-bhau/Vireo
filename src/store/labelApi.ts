import { api } from "./api";

export interface LabelCount {
  name: string;
  count: number;
}

interface LabelsResponse {
  status: string;
  data: { labels: string[] };
}

interface LabelCountsResponse {
  status: string;
  data: { labels: LabelCount[] };
}

interface MergeResult {
  modifiedCount: number;
}

interface MergeResponse {
  status: string;
  data: MergeResult;
}

export const labelApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjectLabels: builder.query<LabelCount[], string>({
      query: (projectId) => `/labels/project/${projectId}`,
      transformResponse: (response: LabelCountsResponse) => response.data.labels,
    }),
    suggestLabels: builder.query<string[], { projectId: string; q: string }>({
      query: ({ projectId, q }) => `/labels/suggest?projectId=${projectId}&q=${encodeURIComponent(q)}`,
      transformResponse: (response: LabelsResponse) => response.data.labels,
    }),
    getWorkspaceLabels: builder.query<string[], string>({
      query: (workspaceId) => `/labels/workspace/${workspaceId}`,
      transformResponse: (response: LabelsResponse) => response.data.labels,
    }),
    mergeLabels: builder.mutation<MergeResult, { projectId: string; sourceLabel: string; targetLabel: string }>({
      query: ({ projectId, ...body }) => ({
        url: `/labels/project/${projectId}/merge`,
        method: "POST",
        body,
      }),
      transformResponse: (response: MergeResponse) => response.data,
    }),
  }),
});

export const {
  useGetProjectLabelsQuery,
  useSuggestLabelsQuery,
  useGetWorkspaceLabelsQuery,
  useMergeLabelsMutation,
} = labelApi;
