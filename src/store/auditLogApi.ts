import { api } from "./api";

export interface AuditLog {
  _id: string;
  workspaceId: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  details: Record<string, unknown>;
  ip: string;
  createdAt: string;
}

interface AuditLogsResponse {
  status: string;
  data: {
    logs: AuditLog[];
    total: number;
    limit: number;
    offset: number;
  };
}

interface EntityTypesResponse {
  status: string;
  data: { types: string[] };
}

interface ActionsResponse {
  status: string;
  data: { actions: string[] };
}

export const auditLogApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      { logs: AuditLog[]; total: number; limit: number; offset: number },
      { workspaceId: string; limit?: number; offset?: number; entityType?: string; action?: string; actorId?: string }
    >({
      query: ({ workspaceId, limit, offset, entityType, action, actorId }) => {
        const params = new URLSearchParams();
        if (limit) params.set("limit", String(limit));
        if (offset) params.set("offset", String(offset));
        if (entityType) params.set("entityType", entityType);
        if (action) params.set("action", action);
        if (actorId) params.set("actorId", actorId);
        const qs = params.toString();
        return `/audit-logs/${workspaceId}${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: AuditLogsResponse) => response.data,
      providesTags: ["AuditLog"],
    }),
    getAuditLogEntityTypes: builder.query<string[], string>({
      query: (workspaceId) => `/audit-logs/${workspaceId}/entity-types`,
      transformResponse: (response: EntityTypesResponse) => response.data.types,
    }),
    getAuditLogActions: builder.query<string[], string>({
      query: (workspaceId) => `/audit-logs/${workspaceId}/actions`,
      transformResponse: (response: ActionsResponse) => response.data.actions,
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useGetAuditLogEntityTypesQuery,
  useGetAuditLogActionsQuery,
} = auditLogApi;
