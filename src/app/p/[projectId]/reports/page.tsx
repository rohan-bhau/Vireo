"use client";

import { useParams } from "next/navigation";
import { ReportsView } from "@/components/reports/reports-view";

export default function ReportsPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div className="flex flex-col">
      <ReportsView projectId={projectId} />
    </div>
  );
}
