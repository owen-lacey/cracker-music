import { describe, expect, it } from "vitest";
import { parseMelody, type ScaleNote } from "./melody";
import { MODES, midiFor, TONICS } from "./pitch";

function midis(melody: string, tonic: string, mode: string): number[] {
  return parseMelody(melody).map((slot) => midiFor(slot as ScaleNote, tonic, mode));
}

describe("midiFor", () => {
  it("maps major degrees with the middle tonic in octave 4", () => {
    expect(midis("1234567", "C", "major")).toEqual([60, 62, 64, 65, 67, 69, 71]);
  });

  it("maps octaves and accidentals", () => {
    expect(midis("1'b7,#4", "C", "major")).toEqual([72, 58, 66]);
  });

  it("maps minor degrees against the natural minor scale", () => {
    expect(midis("13#7", "A", "minor")).toEqual([69, 72, 80]);
  });

  it("maps Away in a manger in F major", () => {
    expect(midis("5,1123", "F", "major")).toEqual([60, 65, 65, 67, 69]);
  });

  it("resolves every degree for every tonic and mode offered", () => {
    for (const tonic of TONICS) {
      for (const mode of MODES) {
        expect(midis("1234567", tonic, mode)).toHaveLength(7);
      }
    }
  });
});
