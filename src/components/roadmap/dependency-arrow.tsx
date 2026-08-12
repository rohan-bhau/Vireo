"use client";

interface Point {
  x: number;
  y: number;
  width: number;
}

interface DependencyArrowProps {
  from: Point;
  to: Point;
  type: "blocks" | "depends-on";
}

export function DependencyArrow({ from, to, type }: DependencyArrowProps) {
  const fromX = from.x + from.width / 2;
  const fromY = from.y + 28;
  const toX = to.x + to.width / 2;
  const toY = to.y - 2;

  const midY = (fromY + toY) / 2;

  const path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;

  const color = type === "blocks" ? "#DC2626" : "#2563EB";

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <marker
          id={`arrowhead-${type}`}
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill={color} />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray={type === "blocks" ? "5,3" : "none"}
        markerEnd={`url(#arrowhead-${type})`}
        opacity={0.6}
      />
      <circle cx={toX} cy={toY} r={3} fill={color} opacity={0.4} />
    </svg>
  );
}
