import { describe, expect, it } from "vitest";
import { parseMelody, type ScaleNote } from "./melody";
import { onWhistle, playableShare } from "./whistles";

const note = (token: string) => parseMelody(token)[0] as ScaleNote;

describe("onWhistle", () => {
  it("accepts the naturals 1–7 and the upper tonic", () => {
    for (const token of ["1", "2", "3", "4", "5", "6", "7", "1'"]) expect(onWhistle(note(token))).toBe(true);
  });

  it("rejects accidentals and notes outside 1–1'", () => {
    for (const token of ["5,", "1,", "2'", "b3", "#4", "b1'"]) expect(onWhistle(note(token))).toBe(false);
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
