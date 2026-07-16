"use client";

import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import type { RootState } from "@/store";
import { WorkspaceTabs } from "@/components/workspace/workspace-tabs";
import { BoardTab } from "@/components/workspace/board-tab";
import { ListTab } from "@/components/workspace/list-tab";
import { SummaryTab } from "@/components/workspace/summary-tab";
import { PlaceholderTab } from "@/components/workspace/placeholder-tab";

function TabContent({ workspaceId, tabId }: { workspaceId: string; tabId: string }) {
  switch (tabId) {
    case "board":
      return <BoardTab workspaceId={workspaceId} />;
    case "list":
      return <ListTab workspaceId={workspaceId} />;
    case "summary":
      return <SummaryTab workspaceId={workspaceId} />;
    case "roadmap":
      return (
        <PlaceholderTab
          title="Roadmap"
          description="Visualize your team's strategy with a Gantt-chart roadmap. Plan sprints, milestones, and dependencies across projects."
          icon="roadmap"
        />
      );
    case "reports":
      return (
        <PlaceholderTab
          title="Reports"
          description="Track team performance with burndown charts, velocity reports, and custom analytics dashboards."
          icon="reports"
        />
      );
    default:
      return <BoardTab workspaceId={workspaceId} />;
  }
}

export default function WorkspaceHomePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const tabConfig = useSelector(
    (state: RootState) => state.workspace.tabsByWorkspace[workspaceId]
  );
  const activeTab = tabConfig?.activeTab ?? "board";

  return (
    <div className="flex flex-1 flex-col">
      <WorkspaceTabs workspaceId={workspaceId} />
      <div className="flex-1 mt-4">
        <TabContent workspaceId={workspaceId} tabId={activeTab} />
      </div>
    </div>
  );
}
