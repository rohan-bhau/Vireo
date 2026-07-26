"use client";

interface StatisticsData {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
}

interface PieChartProps {
  statistics: StatisticsData;
}

const statusLabels: Record<string, string> = {
  todo: "To Do",
  inProgress: "In Progress",
  inReview: "In Review",
  done: "Done",
};

const statusColors: Record<string, string> = {
  todo: "#9CA3AF",
  inProgress: "#2563EB",
  inReview: "#D97706",
  done: "#059669",
};

export function PieChart({ statistics }: PieChartProps) {
  const entries = Object.entries(statistics.byStatus).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = 50;
  let currentAngle = -Math.PI / 2;

  return (
    <div className="p-4">
      <div className="flex items-center gap-6">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {entries.map(([key, val]) => {
            const angle = (val / total) * Math.PI * 2;
            const x1 = cx + r * Math.cos(currentAngle);
            const y1 = cy + r * Math.sin(currentAngle);
            currentAngle += angle;
            const x2 = cx + r * Math.cos(currentAngle);
            const y2 = cy + r * Math.sin(currentAngle);
            const largeArc = angle > Math.PI ? 1 : 0;
            const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            return <path key={key} d={path} fill={statusColors[key] || "#9CA3AF"} />;
          })}
        </svg>
        <div className="space-y-1.5">
          {entries.map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: statusColors[key] || "#9CA3AF" }} />
              <span className="text-[#434655]">{statusLabels[key] || key}</span>
              <span className="text-[#737686]">({Math.round((val / total) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
