import { describe, expect, it } from "vitest";
import { withDraft } from "./drafts";

describe("withDraft", () => {
	it("sets a carol's draft without touching others", () => {
		expect(withDraft({ a: "1 2" }, "b", "3")).toEqual({ a: "1 2", b: "3" });
	});

	it("keeps an empty melody as a draft", () => {
		expect(withDraft({ a: "1 2" }, "a", "")).toEqual({ a: "" });
	});

	it("removes a carol's draft when the melody is null", () => {
		expect(withDraft({ a: "1 2", b: "3" }, "a", null)).toEqual({ b: "3" });
	});
});
