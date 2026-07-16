"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { setActiveWorkspace, addRecentWorkspace } from "@/store/workspaceSlice";
import { AppLayout } from "@/components/layout/app-layout";
import { WorkspaceHeader } from "@/components/layout/workspace-header";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (workspaceId) {
      dispatch(setActiveWorkspace(workspaceId));
      dispatch(addRecentWorkspace(workspaceId));
    }
  }, [workspaceId, dispatch]);

  return (
    <AppLayout sidebarProps={{ workspaceId }}>
      <WorkspaceHeader workspaceId={workspaceId} />
      {children}
    </AppLayout>
  );
}
