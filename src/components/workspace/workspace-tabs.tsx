"use client";

import { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { setActiveTab, addCustomTab, removeCustomTab } from "@/store/workspaceSlice";
import { clsx } from "clsx";
import { Plus, X } from "lucide-react";

interface WorkspaceTabsProps {
  workspaceId: string;
}

export function WorkspaceTabs({ workspaceId }: WorkspaceTabsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const tabConfig = useSelector(
    (state: RootState) => state.workspace.tabsByWorkspace[workspaceId]
  );
  const activeTab = tabConfig?.activeTab ?? "board";
  const tabs = tabConfig?.tabs ?? [];

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTabLabel, setNewTabLabel] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleTabClick(tabId: string) {
    dispatch(setActiveTab({ workspaceId, tabId }));
  }

  function handleAddTab() {
    if (!newTabLabel.trim()) return;
    dispatch(addCustomTab({ workspaceId, label: newTabLabel.trim() }));
    setNewTabLabel("");
    setShowAddDialog(false);
  }

  function handleRemoveTab(e: React.MouseEvent, tabId: string) {
    e.stopPropagation();
    dispatch(removeCustomTab({ workspaceId, tabId }));
  }

  function handleScroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <div className="border-b border-[#C3C6D7]/20 bg-white">
      <div className="relative flex items-center">
        {tabs.length > 4 && (
          <button
            onClick={() => handleScroll("left")}
            className="flex h-full items-center px-2 text-[#737686] hover:text-[#121C28]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex flex-1 overflow-x-auto scrollbar-hide"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={clsx(
                "relative flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-[#2563EB]"
                  : "text-[#737686] hover:text-[#121C28]"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />
              )}
              {tab.type === "custom" && (
                <button
                  onClick={(e) => handleRemoveTab(e, tab.id)}
                  className="ml-1 rounded p-0.5 text-[#C3C6D7] hover:bg-[#F1F2F6] hover:text-[#737686] transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </button>
          ))}
          <div className="relative flex items-center">
            {showAddDialog ? (
              <div className="flex items-center gap-1 px-2">
                <input
                  autoFocus
                  placeholder="Tab name"
                  value={newTabLabel}
                  onChange={(e) => setNewTabLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTab();
                    if (e.key === "Escape") {
                      setShowAddDialog(false);
                      setNewTabLabel("");
                    }
                  }}
                  className="w-28 rounded border border-[#C3C6D7] px-2 py-1 text-xs text-[#121C28] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
                <button
                  onClick={handleAddTab}
                  className="rounded px-1.5 py-1 text-xs font-medium text-[#2563EB] hover:bg-[#EEF4FF] transition-colors"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-[#737686] hover:bg-[#F8F9FF] hover:text-[#2563EB] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Tab
              </button>
            )}
          </div>
        </div>
        {tabs.length > 4 && (
          <button
            onClick={() => handleScroll("right")}
            className="flex h-full items-center px-2 text-[#737686] hover:text-[#121C28]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
