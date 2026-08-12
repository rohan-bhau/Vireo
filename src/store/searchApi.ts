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
  epics: Task[];
  workspaces: { id: string; name: string }[];
  projects: { id: string; name: string; key: string }[];
  total: number;
}

interface Suggestion {
  value: string;
  label: string;
}

interface SuggestResult {
  suggestions: Suggestion[];
}

interface JqlValidateResult {
  valid: boolean;
  error: { message: string; position: number } | null;
}

interface SearchDataResponse<T> {
  status: string;
  data: T;
}

export const searchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchTasks: builder.query<SearchResult, { workspaceId?: string; projectId?: string; q?: string; status?: string; priority?: string; type?: string; assignee?: string; labels?: string; sortField?: string; sortOrder?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: "/search",
        params,
      }),
      transformResponse: (response: SearchDataResponse<SearchResult>) => response.data,
    }),
    advancedFilter: builder.mutation<SearchResult, { workspaceId: string; conditions: FilterCondition[]; sortField?: string; sortOrder?: string; page?: number; limit?: number }>({
      query: (body) => ({
        url: "/search/advanced",
        method: "POST",
        body,
      }),
      transformResponse: (response: SearchDataResponse<SearchResult>) => response.data,
    }),
    globalSearch: builder.query<GlobalSearchResult, string>({
      query: (q) => `/search/global?q=${encodeURIComponent(q)}`,
      transformResponse: (response: SearchDataResponse<GlobalSearchResult>) => response.data,
    }),
    jqlSearch: builder.query<SearchResult, { query: string; workspaceId?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: "/search/jql",
        params,
      }),
      transformResponse: (response: SearchDataResponse<SearchResult>) => response.data,
    }),
    validateJql: builder.mutation<JqlValidateResult, { query: string }>({
      query: (body) => ({
        url: "/search/validate",
        method: "POST",
        body,
      }),
      transformResponse: (response: SearchDataResponse<JqlValidateResult>) => response.data,
    }),
    getSuggestions: builder.query<SuggestResult, { q: string; type: string; workspaceId?: string; field?: string }>({
      query: (params) => ({
        url: "/search/suggest",
        params,
      }),
      transformResponse: (response: SearchDataResponse<SuggestResult>) => response.data,
    }),
  }),
});

export const {
  useSearchTasksQuery,
  useAdvancedFilterMutation,
  useGlobalSearchQuery,
  useLazyGlobalSearchQuery,
  useJqlSearchQuery,
  useLazyJqlSearchQuery,
  useValidateJqlMutation,
  useLazyGetSuggestionsQuery,
} = searchApi;
