"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { useGetWorkspaceQuery, useDeleteWorkspaceMutation, useCreateInvitationMutation } from "@/store/workspaceApi";
import { toggleStarredWorkspace } from "@/store/workspaceSlice";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Star, MoreHorizontal, Settings, Trash2, UserPlus, Plus } from "lucide-react";
import { clsx } from "clsx";

interface WorkspaceHeaderProps {
  workspaceId: string;
}

export function WorkspaceHeader({ workspaceId }: WorkspaceHeaderProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: workspace, isLoading } = useGetWorkspaceQuery(workspaceId);
  const [deleteWorkspace, { isLoading: isDeleting }] = useDeleteWorkspaceMutation();
  const [createInvitation, { isLoading: isInviting }] = useCreateInvitationMutation();

  const starredWorkspaces = useSelector(
    (state: RootState) => state.workspace.starredWorkspaces
  );

  const [showMenu, setShowMenu] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  async function handleDelete() {
    try {
      await deleteWorkspace(workspaceId).unwrap();
      router.replace("/dashboard");
    } catch {}
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);
    if (!inviteEmail.trim()) {
      setInviteError("Email is required");
      return;
    }
    try {
      await createInvitation({
        workspaceId,
        inviteeEmail: inviteEmail.trim(),
      }).unwrap();
      setShowInvite(false);
      setInviteEmail("");
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to send invitation";
      setInviteError(message);
    }
  }

  if (isLoading || !workspace) return null;

  const isStarred = !!starredWorkspaces[workspaceId];

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-[#C3C6D7]/20 bg-white px-4 py-3 md:px-6 md:py-4 max-sm:flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF4FF] text-sm font-bold text-[#004AC6]">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-[#121C28]">
              {workspace.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 max-sm:ml-auto">
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1d4ed8] min-h-[36px] sm:min-h-[32px]"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add member</span>
          </button>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-[#737686] transition-colors hover:bg-[#F8F9FF] hover:text-[#121C28]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-[#C3C6D7]/20 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    dispatch(toggleStarredWorkspace(workspaceId));
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[#434655] hover:bg-[#F8F9FF]"
                >
                  <Star
                    className={clsx(
                      "h-3.5 w-3.5",
                      isStarred && "fill-yellow-400 text-yellow-400"
                    )}
                  />
                  {isStarred ? "Unstar workspace" : "Star workspace"}
                </button>
                <Link
                  href={`/w/${workspaceId}/settings`}
                  onClick={() => setShowMenu(false)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[#434655] hover:bg-[#F8F9FF]"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowDelete(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete workspace
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete workspace"
        className="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#737686]">
            Are you sure you want to delete <strong>{workspace.name}</strong>?
            This will permanently remove all projects, tasks, and member
            associations.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={showInvite}
        onClose={() => setShowInvite(false)}
        title="Add member"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          {inviteError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {inviteError}
            </div>
          )}
          <Input
            label="Email address"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowInvite(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isInviting}>
              Send invite
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
