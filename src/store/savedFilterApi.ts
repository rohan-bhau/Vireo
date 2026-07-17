import { api } from "./api";

export interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

export interface SavedFilter {
  _id: string;
  name: string;
  userId: string;
  workspaceId: string;
  projectId?: string;
  conditions: FilterCondition[];
  sortField?: string;
  sortOrder?: "asc" | "desc";
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FilterResponse {
  status: string;
  data: { filter: SavedFilter };
}

interface FiltersResponse {
  status: string;
  data: { filters: SavedFilter[] };
}

export const savedFilterApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaceFilters: builder.query<SavedFilter[], string>({
      query: (workspaceId) => `/filters/workspace/${workspaceId}`,
      transformResponse: (response: FiltersResponse) => response.data.filters,
    }),
    getSavedFilter: builder.query<SavedFilter, string>({
      query: (id) => `/filters/${id}`,
      transformResponse: (response: FilterResponse) => response.data.filter,
    }),
    createSavedFilter: builder.mutation<SavedFilter, {
      name: string; workspaceId: string; projectId?: string;
      conditions: FilterCondition[]; sortField?: string; sortOrder?: string; isShared?: boolean;
    }>({
      query: (body) => ({
        url: "/filters",
        method: "POST",
        body,
      }),
      transformResponse: (response: FilterResponse) => response.data.filter,
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Project", id: `filter-${workspaceId}` },
      ],
    }),
    updateSavedFilter: builder.mutation<SavedFilter, { id: string; data: Partial<SavedFilter> }>({
      query: ({ id, data }) => ({
        url: `/filters/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: FilterResponse) => response.data.filter,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Project", id: `filter-${id}` },
      ],
    }),
    deleteSavedFilter: builder.mutation<void, string>({
      query: (id) => ({
        url: `/filters/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),
  }),
});

export const {
  useGetWorkspaceFiltersQuery,
  useGetSavedFilterQuery,
  useCreateSavedFilterMutation,
  useUpdateSavedFilterMutation,
  useDeleteSavedFilterMutation,
} = savedFilterApi;
