/** Recording URLs keyed by path, as `import.meta.glob` returns them: `.../<take>/<midi>.mp3`. */
export type SampleFiles = Record<string, string>;

/** One take's recordings, keyed by the MIDI note each sounds. */
export type Take = Record<number, string>;

function parsePath(path: string): { take: string; midi: number } {
	const [take, file] = path.split("/").slice(-2);
	return { take, midi: Number(file.slice(0, -".mp3".length)) };
}

function noteSet(take: Take): string {
	return Object.keys(take).sort().join(",");
}

/**
 * Groups recordings into takes, one per numbered `<take>/` folder, in number order. Every take must
 * record the same notes, so no take is repitched further than another.
 */
export function groupTakes(files: SampleFiles): Take[] {
	const takes = new Map<string, Take>();
	for (const [path, url] of Object.entries(files)) {
		const { take, midi } = parsePath(path);
		takes.set(take, { ...takes.get(take), [midi]: url });
	}
	const grouped = [...takes]
		.sort(([a], [b]) => Number(a) - Number(b))
		.map(([, take]) => take);
	const notes = new Set(grouped.map(noteSet));
	if (notes.size > 1)
		throw new Error(`Takes record different notes: ${[...notes].join(" | ")}`);
	return grouped;
}

/** A random take, never the previous one when there is a choice, so repeated notes always differ. */
export function nextTake(
	count: number,
	previous: number | undefined,
	random: () => number = Math.random
): number {
	if (count === 1 || previous === undefined)
		return Math.floor(random() * count);
	const pick = Math.floor(random() * (count - 1));
	return pick >= previous ? pick + 1 : pick;
}
