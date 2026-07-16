"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WorkspaceState {
  activeWorkspaceId: string | null;
  recentWorkspaces: string[];
  starredWorkspaces: Record<string, boolean>;
  visibleSections: {
    forYou: boolean;
    starred: boolean;
    recent: boolean;
    allWorkspaces: boolean;
  };
  visibleMenuItems: {
    board: boolean;
    list: boolean;
    reports: boolean;
    roadmap: boolean;
    teamChat: boolean;
    automation: boolean;
  };
}

const WORKSPACE_STORAGE_KEY = "vireo_workspace_state";

function loadState(): WorkspaceState {
  if (typeof window === "undefined") return defaultState;
  try {
    const saved = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        activeWorkspaceId: parsed.activeWorkspaceId || null,
        recentWorkspaces: Array.isArray(parsed.recentWorkspaces)
          ? parsed.recentWorkspaces
          : [],
        starredWorkspaces:
          typeof parsed.starredWorkspaces === "object"
            ? parsed.starredWorkspaces
            : {},
        visibleSections: {
          forYou: parsed.visibleSections?.forYou ?? true,
          starred: parsed.visibleSections?.starred ?? true,
          recent: parsed.visibleSections?.recent ?? true,
          allWorkspaces: parsed.visibleSections?.allWorkspaces ?? true,
        },
        visibleMenuItems: {
          board: parsed.visibleMenuItems?.board ?? false,
          list: parsed.visibleMenuItems?.list ?? false,
          reports: parsed.visibleMenuItems?.reports ?? false,
          roadmap: parsed.visibleMenuItems?.roadmap ?? false,
          teamChat: parsed.visibleMenuItems?.teamChat ?? false,
          automation: parsed.visibleMenuItems?.automation ?? false,
        },
      };
    }
  } catch {}
  return defaultState;
}

const defaultState: WorkspaceState = {
  activeWorkspaceId: null,
  recentWorkspaces: [],
  starredWorkspaces: {},
  visibleSections: {
    forYou: true,
    starred: true,
    recent: true,
    allWorkspaces: true,
  },
  visibleMenuItems: {
    board: false,
    list: false,
    reports: false,
    roadmap: false,
    teamChat: false,
    automation: false,
  },
};

const initialState: WorkspaceState = loadState();

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setActiveWorkspace(state, action: PayloadAction<string>) {
      state.activeWorkspaceId = action.payload;
    },
    addRecentWorkspace(state, action: PayloadAction<string>) {
      state.recentWorkspaces = [
        action.payload,
        ...state.recentWorkspaces.filter((id) => id !== action.payload),
      ].slice(0, 5);
    },
    toggleStarredWorkspace(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.starredWorkspaces[id]) {
        delete state.starredWorkspaces[id];
      } else {
        state.starredWorkspaces[id] = true;
      }
    },
    setVisibleSections(
      state,
      action: PayloadAction<Partial<WorkspaceState["visibleSections"]>>
    ) {
      state.visibleSections = { ...state.visibleSections, ...action.payload };
    },
    setVisibleMenuItems(
      state,
      action: PayloadAction<Partial<WorkspaceState["visibleMenuItems"]>>
    ) {
      state.visibleMenuItems = {
        ...state.visibleMenuItems,
        ...action.payload,
      };
    },
    clearWorkspaceState() {
      return { ...defaultState };
    },
  },
});

export const {
  setActiveWorkspace,
  addRecentWorkspace,
  toggleStarredWorkspace,
  setVisibleSections,
  setVisibleMenuItems,
  clearWorkspaceState,
} = workspaceSlice.actions;

export type { WorkspaceState };
export default workspaceSlice.reducer;
