import { describe, expect, it } from "vitest";
import {
  createContainmentObject,
  createCoolingObject,
  createDefaultScenario,
  type CoolingObject,
  type Rack,
  type Scenario,
  residualAirHeatKw
} from "@airpath/scenario-schema";
import { sampleTemperatureField, sampleVectorField, solveScenario } from "./index";

describe("solver core validation cases", () => {
  it("models heat sources increasing nearby temperature", () => {
    const base = scenarioWithOneRack(5);
    const hot = scenarioWithOneRack(35);
    const baseResult = solveScenario(base);
    const hotResult = solveScenario(hot);
    const rack = hot.racks[0];
    const sample = { x: rack.position.x, y: 1.2, z: rack.position.z - 0.8 };
    expect(sampleTemperatureField(hotResult.temperatureFieldC, hotResult.grid, sample)).toBeGreaterThan(
      sampleTemperatureField(baseResult.temperatureFieldC, baseResult.grid, sample)
    );
  });

  it("models cooling sources reducing adjacent temperature", () => {
    const withoutCooling = scenarioWithOneRack(8);
    withoutCooling.coolingObjects = [];
    const withCooling = scenarioWithOneRack(8);
    withCooling.coolingObjects = [highAirflowCooling(withCooling)];
    const warmResult = solveScenario(withoutCooling);
    const coolResult = solveScenario(withCooling);
    const sample = { x: 2.4, y: 1.1, z: 2.6 };
    expect(sampleTemperatureField(coolResult.temperatureFieldC, coolResult.grid, sample)).toBeLessThan(
      sampleTemperatureField(warmResult.temperatureFieldC, warmResult.grid, sample)
    );
  });

  it("models obstacles weakening downstream airflow", () => {
    const scenario = scenarioWithOneRack(10);
    scenario.coolingObjects = [
      {
        ...highAirflowCooling(scenario),
        position: { x: 0.5, y: 1, z: 2.4 },
        direction: { x: 1, y: 0, z: 0 }
      }
    ];
    scenario.racks[0].position = { x: 2.5, y: 1.1, z: 2.4 };
    const result = solveScenario(scenario);
    const blocked = sampleVectorField(result.vectorField, result.grid, { x: 4.2, y: 1, z: 2.4 });
    const bypass = sampleVectorField(result.vectorField, result.grid, { x: 4.2, y: 1, z: 4.8 });
    const blockedMagnitude = Math.hypot(blocked.x, blocked.y, blocked.z);
    const bypassMagnitude = Math.hypot(bypass.x, bypass.y, bypass.z);
    expect(blockedMagnitude).toBeLessThan(bypassMagnitude);
  });

  it("models containment reducing hot/cold mixing", () => {
    const open = scenarioWithOneRack(32);
    open.racks[0].position = { x: 4, y: 1.1, z: 4.5 };
    open.coolingObjects = [
      {
        ...highAirflowCooling(open),
        position: { x: 4, y: 0.04, z: 2.6 },
        direction: { x: 0, y: 1, z: 0 }
      }
    ];
    const contained = structuredClone(open) as Scenario;
    contained.containmentObjects = [
      {
        ...createContainmentObject("cold-aisle", 1, contained.room),
        position: { x: 4, y: 1.2, z: 3.6 },
        size: { width: 5.5, depth: 0.08, height: 2.4 },
        generatedFromRackIds: [contained.racks[0].id]
      }
    ];
    const openResult = solveScenario(open);
    const containedResult = solveScenario(contained);
    const coldSideSample = { x: 4, y: 1, z: 2.8 };
    expect(sampleTemperatureField(containedResult.temperatureFieldC, containedResult.grid, coldSideSample)).toBeLessThan(
      sampleTemperatureField(openResult.temperatureFieldC, openResult.grid, coldSideSample)
    );
  });

  it("increases hotspot risk when rack kW increases", () => {
    const normal = solveScenario(scenarioWithOneRack(6));
    const high = solveScenario(scenarioWithOneRack(42));
    expect(high.metrics.maxRackInletTemperatureC).toBeGreaterThan(normal.metrics.maxRackInletTemperatureC);
    expect(high.metrics.warningCount).toBeGreaterThanOrEqual(normal.metrics.warningCount);
  });

  it("reduces inlet risk when cooling airflow increases", () => {
    const lowAirflow = scenarioWithOneRack(28);
    lowAirflow.coolingObjects = [{ ...highAirflowCooling(lowAirflow), airflowLps: 180, coolingCapacityKw: 8 }];
    const highAirflow = scenarioWithOneRack(28);
    highAirflow.coolingObjects = [{ ...highAirflowCooling(highAirflow), airflowLps: 1900, coolingCapacityKw: 55 }];
    expect(solveScenario(highAirflow).metrics.maxRackInletTemperatureC).toBeLessThan(solveScenario(lowAirflow).metrics.maxRackInletTemperatureC);
  });

  it("reduces air-side heat load with liquid capture ratio", () => {
    expect(residualAirHeatKw(30, 0.8, "hybrid-liquid-cooled")).toBeCloseTo(6);
    const air = scenarioWithOneRack(30);
    const liquid = scenarioWithOneRack(30);
    liquid.racks[0] = {
      ...liquid.racks[0],
      coolingMode: "hybrid-liquid-cooled",
      liquidCaptureRatio: 0.8
    };
    expect(solveScenario(liquid).rackInlets[0].residualAirHeatKw).toBeLessThan(solveScenario(air).rackInlets[0].residualAirHeatKw);
  });

  it("generates required warning categories for risky layouts", () => {
    const scenario = scenarioWithOneRack(45);
    scenario.coolingObjects = [createCoolingObject("ceiling-supply-diffuser", 1, scenario.room), createCoolingObject("ceiling-return-grille", 1, scenario.room)];
    scenario.coolingObjects[0].position = { x: 2, y: scenario.room.height - 0.05, z: 2 };
    scenario.coolingObjects[1].position = { x: 2.7, y: scenario.room.height - 0.05, z: 2.2 };
    scenario.coolingObjects[0].coolingCapacityKw = 5;
    const result = solveScenario(scenario);
    expect(result.warnings.map((warning) => warning.type)).toContain("supply-return-short-circuit");
    expect(result.warnings.map((warning) => warning.type)).toContain("cooling-capacity-insufficient");
  });
});

function scenarioWithOneRack(heatLoadKw: number): Scenario {
  const scenario = createDefaultScenario("small");
  const rack: Rack = {
    ...scenario.racks[0],
    id: "rack-test",
    name: "Rack Test",
    position: { x: 3, y: 1.1, z: 3.2 },
    heatLoadKw,
    coolingMode: "air-cooled",
    liquidCaptureRatio: 0
  };
  scenario.racks = [rack];
  scenario.rackArrays = [];
  scenario.coolingObjects = [highAirflowCooling(scenario)];
  scenario.containmentObjects = [];
  scenario.simulationSettings = {
    ...scenario.simulationSettings,
    iterations: 16,
    gridResolution: "coarse",
    warningTemperatureC: 27,
    criticalTemperatureC: 32
  };
  return scenario;
}

function highAirflowCooling(scenario: Scenario): CoolingObject {
  return {
    ...createCoolingObject("floor-perforated-tile", 1, scenario.room),
    position: { x: 2.4, y: 0.04, z: 3.6 },
    airflowLps: 1200,
    coolingCapacityKw: 35,
    supplyTemperatureC: 17
  };
}
