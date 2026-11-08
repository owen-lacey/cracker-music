import type { Sheet } from "../src/carols";
import type { Slug } from "./slugs";

const SHEETS = import.meta.glob<Sheet>("../data/carols/*.json", {
	eager: true,
	import: "default"
});

const pathFor = (slug: string) => `../data/carols/${slug}.json`;

/** The slug typed as a `Slug`, once data/carols/<slug>.json is known to exist. */
export function slugFor(slug: string): Slug {
	if (!(pathFor(slug) in SHEETS))
		throw new Error(`No transcription for "${slug}"`);
	return slug as Slug;
}

/** The transcription saved as data/carols/<slug>.json. */
export function sheetFor(slug: Slug): Sheet {
	const sheet = SHEETS[pathFor(slug)];
	if (sheet === undefined) throw new Error(`No transcription for "${slug}"`);
	return sheet;
}
