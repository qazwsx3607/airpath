import { describe, expect, it } from "vitest";
import { createDefaultScenario } from "@airpath/scenario-schema";
import { solveScenario } from "@airpath/solver-core";
import { compareScenarioResults, createReportData, exportSimulationResultJson, renderHtmlReport } from "./index";

describe("report engine", () => {
  it("generates report data and required HTML sections", () => {
    const scenario = createDefaultScenario("small");
    const result = solveScenario(scenario);
    const data = createReportData(scenario, result);
    const html = renderHtmlReport(data);
    expect(html).toContain("Executive Summary");
    expect(html).toContain("Rack Heat Load Table");
    expect(html).toContain("Cooling Setup");
    expect(html).toContain("Containment Setup");
    expect(html).toContain("Temperature Review");
    expect(html).toContain("Airflow Review");
    expect(html).toContain("Model Assumptions");
    expect(html).toContain("not a certified CFD solver");
    expect(html).toContain("@media print");
  });

  it("exports simulation result JSON", () => {
    const result = solveScenario(createDefaultScenario("small"));
    const exported = JSON.parse(exportSimulationResultJson(result));
    expect(exported.metrics.maxRackInletTemperatureC).toBeTypeOf("number");
    expect(exported.temperatureFieldC.length).toBeGreaterThan(0);
    expect(exported.vectorField.length).toBeGreaterThan(0);
  });

  it("compares scenario results with delta metrics", () => {
    const scenarioA = createDefaultScenario("small");
    const scenarioB = createDefaultScenario("small");
    scenarioB.metadata.name = "Higher airflow";
    scenarioB.coolingObjects = scenarioB.coolingObjects.map((object) =>
      object.type === "floor-perforated-tile" ? { ...object, airflowLps: object.airflowLps * 2, coolingCapacityKw: object.coolingCapacityKw * 1.5 } : object
    );
    const comparison = compareScenarioResults(scenarioA, solveScenario(scenarioA), scenarioB, solveScenario(scenarioB));
    expect(comparison.scenarioBName).toBe("Higher airflow");
    expect(comparison.recommendationSummary).toContain("Scenario B");
  });
});
