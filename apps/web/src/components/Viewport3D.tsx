import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Edges, Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  type ContainmentObject,
  type CoolingObject,
  type Rack,
  type Vector3,
  generateRackArray,
  isReturnObject,
  isSupplyObject,
  orientationVector
} from "@airpath/scenario-schema";
import { cellCenter, sampleVectorField, type SimulationResult } from "@airpath/solver-core";
import { useAirPathStore } from "../store";

export function Viewport3D() {
  const scenario = useAirPathStore((state) => state.scenario);
  const result = useAirPathStore((state) => state.result);
  const selectedIds = useAirPathStore((state) => state.selectedIds);
  const selectObject = useAirPathStore((state) => state.selectObject);
  const clearSelection = useAirPathStore((state) => state.clearSelection);
  const viewMode = useAirPathStore((state) => state.viewMode);
  const showGrid = useAirPathStore((state) => state.showGrid);
  const rackDraft = useAirPathStore((state) => state.rackDraft);
  const activeStep = useAirPathStore((state) => state.activeStep);
  const focusedPoint = useAirPathStore((state) => state.focusedPoint);
  const particleDensity = useAirPathStore((state) => state.particleDensity);
  const particleSpeed = useAirPathStore((state) => state.particleSpeed);
  const focusWarning = useAirPathStore((state) => state.focusWarning);

  const showThermal = viewMode === "thermal" || viewMode === "combined" || viewMode === "slice" || viewMode === "report";
  const showAirflow = viewMode === "airflow" || viewMode === "combined";
  const showGhost = activeStep === "racks";

  return (
    <Canvas
      shadows
      camera={{ position: [scenario.room.width * 0.86, scenario.room.height * 1.45, scenario.room.depth * 1.22], fov: 46 }}
      onPointerMissed={clearSelection}
      data-testid="three-canvas"
    >
      <color attach="background" args={["#070A0E"]} />
      <ambientLight intensity={0.42} />
      <directionalLight position={[scenario.room.width * 0.4, scenario.room.height * 2, scenario.room.depth * 0.25]} intensity={1.5} castShadow />
      <Room room={scenario.room} showGrid={showGrid} />
      {showThermal && <ThermalSlice result={result} />}
      {scenario.racks.map((rack) => (
        <RackMesh
          key={rack.id}
          rack={rack}
          selected={selectedIds.includes(rack.id)}
          inletTemp={result.rackInlets.find((inlet) => inlet.rackId === rack.id)?.inletTemperatureC}
          onSelect={(event) => selectObject(rack.id, event.nativeEvent.shiftKey)}
          onLabelSelect={(multi) => selectObject(rack.id, multi)}
        />
      ))}
      {showGhost && <GhostRackPreview racks={generateRackArray(rackDraft)} roomWidth={scenario.room.width} roomDepth={scenario.room.depth} />}
      {scenario.coolingObjects.map((object) => (
        <CoolingMesh key={object.id} object={object} selected={selectedIds.includes(object.id)} onSelect={(event) => selectObject(object.id, event.nativeEvent.shiftKey)} />
      ))}
      {scenario.containmentObjects.map((object) => (
        <ContainmentMesh key={object.id} object={object} selected={selectedIds.includes(object.id)} onSelect={(event) => selectObject(object.id, event.nativeEvent.shiftKey)} />
      ))}
      {showAirflow && <AirflowStreamlines result={result} density={particleDensity} speed={particleSpeed} />}
      {result.warnings.map((warning) => (
        <Html key={warning.id} position={[warning.position.x, warning.position.y + 0.25, warning.position.z]} center zIndexRange={[20, 0]}>
          <button type="button" className={`warning-pin ${warning.severity}`} onClick={() => focusWarning(warning)} data-testid="warning-pin">
            {warning.severity === "critical" ? "!" : "?"}
            <span>{warning.label}</span>
          </button>
        </Html>
      ))}
      <CameraFocus point={focusedPoint} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} target={[scenario.room.width / 2, 1.1, scenario.room.depth / 2]} />
    </Canvas>
  );
}

function Room({ room, showGrid }: { room: { width: number; depth: number; height: number }; showGrid: boolean }) {
  return (
    <group>
      {showGrid && (
        <gridHelper
          args={[Math.max(room.width, room.depth), Math.ceil(Math.max(room.width, room.depth) * 2), "#33475B", "#243241"]}
          position={[room.width / 2, 0, room.depth / 2]}
        />
      )}
      <mesh position={[room.width / 2, room.height / 2, room.depth / 2]}>
        <boxGeometry args={[room.width, room.height, room.depth]} />
        <meshBasicMaterial color="#16202B" transparent opacity={0.045} depthWrite={false} />
        <Edges color="#33475B" />
      </mesh>
    </group>
  );
}

function RackMesh({
  rack,
  selected,
  inletTemp,
  onSelect,
  onLabelSelect
}: {
  rack: Rack;
  selected: boolean;
  inletTemp?: number;
  onSelect: (event: ThreeEvent<MouseEvent>) => void;
  onLabelSelect: (multi: boolean) => void;
}) {
  const front = orientationVector(rack.orientation);
  const riskColor = thermalColor(inletTemp ?? 24, 24, 27, 32);
  const markerPosition: [number, number, number] = [
    front.x * (rack.size.width / 2 + 0.012),
    0,
    front.z * (rack.size.depth / 2 + 0.012)
  ];
  const markerSize: [number, number, number] =
    Math.abs(front.x) > 0 ? [0.03, rack.size.height * 0.78, rack.size.depth * 0.55] : [rack.size.width * 0.55, rack.size.height * 0.78, 0.03];

  return (
    <group position={[rack.position.x, rack.size.height / 2, rack.position.z]} onClick={onSelect}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[rack.size.width, rack.size.height, rack.size.depth]} />
        <meshStandardMaterial color={riskColor} roughness={0.62} metalness={0.08} emissive={selected ? "#38BDF8" : "#000000"} emissiveIntensity={selected ? 0.22 : 0} />
        <Edges color={selected ? "#38BDF8" : "#465666"} />
      </mesh>
      <mesh position={markerPosition}>
        <boxGeometry args={markerSize} />
        <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.18} />
      </mesh>
      <Html position={[0, rack.size.height / 2 + 0.22, 0]} center>
        <button
          type="button"
          className={`object-label ${selected ? "selected" : ""}`}
          data-testid="rack-label"
          onClick={(event) => {
            event.stopPropagation();
            onLabelSelect(event.shiftKey);
          }}
        >
          {rack.name.replace("Rack Array ", "R")}
        </button>
      </Html>
    </group>
  );
}

function GhostRackPreview({ racks, roomWidth, roomDepth }: { racks: Rack[]; roomWidth: number; roomDepth: number }) {
  return (
    <group>
      {racks.map((rack) => {
        const outOfRoom =
          rack.position.x - rack.size.width / 2 < 0 ||
          rack.position.z - rack.size.depth / 2 < 0 ||
          rack.position.x + rack.size.width / 2 > roomWidth ||
          rack.position.z + rack.size.depth / 2 > roomDepth;
        return (
          <mesh key={`ghost-${rack.id}`} position={[rack.position.x, rack.size.height / 2, rack.position.z]}>
            <boxGeometry args={[rack.size.width, rack.size.height, rack.size.depth]} />
            <meshBasicMaterial color={outOfRoom ? "#F59E0B" : "#38BDF8"} wireframe transparent opacity={0.72} />
          </mesh>
        );
      })}
    </group>
  );
}

function CoolingMesh({
  object,
  selected,
  onSelect
}: {
  object: CoolingObject;
  selected: boolean;
  onSelect: (event: ThreeEvent<MouseEvent>) => void;
}) {
  const isReturn = isReturnObject(object) || object.type.includes("return");
  const color = object.type === "cdu" ? "#94A3B8" : isReturn ? "#F97316" : "#38BDF8";
  const arrow = useMemo(() => {
    const direction = new THREE.Vector3(object.direction.x, object.direction.y, object.direction.z);
    if (direction.lengthSq() < 0.001) direction.set(0, 1, 0);
    direction.normalize();
    return new THREE.ArrowHelper(direction, new THREE.Vector3(0, 0, 0), 0.85, color, 0.22, 0.12);
  }, [object.direction.x, object.direction.y, object.direction.z, color]);

  return (
    <group position={[object.position.x, object.position.y, object.position.z]} onClick={onSelect}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[object.size.width, object.size.height, object.size.depth]} />
        <meshStandardMaterial color={color} transparent opacity={object.enabled ? 0.78 : 0.28} emissive={selected ? "#38BDF8" : color} emissiveIntensity={selected ? 0.22 : 0.06} />
        <Edges color={selected ? "#38BDF8" : color} />
      </mesh>
      <primitive object={arrow} />
      <Html position={[0, object.size.height / 2 + 0.16, 0]} center style={{ pointerEvents: "none" }}>
        <span className={`object-label ${isReturn ? "return" : "supply"}`}>{object.name}</span>
      </Html>
    </group>
  );
}

function ContainmentMesh({
  object,
  selected,
  onSelect
}: {
  object: ContainmentObject;
  selected: boolean;
  onSelect: (event: ThreeEvent<MouseEvent>) => void;
}) {
  const isCold = object.type.includes("cold");
  const color = isCold ? "#38BDF8" : "#F97316";
  return (
    <group position={[object.position.x, object.position.y, object.position.z]} onClick={onSelect}>
      <mesh>
        <boxGeometry args={[object.size.width, object.size.height, object.size.depth]} />
        <meshStandardMaterial color={color} transparent opacity={object.enabled ? 0.2 : 0.08} depthWrite={false} />
        <Edges color={selected ? "#E5EDF5" : color} />
      </mesh>
      <Html position={[0, object.size.height / 2 + 0.14, 0]} center style={{ pointerEvents: "none" }}>
        <span className="object-label containment">{object.name}</span>
      </Html>
    </group>
  );
}

function ThermalSlice({ result }: { result: SimulationResult }) {
  const y = Math.max(0, Math.floor(result.grid.ny * 0.32));
  const cells = useMemo(() => {
    const output: Array<{ key: string; position: [number, number, number]; color: string; opacity: number }> = [];
    for (let z = 0; z < result.grid.nz; z += 1) {
      for (let x = 0; x < result.grid.nx; x += 1) {
        const index = z * result.grid.nx * result.grid.ny + y * result.grid.nx + x;
        const temp = result.temperatureFieldC[index] ?? result.settings.ambientTemperatureC;
        output.push({
          key: `${x}-${z}`,
          position: [(x + 0.5) * result.grid.cellSizeM, 0.035, (z + 0.5) * result.grid.cellSizeM],
          color: thermalColor(temp, result.settings.ambientTemperatureC, result.settings.warningTemperatureC, result.settings.criticalTemperatureC),
          opacity: clamp((temp - result.settings.ambientTemperatureC + 3) / 15, 0.18, 0.58)
        });
      }
    }
    return output;
  }, [result, y]);

  return (
    <group>
      {cells.map((cell) => (
        <mesh key={cell.key} position={cell.position}>
          <boxGeometry args={[result.grid.cellSizeM * 0.95, 0.015, result.grid.cellSizeM * 0.95]} />
          <meshBasicMaterial color={cell.color} transparent opacity={cell.opacity} depthWrite={false} />
        </mesh>
      ))}
      <Html position={[0.7, 0.15, 0.7]} transform={false} style={{ pointerEvents: "none" }}>
        <div className="heat-legend" data-testid="heat-legend">
          <strong>Thermal slice C</strong>
          <span className="legend-bar" />
          <small>Cold · Neutral · Warm · Hot · Critical</small>
        </div>
      </Html>
    </group>
  );
}

function AirflowStreamlines({ result, density, speed }: { result: SimulationResult; density: number; speed: number }) {
  const paths = useMemo(() => buildStreamlines(result, density), [result, density]);
  return (
    <group>
      {paths.map((path, index) => (
        <Line
          key={`line-${index}`}
          points={path.map((point) => [point.x, point.y, point.z])}
          color={pathColor(path)}
          transparent
          opacity={0.58}
          lineWidth={1.15}
        />
      ))}
      {paths.slice(0, Math.min(paths.length, Math.ceil(density / 2))).map((path, index) => (
        <FlowParticle key={`particle-${index}`} path={path} speed={speed} offset={index / Math.max(paths.length, 1)} />
      ))}
    </group>
  );
}

function FlowParticle({ path, speed, offset }: { path: Vector3[]; speed: number; offset: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current || path.length === 0) return;
    const t = (clock.elapsedTime * speed * 0.35 + offset) % 1;
    const point = path[Math.floor(t * (path.length - 1))] ?? path[0];
    ref.current.position.set(point.x, point.y, point.z);
  });
  if (path.length < 2) return null;
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.035, 10, 10]} />
      <meshBasicMaterial color={pathColor(path)} transparent opacity={0.86} />
    </mesh>
  );
}

function CameraFocus({ point }: { point?: Vector3 }) {
  const { camera } = useThree();
  useEffect(() => {
    if (!point) return;
    camera.position.set(point.x + 3.2, point.y + 2.4, point.z + 3.2);
    camera.lookAt(point.x, point.y, point.z);
  }, [camera, point]);
  return null;
}

function buildStreamlines(result: SimulationResult, density: number): Vector3[][] {
  const paths: Vector3[][] = [];
  const cellCount = result.vectorField.length;
  const step = Math.max(1, Math.floor(cellCount / density));
  for (let index = 0; index < cellCount && paths.length < density; index += step) {
    const start = cellCenter(index, result.grid);
    if (start.y < 0.2 || start.y > result.grid.ny * result.grid.cellSizeM - 0.2) continue;
    const path = tracePath(start, result);
    if (path.length > 2) paths.push(path);
  }
  return paths;
}

function tracePath(start: Vector3, result: SimulationResult): Vector3[] {
  const path = [start];
  let current = start;
  const maxX = result.grid.nx * result.grid.cellSizeM;
  const maxY = result.grid.ny * result.grid.cellSizeM;
  const maxZ = result.grid.nz * result.grid.cellSizeM;
  for (let i = 0; i < 12; i += 1) {
    const vector = sampleVectorField(result.vectorField, result.grid, current);
    const magnitude = Math.hypot(vector.x, vector.y, vector.z);
    if (magnitude < 0.025) break;
    const step = result.grid.cellSizeM * 0.62;
    current = {
      x: clamp(current.x + (vector.x / magnitude) * step, 0.05, maxX - 0.05),
      y: clamp(current.y + (vector.y / magnitude) * step, 0.05, maxY - 0.05),
      z: clamp(current.z + (vector.z / magnitude) * step, 0.05, maxZ - 0.05)
    };
    path.push(current);
  }
  return path;
}

function pathColor(path: Vector3[]): string {
  const start = path[0];
  const end = path[path.length - 1];
  return end.y > start.y + 0.4 ? "#F97316" : end.y < start.y - 0.3 ? "#38BDF8" : "#CBD5E1";
}

function thermalColor(temp: number, ambient: number, warning: number, critical: number): string {
  if (temp >= critical) return "#EF4444";
  if (temp >= warning + 2) return "#F97316";
  if (temp >= warning) return "#F59E0B";
  if (temp <= ambient - 2) return "#38BDF8";
  if (temp <= ambient) return "#22D3EE";
  return "#94A3B8";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
