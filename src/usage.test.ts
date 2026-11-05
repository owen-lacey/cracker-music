import { describe, expect, it } from "vitest";
import { fold, noteUsage } from "./usage";

const note = (degree: number, accidental: -1 | 0 | 1, octave: -1 | 0 | 1) => ({ degree, accidental, octave });

describe("fold", () => {
  it("folds octaves into the middle one but keeps the upper tonic", () => {
    const folding = { octaves: true, accidentals: false };
    expect(fold(note(5, 0, -1), folding)).toEqual(note(5, 0, 0));
    expect(fold(note(2, 0, 1), folding)).toEqual(note(2, 0, 0));
    expect(fold(note(1, 0, 1), folding)).toEqual(note(1, 0, 1));
  });

  it("folds accidentals into their natural degree", () => {
    expect(fold(note(7, -1, -1), { octaves: false, accidentals: true })).toEqual(note(7, 0, -1));
  });

  it("leaves notes alone when nothing is folded", () => {
    expect(fold(note(3, -1, 1), { octaves: false, accidentals: false })).toEqual(note(3, -1, 1));
  });
});

describe("noteUsage", () => {
  const melodies = ["1 5, 3  1'", "b3 2 1 b7,"];
  const bars = (folding: { octaves: boolean; accidentals: boolean }) =>
    noteUsage(melodies, folding).map(({ bar, note, count }) => `${bar}:${note}=${count}`);

  it("gives every transcribed note its own bar when nothing is folded", () => {
    expect(bars({ octaves: false, accidentals: false })).toEqual([
      "5,:5,=1",
      "b7,:b7,=1",
      "1:1=2",
      "2:2=1",
      "b3:b3=1",
      "3:3=1",
      "1':1'=1",
    ]);
  });

  it("stacks folded notes into one bar, ordered by pitch", () => {
    expect(bars({ octaves: true, accidentals: true })).toEqual([
      "1:1=2",
      "2:2=1",
      "3:b3=1",
      "3:3=1",
      "5:5,=1",
      "7:b7,=1",
      "1':1'=1",
    ]);
  });

  it("ignores rests", () => {
    expect(noteUsage(["    "], { octaves: true, accidentals: true })).toEqual([]);
  });
});
