import { Note, Scale } from "tonal";
import type { ScaleNote } from "./melody";

export const TONICS = ["C", "C#", "Db", "D", "Eb", "E", "F", "F#", "Gb", "G", "Ab", "A", "Bb", "B"];
export const MODES = ["major", "minor", "dorian", "phrygian", "lydian", "mixolydian", "locrian"];

/** MIDI number of a scale note; the middle-octave tonic is in octave 4. */
export function midiFor(note: ScaleNote, tonic: string, mode: string): number {
  const scale = Scale.get(`${tonic}4 ${mode}`).notes;
  const base = Note.midi(scale[note.degree - 1] ?? "");
  if (base === null) {
    throw new Error(`Cannot resolve degree ${note.degree} in ${tonic} ${mode}`);
  }
  return base + note.accidental + 12 * note.octave;
}
