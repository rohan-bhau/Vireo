"use client";

import { SYSTEM_ROLES } from "@/lib/workspace-roles";
import { Shield, Lock } from "lucide-react";
import { clsx } from "clsx";

export function WorkspaceSettingsRoles() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text">Roles</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          These are the fixed, system-defined roles for the workspace. They cannot be created or renamed.
        </p>
      </div>

      <div className="space-y-3">
        {SYSTEM_ROLES.map((role) => (
          <div key={role.id} className="rounded-xl border border-border-light bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={clsx("flex h-9 w-9 items-center justify-center rounded-full", role.badge)}>
                  <Shield className="h-4 w-4" />
                </span>
                <h3 className="text-base font-semibold text-text">{role.label}</h3>
              </div>
              {role.id === "OWNER" && (
                <span className="flex items-center gap-1 rounded-full bg-bg-light px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                  <Lock className="h-3 w-3" /> System
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{role.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border-light bg-bg-light/50 px-4 py-3">
        <p className="text-xs text-text-tertiary">
          Assign these roles to members from the <strong className="text-text-secondary">People / Access</strong> page. The owner is set when the workspace is created and can only be changed by transferring ownership.
        </p>
      </div>
    </div>
  );
}