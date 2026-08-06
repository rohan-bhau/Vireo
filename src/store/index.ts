import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import authReducer from "./authSlice";
import sidebarReducer from "./sidebarSlice";
import workspaceReducer, { clearWorkspaceState } from "./workspaceSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    sidebar: sidebarReducer,
    workspace: workspaceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

function getInitialUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem("vireo_access_token");
    if (!token) return null;
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return decoded?.userId || null;
  } catch {
    return null;
  }
}

let prevUserId: string | null = getInitialUserId();

store.subscribe(() => {
  const state = store.getState();

  const userId = state.auth.user?.id ?? null;
  if (userId !== prevUserId) {
    prevUserId = userId;
    store.dispatch(api.util.resetApiState());
    store.dispatch(clearWorkspaceState());
  }

  try {
    localStorage.setItem(
      "vireo_workspace_state",
      JSON.stringify({
        activeWorkspaceId: state.workspace.activeWorkspaceId,
        recentWorkspaces: state.workspace.recentWorkspaces,
        starredWorkspaces: state.workspace.starredWorkspaces,
        visibleSections: state.workspace.visibleSections,
        visibleMenuItems: state.workspace.visibleMenuItems,
        tabsByWorkspace: state.workspace.tabsByWorkspace,
      })
    );
  } catch {}
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
