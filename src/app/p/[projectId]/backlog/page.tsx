"use client";

import { useParams } from "next/navigation";
import { BacklogView } from "@/components/sprint/backlog-view";
import { AIContextualLauncher } from "@/components/ai/ai-contextual-launcher";

export default function BacklogPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div className="flex flex-col">
      <BacklogView projectId={projectId} />
      <AIContextualLauncher context="backlog" projectId={projectId} />
    </div>
  );
}
