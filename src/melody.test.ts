import { describe, expect, it } from "vitest";
import { formatMelody, parseMelody } from "./melody";

describe("parseMelody", () => {
	it("parses one slot per token, with spaces as rests", () => {
		expect(parseMelody("1 2")).toEqual([
			{ degree: 1, accidental: 0, octave: 0 },
			null,
			{ degree: 2, accidental: 0, octave: 0 }
		]);
	});

	it("parses octave marks and accidentals", () => {
		expect(parseMelody("1'5,#4b7,")).toEqual([
			{ degree: 1, accidental: 0, octave: 1 },
			{ degree: 5, accidental: 0, octave: -1 },
			{ degree: 4, accidental: 1, octave: 0 },
			{ degree: 7, accidental: -1, octave: -1 }
		]);
	});

	it("rejects unknown tokens with their position", () => {
		expect(() => parseMelody("1 8")).toThrow(
			'Invalid melody at position 2: "8"'
		);
		expect(() => parseMelody("1-")).toThrow(
			'Invalid melody at position 1: "-"'
		);
	});

	it("round-trips through formatMelody", () => {
		const melody = "5,   1   1 2 3 1 #4b7'  ";
		expect(formatMelody(parseMelody(melody))).toBe(melody);
	});
});
