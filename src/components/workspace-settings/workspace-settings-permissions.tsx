"use client";

import { ROLE_MATRIX, type MatrixCell } from "@/lib/workspace-roles";
import { Check, Minus } from "lucide-react";
import { clsx } from "clsx";

const COLUMNS: { key: "owner" | "admin" | "edit" | "view"; label: string }[] = [
  { key: "owner", label: "Owner" },
  { key: "admin", label: "Admin" },
  { key: "edit", label: "Edit" },
  { key: "view", label: "View" },
];

function Cell({ value, dim }: { value: MatrixCell; dim?: boolean }) {
  return (
    <div className={clsx("flex items-center justify-center gap-1", dim && "opacity-40")}>
      {value === "Yes" && <Check className="h-4 w-4 text-green-600" />}
      {value === "No" && <Minus className="h-4 w-4 text-text-tertiary" />}
      {value === "Own only" && <span className="text-[11px] font-medium text-amber-600">Own only</span>}
    </div>
  );
}

export function WorkspaceSettingsPermissions() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text">Permissions</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          This matrix reflects exactly what the workspace role system enforces. It is informational — roles are managed from the Members page.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-light bg-surface">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-border-light bg-bg-light/60">
              <th className="w-[40%] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                Action
              </th>
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {ROLE_MATRIX.map((row) => (
              <tr key={row.action} className="transition-colors hover:bg-bg-light/50">
                <td className="px-5 py-3 text-sm text-text">{row.action}</td>
                {COLUMNS.map((c) => (
                  <td key={c.key}>
                    <Cell
                      value={row[c.key]}
                      dim={row.action === "Edit / update / delete a task" && c.key === "edit"}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-[#E9D5FF] bg-[#F5F3FF] px-4 py-3">
        <div className="mt-0.5 text-[#6D28D9]">
          <Shield className="h-4 w-4" />
        </div>
        <p className="text-xs leading-relaxed text-text-secondary">
          The owner role is assigned automatically to the workspace creator and can only change through an explicit transfer. Admins cannot delete the workspace, change the owner&apos;s role, or manage other admins unless they are also the owner.
        </p>
      </div>
    </div>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}