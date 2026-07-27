"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useGetSubscriptionQuery, useCheckLimitsQuery } from "@/store/billingApi";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { useGetWorkspaceProjectsQuery } from "@/store/projectApi";

interface UsageStatsProps {
  workspaceId: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  used: number;
  limit: number | null;
  limitHit: boolean;
  limitLabel: string;
  workspaceId: string;
}

function getStorageLimit(plan: string): { limit: number; label: string } | null {
  switch (plan) {
    case "free":
      return { limit: 1, label: "1 GB" };
    case "pro":
      return { limit: 50, label: "50 GB" };
    default:
      return null;
  }
}

function ProgressBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100);
  const color =
    pct >= 100
      ? "bg-[#DC2626]"
      : pct >= 80
        ? "bg-[#D97706]"
        : "bg-[#2563EB]";

  return (
    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#EEF4FF]">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatCard({ icon, label, used, limit, limitHit, limitLabel, workspaceId: wid }: StatCardProps) {
  const pct = limit ? Math.round((used / limit) * 100) : null;

  return (
    <div className="rounded-xl border border-[#C3C6D7]/30 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8F9FF]">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-[#737686]">{label}</p>
            <p className="mt-0.5 text-xl font-bold text-[#121C28]">
              {used}
              {limit !== null && (
                <span className="text-sm font-normal text-[#737686]">
                  {" "}/ {limitLabel}
                </span>
              )}
            </p>
          </div>
        </div>
        {pct !== null && (
          <span
            className={`text-xs font-semibold ${
              pct >= 100
                ? "text-[#DC2626]"
                : pct >= 80
                  ? "text-[#D97706]"
                  : "text-[#737686]"
            }`}
          >
            {pct}%
          </span>
        )}
      </div>
      {limit !== null && used > 0 && <ProgressBar used={used} limit={limit} />}
      {limitHit && (
        <Link
          href={`/w/${wid}/settings/billing`}
          className="mt-3 inline-block text-xs font-medium text-[#2563EB] hover:text-[#004AC6] transition-colors"
        >
          Upgrade to add more
        </Link>
      )}
    </div>
  );
}

export function UsageStats({ workspaceId }: UsageStatsProps) {
  const { data: subscription, isLoading: subLoading } = useGetSubscriptionQuery(workspaceId);
  const { data: members = [], isLoading: membersLoading } = useGetMembersQuery(workspaceId);
  const { data: projects = [], isLoading: projectsLoading } = useGetWorkspaceProjectsQuery(workspaceId);
  const { data: memberLimitHit } = useCheckLimitsQuery({ workspaceId, type: "member" });
  const { data: projectLimitHit } = useCheckLimitsQuery({ workspaceId, type: "project" });

  const isLoading = subLoading || membersLoading || projectsLoading;

  const stats = useMemo(() => {
    const plan = subscription?.plan || "free";
    const memberLimit = subscription?.memberLimit ?? 10;
    const projectLimit = subscription?.projectLimit ?? 2;
    const memberCount = members.length;
    const projectCount = projects.length;
    const storage = getStorageLimit(plan);

    return { memberLimit, projectLimit, memberCount, projectCount, storage };
  }, [subscription, members, projects]);

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

  const { memberLimit, projectLimit, memberCount, projectCount, storage } = stats;

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-base font-semibold text-[#121C28]">Usage</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          workspaceId={workspaceId}
          icon={
            <svg className="h-5 w-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
          label="Team Members"
          used={memberCount}
          limit={memberLimit}
          limitHit={!memberLimitHit?.allowed}
          limitLabel={`${memberLimit}`}
        />
        <StatCard
          workspaceId={workspaceId}
          icon={
            <svg className="h-5 w-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          }
          label="Projects"
          used={projectCount}
          limit={projectLimit}
          limitHit={!projectLimitHit?.allowed}
          limitLabel={`${projectLimit}`}
        />
        <StatCard
          workspaceId={workspaceId}
          icon={
            <svg className="h-5 w-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          }
          label="Storage"
          used={0}
          limit={storage?.limit ?? null}
          limitHit={false}
          limitLabel={storage?.label ?? "Unlimited"}
        />
      </div>
    </div>
  );
}
