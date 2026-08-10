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

let prevUserId: string | null = null;

store.subscribe(() => {
  const state = store.getState();

  const userId = state.auth.user?.id ?? null;
  if (userId && prevUserId && userId !== prevUserId) {
    store.dispatch(api.util.resetApiState());
    store.dispatch(clearWorkspaceState());
  }
  if (userId) {
    prevUserId = userId;
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
