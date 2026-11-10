import { describe, expect, it } from "vitest";
import { groupTakes, nextTake } from "./takes";

describe("groupTakes", () => {
	it("groups recordings by take folder, keyed by MIDI note", () => {
		expect(
			groupTakes({
				"./samples/bell/2/84.mp3": "b84",
				"./samples/bell/1/84.mp3": "a84",
				"./samples/bell/1/87.mp3": "a87",
				"./samples/bell/2/87.mp3": "b87"
			})
		).toEqual([
			{ 84: "a84", 87: "a87" },
			{ 84: "b84", 87: "b87" }
		]);
	});

	it("throws when takes record different notes", () => {
		expect(() =>
			groupTakes({
				"./samples/bell/1/84.mp3": "a84",
				"./samples/bell/1/87.mp3": "a87",
				"./samples/bell/2/84.mp3": "b84"
			})
		).toThrow("Takes record different notes");
	});
});

describe("nextTake", () => {
	it("always picks the only take", () => {
		expect(nextTake(1, 0, () => 0.99)).toBe(0);
	});

	it("picks any take first", () => {
		expect(nextTake(3, undefined, () => 0)).toBe(0);
		expect(nextTake(3, undefined, () => 0.99)).toBe(2);
	});

	it("never repeats the previous take", () => {
		for (let previous = 0; previous < 3; previous++)
			for (const r of [0, 0.25, 0.5, 0.75, 0.99])
				expect(nextTake(3, previous, () => r)).not.toBe(previous);
	});

	it("spreads evenly over the other takes", () => {
		const picks = [0, 0.49, 0.5, 0.99].map((r) => nextTake(3, 1, () => r));
		expect(picks).toEqual([0, 0, 2, 2]);
	});
});
