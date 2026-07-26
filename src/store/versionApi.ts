import { api } from "./api";

export type VersionStatus = "unreleased" | "released" | "archived";

export interface Version {
  _id: string;
  name: string;
  description: string;
  projectId: string;
  startDate: string | null;
  releaseDate: string | null;
  status: VersionStatus;
  released: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VersionProgress {
  versionId: string;
  name: string;
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  percentDone: number;
}

interface VersionResponse {
  status: string;
  data: { version: Version };
}

interface VersionsResponse {
  status: string;
  data: { versions: Version[] };
}

interface ProgressResponse {
  status: string;
  data: { progress: VersionProgress };
}

interface CreateVersionInput {
  name: string;
  description?: string;
  projectId: string;
  startDate?: string;
  releaseDate?: string;
}

interface UpdateVersionInput {
  name?: string;
  description?: string;
  startDate?: string | null;
  releaseDate?: string | null;
  status?: VersionStatus;
}

export const versionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjectVersions: builder.query<Version[], string>({
      query: (projectId) => `/versions/project/${projectId}`,
      transformResponse: (response: VersionsResponse) => response.data.versions,
      providesTags: (_result, _error, projectId) => [{ type: "Version", id: `project-${projectId}` }],
    }),
    getVersion: builder.query<Version, string>({
      query: (id) => `/versions/${id}`,
      transformResponse: (response: VersionResponse) => response.data.version,
      providesTags: (_result, _error, id) => [{ type: "Version", id }],
    }),
    createVersion: builder.mutation<Version, CreateVersionInput>({
      query: (body) => ({
        url: "/versions",
        method: "POST",
        body,
      }),
      transformResponse: (response: VersionResponse) => response.data.version,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Version", id: `project-${projectId}` },
      ],
    }),
    updateVersion: builder.mutation<Version, { id: string; data: UpdateVersionInput }>({
      query: ({ id, data }) => ({
        url: `/versions/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: VersionResponse) => response.data.version,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Version", id },
      ],
    }),
    deleteVersion: builder.mutation<void, string>({
      query: (id) => ({
        url: `/versions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Version"],
    }),
    releaseVersion: builder.mutation<Version, string>({
      query: (id) => ({
        url: `/versions/${id}/release`,
        method: "POST",
      }),
      transformResponse: (response: VersionResponse) => response.data.version,
      invalidatesTags: (_result, _error, id) => [
        { type: "Version", id },
      ],
    }),
    getVersionProgress: builder.query<VersionProgress, string>({
      query: (id) => `/versions/${id}/progress`,
      transformResponse: (response: ProgressResponse) => response.data.progress,
    }),
  }),
});

export const {
  useGetProjectVersionsQuery,
  useGetVersionQuery,
  useCreateVersionMutation,
  useUpdateVersionMutation,
  useDeleteVersionMutation,
  useReleaseVersionMutation,
  useGetVersionProgressQuery,
} = versionApi;
