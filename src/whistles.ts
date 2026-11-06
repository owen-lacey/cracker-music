import { formatSlot, parseMelody, type ScaleNote } from "./melody";
import { fold } from "./usage";

/** The 8 cracker whistles, low to high. */
export const WHISTLES = ["1", "2", "3", "4", "5", "6", "7", "1'"] as const;
export type Whistle = (typeof WHISTLES)[number];

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

/** How many notes each whistle plays across the melodies, with octaves merged (1' keeps its own whistle); accidentals are left out. */
export function whistleLoads(melodies: string[]): Record<Whistle, number> {
  const loads = Object.fromEntries(WHISTLES.map((whistle) => [whistle, 0])) as Record<Whistle, number>;
  for (const slot of melodies.flatMap(parseMelody)) {
    if (slot === null) continue;
    const note = fold(slot, { octaves: true, accidentals: false });
    if (onWhistle(note)) loads[formatSlot(note) as Whistle] += 1;
  }
  return loads;
}

/** Every way to split the whistles into exactly `groups` non-empty groups, each group and the groups in whistle order. */
function* partitions(whistles: readonly Whistle[], groups: number, current: Whistle[][]): Generator<Whistle[][]> {
  if (whistles.length < groups - current.length) return;
  if (whistles.length === 0) {
    yield current.map((group) => [...group]);
    return;
  }
  const [first, ...rest] = whistles;
  for (const group of current) {
    group.push(first);
    yield* partitions(rest, groups, current);
    group.pop();
  }
  if (current.length < groups) yield* partitions(rest, groups, [...current, [first]]);
}

/** The fairest split of the whistles among `people`: the busiest person plays as few notes as possible, then the idlest as many. */
export function splitWhistles(loads: Record<Whistle, number>, people: number): Whistle[][] {
  if (!Number.isInteger(people) || people < 1 || people > WHISTLES.length) {
    throw new Error(`People must be a whole number from 1 to ${WHISTLES.length}, got ${people}`);
  }
  const loadOf = (group: Whistle[]) => group.reduce((sum, whistle) => sum + loads[whistle], 0);
  return [...partitions(WHISTLES, people, [])]
    .map((split) => {
      const totals = split.map(loadOf);
      return { split, busiest: Math.max(...totals), idlest: Math.min(...totals) };
    })
    .reduce((best, next) => (next.busiest - best.busiest || best.idlest - next.idlest) < 0 ? next : best).split;
}
