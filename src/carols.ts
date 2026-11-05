import carolList from "../data/carols.json";

/** One row of data/carols.json, the single list of carols in the post. */
export interface CarolEntry {
  title: string;
  tune?: string;
  /** Whether the carol is in the post; excluded rows stay in the file. */
  included: boolean;
}

export interface Carol {
  title: string;
  tune?: string;
  slug: string;
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

/** The included carols, sorted by title. */
export function includedCarols(entries: CarolEntry[]): Carol[] {
  return entries
    .filter((entry) => entry.included)
    .map((entry) => ({ title: entry.title, tune: entry.tune, slug: slugify(entry.title) }))
    .sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));
}

export const carols = includedCarols(carolList);
