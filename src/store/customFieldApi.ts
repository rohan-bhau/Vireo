import { api } from "./api";

export type CustomFieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "DATE"
  | "SELECT"
  | "MULTISELECT";

export interface CustomField {
  _id: string;
  workspaceId: string;
  name: string;
  type: CustomFieldType;
  options: string[];
  required: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface CustomFieldResponse {
  status: string;
  data: { customField: CustomField };
}

interface CustomFieldsResponse {
  status: string;
  data: { customFields: CustomField[] };
}

interface CreateCustomFieldInput {
  name: string;
  type: CustomFieldType;
  options?: string[];
  required?: boolean;
}

interface UpdateCustomFieldInput {
  name?: string;
  type?: CustomFieldType;
  options?: string[];
  required?: boolean;
}

export const customFieldApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaceCustomFields: builder.query<CustomField[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/custom-fields`,
      transformResponse: (response: CustomFieldsResponse) => response.data.customFields,
      providesTags: (_result, _error, workspaceId) => [
        { type: "CustomField", id: `workspace-${workspaceId}` },
      ],
    }),
    createCustomField: builder.mutation<CustomField, { workspaceId: string; data: CreateCustomFieldInput }>({
      query: ({ workspaceId, data }) => ({
        url: `/workspaces/${workspaceId}/custom-fields`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: CustomFieldResponse) => response.data.customField,
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "CustomField", id: `workspace-${workspaceId}` },
      ],
    }),
    updateCustomField: builder.mutation<CustomField, { workspaceId: string; fieldId: string; data: UpdateCustomFieldInput }>({
      query: ({ workspaceId, fieldId, data }) => ({
        url: `/workspaces/${workspaceId}/custom-fields/${fieldId}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: CustomFieldResponse) => response.data.customField,
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "CustomField", id: `workspace-${workspaceId}` },
        "Task",
      ],
    }),
    deleteCustomField: builder.mutation<void, { workspaceId: string; fieldId: string }>({
      query: ({ workspaceId, fieldId }) => ({
        url: `/workspaces/${workspaceId}/custom-fields/${fieldId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "CustomField", id: `workspace-${workspaceId}` },
        "Task",
      ],
    }),
  }),
});

export const {
  useGetWorkspaceCustomFieldsQuery,
  useCreateCustomFieldMutation,
  useUpdateCustomFieldMutation,
  useDeleteCustomFieldMutation,
} = customFieldApi;