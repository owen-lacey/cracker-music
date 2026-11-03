import { describe, expect, it } from "vitest";
import { carols, parseCarolList, slugify } from "./carols";

describe("parseCarolList", () => {
  it("reads every ticked carol from carol-list.md with unique slugs", () => {
    expect(carols).toHaveLength(53);
    expect(new Set(carols.map((carol) => carol.slug)).size).toBe(53);
  });

  it("sorts carols alphabetically by title", () => {
    const titles = carols.map((carol) => carol.title);
    expect(titles).toEqual(titles.toSorted((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })));
    expect(titles[0]).toBe("Angels we have heard on high");
  });

  it("splits title and tune, keeping parentheses in titles", () => {
    const markdown = [
      "- [x] It came upon the midnight clear: tune *Traditional* (Noel) (CC, NCP, SoC)",
      "- [x] Christ is born (Il est né) (CC, NCP)",
      "- [ ] Not chosen (CC)",
    ].join("\n");
    expect(parseCarolList(markdown)).toEqual([
      { title: "Christ is born (Il est né)", tune: undefined, slug: "christ-is-born-il-est-ne" },
      { title: "It came upon the midnight clear", tune: "Traditional", slug: "it-came-upon-the-midnight-clear" },
    ]);
  });
});

describe("slugify", () => {
  it("strips punctuation and accents", () => {
    expect(slugify("Angels, from the realms of Glory")).toBe("angels-from-the-realms-of-glory");
    expect(slugify("O holy night!")).toBe("o-holy-night");
  });
});
