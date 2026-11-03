import { Note, Scale } from "tonal";
import type { ScaleNote } from "./melody";

/** Playback is always in C major, with the middle-octave tonic at C4. */
const SCALE_MIDI = Scale.get("C4 major").notes.map((note) => Note.midi(note) as number);

export function midiFor(note: ScaleNote): number {
  return SCALE_MIDI[note.degree - 1] + note.accidental + 12 * note.octave;
}
