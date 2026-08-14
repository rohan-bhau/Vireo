"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useGetMembersQuery } from "@/store/workspaceApi";

export function useCanEdit(workspaceId: string): boolean {
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const { data: members = [] } = useGetMembersQuery(workspaceId, { skip: !workspaceId });
  const currentMember = members.find((m) => m.userId === currentUserId);
  return currentMember ? currentMember.role !== "VIEW" : false;
}
