"use client";

import { useState } from "react";
import { useGetProjectSprintsQuery } from "@/store/sprintApi";
import {
  useGetBurndownQuery,
  useGetVelocityQuery,
  useGetSprintReportQuery,
  useGetCumulativeFlowQuery,
  useGetControlChartQuery,
  useGetCreatedVsResolvedQuery,
} from "@/store/reportApi";
import { ReportSidebar, type ReportType } from "./report-sidebar";
import { BurndownChart } from "./burndown-chart";
import { VelocityChart } from "./velocity-chart";
import { SprintReport } from "./sprint-report";
import { CumulativeFlowDiagram } from "./cumulative-flow-diagram";
import { ControlChart } from "./control-chart";
import { CreatedVsResolved } from "./created-vs-resolved";

interface ReportsViewProps {
  projectId: string;
}

export function ReportsView({ projectId }: ReportsViewProps) {
  const [activeReport, setActiveReport] = useState<ReportType>("burndown");
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);

  const { data: sprints = [] } = useGetProjectSprintsQuery(projectId);
  const activeSprint = sprints.find((s) => s.status === "ACTIVE") || sprints[0];
  const currentSprintId = selectedSprintId || activeSprint?.id;

  const { data: burndownData, isLoading: burndownLoading } = useGetBurndownQuery(
    { sprintId: currentSprintId! },
    { skip: !currentSprintId || activeReport !== "burndown" }
  );
  const { data: velocityData, isLoading: velocityLoading } = useGetVelocityQuery(
    { projectId },
    { skip: activeReport !== "velocity" }
  );
  const { data: sprintReportData, isLoading: sprintReportLoading } = useGetSprintReportQuery(
    { sprintId: currentSprintId! },
    { skip: !currentSprintId || activeReport !== "sprint-report" }
  );
  const { data: cfdData, isLoading: cfdLoading } = useGetCumulativeFlowQuery(
    { projectId },
    { skip: activeReport !== "cfd" }
  );
  const { data: controlChartData, isLoading: controlChartLoading } = useGetControlChartQuery(
    { projectId },
    { skip: activeReport !== "control-chart" }
  );
  const { data: createdVsResolvedData, isLoading: createdVsResolvedLoading } = useGetCreatedVsResolvedQuery(
    { projectId },
    { skip: activeReport !== "created-vs-resolved" }
  );

  const needsSprintSelection = ["burndown", "sprint-report"].includes(activeReport);

  return (
    <div className="flex h-full">
      <ReportSidebar activeReport={activeReport} onSelect={setActiveReport} />
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#121C28]">
              {activeReport === "burndown" && "Burndown Chart"}
              {activeReport === "velocity" && "Velocity Chart"}
              {activeReport === "sprint-report" && "Sprint Report"}
              {activeReport === "cfd" && "Cumulative Flow Diagram"}
              {activeReport === "control-chart" && "Control Chart"}
              {activeReport === "created-vs-resolved" && "Created vs Resolved"}
              {activeReport === "average-age" && "Average Age"}
              {activeReport === "time-to-resolution" && "Time to Resolution"}
            </h2>
            <p className="text-sm text-[#737686]">
              {activeReport === "burndown" && "Track remaining work against time across the sprint"}
              {activeReport === "velocity" && "Story points completed per sprint with rolling average"}
              {activeReport === "sprint-report" && "Planned vs completed vs added vs pushed at sprint close"}
              {activeReport === "cfd" && "Issue count per status as colored bands over time"}
              {activeReport === "control-chart" && "Cycle time per issue with rolling average and standard deviation"}
              {activeReport === "created-vs-resolved" && "Issues created vs resolved over time"}
              {activeReport === "average-age" && "Average age of open issues"}
              {activeReport === "time-to-resolution" && "Average time to resolve issues"}
            </p>
          </div>
          {needsSprintSelection && sprints.length > 0 && (
            <select
              value={currentSprintId || ""}
              onChange={(e) => setSelectedSprintId(e.target.value || null)}
              className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2 text-sm text-[#434655] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status === "ACTIVE" ? "Active" : s.status === "PLANNING" ? "Planning" : "Completed"})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="max-w-4xl">
          {activeReport === "burndown" && (
            <BurndownChart data={burndownData} isLoading={burndownLoading} />
          )}
          {activeReport === "velocity" && (
            <VelocityChart data={velocityData} isLoading={velocityLoading} />
          )}
          {activeReport === "sprint-report" && (
            <SprintReport data={sprintReportData} isLoading={sprintReportLoading} />
          )}
          {activeReport === "cfd" && (
            <CumulativeFlowDiagram data={cfdData} isLoading={cfdLoading} />
          )}
          {activeReport === "control-chart" && (
            <ControlChart data={controlChartData} isLoading={controlChartLoading} />
          )}
          {activeReport === "created-vs-resolved" && (
            <CreatedVsResolved data={createdVsResolvedData} isLoading={createdVsResolvedLoading} />
          )}
          {(activeReport === "average-age" || activeReport === "time-to-resolution") && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#C3C6D7]/30 bg-white py-16 text-center">
              <p className="text-sm text-[#737686]">Coming soon</p>
              <p className="text-xs text-[#C3C6D7] mt-1">This report will be available in a future update</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
