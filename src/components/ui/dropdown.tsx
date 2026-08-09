"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface DropdownState {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function useDropdown(): DropdownState {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const trigger = triggerRef.current;
      const panel = (e.target as HTMLElement).closest?.("[data-dropdown-panel]");
      if (trigger && !trigger.contains(e.target as Node) && !panel) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return { open, setOpen, triggerRef };
}

interface DropdownPanelProps {
  open: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  onClose?: () => void;
  children: ReactNode;
  align?: "left" | "right";
  width?: number;
  maxHeight?: number;
  className?: string;
}

export function DropdownPanel({
  open,
  triggerRef,
  onClose,
  children,
  align = "left",
  width = 224,
  maxHeight,
  className = "",
}: DropdownPanelProps) {
  const [pos, setPos] = useState<{ top: number; left: number; maxH: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const compute = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const gap = 4;
    const pad = 8;
    const menuWidth = Math.max(rect.width, width);

    let left = align === "left" ? rect.left : rect.right - menuWidth;
    if (left < pad) left = pad;
    if (left + menuWidth > window.innerWidth - pad) left = Math.max(pad, window.innerWidth - menuWidth - pad);

    let top = rect.bottom + gap;
    const vh = window.innerHeight;
    const availableBelow = vh - top - pad;
    const maxH = Math.min(maxHeight ?? Math.floor(vh * 0.6), Math.max(120, availableBelow));
    if (top + maxH > vh - pad) {
      const flipTop = rect.top - maxH - gap;
      if (flipTop >= pad) {
        top = flipTop;
      } else {
        top = Math.max(pad, vh - maxH - pad);
      }
    }
    setPos({ top, left, maxH });
  }, [triggerRef, align, width, maxHeight]);

  useLayoutEffect(() => {
    if (!open) return;
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [open, compute]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      data-dropdown-panel=""
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) onClose?.();
      }}
      style={{ position: "fixed", top: pos?.top ?? 0, left: pos?.left ?? 0, zIndex: 1000, maxHeight: pos?.maxH, borderWidth: 1 }}
      className={`overflow-y-auto rounded-[3px] border-solid border-border-light bg-surface shadow-modal text-left ${className}`}
    >
      {children}
    </div>,
    document.body
  );
}