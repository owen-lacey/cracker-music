import { useEffect, useRef } from "react";
import { type EditorAction, type Selection, selectionRange } from "../editor";
import { formatSlot, type Slot } from "../melody";

const SLOTS_PER_BEAT = 4;

function label(slot: Slot): string {
  return slot === null ? "·" : formatSlot(slot).replace("#", "♯").replace("b", "♭");
}

function Caret() {
  return <span className="mx-px inline-block h-7 w-0.5 animate-pulse bg-blue-600 align-middle" />;
}

interface MelodyViewProps {
  slots: Slot[];
  cursor: number;
  /** Index of the slot currently sounding during playback. */
  activeSlot: number | null;
  selection: Selection | null;
  onAction: (action: EditorAction) => void;
}

function slotClass(slot: Slot, active: boolean, selected: boolean): string {
  const colour = slot === null ? "text-gray-400" : "";
  if (active) return `bg-yellow-300 ${colour}`;
  return selected ? `bg-blue-200 ${colour}` : `hover:bg-gray-100 ${colour}`;
}

/**
 * Shows the melody one slot per 16th, with a gap every beat.
 * Click or drag across slots to select them (shift-click extends); the cursor goes after the selection.
 */
export function MelodyView({ slots, cursor, activeSlot, selection, onAction }: MelodyViewProps) {
  const dragging = useRef(false);
  const range = selection && selectionRange(selection);

  useEffect(() => {
    const stopDragging = () => {
      dragging.current = false;
    };
    window.addEventListener("mouseup", stopDragging);
    return () => window.removeEventListener("mouseup", stopDragging);
  }, []);

  return (
    <div className="flex min-h-24 flex-wrap items-center gap-y-2 rounded border border-gray-300 bg-white p-3 font-mono text-lg select-none">
      {cursor === 0 && <Caret />}
      {slots.map((slot, index) => (
        <span key={index} className={`flex items-center ${index % SLOTS_PER_BEAT === 0 && index > 0 ? "ml-3" : ""}`}>
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              dragging.current = true;
              onAction({ type: "select", index, extend: event.shiftKey });
            }}
            onMouseEnter={() => dragging.current && onAction({ type: "select", index, extend: true })}
            className={`min-w-6 rounded px-0.5 ${slotClass(
              slot,
              index === activeSlot,
              range !== null && index >= range.start && index < range.end,
            )}`}
          >
            {label(slot)}
          </button>
          {cursor === index + 1 && <Caret />}
        </span>
      ))}
    </div>
  );
}
