import { writeFileSync } from "node:fs";
import path from "node:path";
import { splitWhistles, WHISTLES, type Whistle, whistleLoads } from "../src/whistles";
import { outputDir, readCarols } from "./melodies";

const loads = whistleLoads(readCarols().map(({ melody }) => melody));
const total = WHISTLES.reduce((sum, whistle) => sum + loads[whistle], 0);
const percent = (count: number) => Math.round((count / total) * 1000) / 10;
const loadOf = (group: Whistle[]) => group.reduce((sum, whistle) => sum + loads[whistle], 0);

/** One row per table size, largest first so every person's column appears in order. */
const rows = WHISTLES.map((_, i) => WHISTLES.length - i).map((people) => {
  const split = splitWhistles(loads, people);
  const persons = Object.fromEntries(
    WHISTLES.map((_, i) => [
      `Person ${i + 1}`,
      split[i] ? `${split[i].join(", ")} (${percent(loadOf(split[i]))}%)` : "",
    ]),
  );
  return { People: people, ...persons, "Busiest %": percent(Math.max(...split.map(loadOf))) };
});

writeFileSync(path.join(outputDir(), "whistle-split.json"), `${JSON.stringify(rows, null, 2)}\n`);
console.log(`${total} notes on the whistles, octaves merged`);
for (const whistle of WHISTLES) console.log(`${whistle.padEnd(2)}  ${String(loads[whistle]).padStart(4)}  ${percent(loads[whistle])}%`);
