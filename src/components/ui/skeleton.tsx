function Skeleton({ className, ...rest }: { className?: string } & Record<string, unknown>) {
  return (
    <div
      className={`animate-pulse rounded bg-[#E8EAF0] ${className ?? ""}`}
      {...rest}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-12" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonStatRow() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-3 w-8" />
      <Skeleton className="h-3 w-8" />
    </div>
  );
}

function SkeletonBar() {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

const TIMELINE_BAR_HEIGHTS = [40, 60, 35, 80, 50, 90, 45, 70, 55, 85, 30, 65, 75, 45];

function SkeletonTimeline() {
  return (
    <div className="flex items-end gap-1 h-32">
      {TIMELINE_BAR_HEIGHTS.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full flex flex-col items-center justify-end" style={{ height: "100%" }}>
            <Skeleton
              className="w-full rounded-t"
              style={{ height: `${h}%` }}
            />
          </div>
          <Skeleton className="h-2 w-3" />
        </div>
      ))}
    </div>
  );
}

function SkeletonWorkloadRow() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}

function SkeletonActivityRow() {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Skeleton className="h-7 w-7 rounded-full" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-3 w-10" />
    </div>
  );
}

function SkeletonDashboardContent() {
  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <Skeleton className="mb-4 h-4 w-28" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBar key={i} />
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <Skeleton className="mb-4 h-4 w-36" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonStatRow key={i} />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <Skeleton className="mb-4 h-4 w-40" />
          <SkeletonTimeline />
        </div>

        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <Skeleton className="mb-4 h-4 w-28" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonWorkloadRow key={i} />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <Skeleton className="mb-4 h-4 w-28" />
        <div className="divide-y divide-[#C3C6D7]/10">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonActivityRow key={i} />
          ))}
        </div>
      </div>
    </>
  );
}

function SkeletonNotificationItem() {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-3 w-12 shrink-0" />
    </div>
  );
}

function SkeletonTableRows({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-[#C3C6D7]/10">
          <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-48" />
            </div>
          </td>
          <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
        </tr>
      ))}
    </>
  );
}

function SkeletonBoardColumn() {
  return (
    <div className="flex w-72 max-sm:w-64 flex-shrink-0 flex-col rounded-xl bg-[#F1F2F6]">
      <div className="flex items-center justify-between rounded-t-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-6 rounded-md" />
        </div>
      </div>
      <div className="flex-1 space-y-2 px-3 pb-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-1.5 mb-2">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="mb-1 h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonTaskDetail() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-6 max-sm:px-4 max-sm:py-4">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <div className="flex items-start gap-3">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-7 w-96" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>

          <div>
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-72 flex-shrink-0 max-lg:w-full">
          <div className="flex flex-col gap-4 rounded-xl border border-[#C3C6D7]/20 bg-white p-4">
            <Skeleton className="h-3 w-12" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-20" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonWorkspaceCard() {
  return (
    <div className="rounded-xl bg-white p-5 md:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <Skeleton className="mb-3 h-10 w-10 md:h-12 md:w-12 rounded-lg" />
      <Skeleton className="mb-1 h-5 w-36" />
      <Skeleton className="h-4 w-56" />
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-3.5 w-3.5" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

function SkeletonSummaryCards() {
  return (
    <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <Skeleton className="mb-2 h-3 w-24" />
          <Skeleton className="mb-1 h-8 w-12" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

function SkeletonSidebarItem() {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2">
      <Skeleton className="h-4 w-4 rounded-[4px]" />
      <Skeleton className="h-3 flex-1" />
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonStatRow,
  SkeletonBar,
  SkeletonTimeline,
  SkeletonWorkloadRow,
  SkeletonActivityRow,
  SkeletonDashboardContent,
  SkeletonNotificationItem,
  SkeletonTableRows,
  SkeletonBoardColumn,
  SkeletonTaskDetail,
  SkeletonWorkspaceCard,
  SkeletonSummaryCards,
  SkeletonSidebarItem,
};
