"use client";

import { useRef, useCallback, useState } from "react";
import { clsx } from "clsx";

interface EpicBarProps {
  id: string;
  title: string;
  color: string;
  left: number;
  width: number;
  top: number;
  progress?: number;
  onClick?: () => void;
  onResizeStart?: (edge: "left" | "right") => void;
  onResizeEnd?: () => void;
  isExpanded?: boolean;
  hasChildren?: boolean;
}

export function EpicBar({
  id,
  title,
  color,
  left,
  width,
  top,
  progress,
  onClick,
  onResizeStart,
  onResizeEnd,
  isExpanded,
  hasChildren,
}: EpicBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, edge: "left" | "right") => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      onResizeStart?.(edge);

      const handleMouseUp = () => {
        setIsDragging(false);
        onResizeEnd?.();
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mouseup", handleMouseUp);
    },
    [onResizeStart, onResizeEnd]
  );

  const minWidth = 20;

  return (
    <div
      ref={barRef}
      className={clsx(
        "absolute h-7 rounded-md flex items-center overflow-hidden cursor-pointer group select-none",
        isDragging && "shadow-lg z-10"
      )}
      style={{
        left,
        width: Math.max(width, minWidth),
        top,
        backgroundColor: color + "18",
        borderLeft: `3px solid ${color}`,
      }}
      onClick={onClick}
      title={`${id}: ${title}`}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color + "0a" }}
      />
      {width > 60 && (
        <span className="truncate text-xs font-medium px-2 relative z-[1]" style={{ color }}>
          {id} {title}
        </span>
      )}
      {width > 100 && progress !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C3C6D7]/30">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${Math.min(100, progress)}%`, backgroundColor: color }}
          />
        </div>
      )}
      {hasChildren && (
        <div
          className={clsx(
            "absolute right-1 top-1/2 -translate-y-1/2 w-3.5 h-3.5 flex items-center justify-center rounded text-[9px] font-bold transition-transform",
            isExpanded ? "rotate-90" : "rotate-0"
          )}
          style={{ color, backgroundColor: color + "20" }}
        >
          ►
        </div>
      )}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color + "40" }}
        onMouseDown={(e) => handleMouseDown(e, "left")}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color + "40" }}
        onMouseDown={(e) => handleMouseDown(e, "right")}
      />
    </div>
  );
}
