import {
  type ContainmentObject,
  type CoolingObject,
  type Rack,
  type Scenario,
  type SimulationSettings,
  type Vector3,
  AIRPATH_DISCLAIMER,
  clamp,
  isReturnObject,
  isSupplyObject,
  orientationVector,
  residualAirHeatKw,
  totalResidualAirHeatKw
} from "@airpath/scenario-schema";

export type SimulationWarningSeverity = "info" | "warning" | "critical";

export type SimulationWarningType =
  | "high-rack-inlet-temperature"
  | "poor-airflow-coverage"
  | "hot-air-recirculation-risk"
  | "supply-return-short-circuit"
  | "cooling-capacity-insufficient"
  | "rack-heat-density-too-high"
  | "containment-gap-detected"
  | "return-path-weak"
  | "liquid-cooling-residual-heat-still-high";

export interface SimulationWarning {
  id: string;
  type: SimulationWarningType;
  severity: SimulationWarningSeverity;
  label: string;
  message: string;
  suggestedMitigation: string;
  objectIds: string[];
  position: Vector3;
}

export interface GridShape {
  nx: number;
  ny: number;
  nz: number;
  cellSizeM: number;
}

export interface RackInletResult {
  rackId: string;
  rackName: string;
  inletTemperatureC: number;
  residualAirHeatKw: number;
  airflowCoverage: number;
  risk: "normal" | "warning" | "critical";
  position: Vector3;
}

export interface SimulationMetrics {
  maxRackInletTemperatureC: number;
  averageRackInletTemperatureC: number;
  hotspotCount: number;
  coolingCapacityMarginKw: number;
  warningCount: number;
  criticalWarningCount: number;
  totalResidualAirHeatKw: number;
  totalCoolingCapacityKw: number;
}

export interface SimulationResult {
  disclaimer: string;
  grid: GridShape;
  temperatureFieldC: number[];
  vectorField: Vector3[];
  rackInlets: RackInletResult[];
  warnings: SimulationWarning[];
  criticalWarnings: SimulationWarning[];
  metrics: SimulationMetrics;
  settings: SimulationSettings;
  elapsedMs: number;
  iterationCount: number;
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export function solveScenario(scenario: Scenario, mode: SimulationSettings["mode"] = scenario.simulationSettings.mode): SimulationResult {
  const startedAt = performance.now();
  const settings: SimulationSettings = { ...scenario.simulationSettings, mode };
  const grid = createGrid(scenario.room.width, scenario.room.depth, scenario.room.height, settings.gridResolution);
  const cellCount = grid.nx * grid.ny * grid.nz;
  const baseTemperature = new Array<number>(cellCount);
  const vectors = new Array<Vector3>(cellCount);
  const supplies = scenario.coolingObjects.filter(isSupplyObject);
  const returns = scenario.coolingObjects.filter((object) => isReturnObject(object) || object.returnMode !== "none");
  const cduResidualHeatKw = scenario.coolingObjects
    .filter((object) => object.enabled && object.type === "cdu")
    .reduce((sum, object) => sum + (object.residualHeatKw ?? 0), 0);
  const rackBounds = scenario.racks.map(rackToBounds);
  const containmentBounds = scenario.containmentObjects.filter((object) => object.enabled).map(containmentToBounds);

  for (let index = 0; index < cellCount; index += 1) {
    const center = cellCenter(index, grid);
    let temperature = settings.ambientTemperatureC + (center.y / scenario.room.height) * 1.15;
    let vector = { x: 0, y: 0, z: 0 };

    for (const supply of supplies) {
      const barrierFactor = containmentBarrierFactor(supply.position, center, scenario.containmentObjects, settings);
      const proximity = influence(center, supply.position, 5.5);
      const direction = normalize(supply.direction);
      const verticalBoost = supply.type === "floor-perforated-tile" ? { x: 0, y: 0.45, z: 0 } : { x: 0, y: 0, z: 0 };
      const airflowStrength = (supply.airflowLps / 700) * proximity * barrierFactor;
      vector = add(vector, scale(add(direction, verticalBoost), airflowStrength));
      temperature -=
        Math.max(0, settings.ambientTemperatureC - supply.supplyTemperatureC) *
        proximity *
        (0.14 + supply.airflowLps / 5200 + supply.coolingCapacityKw / 260) *
        barrierFactor;
    }

    for (const returnObject of returns) {
      const returnPoint = returnPosition(returnObject, scenario.room.height);
      const proximity = influence(center, returnPoint, 7);
      vector = add(vector, scale(normalize(subtract(returnPoint, center)), (returnObject.airflowLps / 850) * proximity));
    }

    for (let rackIndex = 0; rackIndex < scenario.racks.length; rackIndex += 1) {
      const rack = scenario.racks[rackIndex];
      const residualKw = residualAirHeatKw(rack.heatLoadKw, rack.liquidCaptureRatio, rack.coolingMode);
      const hotPoint = rackHotExhaustPoint(rack);
      const barrierFactor = containmentBarrierFactor(hotPoint, center, scenario.containmentObjects, settings);
      const proximity = influence(center, hotPoint, 3.4);
      const footprintBoost = pointInsideBounds(center, rackBounds[rackIndex]) ? 1.4 : 1;
      temperature += residualKw * proximity * 0.54 * footprintBoost * barrierFactor;
      temperature += residualKw * Math.max(0, center.y - 1.4) * 0.035 * proximity;
      vector = add(vector, scale(rackExhaustVector(rack), residualKw * proximity * 0.028));
      vector = add(vector, scale({ x: 0, y: 1, z: 0 }, residualKw * proximity * 0.012));
    }

    for (const cdu of scenario.coolingObjects.filter((object) => object.enabled && object.type === "cdu")) {
      const proximity = influence(center, cdu.position, 2.8);
      temperature += (cdu.residualHeatKw ?? 0) * proximity * 0.48;
      vector = add(vector, scale(normalize(cdu.direction), (cdu.airflowLps / 1200) * proximity));
    }

    const nearestSupply = nearestObject(center, supplies);
    if (nearestSupply && hasObstacleBetween(nearestSupply.position, center, rackBounds, containmentBounds)) {
      vector = scale(vector, 0.42);
      temperature += 0.45;
    }

    baseTemperature[index] = clamp(temperature, 8, 65);
    vectors[index] = vectorMagnitude(vector) < 0.01 ? { x: 0, y: 0, z: 0 } : vector;
  }

  const temperatureFieldC = diffuseTemperatureField(baseTemperature, grid, scenario.containmentObjects, settings);
  const rackInlets = scenario.racks.map((rack) => estimateRackInlet(rack, temperatureFieldC, vectors, grid, settings));
  const totalCoolingCapacityKw = supplies.reduce((sum, object) => sum + object.coolingCapacityKw, 0);
  const totalAirHeatKw = totalResidualAirHeatKw(scenario.racks, cduResidualHeatKw);
  const warnings = generateWarnings(scenario, rackInlets, totalAirHeatKw, totalCoolingCapacityKw);
  const criticalWarnings = warnings.filter((warning) => warning.severity === "critical");
  const maxRackInletTemperatureC = rackInlets.length ? Math.max(...rackInlets.map((rack) => rack.inletTemperatureC)) : settings.ambientTemperatureC;
  const averageRackInletTemperatureC = rackInlets.length
    ? rackInlets.reduce((sum, rack) => sum + rack.inletTemperatureC, 0) / rackInlets.length
    : settings.ambientTemperatureC;
  const elapsedMs = Math.max(1, performance.now() - startedAt);

  return {
    disclaimer: AIRPATH_DISCLAIMER,
    grid,
    temperatureFieldC,
    vectorField: vectors,
    rackInlets,
    warnings,
    criticalWarnings,
    metrics: {
      maxRackInletTemperatureC: round(maxRackInletTemperatureC, 1),
      averageRackInletTemperatureC: round(averageRackInletTemperatureC, 1),
      hotspotCount: rackInlets.filter((rack) => rack.risk === "critical").length,
      coolingCapacityMarginKw: round(totalCoolingCapacityKw - totalAirHeatKw, 1),
      warningCount: warnings.length,
      criticalWarningCount: criticalWarnings.length,
      totalResidualAirHeatKw: round(totalAirHeatKw, 1),
      totalCoolingCapacityKw: round(totalCoolingCapacityKw, 1)
    },
    settings,
    elapsedMs: round(elapsedMs, 1),
    iterationCount: settings.iterations
  };
}

export function createGrid(width: number, depth: number, height: number, resolution: SimulationSettings["gridResolution"]): GridShape {
  const targetAcross = resolution === "coarse" ? 13 : resolution === "medium" ? 20 : 28;
  const cellSizeM = Math.max(0.35, Math.max(width, depth) / targetAcross);
  return {
    nx: Math.max(4, Math.ceil(width / cellSizeM)),
    ny: Math.max(4, Math.ceil(height / cellSizeM)),
    nz: Math.max(4, Math.ceil(depth / cellSizeM)),
    cellSizeM
  };
}

export function sampleTemperatureField(field: number[], grid: GridShape, point: Vector3): number {
  return field[cellIndexForPoint(point, grid)] ?? field[0] ?? 24;
}

export function sampleVectorField(field: Vector3[], grid: GridShape, point: Vector3): Vector3 {
  return field[cellIndexForPoint(point, grid)] ?? { x: 0, y: 0, z: 0 };
}

export function cellCenter(index: number, grid: GridShape): Vector3 {
  const xy = grid.nx * grid.ny;
  const z = Math.floor(index / xy);
  const remainder = index - z * xy;
  const y = Math.floor(remainder / grid.nx);
  const x = remainder - y * grid.nx;
  return {
    x: (x + 0.5) * grid.cellSizeM,
    y: (y + 0.5) * grid.cellSizeM,
    z: (z + 0.5) * grid.cellSizeM
  };
}

export function gridIndex(x: number, y: number, z: number, grid: GridShape): number {
  const cx = clamp(Math.floor(x), 0, grid.nx - 1);
  const cy = clamp(Math.floor(y), 0, grid.ny - 1);
  const cz = clamp(Math.floor(z), 0, grid.nz - 1);
  return cz * grid.nx * grid.ny + cy * grid.nx + cx;
}

function diffuseTemperatureField(
  baseTemperature: number[],
  grid: GridShape,
  containmentObjects: ContainmentObject[],
  settings: SimulationSettings
): number[] {
  let current = [...baseTemperature];
  const iterations = settings.mode === "preview" ? Math.min(14, settings.iterations) : settings.iterations;
  const diffusion = 0.055 + settings.airflowMixingFactor * 0.09;
  const offsets = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1]
  ];
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const next = [...current];
    for (let z = 0; z < grid.nz; z += 1) {
      for (let y = 0; y < grid.ny; y += 1) {
        for (let x = 0; x < grid.nx; x += 1) {
          const index = gridIndex(x, y, z, grid);
          const center = cellCenter(index, grid);
          let weightedSum = 0;
          let weightTotal = 0;
          for (const [dx, dy, dz] of offsets) {
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;
            if (nx < 0 || ny < 0 || nz < 0 || nx >= grid.nx || ny >= grid.ny || nz >= grid.nz) continue;
            const neighborIndex = gridIndex(nx, ny, nz, grid);
            const neighborCenter = cellCenter(neighborIndex, grid);
            const barrierFactor = containmentBarrierFactor(center, neighborCenter, containmentObjects, settings);
            weightedSum += current[neighborIndex] * barrierFactor;
            weightTotal += barrierFactor;
          }
          if (weightTotal > 0) {
            const neighborAverage = weightedSum / weightTotal;
            next[index] = current[index] * (1 - diffusion) + neighborAverage * diffusion + (baseTemperature[index] - current[index]) * 0.025;
          }
        }
      }
    }
    current = next;
  }
  return current.map((value) => round(value, 2));
}

function estimateRackInlet(
  rack: Rack,
  temperatureFieldC: number[],
  vectorField: Vector3[],
  grid: GridShape,
  settings: SimulationSettings
): RackInletResult {
  const front = orientationVector(rack.orientation);
  const offset = rackFaceOffset(rack, front);
  const samplePoint = {
    x: rack.position.x + front.x * (offset + 0.35),
    y: Math.min(rack.size.height * 0.55, rack.position.y + 0.25),
    z: rack.position.z + front.z * (offset + 0.35)
  };
  const temperature = sampleTemperatureField(temperatureFieldC, grid, samplePoint);
  const localVector = sampleVectorField(vectorField, grid, samplePoint);
  const airflowCoverage = vectorMagnitude(localVector);
  const inletTemperatureC = round(temperature - Math.min(1.9, airflowCoverage * 0.22), 1);
  const risk =
    inletTemperatureC >= settings.criticalTemperatureC
      ? "critical"
      : inletTemperatureC >= settings.warningTemperatureC
        ? "warning"
        : "normal";

  return {
    rackId: rack.id,
    rackName: rack.name,
    inletTemperatureC,
    residualAirHeatKw: round(residualAirHeatKw(rack.heatLoadKw, rack.liquidCaptureRatio, rack.coolingMode), 2),
    airflowCoverage: round(airflowCoverage, 2),
    risk,
    position: samplePoint
  };
}

function generateWarnings(
  scenario: Scenario,
  rackInlets: RackInletResult[],
  totalAirHeatKw: number,
  totalCoolingCapacityKw: number
): SimulationWarning[] {
  const warnings: SimulationWarning[] = [];
  const settings = scenario.simulationSettings;

  for (const rackResult of rackInlets) {
    const rack = scenario.racks.find((candidate) => candidate.id === rackResult.rackId);
    if (!rack) continue;

    if (rackResult.inletTemperatureC >= settings.warningTemperatureC) {
      warnings.push({
        id: `warning-high-inlet-${rack.id}`,
        type: "high-rack-inlet-temperature",
        severity: rackResult.inletTemperatureC >= settings.criticalTemperatureC ? "critical" : "warning",
        label: "High rack inlet temperature",
        message: `${rack.name} inlet is ${rackResult.inletTemperatureC.toFixed(1)} C.`,
        suggestedMitigation: "Increase nearby supply airflow, improve containment, or reduce rack air-side heat load.",
        objectIds: [rack.id],
        position: rackResult.position
      });
    }

    if (rackResult.airflowCoverage < 0.22) {
      warnings.push({
        id: `warning-airflow-${rack.id}`,
        type: "poor-airflow-coverage",
        severity: "warning",
        label: "Poor airflow coverage",
        message: `${rack.name} has weak simulated inlet airflow coverage.`,
        suggestedMitigation: "Move supply closer, add a floor tile or in-row cooler, or remove downstream obstructions.",
        objectIds: [rack.id],
        position: rackResult.position
      });
    }

    const footprintArea = rack.size.width * rack.size.depth;
    if (footprintArea > 0 && rack.heatLoadKw / footprintArea > 32) {
      warnings.push({
        id: `warning-density-${rack.id}`,
        type: "rack-heat-density-too-high",
        severity: "warning",
        label: "Rack heat density high",
        message: `${rack.name} is ${round(rack.heatLoadKw / footprintArea, 1)} kW/m2.`,
        suggestedMitigation: "Spread load across adjacent racks or use liquid cooling capture for this rack class.",
        objectIds: [rack.id],
        position: rack.position
      });
    }

    if (rack.coolingMode !== "air-cooled" && rackResult.residualAirHeatKw > 10) {
      warnings.push({
        id: `warning-liquid-residual-${rack.id}`,
        type: "liquid-cooling-residual-heat-still-high",
        severity: "warning",
        label: "Liquid residual heat still high",
        message: `${rack.name} still releases ${rackResult.residualAirHeatKw.toFixed(1)} kW to room air.`,
        suggestedMitigation: "Increase liquid capture ratio or add local air-side cooling around this rack.",
        objectIds: [rack.id],
        position: rack.position
      });
    }
  }

  if (totalCoolingCapacityKw - totalAirHeatKw < 0) {
    warnings.push({
      id: "warning-capacity-margin",
      type: "cooling-capacity-insufficient",
      severity: "critical",
      label: "Cooling capacity insufficient",
      message: `Air-side heat load exceeds enabled cooling capacity by ${round(totalAirHeatKw - totalCoolingCapacityKw, 1)} kW.`,
      suggestedMitigation: "Increase cooling capacity, reduce IT load, or increase liquid capture ratio.",
      objectIds: scenario.coolingObjects.map((object) => object.id),
      position: { x: scenario.room.width / 2, y: 1.2, z: scenario.room.depth / 2 }
    });
  }

  const supplyObjects = scenario.coolingObjects.filter(isSupplyObject);
  const returnObjects = scenario.coolingObjects.filter(isReturnObject);
  for (const supply of supplyObjects) {
    for (const returnObject of returnObjects) {
      if (distance(supply.position, returnObject.position) < 2.25) {
        warnings.push({
          id: `warning-short-circuit-${supply.id}-${returnObject.id}`,
          type: "supply-return-short-circuit",
          severity: "warning",
          label: "Supply-return short circuit",
          message: `${supply.name} is close to ${returnObject.name}.`,
          suggestedMitigation: "Separate supply and return paths or redirect discharge toward rack inlets.",
          objectIds: [supply.id, returnObject.id],
          position: midpoint(supply.position, returnObject.position)
        });
      }
    }
  }

  const totalSupplyAirflow = supplyObjects.reduce((sum, object) => sum + object.airflowLps, 0);
  const totalReturnAirflow = returnObjects.reduce((sum, object) => sum + object.airflowLps, 0);
  if (returnObjects.length === 0 || totalReturnAirflow < totalSupplyAirflow * 0.45) {
    warnings.push({
      id: "warning-return-path",
      type: "return-path-weak",
      severity: "warning",
      label: "Return path weak",
      message: "Return airflow path is weak relative to enabled supply objects.",
      suggestedMitigation: "Add ceiling or wall return grilles, or define a CRAC return path.",
      objectIds: returnObjects.map((object) => object.id),
      position: { x: scenario.room.width * 0.5, y: scenario.room.height - 0.3, z: scenario.room.depth * 0.75 }
    });
  }

  const highDensityHeat = scenario.racks.reduce((sum, rack) => sum + rack.heatLoadKw, 0);
  const hasContainment = scenario.containmentObjects.some((object) => object.enabled);
  const averageInlet = rackInlets.length
    ? rackInlets.reduce((sum, rack) => sum + rack.inletTemperatureC, 0) / rackInlets.length
    : settings.ambientTemperatureC;
  if (!hasContainment && highDensityHeat > 85) {
    warnings.push({
      id: "warning-containment-gap",
      type: "containment-gap-detected",
      severity: "warning",
      label: "Containment gap detected",
      message: "High rack load is modeled without active aisle containment.",
      suggestedMitigation: "Auto-generate cold or hot aisle containment for the rack rows.",
      objectIds: scenario.racks.map((rack) => rack.id),
      position: { x: scenario.room.width * 0.45, y: 1.5, z: scenario.room.depth * 0.55 }
    });
  }

  if (!hasContainment && averageInlet > settings.ambientTemperatureC + 2.4) {
    warnings.push({
      id: "warning-recirculation",
      type: "hot-air-recirculation-risk",
      severity: "warning",
      label: "Hot air recirculation risk",
      message: "Average rack inlet temperature indicates possible hot/cold mixing.",
      suggestedMitigation: "Use containment, improve return path, or direct supply toward rack fronts.",
      objectIds: scenario.racks.map((rack) => rack.id),
      position: { x: scenario.room.width * 0.5, y: 1.3, z: scenario.room.depth * 0.5 }
    });
  }

  return warnings;
}

function containmentBarrierFactor(
  from: Vector3,
  to: Vector3,
  containmentObjects: ContainmentObject[],
  settings: Pick<SimulationSettings, "containmentEffectiveness">
): number {
  const blocked = containmentObjects.some((object) => object.enabled && lineIntersectsBounds(from, to, containmentToBounds(object)));
  return blocked ? 1 - settings.containmentEffectiveness : 1;
}

function hasObstacleBetween(from: Vector3, to: Vector3, rackBounds: Bounds[], containmentBounds: Bounds[]): boolean {
  return [...rackBounds, ...containmentBounds].some((bounds) => !pointInsideBounds(from, bounds) && !pointInsideBounds(to, bounds) && lineIntersectsBounds(from, to, bounds));
}

function nearestObject(point: Vector3, objects: CoolingObject[]): CoolingObject | undefined {
  let nearest: CoolingObject | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const object of objects) {
    const currentDistance = distance(point, object.position);
    if (currentDistance < nearestDistance) {
      nearest = object;
      nearestDistance = currentDistance;
    }
  }
  return nearest;
}

function rackToBounds(rack: Rack): Bounds {
  return {
    minX: rack.position.x - rack.size.width / 2,
    maxX: rack.position.x + rack.size.width / 2,
    minY: 0,
    maxY: rack.size.height,
    minZ: rack.position.z - rack.size.depth / 2,
    maxZ: rack.position.z + rack.size.depth / 2
  };
}

function containmentToBounds(object: ContainmentObject): Bounds {
  return {
    minX: object.position.x - object.size.width / 2,
    maxX: object.position.x + object.size.width / 2,
    minY: object.position.y - object.size.height / 2,
    maxY: object.position.y + object.size.height / 2,
    minZ: object.position.z - object.size.depth / 2,
    maxZ: object.position.z + object.size.depth / 2
  };
}

function returnPosition(object: CoolingObject, roomHeight: number): Vector3 {
  if (object.type === "crac-crah") {
    return { x: object.position.x, y: Math.min(roomHeight - 0.35, object.position.y + 1.2), z: object.position.z };
  }
  return object.position;
}

function rackHotExhaustPoint(rack: Rack): Vector3 {
  const exhaust = scale(orientationVector(rack.orientation), -1);
  const offset = rackFaceOffset(rack, exhaust);
  return {
    x: rack.position.x + exhaust.x * (offset + 0.2),
    y: rack.size.height * 0.62,
    z: rack.position.z + exhaust.z * (offset + 0.2)
  };
}

function rackFaceOffset(rack: Rack, direction: Vector3): number {
  return Math.abs(direction.x) > Math.abs(direction.z) ? rack.size.width / 2 : rack.size.depth / 2;
}

function rackExhaustVector(rack: Rack): Vector3 {
  return scale(orientationVector(rack.orientation), -1);
}

function cellIndexForPoint(point: Vector3, grid: GridShape): number {
  return gridIndex(point.x / grid.cellSizeM, point.y / grid.cellSizeM, point.z / grid.cellSizeM, grid);
}

function lineIntersectsBounds(from: Vector3, to: Vector3, bounds: Bounds): boolean {
  const direction = subtract(to, from);
  let tMin = 0;
  let tMax = 1;
  for (const axis of ["x", "y", "z"] as const) {
    const min = axis === "x" ? bounds.minX : axis === "y" ? bounds.minY : bounds.minZ;
    const max = axis === "x" ? bounds.maxX : axis === "y" ? bounds.maxY : bounds.maxZ;
    const origin = from[axis];
    const delta = direction[axis];
    if (Math.abs(delta) < 1e-6) {
      if (origin < min || origin > max) return false;
    } else {
      const inverse = 1 / delta;
      let t1 = (min - origin) * inverse;
      let t2 = (max - origin) * inverse;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);
      if (tMin > tMax) return false;
    }
  }
  return true;
}

function pointInsideBounds(point: Vector3, bounds: Bounds): boolean {
  return (
    point.x >= bounds.minX &&
    point.x <= bounds.maxX &&
    point.y >= bounds.minY &&
    point.y <= bounds.maxY &&
    point.z >= bounds.minZ &&
    point.z <= bounds.maxZ
  );
}

function influence(a: Vector3, b: Vector3, radius: number): number {
  const d = distance(a, b);
  if (d > radius) return 0;
  return Math.exp(-(d * d) / (2 * radius));
}

function midpoint(a: Vector3, b: Vector3): Vector3 {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
}

function add(a: Vector3, b: Vector3): Vector3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtract(a: Vector3, b: Vector3): Vector3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(vector: Vector3, scalar: number): Vector3 {
  return { x: vector.x * scalar, y: vector.y * scalar, z: vector.z * scalar };
}

function normalize(vector: Vector3): Vector3 {
  const magnitude = vectorMagnitude(vector);
  return magnitude < 1e-6 ? { x: 0, y: 0, z: 0 } : scale(vector, 1 / magnitude);
}

function distance(a: Vector3, b: Vector3): number {
  return vectorMagnitude(subtract(a, b));
}

function vectorMagnitude(vector: Vector3): number {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

function round(value: number, digits = 1): number {
  const scaleFactor = 10 ** digits;
  return Math.round(value * scaleFactor) / scaleFactor;
}
