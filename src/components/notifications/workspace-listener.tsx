"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/store/api";
import { onWorkspaceRemoved, onWorkspaceMemberRoleChanged } from "@/lib/socket";

export function WorkspaceListener() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const cleanup1 = onWorkspaceRemoved(({ workspaceId }) => {
      if (pathname?.startsWith(`/w/${workspaceId}`)) {
        router.replace("/dashboard");
      }
      dispatch(api.util.invalidateTags(["Workspace", "Dashboard", "Members", "Invitations"]));
    });

    const cleanup2 = onWorkspaceMemberRoleChanged(() => {
      dispatch(api.util.invalidateTags(["Workspace", "Members"]));
    });

    return () => {
      cleanup1();
      cleanup2();
    };
  }, [dispatch, router, pathname]);

  return null;
}
