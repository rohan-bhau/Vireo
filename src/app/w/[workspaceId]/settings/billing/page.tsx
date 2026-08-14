"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useGetWorkspaceQuery } from "@/store/workspaceApi";
import { SkeletonSettingsPage } from "@/components/ui/skeleton";
import { WorkspaceSettingsBilling } from "@/components/workspace-settings/workspace-settings-billing";

export default function SettingsBillingPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: workspace, isLoading } = useGetWorkspaceQuery(workspaceId, { skip: !workspaceId });

  useEffect(() => {
    if (isLoading) return;
    if (!workspace || !user || workspace.ownerId !== user.id) {
      router.replace(`/w/${workspaceId}/settings`);
    }
  }, [isLoading, workspace, user, workspaceId, router]);

  if (isLoading || !workspace || !user || workspace.ownerId !== user.id) {
    return <SkeletonSettingsPage />;
  }

  return <WorkspaceSettingsBilling />;
}
