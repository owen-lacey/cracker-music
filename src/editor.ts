import type { Accidental, Slot } from "./melody";

/** A run of slots picked in the melody view, from where the drag started (anchor) to where it ended (focus). */
export interface Selection {
  anchor: number;
  focus: number;
}

export interface EditorState {
  slots: Slot[];
  /** Insertion point: slots are inserted before this index. */
  cursor: number;
  /** Accidental applied to the next inserted note. */
  accidental: Accidental;
  /** Selected slots: playback starts here, copy/paste/backspace act on them. Cleared by any other edit. */
  selection: Selection | null;
}

export type EditorAction =
  | { type: "insert"; slot: Slot }
  | { type: "paste"; slots: Slot[] }
  | { type: "accidental"; value: Accidental }
  | { type: "octave"; delta: 1 | -1 }
  | { type: "backspace" }
  | { type: "move"; delta: number }
  | { type: "select"; index: number; extend: boolean }
  | { type: "load"; slots: Slot[] };

type Handlers = {
  [K in EditorAction["type"]]: (state: EditorState, action: Extract<EditorAction, { type: K }>) => EditorState;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function withAccidental(slot: Slot, accidental: Accidental): Slot {
  return slot && accidental !== 0 ? { ...slot, accidental } : slot;
}

/** Selected slot indices as a half-open range [start, end). */
export function selectionRange(selection: Selection): { start: number; end: number } {
  return { start: Math.min(selection.anchor, selection.focus), end: Math.max(selection.anchor, selection.focus) + 1 };
}

function removeSelection(state: EditorState): EditorState {
  if (!state.selection) return state;
  const { start, end } = selectionRange(state.selection);
  return { ...state, slots: state.slots.toSpliced(start, end - start), cursor: start, selection: null };
}

const handlers: Handlers = {
  insert: (state, { slot }) => ({
    ...state,
    slots: state.slots.toSpliced(state.cursor, 0, withAccidental(slot, state.accidental)),
    cursor: state.cursor + 1,
    accidental: 0,
  }),
  paste: (state, { slots }) => {
    const base = removeSelection(state);
    return { ...base, slots: base.slots.toSpliced(base.cursor, 0, ...slots), cursor: base.cursor + slots.length };
  },
  accidental: (state, { value }) => ({ ...state, accidental: state.accidental === value ? 0 : value }),
  octave: (state, { delta }) => {
    const previous = state.slots[state.cursor - 1];
    if (!previous) return state;
    const octave = clamp(previous.octave + delta, -1, 1) as -1 | 0 | 1;
    return { ...state, slots: state.slots.with(state.cursor - 1, { ...previous, octave }) };
  },
  backspace: (state) => {
    if (state.selection) return removeSelection(state);
    if (state.cursor === 0) return state;
    return { ...state, slots: state.slots.toSpliced(state.cursor - 1, 1), cursor: state.cursor - 1 };
  },
  move: (state, { delta }) => ({ ...state, cursor: clamp(state.cursor + delta, 0, state.slots.length) }),
  select: (state, { index, extend }) => {
    const selection = { anchor: extend && state.selection ? state.selection.anchor : index, focus: index };
    return { ...state, selection, cursor: clamp(selectionRange(selection).end, 0, state.slots.length) };
  },
  load: (_state, { slots }) => ({ ...emptyEditor, slots, cursor: slots.length }),
};

export function applyEdit(state: EditorState, action: EditorAction): EditorState {
  const handler = handlers[action.type] as (state: EditorState, action: EditorAction) => EditorState;
  const next = handler(state, action);
  return action.type === "select" ? next : { ...next, selection: null };
}

export const emptyEditor: EditorState = { slots: [], cursor: 0, accidental: 0, selection: null };
