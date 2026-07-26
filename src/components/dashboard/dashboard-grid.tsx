"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { DashboardGadget } from "./dashboard-gadget";
import { GadgetLibrary } from "./gadget-library";
import { GadgetConfigModal } from "./gadget-config-modal";
import type { GadgetConfig, GadgetData } from "@/store/dashboardApi";

interface DashboardGridProps {
  columnCount: 2 | 3;
  gadgets: GadgetConfig[];
  gadgetData: GadgetData | undefined;
  onUpdateGadgets: (gadgets: GadgetConfig[]) => void;
}

export function DashboardGrid({ columnCount, gadgets, gadgetData, onUpdateGadgets }: DashboardGridProps) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [configGadget, setConfigGadget] = useState<GadgetConfig | null>(null);

  const colClass = columnCount === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = gadgets.findIndex((g) => g.gadgetId === active.id);
    const newIndex = gadgets.findIndex((g) => g.gadgetId === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(gadgets, oldIndex, newIndex).map((g, i) => ({
      ...g,
      position: i,
    }));
    onUpdateGadgets(reordered);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-xs text-[#737686]">{gadgets.length} gadgets</p>
        </div>
        <button
          onClick={() => setShowLibrary(true)}
          className="flex items-center gap-1.5 rounded-[3px] border border-[#C3C6D7] bg-white px-3 py-1.5 text-xs font-medium text-[#434655] hover:bg-[#F4F5F7] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add gadget
        </button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={gadgets.map((g) => g.gadgetId)} strategy={verticalListSortingStrategy}>
          <div className={`grid gap-4 ${colClass}`}>
            {gadgets.map((gadget) => (
              <DashboardGadget
                key={gadget.gadgetId}
                config={gadget}
                data={gadgetData}
                onConfigure={() => setConfigGadget(gadget)}
                onRemove={() => {
                  const updated = gadgets.filter((g) => g.gadgetId !== gadget.gadgetId);
                  onUpdateGadgets(updated.map((g, i) => ({ ...g, position: i })));
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {showLibrary && (
        <GadgetLibrary
          onSelect={(type) => {
            const newGadget: GadgetConfig = {
              gadgetId: `gadget-${Date.now()}`,
              type,
              title: type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
              position: gadgets.length,
              width: 1,
              height: 1,
            };
            onUpdateGadgets([...gadgets, newGadget]);
            setShowLibrary(false);
          }}
          onClose={() => setShowLibrary(false)}
        />
      )}

      {configGadget && (
        <GadgetConfigModal
          config={configGadget}
          onSave={(updated) => {
            const updatedGadgets = gadgets.map((g) =>
              g.gadgetId === updated.gadgetId ? updated : g
            );
            onUpdateGadgets(updatedGadgets);
            setConfigGadget(null);
          }}
          onClose={() => setConfigGadget(null)}
        />
      )}
    </>
  );
}
