"use client";

import { useGetRuleAuditQuery } from "@/store/automationApi";

interface RuleAuditLogProps {
  ruleId: string;
}

export function RuleAuditLog({ ruleId }: RuleAuditLogProps) {
  const { data: entries, isLoading } = useGetRuleAuditQuery(ruleId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <svg className="h-5 w-5 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="rounded-lg bg-bg-light py-6 text-center">
        <svg className="mx-auto mb-2 h-8 w-8 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-text-tertiary">No audit entries yet for this rule.</p>
        <p className="text-xs text-text-tertiary mt-1">Entries will appear after the rule is triggered.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#737686]">
          {entries.length} execution{entries.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry._id}
            className="flex items-center justify-between rounded-lg border border-[#C3C6D7]/10 bg-white px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  entry.status === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                }`}
              >
                {entry.status === "success" ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                )}
              </span>
              <div>
                <p className="text-xs font-medium text-[#121C28]">{entry.taskKey || "System"}</p>
                <p className="text-[10px] text-[#C3C6D7]">
                  {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "Unknown"}
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-medium ${
                entry.status === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {entry.status === "success" ? "Success" : "Error"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
