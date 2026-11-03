import { describe, expect, it } from "vitest";
import { parseMelody, type ScaleNote } from "./melody";
import { midiFor } from "./pitch";

function midis(melody: string): number[] {
  return parseMelody(melody).map((slot) => midiFor(slot as ScaleNote));
}

describe("midiFor", () => {
  it("maps degrees to C major with the middle tonic at C4", () => {
    expect(midis("1234567")).toEqual([60, 62, 64, 65, 67, 69, 71]);
  });

  it("maps octaves and accidentals", () => {
    expect(midis("1'b7,#4")).toEqual([72, 58, 66]);
  });
});
