import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("tooling requirements", () => {
  it("documents and enforces the supported Node.js version", () => {
    const packageJson = JSON.parse(
      readFileSync(resolve("package.json"), "utf8"),
    ) as { engines?: { node?: string } };
    const readme = readFileSync(resolve("README.md"), "utf8");

    expect(packageJson.engines?.node).toBe("^22.22.2 || ^24.15.0 || >=26.0.0");
    expect(readme).toContain("- Node.js 22.22.2+, 24.15.0+, or 26.0.0+");
  });
});
