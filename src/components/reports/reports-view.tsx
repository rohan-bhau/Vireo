"use client";

import { useState } from "react";
import {
  useGetProjectSprintsQuery,
  useGetSprintTasksQuery,
} from "@/store/sprintApi";
import { BurndownChart } from "./burndown-chart";
import { VelocityChart } from "./velocity-chart";
import { clsx } from "clsx";

interface ReportsViewProps {
  projectId: string;
}

export function ReportsView({ projectId }: ReportsViewProps) {
  const { data: sprints = [] } = useGetProjectSprintsQuery(projectId);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);

  const completedSprints = sprints.filter((s) => s.status === "COMPLETED");
  const activeSprint = sprints.find((s) => s.status === "ACTIVE") || completedSprints[0] || sprints[0];

  const currentSprintId = selectedSprintId || activeSprint?.id;
  const { data: sprintTasks = [] } = useGetSprintTasksQuery(currentSprintId ?? "", { skip: !currentSprintId });
  const currentSprint = sprints.find((s) => s.id === currentSprintId);

  const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const completedPoints = sprintTasks.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  const totalDays = currentSprint?.startDate && currentSprint?.endDate
    ? Math.max(1, Math.ceil((new Date(currentSprint.endDate).getTime() - new Date(currentSprint.startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 14;
  const daysElapsed = currentSprint?.startDate
    ? Math.max(0, Math.min(totalDays, Math.ceil((Date.now() - new Date(currentSprint.startDate).getTime()) / (1000 * 60 * 60 * 24))))
    : 0;

  const velocityData = completedSprints.map((s) => {
    return {
      name: s.name,
      totalPoints: 0,
      completedPoints: 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#121C28]">Reports</h2>
          <p className="text-sm text-[#737686]">Track sprint progress and team velocity</p>
        </div>
        {sprints.length > 0 && (
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

      {currentSprint && currentSprint.status !== "PLANNING" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <BurndownChart
            totalPoints={totalPoints}
            completedPoints={completedPoints}
            daysElapsed={daysElapsed}
            totalDays={totalDays}
          />
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h3 className="text-sm font-semibold text-[#121C28] mb-4">Sprint Overview</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#737686] mb-1">Progress</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-[#F1F2F6] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2563EB] transition-all"
                      style={{ width: `${totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-[#121C28]">
                    {totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-[#F8F9FF] p-3">
                  <p className="text-xs text-[#737686]">Total Points</p>
                  <p className="text-lg font-bold text-[#121C28]">{totalPoints}</p>
                </div>
                <div className="rounded-lg bg-[#F8F9FF] p-3">
                  <p className="text-xs text-[#737686]">Completed</p>
                  <p className="text-lg font-bold text-green-600">{completedPoints}</p>
                </div>
                <div className="rounded-lg bg-[#F8F9FF] p-3">
                  <p className="text-xs text-[#737686]">Remaining</p>
                  <p className="text-lg font-bold text-[#D97706]">{totalPoints - completedPoints}</p>
                </div>
                <div className="rounded-lg bg-[#F8F9FF] p-3">
                  <p className="text-xs text-[#737686]">Tasks</p>
                  <p className="text-lg font-bold text-[#121C28]">{sprintTasks.length}</p>
                </div>
              </div>
              {currentSprint.goal && (
                <div className="rounded-lg bg-[#EEF4FF] p-3">
                  <p className="text-xs font-medium text-[#2563EB] mb-0.5">Sprint Goal</p>
                  <p className="text-sm text-[#121C28]">{currentSprint.goal}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : currentSprint ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#C3C6D7]/30 bg-white py-16 text-center">
          <svg className="mb-3 h-10 w-10 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="12" width="4" height="9" rx="1" />
            <rect x="10" y="7" width="4" height="14" rx="1" />
            <rect x="17" y="3" width="4" height="18" rx="1" />
          </svg>
          <p className="text-sm text-[#737686]">Selected sprint is in planning</p>
          <p className="text-xs text-[#C3C6D7] mt-1">Start the sprint to see burndown reports</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#C3C6D7]/30 bg-white py-16 text-center">
          <p className="text-sm text-[#737686]">Create and start a sprint to see reports</p>
        </div>
      )}

      <VelocityChart
        sprints={completedSprints.map((s) => ({
          name: s.name,
          totalPoints: totalPoints,
          completedPoints: completedPoints,
        }))}
      />
    </div>
  );
}
