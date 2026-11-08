import { describe, expect, it } from "vitest";
import { parseMelody, type ScaleNote } from "./melody";
import {
	onWhistle,
	playablePercent,
	playableShare,
	splitWhistles,
	WHISTLES,
	type Whistle,
	whistleLoads,
	whistleMidi,
	whistleOf
} from "./whistles";

const note = (token: string) => parseMelody(token)[0] as ScaleNote;

describe("whistleMidi", () => {
	it("plays the Bb major scale from Bb3 to Bb4", () => {
		expect(WHISTLES.map(whistleMidi)).toEqual([58, 60, 62, 63, 65, 67, 69, 70]);
	});
});

describe("onWhistle", () => {
	it("accepts the naturals 1–7 and the upper tonic", () => {
		for (const token of ["1", "2", "3", "4", "5", "6", "7", "1'"])
			expect(onWhistle(note(token))).toBe(true);
	});

	it("rejects accidentals and notes outside 1–1'", () => {
		for (const token of ["5,", "1,", "2'", "b3", "#4", "b1'"])
			expect(onWhistle(note(token))).toBe(false);
	});
});

describe("whistleOf", () => {
	it("names the whistle for each note on the whistles", () => {
		expect(WHISTLES.map((whistle) => whistleOf(note(whistle)))).toEqual([
			...WHISTLES
		]);
	});

	it("gives null for notes no whistle plays", () => {
		for (const token of ["5,", "2'", "b3", "#4"])
			expect(whistleOf(note(token))).toBeNull();
	});
});

describe("playableShare", () => {
	it("counts the share of notes on the whistles, ignoring rests", () => {
		expect(playableShare("1 5, b3  1'")).toBe(0.5);
	});

	it("throws on a melody with no notes", () => {
		expect(() => playableShare("   ")).toThrow("Melody has no notes");
	});
});

describe("playablePercent", () => {
	it("reads 100 when every note is on the whistles", () => {
		expect(playablePercent("1 3 5 1'")).toBe(100);
	});

	it("rounds down, so a melody with a note off the whistles never reads 100", () => {
		expect(playablePercent("1 2 3,")).toBe(66);
	});
});

describe("whistleLoads", () => {
	it("merges octaves into the whistles, keeps 1' apart and leaves out accidentals and rests", () => {
		expect(whistleLoads(["1 5, 1' b3", "#4 2' 1,"])).toEqual({
			"1": 2,
			"2": 1,
			"3": 0,
			"4": 0,
			"5": 1,
			"6": 0,
			"7": 0,
			"1'": 1
		});
	});
});

describe("splitWhistles", () => {
	const even = Object.fromEntries(
		WHISTLES.map((whistle) => [whistle, 1])
	) as Record<Whistle, number>;

	it("gives one person every whistle", () => {
		expect(splitWhistles(even, 1)).toEqual([[...WHISTLES]]);
	});

	it("gives eight people one whistle each", () => {
		expect(splitWhistles(even, 8)).toEqual(
			WHISTLES.map((whistle) => [whistle])
		);
	});

	it("balances the busiest person's notes", () => {
		const loads = { ...even, "1": 10, "5": 6, "3": 4 };
		const split = splitWhistles(loads, 2);
		const totals = split.map((group) =>
			group.reduce((sum, whistle) => sum + loads[whistle], 0)
		);
		expect(totals.sort()).toEqual([12, 13]);
		expect(split.flat().sort()).toEqual([...WHISTLES].sort());
	});

	it("rejects fewer than one or more than eight people", () => {
		expect(() => splitWhistles(even, 0)).toThrow(
			"People must be a whole number from 1 to 8, got 0"
		);
		expect(() => splitWhistles(even, 9)).toThrow(
			"People must be a whole number from 1 to 8, got 9"
		);
	});
});
