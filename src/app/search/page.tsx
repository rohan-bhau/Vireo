"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLazyJqlSearchQuery, useValidateJqlMutation } from "@/store/searchApi";
import { useGetWorkspaceFiltersQuery, useCreateSavedFilterMutation, useDeleteSavedFilterMutation } from "@/store/savedFilterApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Task } from "@/store/taskApi";
import { AppLayout } from "@/components/layout/app-layout";
import { JqlInput } from "@/components/search/jql-input";
import { BasicFiltersSidebar } from "@/components/search/basic-filters-sidebar";
import { SearchResultsList } from "@/components/search/search-results-list";
import { SearchResultsDetail } from "@/components/search/search-results-detail";
import { SaveFilterDialog } from "@/components/search/save-filter-dialog";
import { FilterExamplesDropdown } from "@/components/search/filter-examples-dropdown";
import { BulkActionBar } from "@/components/search/bulk-action-bar";
import { clsx } from "clsx";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQ = searchParams.get("q") || "";
  const [jqlQuery, setJqlQuery] = useState(initialQ);
  const [jqlInput, setJqlInput] = useState(initialQ);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("updatedAt");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [jqlError, setJqlError] = useState<{ message: string; position: number } | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [trigger, { data, isLoading, isFetching }] = useLazyJqlSearchQuery();
  const [validateJql] = useValidateJqlMutation();

  const activeWorkspaceId = useSelector((state: RootState) => state.workspace.activeWorkspaceId);
  const { data: savedFilters = [] } = useGetWorkspaceFiltersQuery(activeWorkspaceId ?? "", { skip: !activeWorkspaceId });
  const [deleteFilter] = useDeleteSavedFilterMutation();

  const [basicFilters, setBasicFilters] = useState<{
    project?: string[];
    type?: string[];
    status?: string[];
    priority?: string[];
    assignee?: string[];
  }>({});

  const executeSearch = useCallback(async (jql: string) => {
    if (!jql.trim() || !activeWorkspaceId) return;
    setJqlError(null);
    try {
      const result = await validateJql({ query: jql }).unwrap();
      if (!result.valid && result.error) {
        setJqlError(result.error);
        return;
      }
    } catch {
      // fallback: execute anyway
    }
    trigger({ query: jql, workspaceId: activeWorkspaceId, page });
  }, [activeWorkspaceId, page, trigger, validateJql]);

  useEffect(() => {
    if (jqlQuery && activeWorkspaceId) {
      executeSearch(jqlQuery);
    }
  }, [jqlQuery, activeWorkspaceId, page, executeSearch]);

  useEffect(() => {
    if (initialQ && !jqlQuery) {
      setJqlQuery(initialQ);
      setJqlInput(initialQ);
    }
  }, [initialQ, jqlQuery]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const tasksList = data?.tasks || [];
      if (tasksList.length === 0) return;

      if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev < tasksList.length - 1 ? prev + 1 : prev;
          const el = document.querySelector(`[data-task-index="${next}"]`);
          el?.scrollIntoView({ block: "nearest" });
          return next;
        });
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : 0;
          const el = document.querySelector(`[data-task-index="${next}"]`);
          el?.scrollIntoView({ block: "nearest" });
          return next;
        });
      } else if (e.key === "Enter" && focusedIndex >= 0 && focusedIndex < tasksList.length) {
        e.preventDefault();
        const task = tasksList[focusedIndex];
        if (viewMode === "detail") {
          setSelectedTask(task);
          setShowDetail(true);
        } else {
          router.push(`/task/${task.taskKey}`);
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [data, focusedIndex, viewMode, router]);

  function handleJqlSubmit(jql: string) {
    setJqlQuery(jql);
    setPage(1);
    setSelectedIds([]);
    setSelectedTask(null);
    setFocusedIndex(-1);
    router.replace(`/search?q=${encodeURIComponent(jql)}`, { scroll: false });
  }

  function handleJqlClear() {
    setJqlInput("");
    setJqlQuery("");
    setJqlError(null);
    setSelectedIds([]);
    setSelectedTask(null);
  }

  function handleBasicFilterChange(field: string, value: string[]) {
    if (field === "clear") {
      setBasicFilters({});
      setJqlInput("");
      setJqlQuery("");
      return;
    }
    const updated = { ...basicFilters, [field]: value };
    setBasicFilters(updated);

    const parts: string[] = [];
    if (updated.type?.length) {
      parts.push(`type IN (${updated.type.join(",")})`);
    }
    if (updated.status?.length) {
      parts.push(`status IN (${updated.status.join(",")})`);
    }
    if (updated.priority?.length) {
      parts.push(`priority IN (${updated.priority.join(",")})`);
    }
    if (updated.assignee?.length) {
      parts.push(`assignee IN (${updated.assignee.join(",")})`);
    }

    const jql = parts.join(" AND ");
    setJqlInput(jql);
    setJqlQuery(jql);
    setPage(1);
    setSelectedIds([]);
    if (jql) {
      router.replace(`/search?q=${encodeURIComponent(jql)}`, { scroll: false });
    }
  }

  function handleSort(field: string, dir: string) {
    setSortField(field);
    setSortDir(dir);
  }

  function handleExampleSelect(jql: string) {
    setJqlInput(jql);
    handleJqlSubmit(jql);
  }

  function jqlToBasicFilters(jql: string) {
    const filters: Record<string, string[]> = {};
    const inMatches = jql.matchAll(/(\w+)\s+IN\s*\(([^)]+)\)/gi);
    for (const m of inMatches) {
      const field = m[1].toLowerCase();
      const values = m[2].split(",").map((v) => v.trim().replace(/['"]/g, "")).filter(Boolean);
      if (values.length > 0) filters[field] = values;
    }
    const eqMatches = jql.matchAll(/(\w+)\s*=\s*(\w+)/gi);
    for (const m of eqMatches) {
      const field = m[1].toLowerCase();
      const value = m[2].trim().replace(/['"]/g, "");
      if (!filters[field]) filters[field] = [];
      if (!filters[field].includes(value)) filters[field].push(value);
    }
    const re: any = {};
    if (filters.type) re.type = filters.type;
    if (filters.status) re.status = filters.status;
    if (filters.priority) re.priority = filters.priority;
    if (filters.assignee) re.assignee = filters.assignee;
    setBasicFilters(re);
  }

  function handleTaskClick(task: Task) {
    setSelectedTask(task);
    if (viewMode === "detail") {
      setShowDetail(true);
    } else {
      router.push(`/task/${task.taskKey}`);
    }
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    setSelectedIds([]);
  }

  async function handleDeleteFilter(id: string) {
    await deleteFilter(id);
  }

  const totalPages = data?.pagination?.totalPages || 0;

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="border-b border-[#DFE1E6] bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <JqlInput
                value={jqlInput}
                onChange={(v) => {
                  setJqlInput(v);
                  setJqlError(null);
                }}
                onSubmit={handleJqlSubmit}
                onClear={handleJqlClear}
                error={jqlError}
                loading={isLoading || isFetching}
              />
            </div>
            <FilterExamplesDropdown onSelect={handleExampleSelect} />
            {jqlQuery && (
              <button
                onClick={() => jqlToBasicFilters(jqlQuery)}
                className="flex items-center gap-1.5 rounded-[3px] border border-[#DFE1E6] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#42526E] hover:bg-[#F1F2F6] transition-colors whitespace-nowrap"
                title="Switch to basic filters"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Basic
              </button>
            )}
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={!jqlQuery}
              className={clsx(
                "flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap",
                jqlQuery
                  ? "border-[#DFE1E6] bg-white text-[#42526E] hover:bg-[#F1F2F6]"
                  : "border-[#DFE1E6] bg-[#FAFBFC] text-[#C3C6D7] cursor-not-allowed"
              )}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
              Save as
            </button>
            <button
              onClick={() => setViewMode(viewMode === "list" ? "detail" : "list")}
              className={clsx(
                "flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                viewMode === "detail"
                  ? "border-[#2563EB] bg-[#EEF4FF] text-[#2563EB]"
                  : "border-[#DFE1E6] bg-white text-[#42526E] hover:bg-[#F1F2F6]"
              )}
              title={viewMode === "list" ? "Split view" : "List view"}
            >
              {viewMode === "list" ? (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <BulkActionBar
          selectedCount={selectedIds.length}
          onClear={() => setSelectedIds([])}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex gap-4 overflow-auto p-6 flex-1">
            <BasicFiltersSidebar
              filters={basicFilters}
              onChange={handleBasicFilterChange}
              onApply={() => {}}
            />

            <div className={clsx("flex-1 min-w-0", viewMode === "detail" && showDetail && selectedTask ? "w-1/2" : "w-full")}>
              <SearchResultsList
                tasks={data?.tasks || []}
                total={data?.pagination?.total || 0}
                loading={isLoading}
                selectedIds={selectedIds}
                onSelect={setSelectedIds}
                onSort={handleSort}
                sortField={sortField}
                sortDir={sortDir}
                onTaskClick={handleTaskClick}
                focusedIndex={focusedIndex}
                onFocusedIndexChange={setFocusedIndex}
              />

              {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="rounded-[3px] border border-[#DFE1E6] px-2.5 py-1 text-[11px] font-medium text-[#434655] hover:bg-[#F1F2F6] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={clsx(
                          "min-w-[28px] rounded-[3px] px-2 py-1 text-[11px] font-medium transition-colors",
                          pageNum === page
                            ? "bg-[#2563EB] text-white"
                            : "text-[#434655] hover:bg-[#F1F2F6]"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="rounded-[3px] border border-[#DFE1E6] px-2.5 py-1 text-[11px] font-medium text-[#434655] hover:bg-[#F1F2F6] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {viewMode === "detail" && showDetail && selectedTask && (
              <div className="w-1/2 border-l border-[#DFE1E6] overflow-y-auto">
                <SearchResultsDetail
                  task={selectedTask}
                  onClose={() => {
                    setShowDetail(false);
                    setSelectedTask(null);
                  }}
                />
              </div>
            )}
          </div>

          {savedFilters.length > 0 && (
            <div className="w-52 flex-shrink-0 border-l border-[#DFE1E6] bg-[#FAFBFC] p-4 overflow-y-auto">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Saved Filters</h3>
              <div className="space-y-0.5">
                {savedFilters.map((f) => (
                  <div
                    key={f._id}
                    className="group flex items-center justify-between rounded-[3px] px-2 py-1.5 text-xs text-[#434655] hover:bg-[#EEF4FF] cursor-pointer transition-colors"
                  >
                    <button
                      onClick={() => {
                        const q = f.jql || "";
                        setJqlInput(q);
                        setJqlQuery(q);
                        setPage(1);
                        if (q) router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
                      }}
                      className="flex-1 text-left truncate"
                    >
                      {f.name}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFilter(f._id); }}
                      className="hidden group-hover:block text-[#C3C6D7] hover:text-red-500 transition-colors"
                    >
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <SaveFilterDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        workspaceId={activeWorkspaceId || undefined}
        jql={jqlQuery}
        sortField={sortField}
        sortOrder={sortDir}
      />
    </AppLayout>
  );
}
