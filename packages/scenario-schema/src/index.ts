import { z } from "zod";

export const AIRPATH_DISCLAIMER =
  "This tool is intended for early-stage pre-sales thermal review and conceptual airflow risk analysis. It is not a certified CFD solver and should not be used as the sole basis for construction, commissioning, or compliance decisions.";

export const SCHEMA_VERSION = "0.1.0";

export const Vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export const Size3Schema = z.object({
  width: z.number().positive(),
  depth: z.number().positive(),
  height: z.number().positive()
});

export const RoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  width: z.number().positive(),
  depth: z.number().positive(),
  height: z.number().positive(),
  ambientTemperatureC: z.number()
});

export const RackOrientationSchema = z.enum([
  "front-positive-z",
  "front-negative-z",
  "front-positive-x",
  "front-negative-x"
]);

export const RackCoolingModeSchema = z.enum(["air-cooled", "hybrid-liquid-cooled", "direct-liquid-cooled"]);

export const HeatLoadModeSchema = z.enum(["per-rack", "total-array", "mixed-custom"]);

export const RackSchema = z.object({
  id: z.string(),
  arrayId: z.string().optional(),
  name: z.string(),
  position: Vector3Schema,
  size: Size3Schema,
  orientation: RackOrientationSchema,
  heatLoadKw: z.number().nonnegative(),
  coolingMode: RackCoolingModeSchema,
  liquidCaptureRatio: z.number().min(0).max(0.98),
  selected: z.boolean().optional()
});

export const RackArrayInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  rows: z.number().int().min(1).max(30),
  columns: z.number().int().min(1).max(60),
  rowSpacingM: z.number().nonnegative(),
  columnSpacingM: z.number().nonnegative(),
  aisleWidthM: z.number().nonnegative(),
  startPosition: Vector3Schema,
  rackSize: Size3Schema,
  orientation: RackOrientationSchema,
  heatLoadMode: HeatLoadModeSchema,
  perRackKw: z.number().nonnegative(),
  totalArrayKw: z.number().nonnegative(),
  customRackKw: z.record(z.string(), z.number().nonnegative()).optional(),
  coolingMode: RackCoolingModeSchema,
  liquidCaptureRatio: z.number().min(0).max(0.98)
});

export const CoolingObjectTypeSchema = z.enum([
  "crac-crah",
  "in-row-cooler",
  "floor-perforated-tile",
  "ceiling-supply-diffuser",
  "ceiling-return-grille",
  "wall-supply-grille",
  "wall-return-grille",
  "cdu"
]);

export const CoolingObjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: CoolingObjectTypeSchema,
  position: Vector3Schema,
  size: Size3Schema,
  direction: Vector3Schema,
  supplyTemperatureC: z.number(),
  airflowLps: z.number().nonnegative(),
  coolingCapacityKw: z.number().nonnegative(),
  returnMode: z.enum(["ceiling", "wall", "crac-return", "rear-zone", "none"]),
  enabled: z.boolean(),
  residualHeatKw: z.number().nonnegative().optional(),
  obstructionFactor: z.number().min(0).max(1).optional()
});

export const ContainmentTypeSchema = z.enum([
  "cold-aisle",
  "hot-aisle",
  "end-of-row-door",
  "top-panel",
  "side-panel",
  "full-aisle"
]);

export const ContainmentObjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ContainmentTypeSchema,
  position: Vector3Schema,
  size: Size3Schema,
  enabled: z.boolean(),
  generatedFromRackIds: z.array(z.string()).optional()
});

export const UnitSettingsSchema = z.object({
  temperature: z.enum(["C", "F"]),
  airflow: z.enum(["L/s", "CFM", "CMH"]),
  dimension: z.enum(["m", "mm", "ft"]),
  heat: z.enum(["kW", "W", "BTU/h"])
});

export const SimulationSettingsSchema = z.object({
  mode: z.enum(["preview", "formal"]),
  gridResolution: z.enum(["coarse", "medium", "fine"]),
  iterations: z.number().int().min(1).max(250),
  ambientTemperatureC: z.number(),
  warningTemperatureC: z.number(),
  criticalTemperatureC: z.number(),
  airflowMixingFactor: z.number().min(0).max(1),
  containmentEffectiveness: z.number().min(0).max(0.95)
});

export const ReportSettingsSchema = z.object({
  includeScreenshots: z.boolean(),
  includeAssumptions: z.boolean(),
  includeDisclaimer: z.boolean(),
  author: z.string(),
  customer: z.string(),
  projectName: z.string(),
  language: z.enum(["en", "zh"]).default("en"),
  companyName: z.string().default("AirPath Consulting"),
  clientName: z.string().default("Concept review"),
  caseName: z.string().default("Baseline review"),
  reportTitle: z.string().default("Pre-Sales Airflow and Thermal Review"),
  reportDate: z.string().default(""),
  revision: z.string().default("R0"),
  logoDataUrl: z.string().default(""),
  preparedByTitle: z.string().default("Pre-sales engineering"),
  documentId: z.string().default("")
});

export const ScenarioMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  expectedInterpretation: z.string().optional(),
  recommendedReportOutput: z.string().optional(),
  validationRelevance: z.string().optional()
});

export const ScenarioSchema = z.object({
  schemaVersion: z.string(),
  metadata: ScenarioMetadataSchema,
  room: RoomSchema,
  rackArrays: z.array(RackArrayInputSchema),
  racks: z.array(RackSchema),
  coolingObjects: z.array(CoolingObjectSchema),
  containmentObjects: z.array(ContainmentObjectSchema),
  units: UnitSettingsSchema,
  simulationSettings: SimulationSettingsSchema,
  reportSettings: ReportSettingsSchema
});

export type Vector3 = z.infer<typeof Vector3Schema>;
export type Size3 = z.infer<typeof Size3Schema>;
export type Room = z.infer<typeof RoomSchema>;
export type Rack = z.infer<typeof RackSchema>;
export type RackArrayInput = z.infer<typeof RackArrayInputSchema>;
export type RackOrientation = z.infer<typeof RackOrientationSchema>;
export type RackCoolingMode = z.infer<typeof RackCoolingModeSchema>;
export type CoolingObject = z.infer<typeof CoolingObjectSchema>;
export type CoolingObjectType = z.infer<typeof CoolingObjectTypeSchema>;
export type ContainmentObject = z.infer<typeof ContainmentObjectSchema>;
export type ContainmentType = z.infer<typeof ContainmentTypeSchema>;
export type UnitSettings = z.infer<typeof UnitSettingsSchema>;
export type SimulationSettings = z.infer<typeof SimulationSettingsSchema>;
export type ReportSettings = z.infer<typeof ReportSettingsSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;

export type RoomTemplateKey = "small" | "medium" | "large" | "custom";

export type AisleType = "hot" | "cold";
export type AisleRelation = "back-to-back" | "face-to-face";
export type AisleAxis = "x" | "z";

export interface DetectedAisle {
  id: string;
  type: AisleType;
  relation: AisleRelation;
  axis: AisleAxis;
  center: Vector3;
  size: Size3;
  rackIds: string[];
  confidence: number;
  label: string;
}

export const roomTemplates: Record<Exclude<RoomTemplateKey, "custom">, Room> = {
  small: {
    id: "room-small",
    name: "Small server room",
    width: 8,
    depth: 6,
    height: 3,
    ambientTemperatureC: 24
  },
  medium: {
    id: "room-medium",
    name: "Medium room",
    width: 15,
    depth: 10,
    height: 3.5,
    ambientTemperatureC: 24
  },
  large: {
    id: "room-large",
    name: "Large room",
    width: 25,
    depth: 12,
    height: 4,
    ambientTemperatureC: 24
  }
};

export const defaultRackSize: Size3 = {
  width: 0.6,
  depth: 1.2,
  height: 2.2
};

export const defaultUnits: UnitSettings = {
  temperature: "C",
  airflow: "L/s",
  dimension: "m",
  heat: "kW"
};

export const defaultSimulationSettings: SimulationSettings = {
  mode: "formal",
  gridResolution: "medium",
  iterations: 48,
  ambientTemperatureC: 24,
  warningTemperatureC: 27,
  criticalTemperatureC: 32,
  airflowMixingFactor: 0.42,
  containmentEffectiveness: 0.72
};

export const defaultReportSettings: ReportSettings = {
  includeScreenshots: true,
  includeAssumptions: true,
  includeDisclaimer: true,
  author: "AirPath",
  customer: "Concept review",
  projectName: "AirPath Scenario",
  language: "en",
  companyName: "AirPath Consulting",
  clientName: "Concept review",
  caseName: "Baseline review",
  reportTitle: "Pre-Sales Airflow and Thermal Review",
  reportDate: "",
  revision: "R0",
  logoDataUrl: "",
  preparedByTitle: "Pre-sales engineering",
  documentId: ""
};

export function residualAirHeatKw(totalItKw: number, liquidCaptureRatio: number, mode: RackCoolingMode): number {
  if (mode === "air-cooled") return totalItKw;
  return totalItKw * (1 - clamp(liquidCaptureRatio, 0, 0.98));
}

export function orientationVector(orientation: RackOrientation): Vector3 {
  switch (orientation) {
    case "front-positive-z":
      return { x: 0, y: 0, z: 1 };
    case "front-negative-z":
      return { x: 0, y: 0, z: -1 };
    case "front-positive-x":
      return { x: 1, y: 0, z: 0 };
    case "front-negative-x":
      return { x: -1, y: 0, z: 0 };
  }
}

export function rackFrontVector(rack: Pick<Rack, "orientation">): Vector3 {
  return orientationVector(rack.orientation);
}

export function rackRearVector(rack: Pick<Rack, "orientation">): Vector3 {
  const front = rackFrontVector(rack);
  return { x: front.x === 0 ? 0 : -front.x, y: 0, z: front.z === 0 ? 0 : -front.z };
}

export function oppositeRackOrientation(orientation: RackOrientation): RackOrientation {
  switch (orientation) {
    case "front-positive-z":
      return "front-negative-z";
    case "front-negative-z":
      return "front-positive-z";
    case "front-positive-x":
      return "front-negative-x";
    case "front-negative-x":
      return "front-positive-x";
  }
}

export function detectAisles(scenario: Pick<Scenario, "room" | "racks">): DetectedAisle[] {
  const candidates: DetectedAisle[] = [];
  for (let a = 0; a < scenario.racks.length; a += 1) {
    for (let b = a + 1; b < scenario.racks.length; b += 1) {
      const aisle = detectAisleBetweenRacks(scenario.racks[a], scenario.racks[b], scenario.room);
      if (aisle) candidates.push(aisle);
    }
  }
  return mergeAisleCandidates(candidates, scenario.room);
}

function detectAisleBetweenRacks(rackA: Rack, rackB: Rack, room: Room): DetectedAisle | undefined {
  const frontA = rackFrontVector(rackA);
  const frontB = rackFrontVector(rackB);
  const parallel = Math.abs(dot2(frontA, frontB));
  if (parallel < 0.96) return undefined;

  const between = { x: rackB.position.x - rackA.position.x, y: 0, z: rackB.position.z - rackA.position.z };
  const distance = Math.hypot(between.x, between.z);
  if (distance < 0.6 || distance > 4.2) return undefined;
  const direction = { x: between.x / distance, y: 0, z: between.z / distance };
  const axis: AisleAxis = Math.abs(direction.x) > Math.abs(direction.z) ? "x" : "z";
  const separation = Math.abs(axis === "x" ? between.x : between.z);
  const averageRackDepth = (rackA.size.depth + rackB.size.depth) / 2;
  const clearAisle = separation - averageRackDepth;
  if (clearAisle < 0.35 || clearAisle > 3.2) return undefined;

  const lateralOverlap = axis === "x"
    ? overlapAmount(rackA.position.z, rackA.size.depth, rackB.position.z, rackB.size.depth)
    : overlapAmount(rackA.position.x, rackA.size.width, rackB.position.x, rackB.size.width);
  if (lateralOverlap < Math.min(rackA.size.width, rackB.size.width) * 0.35) return undefined;

  const aFrontFacesB = dot2(frontA, direction) > 0.62;
  const bFrontFacesA = dot2(frontB, { x: -direction.x, y: 0, z: -direction.z }) > 0.62;
  const aRearFacesB = dot2(rackRearVector(rackA), direction) > 0.62;
  const bRearFacesA = dot2(rackRearVector(rackB), { x: -direction.x, y: 0, z: -direction.z }) > 0.62;

  const type: AisleType | undefined = aFrontFacesB && bFrontFacesA ? "cold" : aRearFacesB && bRearFacesA ? "hot" : undefined;
  if (!type) return undefined;
  const relation: AisleRelation = type === "cold" ? "face-to-face" : "back-to-back";
  const minX = Math.min(rackA.position.x - rackA.size.width / 2, rackB.position.x - rackB.size.width / 2);
  const maxX = Math.max(rackA.position.x + rackA.size.width / 2, rackB.position.x + rackB.size.width / 2);
  const minZ = Math.min(rackA.position.z - rackA.size.depth / 2, rackB.position.z - rackB.size.depth / 2);
  const maxZ = Math.max(rackA.position.z + rackA.size.depth / 2, rackB.position.z + rackB.size.depth / 2);
  const center = {
    x: (rackA.position.x + rackB.position.x) / 2,
    y: Math.min(1.35, room.height / 2),
    z: (rackA.position.z + rackB.position.z) / 2
  };
  const size =
    axis === "x"
      ? { width: Math.max(0.4, clearAisle), depth: Math.max(lateralOverlap, Math.min(rackA.size.depth, rackB.size.depth)), height: Math.min(2.7, room.height) }
      : { width: Math.max(lateralOverlap, Math.min(rackA.size.width, rackB.size.width)), depth: Math.max(0.4, clearAisle), height: Math.min(2.7, room.height) };

  return {
    id: `aisle-${type}-${rackA.id}-${rackB.id}`,
    type,
    relation,
    axis,
    center,
    size,
    rackIds: [rackA.id, rackB.id],
    confidence: 0.82,
    label: `${type === "hot" ? "Hot" : "Cold"} aisle suggestion`,
    // Preserve the full span for later merging without expanding the public type.
    ...(axis === "x" ? { _spanMin: minZ, _spanMax: maxZ } : { _spanMin: minX, _spanMax: maxX })
  } as DetectedAisle;
}

function mergeAisleCandidates(candidates: DetectedAisle[], room: Room): DetectedAisle[] {
  const groups: DetectedAisle[] = [];
  for (const candidate of candidates) {
    const existing = groups.find(
      (group) =>
        group.type === candidate.type &&
        group.relation === candidate.relation &&
        group.axis === candidate.axis &&
        Math.abs((group.axis === "x" ? group.center.x : group.center.z) - (candidate.axis === "x" ? candidate.center.x : candidate.center.z)) < 0.75
    );
    if (!existing) {
      groups.push({ ...candidate });
      continue;
    }
    const rackIds = [...new Set([...existing.rackIds, ...candidate.rackIds])];
    const minX = Math.min(existing.center.x - existing.size.width / 2, candidate.center.x - candidate.size.width / 2);
    const maxX = Math.max(existing.center.x + existing.size.width / 2, candidate.center.x + candidate.size.width / 2);
    const minZ = Math.min(existing.center.z - existing.size.depth / 2, candidate.center.z - candidate.size.depth / 2);
    const maxZ = Math.max(existing.center.z + existing.size.depth / 2, candidate.center.z + candidate.size.depth / 2);
    existing.center = { x: (minX + maxX) / 2, y: Math.min(1.35, room.height / 2), z: (minZ + maxZ) / 2 };
    existing.size = { width: Math.max(0.4, maxX - minX), depth: Math.max(0.4, maxZ - minZ), height: Math.min(2.7, room.height) };
    existing.rackIds = rackIds;
    existing.confidence = Math.min(0.94, existing.confidence + 0.03);
  }
  return groups.map((group, index) => ({
    ...group,
    id: `aisle-${group.type}-${index + 1}`,
    label: `${group.type === "hot" ? "Hot" : "Cold"} aisle ${index + 1}`
  }));
}

function overlapAmount(centerA: number, sizeA: number, centerB: number, sizeB: number): number {
  const minA = centerA - sizeA / 2;
  const maxA = centerA + sizeA / 2;
  const minB = centerB - sizeB / 2;
  const maxB = centerB + sizeB / 2;
  return Math.max(0, Math.min(maxA, maxB) - Math.max(minA, minB));
}

function dot2(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.z * b.z;
}

export function rackFootprint(rack: Rack): { minX: number; maxX: number; minZ: number; maxZ: number; minY: number; maxY: number } {
  return {
    minX: rack.position.x - rack.size.width / 2,
    maxX: rack.position.x + rack.size.width / 2,
    minZ: rack.position.z - rack.size.depth / 2,
    maxZ: rack.position.z + rack.size.depth / 2,
    minY: rack.position.y - rack.size.height / 2,
    maxY: rack.position.y + rack.size.height / 2
  };
}

export function generateRackArray(input: RackArrayInput): Rack[] {
  RackArrayInputSchema.parse(input);
  const count = input.rows * input.columns;
  const totalModeKw = count > 0 ? input.totalArrayKw / count : 0;
  const racks: Rack[] = [];
  for (let row = 0; row < input.rows; row += 1) {
    for (let column = 0; column < input.columns; column += 1) {
      const rackId = `${input.id}-r${row + 1}c${column + 1}`;
      const perRackKw =
        input.heatLoadMode === "total-array"
          ? totalModeKw
          : input.heatLoadMode === "mixed-custom"
            ? input.customRackKw?.[rackId] ?? input.perRackKw
            : input.perRackKw;
      racks.push({
        id: rackId,
        arrayId: input.id,
        name: `${input.name} R${row + 1}C${column + 1}`,
        position: {
          x: input.startPosition.x + column * (input.rackSize.width + input.columnSpacingM),
          y: input.rackSize.height / 2,
          z: input.startPosition.z + row * (input.rackSize.depth + input.rowSpacingM) + Math.floor(row / 2) * input.aisleWidthM
        },
        size: { ...input.rackSize },
        orientation: input.orientation,
        heatLoadKw: Number(perRackKw.toFixed(3)),
        coolingMode: input.coolingMode,
        liquidCaptureRatio: input.coolingMode === "air-cooled" ? 0 : input.liquidCaptureRatio
      });
    }
  }
  return racks;
}

export function defaultRackArrayInput(room: Room = roomTemplates.medium): RackArrayInput {
  return {
    id: "rack-array-1",
    name: "Rack Array",
    rows: 2,
    columns: 4,
    rowSpacingM: 1,
    columnSpacingM: 0.15,
    aisleWidthM: 1.2,
    startPosition: { x: Math.max(1.2, room.width * 0.22), y: 0, z: Math.max(1.4, room.depth * 0.28) },
    rackSize: { ...defaultRackSize },
    orientation: "front-positive-z",
    heatLoadMode: "per-rack",
    perRackKw: 4,
    totalArrayKw: 32,
    customRackKw: {},
    coolingMode: "air-cooled",
    liquidCaptureRatio: 0
  };
}

export function createCoolingObject(type: CoolingObjectType, index: number, room: Room): CoolingObject {
  const id = `${type}-${index}`;
  const common = {
    id,
    name: coolingObjectLabel(type, index),
    type,
    enabled: true
  };
  switch (type) {
    case "crac-crah":
      return {
        ...common,
        position: { x: 0.45, y: 1, z: room.depth / 2 },
        size: { width: 0.8, depth: 1.1, height: 2 },
        direction: { x: 1, y: 0, z: 0 },
        supplyTemperatureC: 18,
        airflowLps: 1650,
        coolingCapacityKw: 45,
        returnMode: "crac-return"
      };
    case "in-row-cooler":
      return {
        ...common,
        position: { x: room.width / 2, y: 1, z: room.depth * 0.48 },
        size: { width: 0.6, depth: 1.2, height: 2.2 },
        direction: { x: 0, y: 0, z: 1 },
        supplyTemperatureC: 18,
        airflowLps: 900,
        coolingCapacityKw: 25,
        returnMode: "rear-zone"
      };
    case "floor-perforated-tile":
      return {
        ...common,
        position: { x: room.width * 0.42, y: 0.02, z: room.depth * 0.4 },
        size: { width: 0.6, depth: 0.6, height: 0.04 },
        direction: { x: 0, y: 1, z: 0 },
        supplyTemperatureC: 18,
        airflowLps: 480,
        coolingCapacityKw: 12,
        returnMode: "none"
      };
    case "ceiling-supply-diffuser":
      return {
        ...common,
        position: { x: room.width * 0.45, y: room.height - 0.05, z: room.depth * 0.3 },
        size: { width: 0.7, depth: 0.7, height: 0.05 },
        direction: { x: 0, y: -1, z: 0 },
        supplyTemperatureC: 17,
        airflowLps: 700,
        coolingCapacityKw: 18,
        returnMode: "ceiling"
      };
    case "ceiling-return-grille":
      return {
        ...common,
        position: { x: room.width * 0.5, y: room.height - 0.04, z: room.depth * 0.72 },
        size: { width: 0.9, depth: 0.9, height: 0.05 },
        direction: { x: 0, y: 1, z: 0 },
        supplyTemperatureC: room.ambientTemperatureC,
        airflowLps: 850,
        coolingCapacityKw: 0,
        returnMode: "ceiling"
      };
    case "wall-supply-grille":
      return {
        ...common,
        position: { x: 0.05, y: 1.6, z: room.depth * 0.32 },
        size: { width: 0.08, depth: 1.2, height: 0.7 },
        direction: { x: 1, y: 0, z: 0 },
        supplyTemperatureC: 18,
        airflowLps: 700,
        coolingCapacityKw: 16,
        returnMode: "wall"
      };
    case "wall-return-grille":
      return {
        ...common,
        position: { x: room.width - 0.05, y: 1.8, z: room.depth * 0.72 },
        size: { width: 0.08, depth: 1.2, height: 0.8 },
        direction: { x: -1, y: 0, z: 0 },
        supplyTemperatureC: room.ambientTemperatureC,
        airflowLps: 850,
        coolingCapacityKw: 0,
        returnMode: "wall"
      };
    case "cdu":
      return {
        ...common,
        position: { x: room.width - 1.2, y: 0.9, z: 1.1 },
        size: { width: 0.7, depth: 1, height: 1.8 },
        direction: { x: 0, y: 0, z: 1 },
        supplyTemperatureC: room.ambientTemperatureC,
        airflowLps: 120,
        coolingCapacityKw: 0,
        returnMode: "none",
        residualHeatKw: 1.5,
        obstructionFactor: 0.4
      };
  }
}

export function createContainmentObject(type: ContainmentType, index: number, room: Room, rackIds: string[] = []): ContainmentObject {
  const base = {
    id: `${type}-${index}`,
    name: containmentLabel(type, index),
    type,
    enabled: true,
    generatedFromRackIds: rackIds
  };
  switch (type) {
    case "cold-aisle":
      return {
        ...base,
        position: { x: room.width * 0.44, y: 1.35, z: room.depth * 0.45 },
        size: { width: Math.min(6, room.width * 0.45), depth: 0.08, height: 2.7 }
      };
    case "hot-aisle":
      return {
        ...base,
        position: { x: room.width * 0.44, y: 1.35, z: room.depth * 0.66 },
        size: { width: Math.min(6, room.width * 0.45), depth: 0.08, height: 2.7 }
      };
    case "end-of-row-door":
      return {
        ...base,
        position: { x: room.width * 0.23, y: 1.1, z: room.depth * 0.55 },
        size: { width: 0.08, depth: 1.4, height: 2.2 }
      };
    case "top-panel":
      return {
        ...base,
        position: { x: room.width * 0.44, y: 2.45, z: room.depth * 0.55 },
        size: { width: Math.min(6, room.width * 0.45), depth: 1.4, height: 0.08 }
      };
    case "side-panel":
      return {
        ...base,
        position: { x: room.width * 0.65, y: 1.2, z: room.depth * 0.55 },
        size: { width: 0.08, depth: 1.4, height: 2.4 }
      };
    case "full-aisle":
      return {
        ...base,
        position: { x: room.width * 0.44, y: 1.35, z: room.depth * 0.55 },
        size: { width: Math.min(6, room.width * 0.45), depth: 1.5, height: 2.7 }
      };
  }
}

export function createDefaultScenario(template: RoomTemplateKey = "medium"): Scenario {
  const now = new Date().toISOString();
  const room = template === "custom" ? { ...roomTemplates.medium, id: "room-custom", name: "Custom room" } : { ...roomTemplates[template] };
  const rackArray = defaultRackArrayInput(room);
  const scenario: Scenario = {
    schemaVersion: SCHEMA_VERSION,
    metadata: {
      id: "scenario-default",
      name: "Medium room baseline",
      description: "Default 5-minute pre-sales airflow review scenario.",
      createdAt: now,
      updatedAt: now,
      expectedInterpretation: "Baseline rack array with mixed side and floor cooling for quick risk review.",
      recommendedReportOutput: "Executive summary, rack inlet table, cooling setup, warnings, assumptions, and disclaimer.",
      validationRelevance: "Covers rack heat, cooling influence, airflow visualization, and report output."
    },
    room,
    rackArrays: [rackArray],
    racks: generateRackArray(rackArray),
    coolingObjects: [
      createCoolingObject("crac-crah", 1, room),
      createCoolingObject("floor-perforated-tile", 1, room),
      createCoolingObject("ceiling-supply-diffuser", 1, room),
      createCoolingObject("in-row-cooler", 1, room),
      createCoolingObject("ceiling-return-grille", 1, room)
    ],
    containmentObjects: [],
    units: { ...defaultUnits },
    simulationSettings: { ...defaultSimulationSettings, ambientTemperatureC: room.ambientTemperatureC },
    reportSettings: { ...defaultReportSettings, projectName: "Medium room baseline" }
  };
  return ScenarioSchema.parse(scenario);
}

export function updateScenarioTimestamp(scenario: Scenario): Scenario {
  return { ...scenario, metadata: { ...scenario.metadata, updatedAt: new Date().toISOString() } };
}

export function validateScenario(data: unknown): Scenario {
  return ScenarioSchema.parse(data);
}

export function serializeScenario(scenario: Scenario): string {
  return JSON.stringify(validateScenario(scenario), null, 2);
}

export function deserializeScenario(json: string): Scenario {
  return validateScenario(JSON.parse(json));
}

export function cloneScenario(scenario: Scenario, id: string, name: string): Scenario {
  const now = new Date().toISOString();
  return validateScenario({
    ...scenario,
    metadata: {
      ...scenario.metadata,
      id,
      name,
      createdAt: now,
      updatedAt: now
    }
  });
}

export function convertTemperature(value: number, from: UnitSettings["temperature"], to: UnitSettings["temperature"]): number {
  if (from === to) return value;
  return from === "C" ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9;
}

export function convertAirflow(value: number, from: UnitSettings["airflow"], to: UnitSettings["airflow"]): number {
  const litersPerSecond = from === "L/s" ? value : from === "CFM" ? value * 0.47194745 : value * 0.277777778;
  return to === "L/s" ? litersPerSecond : to === "CFM" ? litersPerSecond / 0.47194745 : litersPerSecond / 0.277777778;
}

export function convertDimension(value: number, from: UnitSettings["dimension"], to: UnitSettings["dimension"]): number {
  const meters = from === "m" ? value : from === "mm" ? value / 1000 : value * 0.3048;
  return to === "m" ? meters : to === "mm" ? meters * 1000 : meters / 0.3048;
}

export function convertHeat(value: number, from: UnitSettings["heat"], to: UnitSettings["heat"]): number {
  const kw = from === "kW" ? value : from === "W" ? value / 1000 : value * 0.00029307107;
  return to === "kW" ? kw : to === "W" ? kw * 1000 : kw / 0.00029307107;
}

export function totalResidualAirHeatKw(racks: Rack[], cduResidualKw = 0): number {
  return racks.reduce((sum, rack) => sum + residualAirHeatKw(rack.heatLoadKw, rack.liquidCaptureRatio, rack.coolingMode), cduResidualKw);
}

export function isSupplyObject(object: CoolingObject): boolean {
  return (
    object.enabled &&
    ["crac-crah", "in-row-cooler", "floor-perforated-tile", "ceiling-supply-diffuser", "wall-supply-grille"].includes(object.type)
  );
}

export function isReturnObject(object: CoolingObject): boolean {
  return object.enabled && ["ceiling-return-grille", "wall-return-grille"].includes(object.type);
}

export function coolingObjectLabel(type: CoolingObjectType, index: number): string {
  const labels: Record<CoolingObjectType, string> = {
    "crac-crah": "CRAC / CRAH",
    "in-row-cooler": "In-row cooler",
    "floor-perforated-tile": "Floor perforated tile",
    "ceiling-supply-diffuser": "Ceiling supply diffuser",
    "ceiling-return-grille": "Ceiling return grille",
    "wall-supply-grille": "Wall supply grille",
    "wall-return-grille": "Wall return grille",
    cdu: "CDU"
  };
  return `${labels[type]} ${index}`;
}

export function containmentLabel(type: ContainmentType, index: number): string {
  const labels: Record<ContainmentType, string> = {
    "cold-aisle": "Cold aisle containment",
    "hot-aisle": "Hot aisle containment",
    "end-of-row-door": "End-of-row door",
    "top-panel": "Top panel",
    "side-panel": "Side panel",
    "full-aisle": "Full aisle containment"
  };
  return `${labels[type]} ${index}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, digits = 1): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}
