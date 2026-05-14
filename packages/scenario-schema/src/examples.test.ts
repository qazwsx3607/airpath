import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { validateScenario } from "./index";

describe("example scenarios", () => {
  it("validates every .airpath.json sample file", () => {
    const examplesDir = resolve(process.cwd(), "examples/scenarios");
    const files = readdirSync(examplesDir).filter((file) => file.endsWith(".airpath.json"));
    expect(files).toHaveLength(5);
    for (const file of files) {
      const scenario = validateScenario(JSON.parse(readFileSync(resolve(examplesDir, file), "utf8")));
      expect(scenario.metadata.expectedInterpretation).toBeTruthy();
      expect(scenario.metadata.recommendedReportOutput).toBeTruthy();
      expect(scenario.metadata.validationRelevance).toBeTruthy();
    }
  });
});
