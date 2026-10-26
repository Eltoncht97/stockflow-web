import { describe, expect, it } from "vitest";
import { categorySchema } from "./category-schema";

describe("categorySchema", () => {
  it("trims a valid category name", () => {
    expect(categorySchema.parse({ name: "  Hardware  " })).toEqual({
      name: "Hardware",
    });
  });

  it.each(["   ", "a".repeat(101)])("rejects invalid name %s", (name) => {
    expect(categorySchema.safeParse({ name }).success).toBe(false);
  });
});
