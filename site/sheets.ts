import type { Sheet } from "../src/carols";
import type { Slug } from "./slugs";

const SHEETS = import.meta.glob<Sheet>("../data/carols/*.json", {
	eager: true,
	import: "default"
});

/** The transcription saved as data/carols/<slug>.json. */
export function sheetFor(slug: Slug): Sheet {
	const sheet = SHEETS[`../data/carols/${slug}.json`];
	if (sheet === undefined) throw new Error(`No transcription for "${slug}"`);
	return sheet;
}
