import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { carols, type Sheet } from "../src/carols";
import { noteUsage, type UsageSegment } from "../src/usage";

const CAROLS_DIR = path.resolve(import.meta.dirname, "../data/carols");
const OUT = process.env.POST_LAB_OUT;
if (!OUT) throw new Error("POST_LAB_OUT is not set");

/** One hue per scale degree 1–7 (reference categorical palette, dark steps: post-lab renders charts dark). */
const DEGREE_COLOURS = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9"];
/** post-lab's dark chart background; segments are outlined in it so stacked notes read apart. */
const SURFACE = "#333333";
const CHOICES = ["merged", "split"] as const;

function readMelody(slug: string, title: string): string {
  const file = path.join(CAROLS_DIR, `${slug}.json`);
  try {
    return (JSON.parse(readFileSync(file, "utf8")) as Sheet).melody;
  } catch (error) {
    throw new Error(`No transcription for "${title}" at ${file}`, { cause: error });
  }
}

/** Lighter the further a note sits from its middle-octave natural, so stacked segments differ in shade. */
const shade = ({ octave, accidental }: UsageSegment) => 1 - 0.2 * Math.abs(octave) - 0.35 * Math.abs(accidental);

function variantRows(melodies: string[]): object[] {
  return CHOICES.flatMap((octaves) =>
    CHOICES.flatMap((accidentals) =>
      noteUsage(melodies, { octaves: octaves === "merged", accidentals: accidentals === "merged" }).map(
        (segment) => ({ ...segment, octaves, accidentals, shade: shade(segment) }),
      ),
    ),
  );
}

const radio = (name: string, value: string) => ({
  name: name.toLowerCase(),
  value,
  bind: { input: "radio", options: CHOICES, name: `${name} ` },
});

function chart(melodies: string[]): object {
  const total = noteUsage(melodies, { octaves: false, accidentals: false }).reduce((sum, { count }) => sum + count, 0);
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: { text: "Note usage", subtitle: `${total} notes across ${carols.length} included carols` },
    width: "container",
    height: 360,
    params: [radio("Octaves", "merged"), radio("Accidentals", "split")],
    data: { values: variantRows(melodies) },
    transform: [{ filter: "datum.octaves === octaves && datum.accidentals === accidentals" }],
    mark: { type: "bar", width: { band: 0.7 }, stroke: SURFACE, strokeWidth: 2 },
    encoding: {
      x: {
        field: "bar",
        type: "nominal",
        sort: { field: "barPitch", op: "min" },
        title: "Scale degree",
        axis: { labelAngle: 0 },
      },
      y: { field: "count", type: "quantitative", stack: "zero", title: "Notes", axis: { gridOpacity: 0.3 } },
      color: {
        field: "degree",
        type: "nominal",
        scale: { domain: [1, 2, 3, 4, 5, 6, 7], range: DEGREE_COLOURS },
        legend: null,
      },
      opacity: { field: "shade", type: "quantitative", scale: null },
      order: { field: "pitch" },
      tooltip: [
        { field: "note", title: "Note" },
        { field: "count", title: "Count" },
      ],
    },
    config: { view: { stroke: null }, axis: { domain: false, ticks: false } },
  };
}

const melodies = carols.map(({ slug, title }) => readMelody(slug, title));
writeFileSync(path.join(OUT, "note-usage.vl.json"), `${JSON.stringify(chart(melodies), null, 2)}\n`);
console.log(`${carols.length} included carols`);
