"use client";

interface StatisticsData {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
}

interface StatisticsProps {
  statistics: StatisticsData;
}

const statusLabels: Record<string, string> = {
  todo: "To Do",
  inProgress: "In Progress",
  inReview: "In Review",
  done: "Done",
};

const priorityLabels: Record<string, string> = {
  highest: "Highest",
  high: "High",
  medium: "Medium",
  low: "Low",
  lowest: "Lowest",
};

const typeLabels: Record<string, string> = {
  task: "Tasks",
  bug: "Bugs",
  epic: "Epics",
  story: "Stories",
  subtask: "Subtasks",
};

export function Statistics({ statistics }: StatisticsProps) {
  return (
    <div className="p-4 grid grid-cols-3 gap-4">
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#737686] mb-2">By Status</h4>
        <div className="space-y-1.5">
          {Object.entries(statistics.byStatus).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-[#434655]">{statusLabels[key] || key}</span>
              <span className="font-medium text-[#121C28]">{val}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#737686] mb-2">By Priority</h4>
        <div className="space-y-1.5">
          {Object.entries(statistics.byPriority).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-[#434655]">{priorityLabels[key] || key}</span>
              <span className="font-medium text-[#121C28]">{val}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#737686] mb-2">By Type</h4>
        <div className="space-y-1.5">
          {Object.entries(statistics.byType).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-[#434655]">{typeLabels[key] || key}</span>
              <span className="font-medium text-[#121C28]">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
