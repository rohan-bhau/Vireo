"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetProjectTasksQuery } from "@/store/taskApi";
import { useGetProjectQuery } from "@/store/projectApi";
import { useGetProjectEpicsQuery } from "@/store/epicApi";
import { useGetProjectSprintsQuery } from "@/store/sprintApi";
import { RoadmapTimeline } from "@/components/roadmap/roadmap-timeline";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateEpicMutation } from "@/store/epicApi";

export default function RoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const { data: project } = useGetProjectQuery(projectId);
  const { data: tasks = [] } = useGetProjectTasksQuery(projectId);
  const { data: epics = [] } = useGetProjectEpicsQuery(projectId);
  const { data: sprints = [] } = useGetProjectSprintsQuery(projectId);

  const [zoom, setZoom] = useState<"quarter" | "month" | "week">("month");
  const [showEpics, setShowEpics] = useState(true);
  const [selectedEpic, setSelectedEpic] = useState<string | null>(null);
  const [showCreateEpic, setShowCreateEpic] = useState(false);
  const [newEpicName, setNewEpicName] = useState("");
  const [createEpic, { isLoading: isCreating }] = useCreateEpicMutation();

  const now = new Date();

  const roadmapItems = useMemo(() => {
    const items: {
      id: string;
      type: "epic" | "task";
      title: string;
      start: Date;
      end: Date;
      color: string;
      status: string;
      epicKey?: string;
    }[] = [];

    if (showEpics) {
      for (const epic of epics) {
        const epicTasks = tasks.filter((t) => t.parentTask === epic.epicKey);
        const start = new Date(epic.createdAt);
        const end = epicTasks.length > 0
          ? new Date(Math.max(...epicTasks.map((t) => new Date(t.dueDate || t.updatedAt).getTime())))
          : new Date(epic.createdAt);
        end.setDate(end.getDate() + 14);
        items.push({
          id: epic.epicKey,
          type: "epic",
          title: epic.name,
          start,
          end,
          color: epic.color || "#6366f1",
          status: epic.status,
          epicKey: epic.epicKey,
        });
      }
    }

    const showAllTasks = !selectedEpic;
    const selectedEpicTasks = tasks.filter((t) => t.parentTask === selectedEpic);

    const relevantTasks = showAllTasks ? tasks : selectedEpicTasks;

    for (const task of relevantTasks) {
      if (!task.dueDate) continue;
      const start = new Date(task.createdAt);
      const end = new Date(task.dueDate);
      if (end < now) continue;
      items.push({
        id: task.taskKey,
        type: "task",
        title: task.taskKey + " " + task.title,
        start,
        end,
        color: task.status === "done" ? "#10B981" : task.status === "in_progress" ? "#2563EB" : "#6B7280",
        status: task.status,
        epicKey: task.parentTask || undefined,
      });
    }

    items.sort((a, b) => a.start.getTime() - b.start.getTime());
    return items;
  }, [epics, tasks, showEpics, now, selectedEpic]);

  const sprintData = useMemo(
    () =>
      sprints.map((s) => ({
        id: s.id,
        name: s.name,
        startDate: s.startDate,
        endDate: s.endDate,
      })),
    [sprints]
  );

  async function handleCreateEpic() {
    if (!newEpicName.trim() || !project) return;
    try {
      await createEpic({
        name: newEpicName.trim(),
        projectId,
        workspaceId: project.workspaceId,
      }).unwrap();
      setNewEpicName("");
      setShowCreateEpic(false);
    } catch {}
  }

  function handleEpicClick(epicKey: string) {
    if (selectedEpic === epicKey) {
      setSelectedEpic(null);
    } else {
      setSelectedEpic(epicKey);
    }
  }

  return (
    <div className="flex flex-col">
      <RoadmapTimeline
        items={roadmapItems}
        sprints={sprintData}
        showEpics={showEpics}
        onToggleEpics={setShowEpics}
        zoom={zoom}
        onZoomChange={setZoom}
        onAddEpic={() => setShowCreateEpic(true)}
        onEpicClick={handleEpicClick}
        selectedEpic={selectedEpic}
      />

      <Dialog open={showCreateEpic} onClose={() => setShowCreateEpic(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[#121C28] mb-4">Create Epic</h3>
          <Input
            label="Epic name"
            placeholder="Enter epic name..."
            value={newEpicName}
            onChange={(e) => setNewEpicName(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleCreateEpic()}
            autoFocus
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowCreateEpic(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEpic} isLoading={isCreating} disabled={!newEpicName.trim()}>
              Create
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
