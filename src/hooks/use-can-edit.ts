"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useGetMembersQuery, type WorkspaceMember } from "@/store/workspaceApi";

export function useCurrentMember(workspaceId: string): WorkspaceMember | undefined {
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const { data: members = [] } = useGetMembersQuery(workspaceId, { skip: !workspaceId });
  return members.find((m) => m.userId === currentUserId);
}

export function useCanEdit(workspaceId: string): boolean {
  const currentMember = useCurrentMember(workspaceId);
  return currentMember ? currentMember.role !== "VIEW" : false;
}
