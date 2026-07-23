"use client";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { setVisibleSections } from "@/store/workspaceSlice";
import { Dialog } from "@/components/ui/dialog";
import {
  Sparkles,
  Star,
  History,
  Folders,
  LayoutDashboard,
  Filter,
} from "lucide-react";

interface SidebarCustomizeDialogProps {
  open: boolean;
  onClose: () => void;
}

const sections = [
  { key: "forYou" as const, label: "For You", icon: Sparkles },
  { key: "starred" as const, label: "Starred", icon: Star },
  { key: "recent" as const, label: "Recent", icon: History },
  { key: "projects" as const, label: "Projects", icon: Folders },
  { key: "dashboards" as const, label: "Dashboards", icon: LayoutDashboard },
  { key: "filters" as const, label: "Filters", icon: Filter },
];

export function SidebarCustomizeDialog({
  open,
  onClose,
}: SidebarCustomizeDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const visibleSections = useSelector(
    (state: RootState) => state.workspace.visibleSections
  );

  return (
    <Dialog open={open} onClose={onClose} title="Customize Sidebar">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          Sidebar Sections
        </p>
        <div className="space-y-1">
          {sections.map(({ key, label, icon: Icon }) => (
            <label
              key={key}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-bg-light cursor-pointer"
            >
              <input
                type="checkbox"
                checked={visibleSections[key] ?? true}
                onChange={() =>
                  dispatch(
                    setVisibleSections({ [key]: !visibleSections[key] })
                  )
                }
                className="h-4 w-4 rounded border-border-light text-[#2563EB] focus:ring-[#2563EB]"
              />
              <Icon className="h-4 w-4 text-text-tertiary" />
              <span className="text-sm font-medium text-text">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
