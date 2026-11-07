/** Unsaved melodies, by carol slug, kept in localStorage so a reload or carol switch doesn't lose them. */
export type Drafts = Record<string, string>;

const DRAFTS_KEY = "cracker-music:drafts";
const SELECTED_KEY = "cracker-music:selected";

/** Drafts with the given carol's melody set, or removed when `melody` is null. */
export function withDraft(
	drafts: Drafts,
	slug: string,
	melody: string | null
): Drafts {
	if (melody !== null) return { ...drafts, [slug]: melody };
	return Object.fromEntries(
		Object.entries(drafts).filter(([key]) => key !== slug)
	);
}

export function loadDrafts(): Drafts {
	const raw = localStorage.getItem(DRAFTS_KEY);
	return raw ? (JSON.parse(raw) as Drafts) : {};
}

export function storeDraft(slug: string, melody: string | null): void {
	localStorage.setItem(
		DRAFTS_KEY,
		JSON.stringify(withDraft(loadDrafts(), slug, melody))
	);
}

export function loadSelectedSlug(): string | null {
	return localStorage.getItem(SELECTED_KEY);
}

export function storeSelectedSlug(slug: string): void {
	localStorage.setItem(SELECTED_KEY, slug);
}
