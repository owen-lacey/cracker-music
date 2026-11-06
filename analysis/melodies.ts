import { readFileSync } from "node:fs";
import path from "node:path";
import { carols, type Mode, type Sheet } from "../src/carols";

const CAROLS_DIR = path.resolve(import.meta.dirname, "../data/carols");

/** One hue per mode, major then minor (reference categorical palette, dark steps: post-lab renders charts dark). */
export const MODE_COLOURS = ["#c98500", "#9085e9"];
/** post-lab's dark chart background; marks are outlined in it so stacked segments read apart. */
export const SURFACE = "#333333";

export interface CarolMelody {
  title: string;
  mode: Mode;
  melody: string;
}

function readMelody(slug: string, title: string): string {
  const file = path.join(CAROLS_DIR, `${slug}.json`);
  try {
    return (JSON.parse(readFileSync(file, "utf8")) as Sheet).melody;
  } catch (error) {
    throw new Error(`No transcription for "${title}" at ${file}`, { cause: error });
  }
}

/** The included carols with their transcribed melodies. */
export function readCarols(): CarolMelody[] {
  return carols.map(({ slug, title, mode }) => ({ title, mode, melody: readMelody(slug, title) }));
}

/** The folder post-lab gives a cell for its outputs. */
export function outputDir(): string {
  const out = process.env.POST_LAB_OUT;
  if (!out) throw new Error("POST_LAB_OUT is not set");
  return out;
}
