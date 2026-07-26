import { api } from "./api";

export interface BurndownData {
  sprintId: string;
  sprintName: string;
  totalDays: number;
  totalPoints: number;
  dailyData: { day: number; date: string; ideal: number; actual: number }[];
  status: string;
  sprintStatus: string;
}

export interface VelocitySprint {
  sprintId: string;
  name: string;
  totalPoints: number;
  completedPoints: number;
  totalTasks: number;
  completedTasks: number;
  startDate: string | null;
  endDate: string | null;
}

export interface VelocityData {
  sprints: VelocitySprint[];
  avgVelocity: number;
  sprintCount: number;
}

export interface SprintReportIssue {
  key: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  storyPoints: number;
  assignee: string | null;
  outcome: string;
}

export interface SprintReportData {
  sprintId: string;
  sprintName: string;
  planned: { count: number; points: number };
  added: { count: number; points: number };
  completed: { count: number; points: number };
  pushed: { count: number; points: number };
  removed: { count: number; points: number };
  totalPlanned: { points: number };
  completion: number;
  issues: SprintReportIssue[];
}

export interface CFDStatus {
  key: string;
  label: string;
}

export interface CFDDataPoint {
  date: string;
  counts: Record<string, number>;
}

export interface CFDData {
  projectId: string;
  weeks: number;
  statuses: CFDStatus[];
  data: CFDDataPoint[];
}

export interface ControlChartIssue {
  key: string;
  title: string;
  type: string;
  priority: string;
  assignee: string | null;
  cycleTime: number;
  completedDate: string;
}

export interface ControlChartData {
  projectId: string;
  days: number;
  issues: ControlChartIssue[];
  avgCycleTime: number;
  stdDev: number;
  upperBand: number;
  lowerBand: number;
}

export interface CreatedVsResolvedDataPoint {
  date: string;
  created: number;
  resolved: number;
}

export interface CreatedVsResolvedData {
  projectId: string;
  weeks: number;
  data: CreatedVsResolvedDataPoint[];
}

export const reportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBurndown: builder.query<BurndownData, { sprintId: string }>({
      query: ({ sprintId }) => `/reports/burndown?sprintId=${sprintId}`,
      transformResponse: (response: { status: string; data: BurndownData }) => response.data,
    }),
    getVelocity: builder.query<VelocityData, { projectId: string; sprintCount?: number }>({
      query: ({ projectId, sprintCount }) => {
        const params = sprintCount ? `&sprintCount=${sprintCount}` : "";
        return `/reports/velocity?projectId=${projectId}${params}`;
      },
      transformResponse: (response: { status: string; data: VelocityData }) => response.data,
    }),
    getSprintReport: builder.query<SprintReportData, { sprintId: string }>({
      query: ({ sprintId }) => `/reports/sprint-report?sprintId=${sprintId}`,
      transformResponse: (response: { status: string; data: SprintReportData }) => response.data,
    }),
    getCumulativeFlow: builder.query<CFDData, { projectId: string; weeks?: number }>({
      query: ({ projectId, weeks }) => {
        const params = weeks ? `&weeks=${weeks}` : "";
        return `/reports/cfd?projectId=${projectId}${params}`;
      },
      transformResponse: (response: { status: string; data: CFDData }) => response.data,
    }),
    getControlChart: builder.query<ControlChartData, { projectId: string; days?: number }>({
      query: ({ projectId, days }) => {
        const params = days ? `&days=${days}` : "";
        return `/reports/control-chart?projectId=${projectId}${params}`;
      },
      transformResponse: (response: { status: string; data: ControlChartData }) => response.data,
    }),
    getCreatedVsResolved: builder.query<CreatedVsResolvedData, { projectId: string; weeks?: number }>({
      query: ({ projectId, weeks }) => {
        const params = weeks ? `&weeks=${weeks}` : "";
        return `/reports/created-vs-resolved?projectId=${projectId}${params}`;
      },
      transformResponse: (response: { status: string; data: CreatedVsResolvedData }) => response.data,
    }),
  }),
});

export const {
  useGetBurndownQuery,
  useGetVelocityQuery,
  useGetSprintReportQuery,
  useGetCumulativeFlowQuery,
  useGetControlChartQuery,
  useGetCreatedVsResolvedQuery,
} = reportApi;
