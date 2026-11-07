import { MODES, type Mode } from "./carols";
import { formatSlot, parseMelody, type ScaleNote } from "./melody";
import { midiFor } from "./pitch";

/** Which differences are folded away when notes are grouped into bars. */
export interface Folding {
	/** Fold every octave into the middle one, except the upper tonic 1', which keeps its own bar. */
	octaves: boolean;
	/** Fold sharps and flats into their natural degree. */
	accidentals: boolean;
}

/** One stacked segment: how often a transcribed note occurs, and the bar it is grouped into. */
export interface UsageSegment {
	bar: string;
	barPitch: number;
	note: string;
	pitch: number;
	octave: number;
	accidental: number;
	degree: number;
	count: number;
}

const isUpperTonic = (note: ScaleNote) =>
	note.degree === 1 && note.octave === 1;

export function fold(note: ScaleNote, folding: Folding): ScaleNote {
	const natural: ScaleNote = folding.accidentals
		? { ...note, accidental: 0 }
		: note;
	return folding.octaves && !isUpperTonic(natural)
		? { ...natural, octave: 0 }
		: natural;
}

function tally(
	melodies: string[]
): Map<string, { note: ScaleNote; count: number }> {
	const counts = new Map<string, { note: ScaleNote; count: number }>();
	for (const slot of melodies.flatMap(parseMelody)) {
		if (slot === null) continue;
		const key = formatSlot(slot);
		counts.set(key, { note: slot, count: (counts.get(key)?.count ?? 0) + 1 });
	}
	return counts;
}

/** Note usage across the melodies as stacked segments, ordered by bar pitch then note pitch. */
export function noteUsage(
	melodies: string[],
	folding: Folding
): UsageSegment[] {
	return [...tally(melodies).entries()]
		.map(([key, { note, count }]) => {
			const bar = fold(note, folding);
			return {
				bar: formatSlot(bar),
				barPitch: midiFor(bar),
				note: key,
				pitch: midiFor(note),
				octave: note.octave,
				accidental: note.accidental,
				degree: note.degree,
				count
			};
		})
		.sort((a, b) => a.barPitch - b.barPitch || a.pitch - b.pitch);
}

/** One stacked segment: how many notes in a bar come from carols in one mode. */
export interface ModeSegment {
	bar: string;
	barPitch: number;
	mode: Mode;
	count: number;
}

/** A carol's melody tagged with the mode it is in. */
export interface ModedMelody {
	mode: Mode;
	melody: string;
}

function barsFor(
	mode: Mode,
	melodies: string[],
	folding: Folding
): ModeSegment[] {
	const bars = new Map<string, ModeSegment>();
	for (const { bar, barPitch, count } of noteUsage(melodies, folding)) {
		const total = bars.get(bar)?.count ?? 0;
		bars.set(bar, { bar, barPitch, mode, count: total + count });
	}
	return [...bars.values()];
}

/** Note usage per bar, split by the mode of the carol each note comes from; ordered by bar pitch then mode. */
export function modeUsage(
	melodies: ModedMelody[],
	folding: Folding
): ModeSegment[] {
	return MODES.flatMap((mode) =>
		barsFor(
			mode,
			melodies
				.filter((carol) => carol.mode === mode)
				.map((carol) => carol.melody),
			folding
		)
	).sort(
		(a, b) =>
			a.barPitch - b.barPitch || MODES.indexOf(a.mode) - MODES.indexOf(b.mode)
	);
}
