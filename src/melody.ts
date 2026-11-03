/**
 * Melody notation: one token per 16th-note slot.
 *   1-7      scale degree (middle octave)
 *   ' / ,    suffix: octave above / below
 *   # / b    prefix: sharpened / flattened degree
 *   space    rest
 */

export type Accidental = -1 | 0 | 1;
export type Octave = -1 | 0 | 1;

export interface ScaleNote {
  degree: number;
  accidental: Accidental;
  octave: Octave;
}

/** A 16th-note slot: a note, or null for a rest. Its index is its start time in 16ths. */
export type Slot = ScaleNote | null;

const ACCIDENTALS: Record<string, Accidental> = { "": 0, "#": 1, b: -1 };
const OCTAVES: Record<string, Octave> = { "": 0, "'": 1, ",": -1 };
const ACCIDENTAL_MARKS: Record<Accidental, string> = { [-1]: "b", 0: "", 1: "#" };
const OCTAVE_MARKS: Record<Octave, string> = { [-1]: ",", 0: "", 1: "'" };

export function parseMelody(melody: string): Slot[] {
  const token = /([#b]?)([1-7])([',]?)| /y;
  const slots: Slot[] = [];
  while (token.lastIndex < melody.length) {
    const position = token.lastIndex;
    const match = token.exec(melody);
    if (!match) {
      throw new Error(`Invalid melody at position ${position}: "${melody[position]}"`);
    }
    slots.push(
      match[2]
        ? { degree: Number(match[2]), accidental: ACCIDENTALS[match[1]], octave: OCTAVES[match[3]] }
        : null,
    );
  }
  return slots;
}

export function formatSlot(slot: Slot): string {
  if (slot === null) return " ";
  return `${ACCIDENTAL_MARKS[slot.accidental]}${slot.degree}${OCTAVE_MARKS[slot.octave]}`;
}

export function formatMelody(slots: Slot[]): string {
  return slots.map(formatSlot).join("");
}
