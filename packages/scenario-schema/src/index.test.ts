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
  convertTemperature,
  analyzeThermalTopology,
  buildThermalZones,
  createContainmentObject,
  createCoolingObject,
  detectAisles,
  oppositeRackOrientation,
  rackFrontVector,
  rackRearVector
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

  it("exposes rack front and rear direction semantics", () => {
    const rack = createDefaultScenario("small").racks[0];
    const front = rackFrontVector({ ...rack, orientation: "front-positive-z" });
    const rear = rackRearVector({ ...rack, orientation: "front-positive-z" });
    expect(front).toEqual({ x: 0, y: 0, z: 1 });
    expect(rear).toEqual({ x: 0, y: 0, z: -1 });
    expect(oppositeRackOrientation("front-positive-x")).toBe("front-negative-x");
  });

  it("detects hot and cold aisles from rack geometry and orientation", () => {
    const scenario = createDefaultScenario("small");
    scenario.racks = [
      { ...scenario.racks[0], id: "rack-a", position: { x: 3, y: 1.1, z: 2.4 }, orientation: "front-negative-z" },
      { ...scenario.racks[1], id: "rack-b", position: { x: 3, y: 1.1, z: 4.8 }, orientation: "front-positive-z" }
    ];
    expect(detectAisles(scenario)[0]?.type).toBe("hot");
    scenario.racks = [
      { ...scenario.racks[0], id: "rack-c", position: { x: 3, y: 1.1, z: 2.4 }, orientation: "front-positive-z" },
      { ...scenario.racks[1], id: "rack-d", position: { x: 3, y: 1.1, z: 4.8 }, orientation: "front-negative-z" }
    ];
    expect(detectAisles(scenario)[0]?.type).toBe("cold");
  });

  it("preserves central hot aisle topology when rack slots become in-row cooling", () => {
    const scenario = createDefaultScenario("medium");
    scenario.racks = buildTwoRows(6);
    const convertedA = scenario.racks[2];
    const convertedB = scenario.racks[9];
    const inRowA = {
      ...createCoolingObject("in-row-cooler", 1, scenario.room),
      id: `in-row-from-${convertedA.id}`,
      position: { ...convertedA.position },
      size: { ...convertedA.size },
      orientation: convertedA.orientation,
      direction: rackFrontVector(convertedA),
      rowId: `${convertedA.arrayId}-row-1`,
      slotIndex: 2
    };
    const inRowB = {
      ...createCoolingObject("in-row-cooler", 2, scenario.room),
      id: `in-row-from-${convertedB.id}`,
      position: { ...convertedB.position },
      size: { ...convertedB.size },
      orientation: convertedB.orientation,
      direction: rackFrontVector(convertedB),
      rowId: `${convertedB.arrayId}-row-1`,
      slotIndex: 3
    };
    scenario.racks = scenario.racks.filter((rack) => rack.id !== convertedA.id && rack.id !== convertedB.id);
    scenario.coolingObjects = [inRowA, inRowB];

    const topology = analyzeThermalTopology(scenario);
    const hotAisle = topology.detectedAisles.find((aisle) => aisle.type === "hot");
    expect(hotAisle).toBeDefined();
    expect(hotAisle?.rackIds).toContain(inRowA.id);
    expect(hotAisle?.rackIds).toContain(inRowB.id);
    expect(topology.rowModules.filter((module) => module.type === "in-row-cooling")).toHaveLength(2);
  });

  it("generates 3D contained thermal zones from detected hot aisles", () => {
    const scenario = createDefaultScenario("medium");
    scenario.racks = buildTwoRows(6);
    const aisle = detectAisles(scenario).find((candidate) => candidate.type === "hot");
    expect(aisle).toBeDefined();
    scenario.containmentObjects = [
      {
        ...createContainmentObject("hot-aisle", 1, scenario.room, aisle?.rackIds ?? []),
        position: { x: aisle!.center.x, y: 1.35, z: aisle!.center.z },
        size: { ...aisle!.size, height: 2.7 }
      }
    ];
    const zones = buildThermalZones(scenario);
    expect(zones[0]?.type).toBe("contained-hot-aisle");
    expect(zones[0]?.boundarySurfaces).toContain("top");
    expect(zones[0]?.height).toBeGreaterThan(2);
  });

  it("warns when a row has mixed front/rear orientation semantics", () => {
    const scenario = createDefaultScenario("medium");
    scenario.racks = buildTwoRows(3);
    scenario.racks[1] = { ...scenario.racks[1], orientation: "front-positive-x" };
    const topology = analyzeThermalTopology(scenario);
    expect(topology.warnings.map((warning) => warning.type)).toContain("ambiguous-aisle-orientation");
  });
});

function buildTwoRows(columns: number) {
  const room = roomTemplates.medium;
  const rowA = generateRackArray({
    ...defaultRackArrayInput(room),
    id: "row-a",
    name: "Row A",
    rows: 1,
    columns,
    startPosition: { x: 3, y: 0, z: 3.2 },
    orientation: "front-negative-z"
  });
  const rowB = generateRackArray({
    ...defaultRackArrayInput(room),
    id: "row-b",
    name: "Row B",
    rows: 1,
    columns,
    startPosition: { x: 3, y: 0, z: 5.6 },
    orientation: "front-positive-z"
  });
  return [...rowA, ...rowB];
}
