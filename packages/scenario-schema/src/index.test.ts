import { describe, expect, it } from "vitest";
import {
  createDefaultScenario,
  defaultRackArrayInput,
  deserializeScenario,
  generateRackArray,
  residualAirHeatKw,
  roomTemplates,
  serializeScenario,
  validateScenario,
  convertAirflow,
  convertDimension,
  convertHeat,
  convertTemperature
} from "./index";

describe("scenario schema", () => {
  it("validates a complete default scenario", () => {
    const scenario = createDefaultScenario("medium");
    expect(validateScenario(scenario).room.name).toBe("Medium room");
    expect(scenario.racks.length).toBeGreaterThan(0);
  });

  it("generates rack arrays from rows, columns, spacing, aisle width, and total heat mode", () => {
    const input = {
      ...defaultRackArrayInput(roomTemplates.medium),
      id: "array-test",
      rows: 2,
      columns: 3,
      heatLoadMode: "total-array" as const,
      totalArrayKw: 90,
      aisleWidthM: 1.4
    };
    const racks = generateRackArray(input);
    expect(racks).toHaveLength(6);
    expect(racks.every((rack) => rack.heatLoadKw === 15)).toBe(true);
    expect(racks[3].position.z).toBeGreaterThan(racks[0].position.z + input.rackSize.depth);
  });

  it("calculates liquid cooling residual air heat", () => {
    expect(residualAirHeatKw(40, 0.75, "hybrid-liquid-cooled")).toBe(10);
    expect(residualAirHeatKw(40, 0.9, "direct-liquid-cooled")).toBeCloseTo(4, 5);
    expect(residualAirHeatKw(40, 0.9, "air-cooled")).toBe(40);
  });

  it("converts required units explicitly", () => {
    expect(convertTemperature(0, "C", "F")).toBe(32);
    expect(convertTemperature(32, "F", "C")).toBe(0);
    expect(convertDimension(1000, "mm", "m")).toBe(1);
    expect(convertDimension(3.280839895, "ft", "m")).toBeCloseTo(1, 4);
    expect(convertAirflow(1000, "CFM", "L/s")).toBeCloseTo(471.94745, 4);
    expect(convertHeat(3412.142, "BTU/h", "kW")).toBeCloseTo(1, 3);
  });

  it("round-trips scenario JSON import and export", () => {
    const scenario = createDefaultScenario("small");
    const json = serializeScenario(scenario);
    const restored = deserializeScenario(json);
    expect(restored.room.name).toBe("Small server room");
    expect(restored.racks.length).toBe(scenario.racks.length);
  });
});
