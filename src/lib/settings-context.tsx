"use client";

import { createContext, useContext } from "react";

export interface SettingsContextValue {
  workspaceId: string;
  isAdmin: boolean;
  isOwner: boolean;
}

export const SettingsContext = createContext<SettingsContextValue>({
  workspaceId: "",
  isAdmin: false,
  isOwner: false,
});

export function useSettings() {
  return useContext(SettingsContext);
}

export function RequireAdmin({
  children,
  message,
}: {
  children: React.ReactNode;
  message?: string;
}) {
  const { isAdmin } = useSettings();
  if (isAdmin) {
    return <>{children}</>;
  }
  return (
    <div className="rounded-xl border border-border-light bg-surface p-8 text-center">
      <p className="text-sm font-semibold text-text">Admins only</p>
      <p className="mt-1 text-sm text-text-tertiary">
        {message || "Only workspace admins can configure this. You can view the workspace, but changes here require admin access."}
      </p>
    </div>
  );
}