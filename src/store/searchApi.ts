import { api } from "./api";
import type { Task } from "./taskApi";

interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

interface SearchResult {
  tasks: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface GlobalSearchResult {
  tasks: Task[];
  epics: any[];
  workspaces: any[];
  projects: any[];
  total: number;
}

export const searchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchTasks: builder.query<SearchResult, { workspaceId?: string; projectId?: string; q?: string; status?: string; priority?: string; type?: string; assignee?: string; labels?: string; sortField?: string; sortOrder?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: "/search",
        params,
      }),
      transformResponse: (response: any) => response.data,
    }),
    advancedFilter: builder.mutation<SearchResult, { workspaceId: string; conditions: FilterCondition[]; sortField?: string; sortOrder?: string; page?: number; limit?: number }>({
      query: (body) => ({
        url: "/search/advanced",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response.data,
    }),
    globalSearch: builder.query<GlobalSearchResult, string>({
      query: (q) => `/search/global?q=${encodeURIComponent(q)}`,
      transformResponse: (response: any) => response.data,
    }),
  }),
});

export const {
  useSearchTasksQuery,
  useAdvancedFilterMutation,
  useGlobalSearchQuery,
  useLazyGlobalSearchQuery,
} = searchApi;
