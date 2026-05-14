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
    expect(html).toContain("Project Metadata");
    expect(html).toContain("Methodology");
    expect(html).toContain("Cooling Configuration");
    expect(html).toContain("Containment Configuration");
    expect(html).toContain("Thermal Results");
    expect(html).toContain("Airflow Results");
    expect(html).toContain("Risk Register");
    expect(html).toContain("Assumptions and Limitations");
    expect(html).toContain("not a certified CFD solver");
    expect(html).toContain("@media print");
  });

  it("localizes professional report structure to Chinese", () => {
    const scenario = createDefaultScenario("small");
    scenario.reportSettings.language = "zh";
    scenario.reportSettings.reportTitle = "預售氣流與熱風險檢視報告";
    scenario.reportSettings.clientName = "客戶 A";
    const html = renderHtmlReport(createReportData(scenario, solveScenario(scenario)));
    expect(html).toContain('lang="zh-Hant"');
    expect(html).toContain("專案資料");
    expect(html).toContain("熱場結果");
    expect(html).toContain("氣流結果");
    expect(html).toContain("不代表認證 CFD 精度");
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
