import { writeFileSync } from "node:fs";
import path from "node:path";
import { carols, MODES } from "../src/carols";
import { type Folding, type ModedMelody, modeUsage, noteUsage, type UsageSegment } from "../src/usage";
import { MODE_COLOURS, outputDir, readCarols, SURFACE } from "./melodies";

/** One hue per scale degree 1–7 (reference categorical palette, dark steps: post-lab renders charts dark). */
const DEGREE_COLOURS = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9"];
const CHOICES = ["merged", "split"] as const;
const STACKS = ["note", "mode"] as const;

/** Lighter the further a note sits from its middle-octave natural, so stacked segments differ in shade. */
const shade = ({ octave, accidental }: UsageSegment) => 1 - 0.2 * Math.abs(octave) - 0.35 * Math.abs(accidental);

function stackRows(melodies: ModedMelody[], folding: Folding): object[] {
  const notes = MODES.flatMap((mode) =>
    noteUsage(
      melodies.filter((carol) => carol.mode === mode).map(({ melody }) => melody),
      folding,
    ).map((segment) => ({ ...segment, mode, stack: "note", shade: shade(segment) })),
  );
  const modes = modeUsage(melodies, folding).map((segment) => ({ ...segment, stack: "mode" }));
  return [...notes, ...modes];
}

function variantRows(melodies: ModedMelody[]): object[] {
  return CHOICES.flatMap((octaves) =>
    CHOICES.flatMap((accidentals) =>
      stackRows(melodies, { octaves: octaves === "merged", accidentals: accidentals === "merged" }).map((row) => ({
        ...row,
        octaves,
        accidentals,
      })),
    ),
  );
}

const radio = (name: string, label: string, options: readonly string[], value: string) => ({
  name,
  value,
  bind: { input: "radio", options, name: `${label} ` },
});

const checkbox = (name: string, label: string) => ({
  name,
  value: true,
  bind: { input: "checkbox", name: `${label} ` },
});

/** Keeps rows whose mode's checkbox is ticked. */
const TICKED_MODES = MODES.map((mode) => `(datum.mode === '${mode}' && ${mode})`).join(" || ");

/** Sums a note's counts across the ticked modes, so each note is one segment. */
const NOTE_TOTALS = {
  aggregate: [{ op: "sum", field: "count", as: "count" }],
  groupby: ["bar", "barPitch", "note", "pitch", "degree", "shade"],
};

const bars = (stack: (typeof STACKS)[number], encoding: object, transform: object[] = []) => ({
  transform: [{ filter: `datum.stack === '${stack}'` }, ...transform],
  mark: { type: "bar", width: { band: 0.7 }, stroke: SURFACE, strokeWidth: 2 },
  encoding,
});

const byNote = bars(
  "note",
  {
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
  [NOTE_TOTALS],
);

const byMode = bars("mode", {
  color: { field: "mode", type: "nominal", scale: { domain: MODES, range: MODE_COLOURS }, title: "Key" },
  order: { field: "mode" },
  tooltip: [
    { field: "bar", title: "Note" },
    { field: "mode", title: "Key" },
    { field: "count", title: "Count" },
  ],
});

function chart(melodies: ModedMelody[]): object {
  const total = noteUsage(
    melodies.map(({ melody }) => melody),
    { octaves: false, accidentals: false },
  ).reduce((sum, { count }) => sum + count, 0);
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: { text: "Note usage", subtitle: `${total} notes across ${carols.length} included carols` },
    width: "container",
    height: 360,
    params: [
      radio("octaves", "Octaves", CHOICES, "merged"),
      radio("accidentals", "Accidentals", CHOICES, "merged"),
      radio("stack", "Stack by", STACKS, "note"),
      checkbox("major", "Major"),
      checkbox("minor", "Minor"),
    ],
    data: { values: variantRows(melodies) },
    transform: [
      { filter: "datum.octaves === octaves && datum.accidentals === accidentals && datum.stack === stack" },
      { filter: TICKED_MODES },
    ],
    encoding: {
      x: {
        field: "bar",
        type: "nominal",
        sort: { field: "barPitch", op: "min" },
        title: "Scale degree",
        axis: { labelAngle: 0 },
      },
      y: { field: "count", type: "quantitative", stack: "zero", title: "Notes", axis: { gridOpacity: 0.3 } },
    },
    layer: [byNote, byMode],
    resolve: { scale: { color: "independent" } },
    config: { view: { stroke: null }, axis: { domain: false, ticks: false } },
  };
}

writeFileSync(path.join(outputDir(), "note-usage.vl.json"), `${JSON.stringify(chart(readCarols()), null, 2)}\n`);
const minor = carols.filter(({ mode }) => mode === "minor").length;
console.log(`${carols.length} included carols (${carols.length - minor} major, ${minor} minor)`);
