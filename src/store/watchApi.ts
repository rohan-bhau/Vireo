import { api } from "./api";

interface WatcherResponse {
  status: string;
  data: { watchers: string[] };
}

interface WatchingResponse {
  status: string;
  data: { isWatching: boolean };
}

interface WatchersResponse {
  status: string;
  data: { watchers: string[]; users: { _id: string; name: string; email: string; avatar?: string }[] };
}

export const watchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    watchTask: builder.mutation<{ watchers: string[] }, string>({
      query: (taskKey) => ({
        url: `/tasks/${taskKey}/watch`,
        method: "POST",
      }),
      transformResponse: (response: WatcherResponse) => response.data,
      invalidatesTags: (_result, _error, taskKey) => [{ type: "Task", id: taskKey }],
    }),
    unwatchTask: builder.mutation<{ watchers: string[] }, string>({
      query: (taskKey) => ({
        url: `/tasks/${taskKey}/unwatch`,
        method: "POST",
      }),
      transformResponse: (response: WatcherResponse) => response.data,
      invalidatesTags: (_result, _error, taskKey) => [{ type: "Task", id: taskKey }],
    }),
    getTaskWatchers: builder.query<{ watchers: string[]; users: any[] }, string>({
      query: (taskKey) => `/tasks/${taskKey}/watchers`,
      transformResponse: (response: WatchersResponse) => response.data,
    }),
    getIsWatching: builder.query<boolean, string>({
      query: (taskKey) => `/tasks/${taskKey}/watching`,
      transformResponse: (response: WatchingResponse) => response.data.isWatching,
    }),
  }),
});

export const {
  useWatchTaskMutation,
  useUnwatchTaskMutation,
  useGetTaskWatchersQuery,
  useGetIsWatchingQuery,
} = watchApi;
