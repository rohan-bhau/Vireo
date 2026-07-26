"use client";

import { useLazyGetSuggestionsQuery } from "@/store/searchApi";
import { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";

interface JqlAutocompleteProps {
  query: string;
  cursorPos: number;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function JqlAutocomplete({ query, cursorPos, onSelect, onClose }: JqlAutocompleteProps) {
  const [trigger, { data }] = useLazyGetSuggestionsQuery();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const lastWord = getLastWord(query, cursorPos);
  const suggestType = getSuggestType(query, cursorPos);

  useEffect(() => {
    if (lastWord && lastWord.length >= 1) {
      trigger({ q: lastWord, type: suggestType });
    }
  }, [lastWord, suggestType, trigger]);

  const items = data?.suggestions || [];

  useEffect(() => {
    setSelectedIndex(0);
  }, [items.length]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (items[selectedIndex]) {
          onSelect(items[selectedIndex].value);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [items, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      (listRef.current.children[selectedIndex] as HTMLElement).scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (items.length === 0) return null;

  return (
    <div
      ref={listRef}
      className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-[3px] border border-[#DFE1E6] bg-white shadow-modal"
    >
      {items.map((item, i) => (
        <button
          key={item.value}
          onClick={() => onSelect(item.value)}
          onMouseEnter={() => setSelectedIndex(i)}
          className={clsx(
            "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors",
            i === selectedIndex ? "bg-[#EEF4FF] text-[#2563EB]" : "text-[#434655] hover:bg-[#F1F2F6]"
          )}
        >
          <span className="font-medium">{item.label}</span>
          <span className="ml-auto font-mono text-[10px] text-[#737686]">{item.value}</span>
        </button>
      ))}
    </div>
  );
}

function getLastWord(query: string, pos: number): string {
  const before = query.slice(0, pos);
  const match = before.match(/[a-zA-Z0-9_'"-]+$/);
  return match ? match[0].replace(/['"]/g, "") : "";
}

function getSuggestType(query: string, pos: number): string {
  const before = query.slice(0, pos).trimEnd();
  const opMatch = before.match(/([=!><~]+|IN|NOT IN|IS|IS NOT)\s*$/i);
  if (opMatch) return "value";

  const lastToken = before.split(/\s+/).pop() || "";
  const operators = ["=", "!=", ">", ">=", "<", "<=", "~", "!~", "IN", "NOT IN", "IS", "IS NOT"];
  const hasOp = operators.some((op) => before.toUpperCase().endsWith(op));
  if (hasOp) return "value";

  if (/AND\s*$/i.test(before) || /OR\s*$/i.test(before) || /^\s*$/.test(before) || before.length === 0) {
    return "field";
  }

  return "field";
}
