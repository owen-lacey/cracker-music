import carolList from "../data/carols.json";

/** One row of data/carols.json, the single list of carols in the post. */
export interface CarolEntry {
	title: string;
	tune?: string;
	/** Whether the carol is in the post; excluded rows stay in the file. */
	included: boolean;
	/** The key the carol is in: "major" or "minor". */
	mode: string;
	/** Whether the carol plays swung; see `src/swing.ts`. */
	swing: boolean;
}

export const MODES = ["major", "minor"] as const;
export type Mode = (typeof MODES)[number];

export interface Carol {
	title: string;
	tune?: string;
	slug: string;
	mode: Mode;
}

/** A transcribed carol, saved as data/carols/<slug>.json. */
export interface Sheet {
	title: string;
	tune?: string;
	melody: string;
}

export function slugify(title: string): string {
	return title
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

const isMode = (value: string): value is Mode =>
	(MODES as readonly string[]).includes(value);

function modeOf({ title, mode }: CarolEntry): Mode {
	if (isMode(mode)) return mode;
	throw new Error(
		`"${title}" has mode "${mode}" in data/carols.json; expected ${MODES.join(" or ")}`
	);
}

/** The included carols, sorted by title. */
export function includedCarols(entries: CarolEntry[]): Carol[] {
	return entries
		.filter((entry) => entry.included)
		.map((entry) => ({
			title: entry.title,
			tune: entry.tune,
			slug: slugify(entry.title),
			mode: modeOf(entry)
		}))
		.sort((a, b) =>
			a.title.localeCompare(b.title, "en", { sensitivity: "base" })
		);
}

export const carols = includedCarols(carolList);

/** Whether the carol with this slug plays swung, read from any row of the entries, included or not. */
export function isSwung(
	slug: string,
	entries: CarolEntry[] = carolList
): boolean {
	const entry = entries.find(({ title }) => slugify(title) === slug);
	if (entry === undefined)
		throw new Error(`No carol with slug "${slug}" in data/carols.json`);
	return entry.swing;
}
