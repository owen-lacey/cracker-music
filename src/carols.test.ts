import { describe, expect, it } from "vitest";
import { carols, includedCarols, slugify } from "./carols";

describe("includedCarols", () => {
  it("reads every carol from data/carols.json with unique slugs", () => {
    expect(carols).toHaveLength(46);
    expect(new Set(carols.map((carol) => carol.slug)).size).toBe(46);
  });

  it("sorts carols alphabetically by title", () => {
    const titles = carols.map((carol) => carol.title);
    expect(titles).toEqual(titles.toSorted((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })));
    expect(titles[0]).toBe("Angels we have heard on high");
  });

  it("leaves out excluded carols and keeps tunes", () => {
    expect(
      includedCarols([
        { title: "It came upon the midnight clear", tune: "Noel", included: true },
        { title: "Christ is born (Il est né)", included: true },
        { title: "Not chosen", included: false },
      ]),
    ).toEqual([
      { title: "Christ is born (Il est né)", tune: undefined, slug: "christ-is-born-il-est-ne" },
      { title: "It came upon the midnight clear", tune: "Noel", slug: "it-came-upon-the-midnight-clear" },
    ]);
  });
});

describe("slugify", () => {
  it("strips punctuation and accents", () => {
    expect(slugify("Angels, from the realms of Glory")).toBe("angels-from-the-realms-of-glory");
    expect(slugify("O holy night!")).toBe("o-holy-night");
  });
});
