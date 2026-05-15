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

export const RowModuleTypeSchema = z.enum(["rack", "in-row-cooling", "empty"]);

export const ModuleSideSchema = z.enum(["front", "rear", "left", "right", "top", "bottom"]);

export const InRowCoolingModeSchema = z.enum([
  "hot-side-return-cold-side-supply",
  "contained-hot-aisle-local",
  "custom"
]);

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
  orientation: RackOrientationSchema.optional(),
  rowId: z.string().optional(),
  slotIndex: z.number().int().nonnegative().optional(),
  rowModuleType: RowModuleTypeSchema.optional(),
  intakeSide: ModuleSideSchema.optional(),
  supplySide: ModuleSideSchema.optional(),
  coolingModeSemantic: InRowCoolingModeSchema.optional(),
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
export type RowModuleType = z.infer<typeof RowModuleTypeSchema>;
export type ModuleSide = z.infer<typeof ModuleSideSchema>;
export type InRowCoolingMode = z.infer<typeof InRowCoolingModeSchema>;
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
export type ThermalZoneType = "hot-aisle" | "cold-aisle" | "contained-hot-aisle" | "contained-cold-aisle";
export type ThermalZoneContainmentState = "open" | "contained";
export type TopologyWarningSeverity = "info" | "warning" | "critical";
export type TopologyWarningType =
  | "ambiguous-aisle-orientation"
  | "inrow-intake-mismatch"
  | "contained-zone-no-sink"
  | "rack-exhaust-unzoned"
  | "thermal-zone-missing"
  | "hot-aisle-interrupted";

export interface DetectedAisle {
  id: string;
  type: AisleType;
  relation: AisleRelation;
  axis: AisleAxis;
  center: Vector3;
  size: Size3;
  rackIds: string[];
  moduleIds?: string[];
  rowIds?: string[];
  confidence: number;
  label: string;
}

export interface RowModule {
  id: string;
  sourceId: string;
  type: RowModuleType;
  position: Vector3;
  size: Size3;
  orientation: RackOrientation;
  rowId: string;
  slotIndex: number;
  frontSide: Vector3;
  rearSide: Vector3;
  thermalRole: "rack-heat-source" | "in-row-cooling" | "reserved";
  transformableType: "rack" | "cooling";
}

export interface RowGroup {
  id: string;
  axis: "x" | "z";
  modules: RowModule[];
  orientation: RackOrientation;
  frontSide: Vector3;
  rearSide: Vector3;
  consistent: boolean;
  bounds: RectBounds;
}

export interface RectBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface ThermalZone {
  id: string;
  type: ThermalZoneType;
  aisleType: AisleType;
  sourceAisleId: string;
  center: Vector3;
  size: Size3;
  height: number;
  floorBounds: RectBounds;
  associatedRowIds: string[];
  associatedModuleIds: string[];
  containmentState: ThermalZoneContainmentState;
  boundarySurfaces: Array<"left" | "right" | "top" | "end-a" | "end-b">;
  allowedAirflowSourceIds: string[];
  allowedAirflowSinkIds: string[];
  visualStyle: {
    color: string;
    opacity: number;
    outlineColor: string;
  };
}

export interface TopologyWarning {
  id: string;
  type: TopologyWarningType;
  severity: TopologyWarningSeverity;
  label: string;
  message: string;
  suggestedMitigation: string;
  objectIds: string[];
  position: Vector3;
}

export interface ThermalTopology {
  rowModules: RowModule[];
  rowGroups: RowGroup[];
  detectedAisles: DetectedAisle[];
  thermalZones: ThermalZone[];
  warnings: TopologyWarning[];
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

export function analyzeThermalTopology(
  scenario: Pick<Scenario, "room" | "racks"> & Partial<Pick<Scenario, "coolingObjects" | "containmentObjects">>
): ThermalTopology {
  const rowModules = buildRowModules(scenario);
  const rowGroups = buildRowGroups(rowModules);
  const detectedAisles = detectAislesFromRowGroups(rowGroups, scenario.room);
  const thermalZones = buildThermalZones(scenario, detectedAisles, rowModules);
  const warnings = buildTopologyWarnings(scenario, rowGroups, detectedAisles, thermalZones, rowModules);
  return { rowModules, rowGroups, detectedAisles, thermalZones, warnings };
}

export function buildRowModules(
  scenario: Pick<Scenario, "racks"> & Partial<Pick<Scenario, "coolingObjects">>
): RowModule[] {
  const rackModules: RowModule[] = scenario.racks.map((rack, index) => {
    const identity = inferRackRowIdentity(rack, index);
    const frontSide = rackFrontVector(rack);
    return {
      id: `module-${rack.id}`,
      sourceId: rack.id,
      type: "rack",
      position: { ...rack.position },
      size: { ...rack.size },
      orientation: rack.orientation,
      rowId: identity.rowId,
      slotIndex: identity.slotIndex,
      frontSide,
      rearSide: rackRearVector(rack),
      thermalRole: "rack-heat-source",
      transformableType: "rack"
    };
  });

  const coolingModules: RowModule[] = (scenario.coolingObjects ?? [])
    .filter((object) => object.type === "in-row-cooler")
    .map((object, index) => {
      const orientation = object.orientation ?? orientationFromDirection(object.direction);
      const identity = inferCoolingRowIdentity(object, orientation, index);
      const frontSide = orientationVector(orientation);
      return {
        id: `module-${object.id}`,
        sourceId: object.id,
        type: "in-row-cooling",
        position: { ...object.position },
        size: { ...object.size },
        orientation,
        rowId: identity.rowId,
        slotIndex: identity.slotIndex,
        frontSide,
        rearSide: { x: -frontSide.x, y: 0, z: -frontSide.z },
        thermalRole: "in-row-cooling",
        transformableType: "cooling"
      };
    });

  return [...rackModules, ...coolingModules].sort((a, b) => a.rowId.localeCompare(b.rowId) || a.slotIndex - b.slotIndex);
}

export function buildRowGroups(rowModules: RowModule[]): RowGroup[] {
  const byRow = new Map<string, RowModule[]>();
  for (const module of rowModules) {
    const modules = byRow.get(module.rowId) ?? [];
    modules.push(module);
    byRow.set(module.rowId, modules);
  }

  return [...byRow.entries()]
    .map(([id, modules]) => {
      const sorted = [...modules].sort((a, b) => a.slotIndex - b.slotIndex || a.position.x - b.position.x || a.position.z - b.position.z);
      const orientation = dominantOrientation(sorted);
      const frontSide = orientationVector(orientation);
      const bounds = rectBoundsFromModules(sorted);
      return {
        id,
        axis: rowAxisForOrientation(orientation),
        modules: sorted,
        orientation,
        frontSide,
        rearSide: { x: -frontSide.x, y: 0, z: -frontSide.z },
        consistent: sorted.every((module) => Math.abs(dot2(module.frontSide, frontSide)) > 0.92),
        bounds
      } satisfies RowGroup;
    })
    .filter((group) => group.modules.length >= 1);
}

export function detectAislesFromTopology(
  scenario: Pick<Scenario, "room" | "racks"> & Partial<Pick<Scenario, "coolingObjects">>
): DetectedAisle[] {
  return detectAislesFromRowGroups(buildRowGroups(buildRowModules(scenario)), scenario.room);
}

export function detectAisles(
  scenario: Pick<Scenario, "room" | "racks"> & Partial<Pick<Scenario, "coolingObjects">>
): DetectedAisle[] {
  return detectAislesFromTopology(scenario);
}

export function buildThermalZones(
  scenario: Pick<Scenario, "room" | "racks"> & Partial<Pick<Scenario, "coolingObjects" | "containmentObjects">>,
  detectedAisles: DetectedAisle[] = detectAisles(scenario),
  rowModules: RowModule[] = buildRowModules(scenario)
): ThermalZone[] {
  return detectedAisles.map((aisle, index) => {
    const containment = findAisleContainment(aisle, scenario.containmentObjects ?? []);
    const contained = Boolean(containment);
    const height = Math.min(scenario.room.height, containment?.size.height ?? aisle.size.height ?? 2.7);
    const floorBounds = rectBoundsFromCenterSize(aisle.center, aisle.size);
    const associatedModuleIds = aisle.moduleIds ?? rowModules.filter((module) => aisle.rackIds.includes(module.sourceId)).map((module) => module.id);
    const inRowSinkIds = (scenario.coolingObjects ?? [])
      .filter((object) => object.enabled && (object.type === "in-row-cooler" || object.returnMode !== "none") && pointInsideOrNearBounds(object.position, floorBounds, 0.45))
      .map((object) => object.id);
    const returnSinkIds = (scenario.coolingObjects ?? [])
      .filter((object) => object.enabled && object.type !== "in-row-cooler" && object.returnMode !== "none" && distance2d(object.position, aisle.center) <= 4.5)
      .map((object) => object.id);
    const type: ThermalZoneType =
      aisle.type === "hot" ? (contained ? "contained-hot-aisle" : "hot-aisle") : contained ? "contained-cold-aisle" : "cold-aisle";
    return {
      id: `thermal-zone-${aisle.type}-${index + 1}`,
      type,
      aisleType: aisle.type,
      sourceAisleId: aisle.id,
      center: { x: aisle.center.x, y: height / 2, z: aisle.center.z },
      size: { width: aisle.size.width, depth: aisle.size.depth, height },
      height,
      floorBounds,
      associatedRowIds: aisle.rowIds ?? [],
      associatedModuleIds,
      containmentState: contained ? "contained" : "open",
      boundarySurfaces: contained ? ["left", "right", "top", "end-a", "end-b"] : [],
      allowedAirflowSourceIds:
        aisle.type === "hot"
          ? rowModules.filter((module) => associatedModuleIds.includes(module.id) && module.type === "rack").map((module) => module.sourceId)
          : (scenario.coolingObjects ?? []).filter((object) => object.enabled && object.coolingCapacityKw > 0).map((object) => object.id),
      allowedAirflowSinkIds: [...new Set([...inRowSinkIds, ...returnSinkIds])],
      visualStyle:
        aisle.type === "hot"
          ? { color: "#F97316", opacity: contained ? 0.2 : 0.13, outlineColor: "#FDBA74" }
          : { color: "#38BDF8", opacity: contained ? 0.18 : 0.12, outlineColor: "#7DD3FC" }
    };
  });
}

export function pointInThermalZone(point: Vector3, zone: ThermalZone): boolean {
  return (
    point.x >= zone.floorBounds.minX &&
    point.x <= zone.floorBounds.maxX &&
    point.z >= zone.floorBounds.minZ &&
    point.z <= zone.floorBounds.maxZ &&
    point.y >= 0 &&
    point.y <= zone.height
  );
}

export function clampPointToThermalZone(point: Vector3, zone: ThermalZone): Vector3 {
  return {
    x: clamp(point.x, zone.floorBounds.minX + 0.03, zone.floorBounds.maxX - 0.03),
    y: clamp(point.y, 0.08, zone.height - 0.03),
    z: clamp(point.z, zone.floorBounds.minZ + 0.03, zone.floorBounds.maxZ - 0.03)
  };
}

function detectAislesFromRowGroups(rowGroups: RowGroup[], room: Room): DetectedAisle[] {
  const candidates: DetectedAisle[] = [];
  for (let a = 0; a < rowGroups.length; a += 1) {
    for (let b = a + 1; b < rowGroups.length; b += 1) {
      const aisle = detectAisleBetweenRows(rowGroups[a], rowGroups[b], room);
      if (aisle) candidates.push(aisle);
    }
  }
  return candidates.sort((a, b) => a.type.localeCompare(b.type) || a.center.x - b.center.x || a.center.z - b.center.z);
}

function detectAisleBetweenRows(rowA: RowGroup, rowB: RowGroup, room: Room): DetectedAisle | undefined {
  if (!rowA.consistent || !rowB.consistent || rowA.axis !== rowB.axis) return undefined;
  if (Math.abs(dot2(rowA.frontSide, rowB.frontSide)) < 0.96) return undefined;

  const separationAxis: AisleAxis = rowA.axis === "x" ? "z" : "x";
  const rowCenterA = centerOfBounds(rowA.bounds);
  const rowCenterB = centerOfBounds(rowB.bounds);
  const delta = separationAxis === "z" ? rowCenterB.z - rowCenterA.z : rowCenterB.x - rowCenterA.x;
  const distance = Math.abs(delta);
  if (distance < 0.6 || distance > 5.2) return undefined;
  const direction: Vector3 = separationAxis === "z" ? { x: 0, y: 0, z: Math.sign(delta) || 1 } : { x: Math.sign(delta) || 1, y: 0, z: 0 };
  const depthA = separationAxis === "z" ? rowA.bounds.maxZ - rowA.bounds.minZ : rowA.bounds.maxX - rowA.bounds.minX;
  const depthB = separationAxis === "z" ? rowB.bounds.maxZ - rowB.bounds.minZ : rowB.bounds.maxX - rowB.bounds.minX;
  const clearAisle = distance - (depthA + depthB) / 2;
  if (clearAisle < 0.35 || clearAisle > 3.8) return undefined;

  const rowOverlap =
    rowA.axis === "x"
      ? overlapAmount(rowA.bounds.minX + (rowA.bounds.maxX - rowA.bounds.minX) / 2, rowA.bounds.maxX - rowA.bounds.minX, rowB.bounds.minX + (rowB.bounds.maxX - rowB.bounds.minX) / 2, rowB.bounds.maxX - rowB.bounds.minX)
      : overlapAmount(rowA.bounds.minZ + (rowA.bounds.maxZ - rowA.bounds.minZ) / 2, rowA.bounds.maxZ - rowA.bounds.minZ, rowB.bounds.minZ + (rowB.bounds.maxZ - rowB.bounds.minZ) / 2, rowB.bounds.maxZ - rowB.bounds.minZ);
  if (rowOverlap < 0.45) return undefined;

  const aFrontFacesB = dot2(rowA.frontSide, direction) > 0.62;
  const bFrontFacesA = dot2(rowB.frontSide, { x: -direction.x, y: 0, z: -direction.z }) > 0.62;
  const aRearFacesB = dot2(rowA.rearSide, direction) > 0.62;
  const bRearFacesA = dot2(rowB.rearSide, { x: -direction.x, y: 0, z: -direction.z }) > 0.62;
  const type: AisleType | undefined = aFrontFacesB && bFrontFacesA ? "cold" : aRearFacesB && bRearFacesA ? "hot" : undefined;
  if (!type) return undefined;

  const rowSpanMin =
    rowA.axis === "x" ? Math.max(rowA.bounds.minX, rowB.bounds.minX) : Math.max(rowA.bounds.minZ, rowB.bounds.minZ);
  const rowSpanMax =
    rowA.axis === "x" ? Math.min(rowA.bounds.maxX, rowB.bounds.maxX) : Math.min(rowA.bounds.maxZ, rowB.bounds.maxZ);
  const center =
    separationAxis === "z"
      ? { x: (rowSpanMin + rowSpanMax) / 2, y: Math.min(1.35, room.height / 2), z: (rowCenterA.z + rowCenterB.z) / 2 }
      : { x: (rowCenterA.x + rowCenterB.x) / 2, y: Math.min(1.35, room.height / 2), z: (rowSpanMin + rowSpanMax) / 2 };
  const size =
    separationAxis === "z"
      ? { width: Math.max(0.4, rowSpanMax - rowSpanMin), depth: Math.max(0.4, clearAisle), height: Math.min(2.7, room.height) }
      : { width: Math.max(0.4, clearAisle), depth: Math.max(0.4, rowSpanMax - rowSpanMin), height: Math.min(2.7, room.height) };
  const moduleIds = [...rowA.modules, ...rowB.modules].map((module) => module.id);
  const objectIds = [...rowA.modules, ...rowB.modules].map((module) => module.sourceId);
  return {
    id: `aisle-${type}-${rowA.id}-${rowB.id}`,
    type,
    relation: type === "cold" ? "face-to-face" : "back-to-back",
    axis: separationAxis,
    center,
    size,
    rackIds: objectIds,
    moduleIds,
    rowIds: [rowA.id, rowB.id],
    confidence: Math.min(0.96, 0.82 + Math.min(rowA.modules.length, rowB.modules.length) * 0.02),
    label: `${type === "hot" ? "Hot" : "Cold"} aisle ${type === "hot" ? "thermal zone" : "supply zone"}`
  };
}

function buildTopologyWarnings(
  scenario: Pick<Scenario, "room" | "racks"> & Partial<Pick<Scenario, "coolingObjects" | "containmentObjects">>,
  rowGroups: RowGroup[],
  detectedAisles: DetectedAisle[],
  thermalZones: ThermalZone[],
  rowModules: RowModule[]
): TopologyWarning[] {
  const warnings: TopologyWarning[] = [];
  for (const row of rowGroups) {
    if (!row.consistent) {
      warnings.push({
        id: `topology-ambiguous-${row.id}`,
        type: "ambiguous-aisle-orientation",
        severity: "warning",
        label: "Ambiguous aisle orientation",
        message: "Aisle type cannot be determined because row module orientations are inconsistent.",
        suggestedMitigation: "Rotate rack or in-row modules so the row has a consistent front/rear direction.",
        objectIds: row.modules.map((module) => module.sourceId),
        position: { ...centerOfBounds(row.bounds), y: 1.2 }
      });
    }
  }

  if (detectedAisles.length > thermalZones.length) {
    warnings.push({
      id: "topology-zone-missing",
      type: "thermal-zone-missing",
      severity: "warning",
      label: "Detected aisle has no 3D thermal zone",
      message: "An aisle was detected in Plan View but a matching 3D thermal zone was not generated.",
      suggestedMitigation: "Run Detect Aisles again or review row orientation before simulation.",
      objectIds: detectedAisles.flatMap((aisle) => aisle.rackIds),
      position: { x: scenario.room.width / 2, y: 1.2, z: scenario.room.depth / 2 }
    });
  }

  const hotZones = thermalZones.filter((zone) => zone.aisleType === "hot");
  for (const module of rowModules.filter((candidate) => candidate.type === "in-row-cooling")) {
    const hotZone = hotZones.find((zone) => zone.associatedRowIds.includes(module.rowId) || pointInsideOrNearBounds(module.position, zone.floorBounds, 0.75));
    if (!hotZone) continue;
    const vectorToZone = normalize2d({ x: hotZone.center.x - module.position.x, y: 0, z: hotZone.center.z - module.position.z });
    if (vectorMagnitude2d(vectorToZone) > 0.01 && dot2(module.rearSide, vectorToZone) < 0.18) {
      warnings.push({
        id: `topology-inrow-intake-${module.sourceId}`,
        type: "inrow-intake-mismatch",
        severity: "warning",
        label: "In-row intake side mismatch",
        message: "In-row cooling intake side does not face the detected hot aisle.",
        suggestedMitigation: "Rotate the in-row cooling unit so its return side faces the hot aisle.",
        objectIds: [module.sourceId],
        position: module.position
      });
    }
  }

  for (const zone of thermalZones) {
    if (zone.type === "contained-hot-aisle" && zone.allowedAirflowSinkIds.length === 0) {
      warnings.push({
        id: `topology-no-sink-${zone.id}`,
        type: "contained-zone-no-sink",
        severity: "warning",
        label: "Contained hot aisle has no valid sink",
        message: "Contained hot aisle has no valid return, in-row return, or cooling sink in the modeled zone.",
        suggestedMitigation: "Add an in-row cooler, ceiling return, CRAC return path, or modeled opening for the contained hot aisle.",
        objectIds: zone.associatedModuleIds,
        position: zone.center
      });
    }
  }

  const containedHotZones = hotZones.filter((zone) => zone.containmentState === "contained");
  if (containedHotZones.length > 0) {
    const unzonedRacks = scenario.racks.filter((rack) => {
      const exhaust = rackRearVector(rack);
      const point = {
        x: rack.position.x + exhaust.x * (rackFaceSpan(rack, exhaust) + 0.16),
        y: Math.min(rack.size.height, 1.5),
        z: rack.position.z + exhaust.z * (rackFaceSpan(rack, exhaust) + 0.16)
      };
      return !containedHotZones.some((zone) => pointInThermalZone(point, zone) || pointInsideOrNearBounds(point, zone.floorBounds, 0.42));
    });
    if (unzonedRacks.length > 0) {
      warnings.push({
        id: "topology-rack-exhaust-unzoned",
        type: "rack-exhaust-unzoned",
        severity: "info",
        label: "Rack exhaust is not connected to a hot aisle zone",
        message: `${unzonedRacks.length} rack exhaust point(s) are not adjacent to the contained hot aisle zone.`,
        suggestedMitigation: "Review rack orientation and detected hot aisle geometry before relying on containment-constrained airflow.",
        objectIds: unzonedRacks.map((rack) => rack.id),
        position: unzonedRacks[0]?.position ?? { x: scenario.room.width / 2, y: 1.2, z: scenario.room.depth / 2 }
      });
    }
  }

  return warnings;
}

function inferRackRowIdentity(rack: Rack, fallbackIndex: number): { rowId: string; slotIndex: number } {
  const match = rack.arrayId ? rack.id.match(/-r(\d+)c(\d+)/) : undefined;
  if (match) {
    return {
      rowId: `${rack.arrayId}-row-${Number(match[1])}`,
      slotIndex: Number(match[2]) - 1
    };
  }
  return {
    rowId: derivedRowId(rack.orientation, rack.position),
    slotIndex: fallbackIndex
  };
}

function inferCoolingRowIdentity(object: CoolingObject, orientation: RackOrientation, fallbackIndex: number): { rowId: string; slotIndex: number } {
  if (object.rowId) return { rowId: object.rowId, slotIndex: object.slotIndex ?? fallbackIndex };
  const convertedRackMatch = object.id.match(/^in-row-from-(.*-r(\d+)c(\d+).*)$/);
  if (convertedRackMatch) {
    const sourceRackId = convertedRackMatch[1];
    const sourceArrayMatch = sourceRackId.match(/^(.*)-r(\d+)c(\d+)/);
    if (sourceArrayMatch) {
      return {
        rowId: `${sourceArrayMatch[1]}-row-${Number(sourceArrayMatch[2])}`,
        slotIndex: Number(sourceArrayMatch[3]) - 1
      };
    }
  }
  return { rowId: derivedRowId(orientation, object.position), slotIndex: object.slotIndex ?? fallbackIndex };
}

function derivedRowId(orientation: RackOrientation, position: Vector3): string {
  const axis = rowAxisForOrientation(orientation);
  const lateral = axis === "x" ? position.z : position.x;
  return `derived-${axis}-${orientation}-${Math.round(lateral / 0.5)}`;
}

export function orientationFromDirection(direction: Vector3): RackOrientation {
  if (Math.abs(direction.x) >= Math.abs(direction.z)) return direction.x >= 0 ? "front-positive-x" : "front-negative-x";
  return direction.z >= 0 ? "front-positive-z" : "front-negative-z";
}

function dominantOrientation(modules: RowModule[]): RackOrientation {
  const counts = new Map<RackOrientation, number>();
  for (const module of modules) counts.set(module.orientation, (counts.get(module.orientation) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? modules[0]?.orientation ?? "front-positive-z";
}

function rowAxisForOrientation(orientation: RackOrientation): "x" | "z" {
  const front = orientationVector(orientation);
  return Math.abs(front.z) >= Math.abs(front.x) ? "x" : "z";
}

function rectBoundsFromModules(modules: RowModule[]): RectBounds {
  return modules.reduce(
    (bounds, module) => ({
      minX: Math.min(bounds.minX, module.position.x - module.size.width / 2),
      maxX: Math.max(bounds.maxX, module.position.x + module.size.width / 2),
      minZ: Math.min(bounds.minZ, module.position.z - module.size.depth / 2),
      maxZ: Math.max(bounds.maxZ, module.position.z + module.size.depth / 2)
    }),
    { minX: Number.POSITIVE_INFINITY, maxX: Number.NEGATIVE_INFINITY, minZ: Number.POSITIVE_INFINITY, maxZ: Number.NEGATIVE_INFINITY }
  );
}

function rectBoundsFromCenterSize(center: Vector3, size: Size3): RectBounds {
  return {
    minX: center.x - size.width / 2,
    maxX: center.x + size.width / 2,
    minZ: center.z - size.depth / 2,
    maxZ: center.z + size.depth / 2
  };
}

function centerOfBounds(bounds: RectBounds): Vector3 {
  return { x: (bounds.minX + bounds.maxX) / 2, y: 0, z: (bounds.minZ + bounds.maxZ) / 2 };
}

function findAisleContainment(aisle: DetectedAisle, containmentObjects: ContainmentObject[]): ContainmentObject | undefined {
  const expectedTypes = aisle.type === "hot" ? ["hot-aisle", "full-aisle"] : ["cold-aisle", "full-aisle"];
  return containmentObjects.find((object) => {
    if (!object.enabled || !expectedTypes.includes(object.type)) return false;
    const generatedIds = object.generatedFromRackIds ?? [];
    if (generatedIds.some((id) => aisle.rackIds.includes(id))) return true;
    const bounds = rectBoundsFromCenterSize(object.position, object.size);
    return overlapArea(bounds, rectBoundsFromCenterSize(aisle.center, aisle.size)) > 0.08;
  });
}

function pointInsideOrNearBounds(point: Vector3, bounds: RectBounds, margin: number): boolean {
  return point.x >= bounds.minX - margin && point.x <= bounds.maxX + margin && point.z >= bounds.minZ - margin && point.z <= bounds.maxZ + margin;
}

function overlapArea(a: RectBounds, b: RectBounds): number {
  const width = Math.max(0, Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX));
  const depth = Math.max(0, Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ));
  return width * depth;
}

function distance2d(a: Vector3, b: Vector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function normalize2d(vector: Vector3): Vector3 {
  const magnitude = vectorMagnitude2d(vector);
  return magnitude < 1e-6 ? { x: 0, y: 0, z: 0 } : { x: vector.x / magnitude, y: 0, z: vector.z / magnitude };
}

function vectorMagnitude2d(vector: Vector3): number {
  return Math.hypot(vector.x, vector.z);
}

function rackFaceSpan(rack: Pick<Rack, "size">, direction: Vector3): number {
  return Math.abs(direction.x) > Math.abs(direction.z) ? rack.size.width / 2 : rack.size.depth / 2;
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
        orientation: "front-positive-z",
        rowModuleType: "in-row-cooling",
        intakeSide: "rear",
        supplySide: "front",
        coolingModeSemantic: "hot-side-return-cold-side-supply",
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
