import { parseMelody, type ScaleNote } from "./melody";

/** Whether a note is one of the 8 cracker whistles: the naturals 1–7 in the middle octave, plus the upper tonic 1'. */
export function onWhistle({ degree, accidental, octave }: ScaleNote): boolean {
  return accidental === 0 && (octave === 0 || (degree === 1 && octave === 1));
}

/** The fraction of a melody's notes that can be played on the whistles. */
export function playableShare(melody: string): number {
  const notes = parseMelody(melody).filter((slot) => slot !== null);
  if (notes.length === 0) throw new Error("Melody has no notes");
  return notes.filter(onWhistle).length / notes.length;
}
