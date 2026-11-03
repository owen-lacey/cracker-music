import carolList from "../carol-list.md?raw";

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

const TICKED_LINE = /^- \[x\] (.+?)(?:: tune \*([^*]+)\*.*)? \([^()]*\)$/;

export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseCarolList(markdown: string): Carol[] {
  return markdown
    .split("\n")
    .flatMap((line) => {
      const match = TICKED_LINE.exec(line.trim());
      return match ? [{ title: match[1], tune: match[2], slug: slugify(match[1]) }] : [];
    })
    .sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));
}

export const carols = parseCarolList(carolList);
