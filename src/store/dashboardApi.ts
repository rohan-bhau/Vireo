import { api } from "./api";

interface DashboardStats {
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

interface TimelineEntry {
  date: string;
  created: number;
  done: number;
}

interface WorkloadEntry {
  userId: string;
  assigned: number;
  urgent: number;
  high: number;
  inProgress: number;
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
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetTaskTimelineQuery,
  useGetTeamWorkloadQuery,
} = dashboardApi;
