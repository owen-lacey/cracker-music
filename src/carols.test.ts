import { describe, expect, it } from "vitest";
import { carols, includedCarols, isSwung, slugify } from "./carols";

describe("includedCarols", () => {
	it("reads every included carol from data/carols.json with unique slugs", () => {
		expect(carols).toHaveLength(20);
		expect(new Set(carols.map((carol) => carol.slug)).size).toBe(20);
	});

	it("sorts carols alphabetically by title", () => {
		const titles = carols.map((carol) => carol.title);
		expect(titles).toEqual(
			titles.toSorted((a, b) =>
				a.localeCompare(b, "en", { sensitivity: "base" })
			)
		);
		expect(titles[0]).toBe("Away in a manger");
	});

	it("leaves out excluded carols and keeps tunes and modes", () => {
		expect(
			includedCarols([
				{
					title: "It came upon the midnight clear",
					tune: "Noel",
					included: true,
					mode: "major",
					swing: false
				},
				{
					title: "Christ is born (Il est né)",
					included: true,
					mode: "minor",
					swing: false
				},
				{ title: "Not chosen", included: false, mode: "major", swing: false }
			])
		).toEqual([
			{
				title: "Christ is born (Il est né)",
				tune: undefined,
				slug: "christ-is-born-il-est-ne",
				mode: "minor"
			},
			{
				title: "It came upon the midnight clear",
				tune: "Noel",
				slug: "it-came-upon-the-midnight-clear",
				mode: "major"
			}
		]);
	});

	it("rejects a mode that is neither major nor minor", () => {
		expect(() =>
			includedCarols([
				{ title: "Odd one", included: true, mode: "dorian", swing: false }
			])
		).toThrow('"Odd one" has mode "dorian"');
	});
});

describe("isSwung", () => {
	const entries = [
		{ title: "Swung one", included: true, mode: "major", swing: true },
		{ title: "Straight one", included: false, mode: "major", swing: false }
	];

	it("reads the swing of any row by slug, included or not", () => {
		expect(isSwung("swung-one", entries)).toBe(true);
		expect(isSwung("straight-one", entries)).toBe(false);
	});

	it("marks Rudolph as swung in data/carols.json", () => {
		expect(isSwung("rudolph-the-red-nosed-reindeer")).toBe(true);
	});

	it("rejects a slug with no row", () => {
		expect(() => isSwung("missing", entries)).toThrow(
			'No carol with slug "missing"'
		);
	});
});

describe("slugify", () => {
	it("strips punctuation and accents", () => {
		expect(slugify("Angels, from the realms of Glory")).toBe(
			"angels-from-the-realms-of-glory"
		);
		expect(slugify("O holy night!")).toBe("o-holy-night");
	});
});
