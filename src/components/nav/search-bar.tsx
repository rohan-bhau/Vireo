"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { clsx } from "clsx";

export function SearchBar() {
  const router = useRouter();
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
      setFocused(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={handleSubmit}
        className={clsx(
          "flex items-center rounded-[3px] border transition-all",
          focused
            ? "w-72 border-[#2563EB] bg-white shadow-sm"
            : "w-52 md:w-64 border-border-light bg-bg-light hover:bg-white"
        )}
      >
        <Search
          className={clsx(
            "ml-2 h-3.5 w-3.5 shrink-0",
            focused ? "text-[#2563EB]" : "text-text-tertiary"
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search"
          className="w-full bg-transparent px-2 py-1.5 text-xs font-medium text-text outline-none placeholder:text-text-tertiary"
          aria-label="Search issues, projects, and people"
        />
        {!focused && (
          <kbd className="mr-2 hidden rounded-[2px] border border-border-light bg-white px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary md:inline">
            /
          </kbd>
        )}
      </form>
    </div>
  );
}
