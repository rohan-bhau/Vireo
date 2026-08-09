"use client";

import { useGetProjectComponentsQuery, type Component } from "@/store/componentApi";
import { useDropdown, DropdownPanel } from "@/components/ui/dropdown";

interface ComponentSelectorProps {
  value: string;
  onChange: (component: string) => void;
  projectId?: string;
}

export function ComponentSelector({ value, onChange, projectId }: ComponentSelectorProps) {
  const { data: components } = useGetProjectComponentsQuery(projectId || "", { skip: !projectId });
  const { open, setOpen, triggerRef } = useDropdown();

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-[3px] border border-border-input bg-surface px-2.5 py-1.5 text-sm text-text hover:border-border-default transition-colors text-left"
      >
        {value || <span className="text-text-placeholder">None</span>}
      </button>
      <DropdownPanel open={open} triggerRef={triggerRef} onClose={() => setOpen(false)} maxHeight={160}>
        <button
          type="button"
          onClick={() => { onChange(""); setOpen(false); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-placeholder hover:bg-bg-light"
        >
          None
        </button>
        {(!components || components.length === 0) ? (
          <div className="px-3 py-2 text-xs text-text-placeholder">No components</div>
        ) : (
          components.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => { onChange(c.name); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light ${c.name === value ? "bg-bg-light font-medium" : ""}`}
            >
              {c.name}
            </button>
          ))
        )}
      </DropdownPanel>
    </div>
  );
}

interface MultiComponentSelectorProps {
  value: string[];
  onChange: (components: string[]) => void;
  projectId?: string;
}

export function MultiComponentSelector({ value, onChange, projectId }: MultiComponentSelectorProps) {
  const { data: components } = useGetProjectComponentsQuery(projectId || "", { skip: !projectId });
  const { open, setOpen, triggerRef } = useDropdown();

  function toggle(comp: Component) {
    if (value.includes(comp.name)) {
      onChange(value.filter((c) => c !== comp.name));
    } else {
      onChange([...value, comp.name]);
    }
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-[3px] border border-border-input bg-surface px-2.5 py-1.5 text-sm text-text hover:border-border-default transition-colors text-left"
      >
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {value.map((c) => (
              <span key={c} className="rounded bg-bg-light px-1.5 py-0.5 text-[11px] font-medium text-text-secondary">
                {c}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-text-placeholder">None</span>
        )}
      </button>
      <DropdownPanel open={open} triggerRef={triggerRef} onClose={() => setOpen(false)} maxHeight={160}>
        {(!components || components.length === 0) ? (
          <div className="px-3 py-2 text-xs text-text-placeholder">No components</div>
        ) : (
          components.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => toggle(c)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light ${value.includes(c.name) ? "bg-bg-light font-medium" : ""}`}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded border border-border-light">
                {value.includes(c.name) && (
                  <svg className="h-3 w-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </span>
              {c.name}
            </button>
          ))
        )}
      </DropdownPanel>
    </div>
  );
}