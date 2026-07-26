import { api } from "./api";
import type { Task } from "./taskApi";

export interface DashboardStats {
  taskStats: {
    total: number;
    byStatus: { todo: number; inProgress: number; inReview: number; done: number };
    byPriority: { highest: number; high: number; medium: number; low: number; lowest: number };
    byType: { task: number; bug: number; epic: number; story: number; subtask: number };
  };
  memberCount: number;
  projectCount: number;
  activeSprintCount: number;
  recentActivity: Array<{
    _id: string;
    actorName: string;
    action: string;
    entityType: string;
    entityName: string;
    createdAt: string;
  }>;
}

export interface TimelineEntry {
  date: string;
  created: number;
  done: number;
}

export interface WorkloadEntry {
  userId: string;
  assigned: number;
  urgent: number;
  high: number;
  inProgress: number;
}

export interface GadgetConfig {
  gadgetId: string;
  type: string;
  title: string;
  filterId?: string;
  timeRange?: string;
  refreshInterval?: number;
  displayOptions?: Record<string, unknown>;
  position: number;
  width: 1 | 2 | 3;
  height: 1 | 2;
}

export interface Dashboard {
  _id: string;
  name: string;
  description?: string;
  workspaceId: string;
  ownerId: string;
  shared: boolean;
  sharedWith: string[];
  columnCount: 2 | 3;
  gadgets: GadgetConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface GadgetData {
  assignedToMe: Task[];
  recentlyCreated: Task[];
  sprintStatus: Array<{
    sprintId: string;
    name: string;
    projectName: string;
    totalPoints: number;
    completedPoints: number;
    progress: number;
    endDate: string | null;
  }>;
  activityStream: Array<{
    _id: string;
    actorName: string;
    action: string;
    entityType: string;
    entityName: string;
    createdAt: string;
  }>;
  statistics: {
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  };
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, string>({
      query: (workspaceId) => `/dashboard/${workspaceId}/stats`,
      transformResponse: (response: { status: string; data: DashboardStats }) => response.data,
      providesTags: ["Dashboard"],
    }),
    getTaskTimeline: builder.query<TimelineEntry[], { workspaceId: string; days?: number }>({
      query: ({ workspaceId, days }) => {
        const params = days ? `?days=${days}` : "";
        return `/dashboard/${workspaceId}/timeline${params}`;
      },
      transformResponse: (response: { status: string; data: { timeline: TimelineEntry[] } }) => response.data.timeline,
      providesTags: ["Dashboard"],
    }),
    getTeamWorkload: builder.query<WorkloadEntry[], string>({
      query: (workspaceId) => `/dashboard/${workspaceId}/workload`,
      transformResponse: (response: { status: string; data: { workload: WorkloadEntry[] } }) => response.data.workload,
      providesTags: ["Dashboard"],
    }),
    getDashboards: builder.query<Dashboard[], string>({
      query: (workspaceId) => `/dashboard/${workspaceId}`,
      transformResponse: (response: { status: string; data: { dashboards: Dashboard[] } }) => response.data.dashboards,
      providesTags: (_result, _error, workspaceId) => [{ type: "Dashboard", id: `workspace-${workspaceId}` }],
    }),
    getDashboard: builder.query<Dashboard, { workspaceId: string; dashboardId: string }>({
      query: ({ workspaceId, dashboardId }) => `/dashboard/${workspaceId}/${dashboardId}`,
      transformResponse: (response: { status: string; data: { dashboard: Dashboard } }) => response.data.dashboard,
      providesTags: (_result, _error, { dashboardId }) => [{ type: "Dashboard", id: dashboardId }],
    }),
    createDashboard: builder.mutation<Dashboard, { workspaceId: string; name: string; description?: string }>({
      query: ({ workspaceId, ...body }) => ({
        url: `/dashboard/${workspaceId}`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { status: string; data: { dashboard: Dashboard } }) => response.data.dashboard,
      invalidatesTags: (_result, _error, { workspaceId }) => [{ type: "Dashboard", id: `workspace-${workspaceId}` }],
    }),
    updateDashboard: builder.mutation<Dashboard, { workspaceId: string; dashboardId: string; data: Partial<Dashboard> }>({
      query: ({ workspaceId, dashboardId, data }) => ({
        url: `/dashboard/${workspaceId}/${dashboardId}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: { status: string; data: { dashboard: Dashboard } }) => response.data.dashboard,
      invalidatesTags: (_result, _error, { dashboardId, workspaceId }) => [
        { type: "Dashboard", id: dashboardId },
        { type: "Dashboard", id: `workspace-${workspaceId}` },
      ],
    }),
    deleteDashboard: builder.mutation<void, { workspaceId: string; dashboardId: string }>({
      query: ({ workspaceId, dashboardId }) => ({
        url: `/dashboard/${workspaceId}/${dashboardId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [{ type: "Dashboard", id: `workspace-${workspaceId}` }],
    }),
    getGadgetData: builder.query<GadgetData, string>({
      query: (workspaceId) => `/dashboard/${workspaceId}/gadgets`,
      transformResponse: (response: { status: string; data: GadgetData }) => response.data,
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetTaskTimelineQuery,
  useGetTeamWorkloadQuery,
  useGetDashboardsQuery,
  useGetDashboardQuery,
  useCreateDashboardMutation,
  useUpdateDashboardMutation,
  useDeleteDashboardMutation,
  useGetGadgetDataQuery,
} = dashboardApi;
