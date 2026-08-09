"use client";

import { useMemo, useState, useEffect } from "react";
import { useGetWorkspaceProjectsQuery, useGetOrSeedDefaultProjectMutation } from "@/store/projectApi";
import { useGetWorkspaceTasksQuery } from "@/store/taskApi";
import { useGetWorkspaceEpicsQuery, useCreateEpicMutation } from "@/store/epicApi";
import { useGetWorkspaceSprintsQuery } from "@/store/sprintApi";
import { RoadmapTimeline } from "@/components/roadmap/roadmap-timeline";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Epic } from "@/store/epicApi";
import { Task } from "@/store/taskApi";

interface RoadmapTabProps {
  workspaceId: string;
}

const EPIC_COLORS = ["#6366f1", "#2563eb", "#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

export function RoadmapTab({ workspaceId }: RoadmapTabProps) {
  const { data: projects = [], isLoading: projectsLoading } = useGetWorkspaceProjectsQuery(workspaceId);
  const { data: tasks = [], isLoading: tasksLoading } = useGetWorkspaceTasksQuery(workspaceId);
  const { data: epics = [], isLoading: epicsLoading } = useGetWorkspaceEpicsQuery(workspaceId);
  const { data: sprints = [], isLoading: sprintsLoading } = useGetWorkspaceSprintsQuery(workspaceId);
  const [ensureDefault, { isLoading: isEnsuring }] = useGetOrSeedDefaultProjectMutation();

  useEffect(() => {
    if (!projectsLoading && projects.length === 0) {
      ensureDefault(workspaceId);
    }
  }, [projectsLoading, projects.length, workspaceId, ensureDefault]);

  const [zoom, setZoom] = useState<"quarter" | "month" | "week">("month");
  const [showEpics, setShowEpics] = useState(true);
  const [selectedEpic, setSelectedEpic] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [showCreateEpic, setShowCreateEpic] = useState(false);
  const [newEpicName, setNewEpicName] = useState("");
  const [newEpicProjectId, setNewEpicProjectId] = useState<string>("");

  const [createEpic, { isLoading: isCreating }] = useCreateEpicMutation();

  const loading = projectsLoading || tasksLoading || epicsLoading || sprintsLoading || isEnsuring;
  const now = useMemo(() => new Date(), []);

  const projectNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of projects) map[p.id] = p.name;
    return map;
  }, [projects]);

  const filteredTasks = useMemo(
    () => (projectFilter === "all" ? tasks : tasks.filter((t) => t.projectId === projectFilter)),
    [tasks, projectFilter]
  );

  const filteredEpics = useMemo(
    () => (projectFilter === "all" ? epics : epics.filter((e) => e.projectId === projectFilter)),
    [epics, projectFilter]
  );

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
      filteredEpics.forEach((epic, idx) => {
        const epicTasks = filteredTasks.filter((t) => t.parentTask === epic.epicKey);
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
          color: epic.color || EPIC_COLORS[idx % EPIC_COLORS.length],
          status: epic.status,
          epicKey: epic.epicKey,
        });
      });
    }

    const showAllTasks = !selectedEpic;
    const selectedEpicTasks = filteredTasks.filter((t) => t.parentTask === selectedEpic);
    const relevantTasks = showAllTasks ? filteredTasks : selectedEpicTasks;

    for (const task of relevantTasks) {
      if (!task.dueDate) continue;
      const start = new Date(task.createdAt);
      const end = new Date(task.dueDate);
      if (end < now) continue;
      items.push({
        id: task.taskKey,
        type: "task",
        title: `${task.taskKey} ${task.title}`,
        start,
        end,
        color: task.status === "done" ? "#10B981" : task.status === "in_progress" ? "#2563EB" : "#6B7280",
        status: task.status,
        epicKey: task.parentTask || undefined,
      });
    }

    items.sort((a, b) => a.start.getTime() - b.start.getTime());
    return items;
  }, [filteredEpics, filteredTasks, showEpics, now, selectedEpic]);

  const sprintData = useMemo(
    () =>
      sprints.map((s) => ({
        id: s.id,
        name: `${s.project?.key ? s.project.key + " · " : ""}${s.name}`,
        startDate: s.startDate,
        endDate: s.endDate,
      })),
    [sprints]
  );

  const dependencies = useMemo(() => {
    const deps: { from: string; to: string; type: "blocks" | "depends-on" }[] = [];
    for (const task of filteredTasks) {
      if (task.linkedTasks && task.linkedTasks.length > 0) {
        for (const link of task.linkedTasks) {
          const sourceEpic = filteredEpics.find((e) => e.epicKey === task.parentTask);
          const targetEpic = filteredEpics.find((e) => e.epicKey === link.taskId);
          if (sourceEpic && targetEpic) {
            deps.push({
              from: targetEpic.epicKey,
              to: sourceEpic.epicKey,
              type: "depends-on",
            });
          }
        }
      }
    }
    return deps;
  }, [filteredTasks, filteredEpics]);

  function handleCreateEpic() {
    if (!newEpicName.trim() || !newEpicProjectId) return;
    createEpic({
      name: newEpicName.trim(),
      projectId: newEpicProjectId,
      workspaceId,
    })
      .unwrap()
      .then(() => {
        setNewEpicName("");
        setNewEpicProjectId("");
        setShowCreateEpic(false);
      })
      .catch(() => {});
  }

  function handleEpicClick(epicKey: string) {
    setSelectedEpic((prev) => (prev === epicKey ? null : epicKey));
  }

  function openCreateEpic() {
    setNewEpicProjectId(projectFilter !== "all" ? projectFilter : projects[0]?.id ?? "");
    setShowCreateEpic(true);
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-bg-neutral" />
        <div className="h-64 animate-pulse rounded-xl bg-bg-neutral" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#121C28]">Workspace Roadmap</h2>
          <div className="flex items-center gap-1 rounded-lg border border-[#C3C6D7] bg-white p-0.5">
            <button
              onClick={() => setProjectFilter("all")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                projectFilter === "all" ? "bg-[#2563EB] text-white" : "text-[#737686] hover:text-[#121C28]"
              }`}
            >
              All projects
            </button>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setProjectFilter(p.id)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  projectFilter === p.id ? "bg-[#2563EB] text-white" : "text-[#737686] hover:text-[#121C28]"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <RoadmapTimeline
        items={roadmapItems}
        sprints={sprintData}
        showEpics={showEpics}
        onToggleEpics={setShowEpics}
        zoom={zoom}
        onZoomChange={setZoom}
        onAddEpic={openCreateEpic}
        onEpicClick={handleEpicClick}
        selectedEpic={selectedEpic}
        dependencies={dependencies}
      />

      <Dialog open={showCreateEpic} onClose={() => setShowCreateEpic(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Create Epic</h3>
          <div className="space-y-4">
            <Input
              label="Epic name"
              placeholder="Enter epic name..."
              value={newEpicName}
              onChange={(e) => setNewEpicName(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleCreateEpic()}
              autoFocus
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Project</label>
              <select
                value={newEpicProjectId}
                onChange={(e) => setNewEpicProjectId(e.target.value)}
                className="w-full rounded-lg border border-border-default bg-bg-input px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none"
              >
                {projects.length === 0 && <option value="">No projects available</option>}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-tertiary">
                {projectNameById[newEpicProjectId] ? `Epic will be created in ${projectNameById[newEpicProjectId]}.` : "Choose a project for this epic."}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowCreateEpic(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateEpic}
              isLoading={isCreating}
              disabled={!newEpicName.trim() || !newEpicProjectId}
            >
              Create
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
