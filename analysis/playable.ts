import { writeFileSync } from "node:fs";
import path from "node:path";
import { MODES } from "../src/carols";
import { playableShare } from "../src/whistles";
import { type CarolMelody, MODE_COLOURS, outputDir, readCarols, SURFACE } from "./melodies";

/** 10%-wide bins below 100%, then 100% on its own so fully playable carols stand apart. */
const BINS = [...Array.from({ length: 10 }, (_, i) => `${i * 10}–${i * 10 + 9}%`), "100%"];

interface PlayableRow {
  title: string;
  mode: string;
  playable: number;
  bin: string;
}

function binFor(percent: number): string {
  return BINS[Math.min(Math.floor(percent / 10), 10)];
}

function rows(melodies: CarolMelody[]): PlayableRow[] {
  return melodies
    .map(({ title, mode, melody }) => {
      /** Rounded down, so only a carol with every note on the whistles reads as 100%. */
      const playable = Math.floor(playableShare(melody) * 1000) / 10;
      return { title, mode, playable, bin: binFor(playable) };
    })
    .sort((a, b) => a.playable - b.playable || a.title.localeCompare(b.title));
}

function chart(data: PlayableRow[]): object {
  const full = data.filter(({ playable }) => playable === 100).length;
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: {
      text: "Notes playable on the 8 whistles",
      subtitle: `${full} of ${data.length} included carols fully playable on 1–7 and 1'`,
    },
    width: "container",
    height: 360,
    data: { values: data },
    mark: { type: "bar", width: { band: 0.8 }, stroke: SURFACE, strokeWidth: 2 },
    encoding: {
      x: {
        field: "bin",
        type: "ordinal",
        scale: { domain: BINS },
        title: "Share of the carol's notes on the whistles",
        axis: { labelAngle: 0 },
      },
      y: {
        aggregate: "count",
        type: "quantitative",
        stack: "zero",
        title: "Carols",
        axis: { gridOpacity: 0.3, tickMinStep: 1 },
      },
      color: { field: "mode", type: "nominal", scale: { domain: MODES, range: MODE_COLOURS }, title: "Key" },
      detail: { field: "title" },
      order: { field: "mode" },
      tooltip: [
        { field: "title", title: "Carol" },
        { field: "mode", title: "Key" },
        { field: "playable", title: "Playable %" },
      ],
    },
    config: { view: { stroke: null }, axis: { domain: false, ticks: false } },
  };
}

const data = rows(readCarols());
writeFileSync(path.join(outputDir(), "playable.vl.json"), `${JSON.stringify(chart(data), null, 2)}\n`);
for (const { playable, title } of data) console.log(`${playable.toFixed(1).padStart(5)}%  ${title}`);
