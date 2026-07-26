"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useGetDashboardsQuery,
  useCreateDashboardMutation,
  useUpdateDashboardMutation,
  useGetGadgetDataQuery,
} from "@/store/dashboardApi";
import { useGetWorkspaceQuery } from "@/store/workspaceApi";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Plus, ChevronDown } from "lucide-react";
import type { GadgetConfig } from "@/store/dashboardApi";

export default function WorkspaceDashboardPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { data: workspace } = useGetWorkspaceQuery(workspaceId);
  const { data: dashboards = [], isLoading: dashboardsLoading } = useGetDashboardsQuery(workspaceId);
  const [createDashboard] = useCreateDashboardMutation();
  const [updateDashboard] = useUpdateDashboardMutation();
  const { data: gadgetData } = useGetGadgetDataQuery(workspaceId);

  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState("");

  const activeDashboard = dashboards.find((d) => d._id === activeDashboardId) || dashboards[0];

  const handleCreateDashboard = async () => {
    if (!newDashboardName.trim()) return;
    await createDashboard({ workspaceId, name: newDashboardName.trim() });
    setNewDashboardName("");
    setShowCreateInput(false);
  };

  const handleUpdateGadgets = async (gadgets: GadgetConfig[]) => {
    if (!activeDashboard) return;
    await updateDashboard({
      workspaceId,
      dashboardId: activeDashboard._id,
      data: { gadgets } as any,
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-[#121C28]">Dashboard</h1>
          <p className="mt-0.5 text-sm text-[#737686]">
            {workspace?.name || "Workspace"} overview and metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button className="flex items-center gap-1.5 rounded-[3px] border border-[#C3C6D7] bg-white px-3 py-1.5 text-xs font-medium text-[#434655] hover:bg-[#F4F5F7] transition-colors">
              <LayoutDashboard className="h-3.5 w-3.5" />
              {activeDashboard?.name || "Default"}
              <ChevronDown className="h-3 w-3" />
            </button>
            <div className="absolute right-0 top-full z-50 mt-1 hidden w-48 rounded-lg border border-[#C3C6D7]/20 bg-white py-1 shadow-lg group-hover:block group-focus-within:block">
              {dashboards.map((d) => (
                <button
                  key={d._id}
                  onClick={() => setActiveDashboardId(d._id)}
                  className={`w-full px-3 py-1.5 text-left text-xs hover:bg-[#F8F9FF] ${
                    activeDashboard?._id === d._id ? "text-[#0052CC] font-medium" : "text-[#434655]"
                  }`}
                >
                  {d.name}
                </button>
              ))}
              {showCreateInput ? (
                <div className="border-t border-[#C3C6D7]/10 px-3 py-2">
                  <input
                    type="text"
                    value={newDashboardName}
                    onChange={(e) => setNewDashboardName(e.target.value)}
                    placeholder="Dashboard name"
                    className="w-full rounded border border-[#C3C6D7] px-2 py-1 text-xs mb-2 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateDashboard();
                      if (e.key === "Escape") setShowCreateInput(false);
                    }}
                  />
                  <button
                    onClick={handleCreateDashboard}
                    className="rounded-[3px] bg-[#0052CC] px-3 py-1 text-[10px] font-medium text-white hover:bg-[#0747A6]"
                  >
                    Create
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateInput(true)}
                  className="flex w-full items-center gap-2 border-t border-[#C3C6D7]/10 px-3 py-1.5 text-left text-xs text-[#2563EB] hover:bg-[#F8F9FF]"
                >
                  <Plus className="h-3 w-3" />
                  New dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {dashboardsLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-white animate-pulse shadow-[0_1px_2px_rgba(0,0,0,0.05)]" />
          ))}
        </div>
      ) : activeDashboard ? (
        <DashboardGrid
          columnCount={activeDashboard.columnCount}
          gadgets={activeDashboard.gadgets}
          gadgetData={gadgetData}
          onUpdateGadgets={handleUpdateGadgets}
        />
      ) : (
        <div className="rounded-xl bg-white p-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF4FF]">
            <LayoutDashboard className="h-8 w-8 text-[#2563EB]" />
          </div>
          <h2 className="text-lg font-semibold text-[#121C28]">No dashboards yet</h2>
          <p className="mt-2 text-sm text-[#737686]">Create a dashboard to get started with customizable gadgets.</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => setShowCreateInput(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
