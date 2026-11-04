import { Note, Scale } from "tonal";
import type { ScaleNote } from "./melody";

/** Degrees are mapped to C major, with the middle-octave tonic at C4; playback transposes from there. */
const SCALE_MIDI = Scale.get("C4 major").notes.map((note) => Note.midi(note) as number);

export function midiFor(note: ScaleNote): number {
  return SCALE_MIDI[note.degree - 1] + note.accidental + 12 * note.octave;
}

/** Name of the major key a transposition of C by this many semitones lands in. */
export function keyName(semitones: number): string {
  return Note.pitchClass(Note.fromMidi(SCALE_MIDI[0] + semitones));
}
