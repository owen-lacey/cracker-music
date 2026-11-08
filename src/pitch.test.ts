import { describe, expect, it } from "vitest";
import { parseMelody, type ScaleNote } from "./melody";
import { keyName, midiFor } from "./pitch";

function midis(melody: string): number[] {
	return parseMelody(melody).map((slot) => midiFor(slot as ScaleNote));
}

describe("midiFor", () => {
	it("maps degrees to Bb major with the middle tonic at Bb3", () => {
		expect(midis("1234567")).toEqual([58, 60, 62, 63, 65, 67, 69]);
	});

	it("maps octaves and accidentals", () => {
		expect(midis("1'b7,#4")).toEqual([70, 56, 64]);
	});
});

describe("keyName", () => {
	it("names the key a transposition from Bb lands in", () => {
		expect([-6, -1, 0, 2, 5].map(keyName)).toEqual(["E", "A", "Bb", "C", "Eb"]);
	});
});
