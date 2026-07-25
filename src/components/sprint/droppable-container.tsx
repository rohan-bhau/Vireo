"use client";

import { useDroppable } from "@dnd-kit/core";
import { clsx } from "clsx";
import type { ReactNode } from "react";

interface DroppableContainerProps {
  id: string;
  children: ReactNode;
  className?: string;
  isOver?: boolean;
}

export function DroppableContainer({ id, children, className }: DroppableContainerProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "transition-[border-color,box-shadow]",
        isOver && "ring-2 ring-[#4C9AFF] ring-inset rounded-[3px]",
        className
      )}
    >
      {children}
    </div>
  );
}
