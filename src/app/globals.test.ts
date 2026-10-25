import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("global theme tokens", () => {
  it("maps the sans font token to the Geist variable from the root layout", () => {
    const styles = readFileSync(resolve("src/app/globals.css"), "utf8");

    expect(styles).toContain("--font-sans: var(--font-geist-sans);");
    expect(styles).not.toContain("--font-sans: var(--font-sans);");
  });
});
