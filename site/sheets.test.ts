import { describe, expect, it } from "vitest";
import type { Sheet } from "../src/carols";

const SHEETS = import.meta.glob<Sheet>("../data/carols/*.json", {
	eager: true,
	import: "default"
});

describe("saved sheets", () => {
	it.each(Object.entries(SHEETS))(
		"%s has a tempo within the transcriber's slider range",
		(_, sheet) => {
			expect(Number.isInteger(sheet.tempo)).toBe(true);
			expect(sheet.tempo).toBeGreaterThanOrEqual(40);
			expect(sheet.tempo).toBeLessThanOrEqual(200);
		}
	);
});
