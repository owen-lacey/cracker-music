import { describe, expect, it } from "vitest";
import { SWING_DELAY, swingDelay } from "./swing";

describe("swingDelay", () => {
	it("delays odd slots of a swung carol by a third of a slot", () => {
		expect([0, 1, 2, 3].map((index) => swingDelay(index, true))).toEqual([
			0,
			SWING_DELAY,
			0,
			SWING_DELAY
		]);
		expect(SWING_DELAY).toBeCloseTo(1 / 3);
	});

	it("leaves a straight carol on the grid", () => {
		expect([0, 1, 2, 3].map((index) => swingDelay(index, false))).toEqual([
			0, 0, 0, 0
		]);
	});
});
