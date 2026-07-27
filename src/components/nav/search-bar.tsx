"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLazyGlobalSearchQuery } from "@/store/searchApi";
import { clsx } from "clsx";

interface SuggestionGroup {
  label: string;
  items: { id: string; label: string; sublabel?: string; href: string; icon?: string }[];
}

export function SearchBar() {
  const router = useRouter();
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const [trigger, { data, isLoading }] = useLazyGlobalSearchQuery();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [debouncedValue, setDebouncedValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    if (debouncedValue.length >= 2) {
      trigger(debouncedValue);
    }
  }, [debouncedValue, trigger]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (
      e.key === "/" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(
        (e.target as HTMLElement)?.tagName
      )
    ) {
      e.preventDefault();
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestionGroups: SuggestionGroup[] = [];

  if (data && focused) {
    if (data.tasks.length > 0) {
      suggestionGroups.push({
        label: "Recent Issues",
        items: data.tasks.slice(0, 5).map((t: any) => ({
          id: t._id,
          label: t.title,
          sublabel: t.taskKey,
          href: `/task/${t.taskKey}`,
          icon: t.type === "bug" ? "◉" : t.type === "story" ? "☰" : t.type === "epic" ? "◆" : "○",
        })),
      });
    }
    if (data.projects.length > 0) {
      suggestionGroups.push({
        label: "Projects",
        items: data.projects.map((p: any) => ({
          id: p.id,
          label: p.name,
          sublabel: p.key,
          href: `/p/${p.id}/board`,
        })),
      });
    }
    if (data.workspaces.length > 0) {
      suggestionGroups.push({
        label: "Workspaces",
        items: data.workspaces.map((w: any) => ({
          id: w.id,
          label: w.name,
          href: `/w/${w.id}`,
        })),
      });
    }
  }

  const flatItems = suggestionGroups.flatMap((g) => g.items);
  const totalSuggestions = flatItems.length;

  function navigateToItem(index: number) {
    if (index >= 0 && index < flatItems.length) {
      router.push(flatItems[index].href);
      setFocused(false);
      setValue("");
    }
  }

  function handleKeyDownInput(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, totalSuggestions - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (totalSuggestions > 0 && selectedIndex >= 0 && selectedIndex < totalSuggestions) {
        navigateToItem(selectedIndex);
      } else if (value.trim()) {
        router.push(`/search?q=${encodeURIComponent(value.trim())}`);
        setFocused(false);
      }
    } else if (e.key === "Escape") {
      setFocused(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
      setFocused(false);
    }
  }

  useEffect(() => {
    setSelectedIndex(0);
  }, [data]);

  let currentGroupIndex = 0;
  let itemOffset = 0;

  const isIssueKey = /^[A-Z]+-\d+$/i.test(value.trim());
  if (isIssueKey && focused) {
    suggestionGroups.unshift({
      label: "Quick Navigate",
      items: [{
        id: "direct-issue",
        label: `Go to issue ${value.toUpperCase()}`,
        sublabel: "Open issue",
        href: `/task/${value.toUpperCase()}`,
        icon: "→",
      }],
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={handleSubmit}
        className={clsx(
          "flex items-center rounded-[3px] border transition-all",
          focused
            ? "w-80 border-[#2563EB] bg-white shadow-sm"
            : "w-52 md:w-64 border-border-light bg-bg-light hover:bg-white"
        )}
      >
        <svg
          className={clsx(
            "ml-2 h-3.5 w-3.5 shrink-0",
            focused ? "text-[#2563EB]" : "text-text-tertiary"
          )}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDownInput}
          placeholder="Search"
          className="w-full bg-transparent px-2 py-1.5 text-xs font-medium text-text outline-none placeholder:text-text-tertiary"
          aria-label="Search issues, projects, and people"
        />
        {!focused && (
          <kbd className="mr-2 hidden rounded-[2px] border border-border-light bg-white px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary md:inline">
            /
          </kbd>
        )}
        {focused && value && (
          <button
            type="button"
            onClick={() => setValue("")}
            className="mr-1.5 text-[#737686] hover:text-[#121C28]"
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {focused && (isLoading || suggestionGroups.length > 0 || (value.length >= 2 && !isLoading)) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-[3px] border border-[#DFE1E6] bg-white shadow-modal overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <svg className="h-4 w-4 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {!isLoading && suggestionGroups.length > 0 && (
            <div ref={listRef} className="max-h-80 overflow-y-auto">
              {suggestionGroups.map((group) => {
                const groupStartIndex = itemOffset;
                itemOffset += group.items.length;
                return (
                  <div key={group.label}>
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#737686] bg-[#FAFBFC]">
                      {group.label}
                    </div>
                    {group.items.map((item, idx) => {
                      const globalIdx = groupStartIndex + idx;
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigateToItem(globalIdx)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={clsx(
                            "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors",
                            globalIdx === selectedIndex ? "bg-[#EEF4FF]" : "hover:bg-[#F8F9FF]"
                          )}
                        >
                          {item.icon && (
                            <span className="w-4 text-center text-[11px]">{item.icon}</span>
                          )}
                          <span className="flex-1 truncate font-medium text-[#121C28]">{item.label}</span>
                          {item.sublabel && (
                            <span className="shrink-0 font-mono text-[10px] text-[#737686]">{item.sublabel}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && suggestionGroups.length === 0 && value.length >= 2 && (
            <div className="px-3 py-3 text-xs text-text-tertiary text-center">No results found</div>
          )}

          {value.length >= 2 && (
            <button
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(value.trim())}`);
                setFocused(false);
              }}
              className="flex w-full items-center gap-2 border-t border-[#DFE1E6] px-3 py-2 text-xs font-medium text-[#2563EB] hover:bg-[#EEF4FF] transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              View all results for &ldquo;{value}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
