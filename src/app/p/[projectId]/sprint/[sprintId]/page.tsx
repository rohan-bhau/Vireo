"use client";

import { useParams } from "next/navigation";
import { ScrumBoard } from "@/components/sprint/scrum-board";

export default function SprintPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const sprintId = params.sprintId as string;

  return <ScrumBoard projectId={projectId} sprintId={sprintId} />;
}
