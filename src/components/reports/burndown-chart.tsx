"use client";

interface BurndownChartProps {
  totalPoints: number;
  completedPoints: number;
  daysElapsed: number;
  totalDays: number;
  dailyData?: { day: number; ideal: number; actual: number }[];
}

export function BurndownChart({
  totalPoints,
  completedPoints,
  daysElapsed,
  totalDays,
  dailyData: rawData,
}: BurndownChartProps) {
  const data = rawData || generateDefaultData(totalPoints, completedPoints, daysElapsed, totalDays);

  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 600;
  const height = 260;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxY = totalPoints * 1.1;
  const xScale = (day: number) => padding.left + (day / totalDays) * chartW;
  const yScale = (val: number) => padding.top + chartH - (val / maxY) * chartH;

  const idealLine = data.map((d) => ({ x: xScale(d.day), y: yScale(d.ideal) }));
  const actualLine = data.map((d) => ({ x: xScale(d.day), y: yScale(d.actual) }));

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    y: yScale(totalPoints * pct),
    label: `${Math.round(totalPoints * pct)}`,
  }));

  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <h3 className="text-sm font-semibold text-[#121C28] mb-4">Burndown Chart</h3>
      <div className="flex items-center gap-4 mb-3 text-xs text-[#737686]">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-[#2563EB]" />
          <span>Ideal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-[#DC2626]" />
          <span>Actual</span>
        </div>
        <span className="ml-auto font-medium text-[#121C28]">
          {completedPoints}/{totalPoints} pts completed
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-full" style={{ maxHeight: height }}>
        <defs>
          <linearGradient id="burndown-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {gridLines.map((gl, i) => (
          <g key={i}>
            <line x1={padding.left} y1={gl.y} x2={width - padding.right} y2={gl.y}
              stroke="#F1F2F6" strokeWidth="1" />
            <text x={padding.left - 8} y={gl.y + 4} textAnchor="end" className="text-[10px]" fill="#C3C6D7">
              {gl.label}
            </text>
          </g>
        ))}

        <polygon
          points={actualLine.map((p) => `${p.x},${p.y}`).join(" ") + ` ${xScale(totalDays)},${chartH + padding.top} ${xScale(0)},${chartH + padding.top}`}
          fill="url(#burndown-fill)"
        />

        <polyline
          points={idealLine.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#2563EB"
          strokeWidth="2"
          strokeDasharray="6 3"
        />

        <polyline
          points={actualLine.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#DC2626"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {actualLine.filter((_, i) => i === 0 || i === actualLine.length - 1 || data[i].day % Math.ceil(totalDays / 6) === 0).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#DC2626" stroke="white" strokeWidth="1.5" />
        ))}

        <text x={padding.left} y={height - 4} textAnchor="middle" className="text-[10px]" fill="#C3C6D7">
          Day 0
        </text>
        <text x={xScale(totalDays)} y={height - 4} textAnchor="middle" className="text-[10px]" fill="#C3C6D7">
          Day {totalDays}
        </text>
        <text x={xScale(daysElapsed)} y={height - 4} textAnchor="middle" className="text-[10px]" fill="#DC2626" fontWeight="600">
          Now
        </text>
      </svg>
    </div>
  );
}

function generateDefaultData(
  totalPoints: number,
  completedPoints: number,
  daysElapsed: number,
  totalDays: number
): { day: number; ideal: number; actual: number }[] {
  const data: { day: number; ideal: number; actual: number }[] = [];
  const pointsPerDay = totalPoints / totalDays;

  if (daysElapsed === 0) {
    data.push({ day: 0, ideal: totalPoints, actual: totalPoints });
    data.push({ day: totalDays, ideal: 0, actual: 0 });
    return data;
  }

  for (let day = 0; day <= totalDays; day++) {
    const ideal = totalPoints - pointsPerDay * day;
    let actual: number;
    if (day <= daysElapsed) {
      const pct = day / daysElapsed;
      actual = totalPoints - completedPoints * pct;
    } else {
      const remaining = totalPoints - completedPoints;
      const remainingDays = totalDays - daysElapsed;
      actual = Math.max(0, (totalPoints - completedPoints) - (remaining / remainingDays) * (day - daysElapsed));
    }
    data.push({ day, ideal: Math.round(ideal * 10) / 10, actual: Math.round(actual * 10) / 10 });
  }
  return data;
}
