"use client";

import { motion } from "framer-motion";
import {
  Plus,
  Users,
  LayoutDashboard,
  Columns3,
  ListChecks,
  PlayCircle,
  TrendingUp,
  BarChart3,
  Check,
  Link as LinkIcon,
  UserPlus,
  GripVertical,
} from "lucide-react";
import { PageHero } from "@/components/sections/marketing/page-hero";

const avatarPalette = ["#004AC6", "#10B981", "#D97706", "#7C3AED", "#DC2626", "#0891B2", "#4F46E5", "#DB2777"];
const priorityColor: Record<string, string> = {
  Highest: "#CD1317",
  High: "#FF8B00",
  Medium: "#0052CC",
  Low: "#5E6C84",
};
const typeColor: Record<string, string> = {
  Story: "#36B37E",
  Task: "#4C9AFF",
  Bug: "#FF5630",
  Epic: "#6554C0",
};

interface Issue {
  key: string;
  title: string;
  type: string;
  priority: string;
  avatarIdx: number;
}

const todoIssues: Issue[] = [
  { key: "VRE-24", title: "Add drag-and-drop to board columns", type: "Task", priority: "Medium", avatarIdx: 1 },
  { key: "VRE-27", title: "Write onboarding copy for new users", type: "Story", priority: "Low", avatarIdx: 3 },
];
const inProgressIssues: Issue[] = [
  { key: "VRE-19", title: "Migrate auth to secure sessions", type: "Bug", priority: "High", avatarIdx: 2 },
  { key: "VRE-22", title: "Design empty states for reports", type: "Story", priority: "Medium", avatarIdx: 0 },
];
const doneIssues: Issue[] = [
  { key: "VRE-12", title: "Set up CI pipeline for main branch", type: "Task", priority: "High", avatarIdx: 4 },
  { key: "VRE-15", title: "Ship landing page refresh", type: "Task", priority: "Low", avatarIdx: 5 },
  { key: "VRE-18", title: "Add roles & permissions", type: "Epic", priority: "Medium", avatarIdx: 6 },
];

function IssueCard({ issue }: { issue: Issue }) {
  return (
    <div className="rounded-lg border border-[#C3C6D7]/40 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: typeColor[issue.type] }} />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#737686]">{issue.type}</span>
        <span className="ml-auto text-[10px] font-medium text-[#8A8FA3]">{issue.key}</span>
      </div>
      <p className="mt-1.5 text-xs font-medium leading-snug text-[#1F2937]">{issue.title}</p>
      <div className="mt-2.5 flex items-center justify-between">
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
          style={{ backgroundColor: priorityColor[issue.priority] }}
        >
          {issue.priority}
        </span>
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
          style={{ backgroundColor: avatarPalette[issue.avatarIdx % avatarPalette.length] }}
        >
          {["RK", "SA", "JY", "MT", "DR", "LC", "AP", "KW"][issue.avatarIdx % 8]}
        </span>
      </div>
    </div>
  );
}

const backlogRows = [
  { key: "VRE-31", title: "Improve dashboard load time", points: 5, priority: "High", status: "Ready" },
  { key: "VRE-30", title: "Add team availability view", points: 8, priority: "Medium", status: "Ready" },
  { key: "VRE-28", title: "Bulk edit custom fields", points: 3, priority: "Medium", status: "Ready" },
  { key: "VRE-25", title: "Dark mode for reports", points: 2, priority: "Low", status: "Refined" },
  { key: "VRE-23", title: "New issue templates", points: 5, priority: "Medium", status: "Refined" },
];

interface Step {
  icon: typeof Plus;
  title: string;
  description: string;
  tips: string[];
}

const steps: Step[] = [
  {
    icon: Plus,
    title: "Create your workspace",
    description:
      "After signing up, give your workspace a name and add your team's domain. Vireo pre-fills sensible defaults — issue types, roles, and a Scrum board — so you can start planning immediately.",
    tips: ["You can always rename the workspace later from Settings.", "Start with a template if you'd rather not configure anything."],
  },
  {
    icon: Users,
    title: "Invite your team",
    description:
      "Open Members and send invites by email, or share a single invite link. Assign roles as people join — Owners manage billing, Admins configure settings, and Members focus on the work.",
    tips: ["Invitees join instantly — no admin approval required.", "Use groups to batch-apply the same role to many people."],
  },
  {
    icon: LayoutDashboard,
    title: "Create a project",
    description:
      "Projects are where work happens. Pick a template: Scrum for time-boxed sprints, Kanban for a continuous flow, or Bug tracking for issue triage. Each template ships with a ready-made board and workflow.",
    tips: ["Add a project avatar so teams recognise it at a glance.", "Set components and versions early to keep releases organised."],
  },
  {
    icon: Columns3,
    title: "Build the board",
    description:
      "The board maps your workflow into columns. Drag issues between columns to move them through your process. Add swimlanes, WIP limits, and new columns whenever your process evolves.",
    tips: ["Create issues directly on the board with the + button.", "Reorder cards within a column to rank their priority."],
  },
  {
    icon: ListChecks,
    title: "Plan the backlog",
    description:
      "Your backlog holds every issue that hasn't started. Rank it by dragging, or let AI suggest a priority order. Refined, ready-to-go issues float to the top, waiting for your next sprint.",
    tips: ["Add story points and estimates for capacity planning.", "Use filters to focus on epics, versions, or assignees."],
  },
  {
    icon: PlayCircle,
    title: "Run a sprint",
    description:
      "Create a sprint, pull issues in from the backlog, and set a goal. Watch live counts for issues done, remaining, and capacity as the team works. Complete the sprint when it ends to get an AI-written retrospective.",
    tips: ["Capacity is calculated from points × member availability.", "Split or add issues mid-sprint without losing history."],
  },
  {
    icon: TrendingUp,
    title: "Track progress",
    description:
      "Roadmaps and timelines show planned work over time, across epics and releases. Dependencies are drawn automatically, so leadership always knows what's on track and what's at risk.",
    tips: ["Burndown and velocity charts update in real time.", "Share the roadmap with stakeholders via a read-only link."],
  },
  {
    icon: BarChart3,
    title: "Learn from reports",
    description:
      "After a few sprints, reports show how your team really delivers — velocity trends, cycle time, DORA metrics, and team health. Use the insights to tune your process every retrospective.",
    tips: ["Build custom dashboards from saved filters.", "Schedule reports to email stakeholders automatically."],
  },
];

function MockWorkspaceCard() {
  return (
    <div className="rounded-xl border border-[#C3C6D7]/30 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004AC6] text-sm font-bold text-white">V</div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#737686]">Workspace name</p>
          <p className="text-sm font-semibold text-[#121C28]">Acme Software</p>
        </div>
      </div>
      <div className="space-y-2">
        {["Select your agile template", "Set your team size", "Pick a URL slug"].map((label, i) => (
          <div key={label} className="flex items-center gap-2.5 rounded-lg border border-[#C3C6D7]/30 px-3 py-2.5">
            <Check className={i === 0 ? "h-4 w-4 text-[#10B981]" : "h-4 w-4 text-[#C3C6D7]"} />
            <span className="text-sm text-[#434655]">{i === 0 ? "Scrum template" : label}</span>
            {i === 2 && <span className="ml-auto text-xs text-[#004AC6]">northstar</span>}
          </div>
        ))}
      </div>
      <button className="mt-4 w-full cursor-pointer rounded-lg bg-[#004AC6] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#003da8]">
        Create workspace
      </button>
    </div>
  );
}

function MockInviteCard() {
  return (
    <div className="rounded-xl border border-[#C3C6D7]/30 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-[#004AC6]" />
        <p className="text-sm font-semibold text-[#121C28]">Invite members</p>
      </div>
      <div className="mb-4 flex items-center gap-1.5">
        {avatarPalette.slice(0, 6).map((color, i) => (
          <span
            key={color}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-white"
            style={{ backgroundColor: color, zIndex: 6 - i }}
          >
            {["SA", "RK", "JY", "MT", "DR", "LC"][i]}
          </span>
        ))}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF4FF] text-[10px] font-bold text-[#004AC6] ring-2 ring-white">
          +8
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-[#004AC6]/40 bg-[#F0F6FF] px-3 py-2.5">
        <LinkIcon className="h-3.5 w-3.5 text-[#737686]" />
        <span className="truncate text-xs text-[#434655]">https://vireo.app/invite/northstar-7f2e</span>
      </div>
      <p className="mt-2 text-[11px] text-[#8A8FA3]">Anyone with the link can join. Copies instantly.</p>
    </div>
  );
}

function MockProjectTemplates() {
  const templates = [
    { label: "Scrum", desc: "Sprints + backlog", color: "#004AC6" },
    { label: "Kanban", desc: "Continuous flow", color: "#10B981" },
    { label: "Bug tracking", desc: "Triage + fixes", color: "#DC2626" },
  ];
  return (
    <div className="rounded-xl border border-[#C3C6D7]/30 bg-white p-5 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-[#121C28]">Choose a project template</p>
      <div className="space-y-2">
        {templates.map((template, i) => (
          <div
            key={template.label}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition-colors ${
              i === 0 ? "border-[#004AC6]/40 bg-[#F0F6FF]" : "border-[#C3C6D7]/30 bg-white hover:border-[#004AC6]/30"
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ backgroundColor: template.color }}>
              <LayoutDashboard className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#121C28]">{template.label}</p>
              <p className="text-xs text-[#737686]">{template.desc}</p>
            </div>
            {i === 0 && (
              <span className="ml-auto rounded-full bg-[#004AC6] px-2 py-0.5 text-[9px] font-bold uppercase text-white">Recommended</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockBoard() {
  const columns = [
    { title: "To do", color: "#8A8FA3", issues: todoIssues },
    { title: "In progress", color: "#0052CC", issues: inProgressIssues },
    { title: "Done", color: "#36B37E", issues: doneIssues },
  ];
  return (
    <div className="rounded-xl border border-[#C3C6D7]/30 bg-[#F4F6FB] p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 text-[#121C28]" />
          <p className="text-sm font-semibold text-[#121C28]">Northstar — Sprint 24</p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#737686]">4 members</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {columns.map((column) => (
          <div key={column.title} className="rounded-lg bg-white p-2.5">
            <div className="mb-2.5 flex items-center gap-1.5 px-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} />
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#434655]">{column.title}</p>
              <span className="ml-auto text-[10px] font-medium text-[#8A8FA3]">{column.issues.length}</span>
              <Plus className="h-3.5 w-3.5 cursor-pointer text-[#8A8FA3]" />
            </div>
            <div className="space-y-2">
              {column.issues.map((issue) => (
                <IssueCard key={issue.key} issue={issue} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockBacklog() {
  return (
    <div className="rounded-xl border border-[#C3C6D7]/30 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#C3C6D7]/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-[#121C28]" />
          <p className="text-sm font-semibold text-[#121C28]">Backlog</p>
        </div>
        <button className="cursor-pointer rounded-lg bg-[#004AC6] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#003da8]">
          + Create sprint
        </button>
      </div>
      <div className="divide-y divide-[#C3C6D7]/20">
        {backlogRows.map((row) => (
          <div key={row.key} className="flex items-center gap-3 px-4 py-2.5">
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-[#C3C6D7]" />
            <span className="w-12 shrink-0 text-[10px] font-medium text-[#8A8FA3]">{row.key}</span>
            <p className="min-w-0 flex-1 truncate text-sm text-[#1F2937]">{row.title}</p>
            <span
              className="hidden w-4 rounded-sm px-1 text-center text-[10px] font-bold text-white sm:block"
              style={{ backgroundColor: priorityColor[row.priority] }}
            >
              {row.priority[0]}
            </span>
            <span className="hidden rounded bg-[#F4F6FB] px-1.5 py-0.5 text-[10px] font-semibold text-[#737686] sm:block">
              {row.status}
            </span>
            <span className="w-8 rounded bg-[#EEF4FF] py-0.5 text-center text-[10px] font-bold text-[#004AC6]">{row.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockSprint() {
  return (
    <div className="rounded-xl border border-[#C3C6D7]/30 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#121C28]">Sprint 24 · Delivery week</p>
          <p className="text-xs text-[#737686]">Mar 2 – Mar 13 · Goal: Ship invites + board polish</p>
        </div>
        <span className="rounded-full bg-[#10B981]/10 px-2.5 py-1 text-[10px] font-bold uppercase text-[#059669]">On track</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-center">
        {[
          { label: "Issues done", value: "8 / 12" },
          { label: "Points", value: "34" },
          { label: "Capacity", value: "80%" },
          { label: "Velocity", value: "31" },
        ].map((stat) => (
          <div key={stat.label} className="flex-1">
            <p className="text-lg font-bold text-[#121C28]">{stat.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#8A8FA3]">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-[#737686]">
          <span>8 of 12 issues completed</span>
          <span>67%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#F4F6FB]">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#004AC6] to-[#4C9AFF]" />
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-[#F8F9FF] p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#737686]">AI retro snapshot</p>
        <p className="mt-1 text-xs leading-relaxed text-[#434655]">
          &ldquo;Scope creep on VRE-19 pushed quality checks late — consider splitting larger stories into <span className="font-semibold text-[#004AC6]">2-3 point</span> slices next sprint.&rdquo;
        </p>
      </div>
    </div>
  );
}

function MockRoadmap() {
  const bars = [
    { label: "Invites & SSO", done: 85 },
    { label: "Board polish", done: 60 },
    { label: "Reports v2", done: 35 },
    { label: "Mobile app", done: 15 },
  ];
  return (
    <div className="rounded-xl border border-[#C3C6D7]/30 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#121C28]">Release roadmap</p>
        <span className="rounded-full bg-[#EEF4FF] px-2.5 py-1 text-[10px] font-bold uppercase text-[#004AC6]">Q2 · 2026</span>
      </div>
      <div className="space-y-3">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-[#434655]">{bar.label}</span>
              <span className="font-semibold text-[#121C28]">{bar.done}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#F4F6FB]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#004AC6] to-[#4C9AFF]"
                style={{ width: `${bar.done}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockReports() {
  const metrics = [
    { label: "Cycle time", value: "2.4d", delta: "+0.3d", trend: "down" },
    { label: "Lead time", value: "6.1d", delta: "-1.2d", trend: "up" },
    { label: "Change failure rate", value: "4.1%", delta: "-0.9%", trend: "up" },
    { label: "Deployment freq", value: "9/wk", delta: "+2/wk", trend: "up" },
  ];
  return (
    <div className="rounded-xl border border-[#C3C6D7]/30 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#121C28]">Team health · DORA summary</p>
        <span className="text-[10px] font-medium text-[#8A8FA3]">Last 4 sprints</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-[#C3C6D7]/25 bg-[#F8F9FF] p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#8A8FA3]">{metric.label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-lg font-bold text-[#121C28]">{metric.value}</p>
              <span className={`text-[10px] font-semibold ${metric.trend === "up" ? "text-[#059669]" : "text-[#D97706]"}`}>
                {metric.delta}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex h-16 items-end gap-1.5">
        {[38, 55, 44, 70, 62, 84, 76, 95].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-[#004AC6]/80"
            style={{ height: `${h}%`, opacity: 0.4 + (i / 8) * 0.6 }}
          />
        ))}
      </div>
    </div>
  );
}

const mockWidgets = [
  <MockWorkspaceCard key="workspace" />,
  <MockInviteCard key="invite" />,
  <MockProjectTemplates key="templates" />,
  <MockBoard key="board" />,
  <MockBacklog key="backlog" />,
  <MockSprint key="sprint" />,
  <MockRoadmap key="roadmap" />,
  <MockReports key="reports" />,
];

export default function GuidePage() {
  return (
    <div>
      <PageHero
        eyebrow="Interactive guide"
        title="How to use Vireo"
        subtitle="A guided tour of the whole product — from your first workspace to shipping your first sprint. Follow along with the sample data shown here."
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            {avatarPalette.slice(0, 5).map((color, i) => (
              <span
                key={color}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-[#F8F9FF]"
                style={{ backgroundColor: color }}
              >
                {["SA", "RK", "JY", "MT", "DR"][i]}
              </span>
            ))}
          </div>
          <span className="text-sm font-medium text-[#434655]">
            <span className="font-bold text-[#121C28]">2,500+</span> engineering teams already shipping with Vireo
          </span>
        </div>
      </PageHero>

      <section className="border-t border-[#C3C6D7]/20 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="space-y-20 md:space-y-28">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const reversed = idx % 2 === 1;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45 }}
                  className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
                >
                  <div className={reversed ? "lg:order-2" : ""}>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#004AC6] to-[#0075FF] text-white shadow-[0_6px_16px_rgba(0,74,198,0.3)]">
                        <Icon className="h-5 w-5" />
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#004AC6] shadow-sm">
                          {idx + 1}
                        </span>
                      </span>
                      <span className="text-sm font-bold uppercase tracking-wider text-[#8A8FA3]">
                        Step {idx + 1} of {steps.length}
                      </span>
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[#121C28] md:text-3xl">
                      {step.title}
                    </h2>
                    <p className="mt-3 leading-relaxed text-[#434655]">{step.description}</p>
                    <ul className="mt-4 space-y-2">
                      {step.tips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2 text-sm text-[#434655]">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={reversed ? "lg:order-1" : ""}>{mockWidgets[idx]}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#004AC6] via-[#00348f] to-[#001f63] px-8 py-14 text-center shadow-[0_20px_60px_-15px_rgba(0,74,198,0.45)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#4C9AFF]/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-[#10B981]/20 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Ready to run your first sprint?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/70">
                Create a free workspace in minutes — no credit card required. Your journey through the whole product starts here.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <a
                  href="/register"
                  className="rounded-lg bg-white px-8 py-3.5 text-base font-bold text-[#004AC6] shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-0.5 hover:bg-white/90"
                >
                  Start free trial
                </a>
                <a
                  href="/docs"
                  className="rounded-lg border border-white/20 px-8 py-3.5 text-base font-bold text-white/90 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
                >
                  Read the docs
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}