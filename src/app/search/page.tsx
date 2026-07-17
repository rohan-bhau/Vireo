"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLazyGlobalSearchQuery } from "@/store/searchApi";
import { AppLayout } from "@/components/layout/app-layout";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [trigger, { data, isLoading }] = useLazyGlobalSearchQuery();
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debounced.length >= 2) {
      trigger(debounced);
    }
  }, [debounced, trigger]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl py-8">
        <div className="relative mb-8">
          <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            autoFocus
            placeholder="Search tasks, epics, workspaces, projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-[#C3C6D7] bg-white py-4 pl-12 pr-4 text-base text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C3C6D7] hover:text-[#737686]">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {query.length < 2 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="mb-4 h-12 w-12 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <h2 className="text-base font-semibold text-[#121C28]">Global Search</h2>
            <p className="mt-1 text-sm text-[#737686]">Search across all your workspaces, projects, tasks, and epics</p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-8">
            <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-8">
            {data.tasks.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#737686]">Tasks ({data.tasks.length})</h3>
                <div className="space-y-1">
                  {data.tasks.map((task) => (
                    <button
                      key={task._id}
                      onClick={() => router.push(`/task/${task.taskKey}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-[#434655] hover:bg-[#F1F2F6] transition-colors"
                    >
                      <span className="font-mono text-xs font-medium text-[#2563EB]">{task.taskKey}</span>
                      <span className="flex-1 truncate font-medium text-[#121C28]">{task.title}</span>
                      <StatusBadge status={task.status} />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {data.epics.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#737686]">Epics ({data.epics.length})</h3>
                <div className="space-y-1">
                  {data.epics.map((epic: any) => (
                    <div key={epic._id} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-[#434655]">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: epic.color || "#6366f1" }} />
                      <span className="font-mono text-xs font-medium text-[#6366f1]">{epic.epicKey}</span>
                      <span className="font-medium text-[#121C28]">{epic.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.projects.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#737686]">Projects ({data.projects.length})</h3>
                <div className="space-y-1">
                  {data.projects.map((project: any) => (
                    <button
                      key={project.id}
                      onClick={() => router.push(`/p/${project.id}/board`)}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-[#434655] hover:bg-[#F1F2F6] transition-colors"
                    >
                      <span className="font-mono text-xs font-medium text-[#059669]">{project.key}</span>
                      <span className="font-medium text-[#121C28]">{project.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {data.workspaces.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#737686]">Workspaces ({data.workspaces.length})</h3>
                <div className="space-y-1">
                  {data.workspaces.map((ws: any) => (
                    <button
                      key={ws.id}
                      onClick={() => router.push(`/w/${ws.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-[#434655] hover:bg-[#F1F2F6] transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-xs font-bold text-white">
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-[#121C28]">{ws.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {data.total === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="mb-3 h-10 w-10 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <p className="text-sm text-[#737686]">No results found for &ldquo;{query}&rdquo;</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    todo: "bg-[#F1F2F6] text-[#737686]",
    in_progress: "bg-[#DBEAFE] text-[#2563EB]",
    in_review: "bg-[#FEF3C7] text-[#D97706]",
    done: "bg-[#D1FAE5] text-[#059669]",
  };
  const labels: Record<string, string> = {
    todo: "Todo", in_progress: "In Progress", in_review: "In Review", done: "Done",
  };
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${styles[status] || styles.todo}`}>
      {labels[status] || status}
    </span>
  );
}
