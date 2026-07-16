import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import authReducer from "./authSlice";
import sidebarReducer from "./sidebarSlice";
import workspaceReducer from "./workspaceSlice";

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

store.subscribe(() => {
  const state = store.getState().workspace;
  try {
    localStorage.setItem(
      "vireo_workspace_state",
      JSON.stringify({
        activeWorkspaceId: state.activeWorkspaceId,
        recentWorkspaces: state.recentWorkspaces,
        starredWorkspaces: state.starredWorkspaces,
        visibleSections: state.visibleSections,
        visibleMenuItems: state.visibleMenuItems,
      })
    );
  } catch {}
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
