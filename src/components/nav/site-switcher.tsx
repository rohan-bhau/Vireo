"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { useGetWorkspacesQuery } from "@/store/workspaceApi";
import { setActiveWorkspace, addRecentWorkspace } from "@/store/workspaceSlice";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";

export function SiteSwitcher() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: workspaces = [] } = useGetWorkspacesQuery();
  const activeWorkspaceId = useSelector(
    (state: RootState) => state.workspace.activeWorkspaceId
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  function handleSelect(wsId: string) {
    dispatch(setActiveWorkspace(wsId));
    dispatch(addRecentWorkspace(wsId));
    setOpen(false);
    router.push(`/w/${wsId}`);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-[3px] px-2 py-1.5 text-sm font-semibold text-text transition-colors hover:bg-bg-light"
      >
        <span>{activeWorkspace?.name || "Vireo"}</span>
        <ChevronDown
          className={clsx(
            "h-3.5 w-3.5 text-text-tertiary transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-56 rounded-[3px] border border-border-light bg-surface shadow-dropdown z-50">
          <div className="border-b border-border-light px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              Workspaces
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => handleSelect(ws.id)}
                className={clsx(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors min-h-[38px]",
                  ws.id === activeWorkspaceId
                    ? "bg-bg-light text-text font-semibold"
                    : "text-text-secondary hover:bg-bg-light"
                )}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] bg-[#EEF4FF] text-[9px] font-bold text-[#004AC6]">
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
