import { describe, expect, it } from "vitest";
import { applyEdit, type EditorAction, emptyEditor, selectionRange } from "./editor";
import { formatMelody, parseMelody } from "./melody";

function run(...actions: EditorAction[]) {
  return actions.reduce(applyEdit, emptyEditor);
}

const note = (degree: number): EditorAction => ({ type: "insert", slot: { degree, accidental: 0, octave: 0 } });

describe("applyEdit", () => {
  it("inserts at the cursor and applies a pending accidental once", () => {
    const state = run(note(1), { type: "accidental", value: -1 }, note(7), note(2));
    expect(formatMelody(state.slots)).toBe("1b72");
    expect(state.accidental).toBe(0);
  });

  it("shifts the octave of the note before the cursor, within one octave either way", () => {
    const state = run(note(5), { type: "octave", delta: -1 }, { type: "octave", delta: -1 });
    expect(formatMelody(state.slots)).toBe("5,");
  });

  it("selects a slot, moving the cursor after it, until the next edit", () => {
    const selected = run(note(1), note(2), note(3), { type: "select", index: 1, extend: false });
    expect(selected).toMatchObject({ selection: { anchor: 1, focus: 1 }, cursor: 2 });
    expect(applyEdit(selected, note(4))).toMatchObject({ selection: null, cursor: 3 });
  });

  it("extends a selection backwards from its anchor", () => {
    const state = run(
      note(1),
      note(2),
      note(3),
      note(4),
      { type: "select", index: 2, extend: false },
      { type: "select", index: 0, extend: true },
    );
    expect(selectionRange(state.selection!)).toEqual({ start: 0, end: 3 });
    expect(state.cursor).toBe(3);
  });

  it("deletes the selection with backspace", () => {
    const state = run(note(1), note(2), note(3), note(4), { type: "select", index: 1, extend: false }, {
      type: "select",
      index: 2,
      extend: true,
    });
    expect(formatMelody(applyEdit(state, { type: "backspace" }).slots)).toBe("14");
  });

  it("pastes at the cursor, replacing any selection", () => {
    const pasted = parseMelody("5 6'");
    const atCursor = run(note(1), note(2), { type: "move", delta: -1 }, { type: "paste", slots: pasted });
    expect(formatMelody(atCursor.slots)).toBe("15 6'2");
    expect(atCursor.cursor).toBe(4);
    const replacing = applyEdit(applyEdit(atCursor, { type: "select", index: 0, extend: false }), {
      type: "paste",
      slots: pasted,
    });
    expect(formatMelody(replacing.slots)).toBe("5 6'5 6'2");
  });

  it("inserts and deletes in the middle", () => {
    const state = run(note(1), note(3), { type: "move", delta: -1 }, note(2), { type: "insert", slot: null });
    expect(formatMelody(state.slots)).toBe("12 3");
    expect(formatMelody(applyEdit(state, { type: "backspace" }).slots)).toBe("123");
  });
});
