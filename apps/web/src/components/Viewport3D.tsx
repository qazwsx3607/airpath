import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Edges, Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  type ContainmentObject,
  type CoolingObject,
  type Rack,
  type Scenario,
  type Vector3,
  generateRackArray,
  isReturnObject,
  isSupplyObject,
  orientationVector
} from "@airpath/scenario-schema";
import { cellCenter, sampleVectorField, type SimulationResult, type SimulationWarning, type SimulationWarningSeverity } from "@airpath/solver-core";
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
  const updateRackPositionPreview = useAirPathStore((state) => state.updateRackPositionPreview);
  const commitScenarioHistory = useAirPathStore((state) => state.commitScenarioHistory);
  const focusWarningCluster = useAirPathStore((state) => state.focusWarningCluster);
  const dragRef = useRef<RackDragState | null>(null);
  const [draggingRackId, setDraggingRackId] = useState<string | undefined>();

  const showThermal = viewMode === "thermal" || viewMode === "combined" || viewMode === "slice" || viewMode === "report";
  const showAirflow = viewMode === "airflow" || viewMode === "combined";
  const showGhost = activeStep === "racks";
  const warningClusters = useMemo(() => clusterWarnings(result.warnings), [result.warnings]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || drag.source !== "screen") return;
      const dx = (event.clientX - drag.startClient.x) * 0.018;
      const dz = (event.clientY - drag.startClient.y) * 0.018;
      updateRackPositionPreview(drag.rackId, drag.startRackPosition.x + dx, drag.startRackPosition.z + dz);
    }

    function handlePointerUp() {
      const drag = dragRef.current;
      if (!drag) return;
      commitScenarioHistory(drag.previousScenario, `Dragged ${drag.rackName} on the floor plane.`);
      dragRef.current = null;
      setDraggingRackId(undefined);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [commitScenarioHistory, updateRackPositionPreview]);

  function beginRackScreenDrag(rack: Rack, clientX: number, clientY: number) {
    dragRef.current = {
      source: "screen",
      rackId: rack.id,
      rackName: rack.name,
      previousScenario: scenario,
      startRackPosition: { x: rack.position.x, z: rack.position.z },
      startClient: { x: clientX, y: clientY }
    };
    setDraggingRackId(rack.id);
  }

  function beginRackViewportDrag(rack: Rack, event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    const target = event.target as Element & { setPointerCapture?: (pointerId: number) => void };
    target.setPointerCapture?.(event.pointerId);
    selectObject(rack.id, event.nativeEvent.shiftKey);
    dragRef.current = {
      source: "viewport",
      rackId: rack.id,
      rackName: rack.name,
      previousScenario: scenario,
      startRackPosition: { x: rack.position.x, z: rack.position.z },
      startPoint: { x: event.point.x, z: event.point.z },
      startClient: { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY }
    };
    setDraggingRackId(rack.id);
  }

  function updateRackViewportDrag(rack: Rack, event: ThreeEvent<PointerEvent>) {
    const drag = dragRef.current;
    if (!drag || drag.rackId !== rack.id || drag.source !== "viewport" || !drag.startPoint) return;
    event.stopPropagation();
    updateRackPositionPreview(
      rack.id,
      drag.startRackPosition.x + (event.point.x - drag.startPoint.x),
      drag.startRackPosition.z + (event.point.z - drag.startPoint.z)
    );
  }

  function endRackViewportDrag(rack: Rack, event: ThreeEvent<PointerEvent>) {
    const drag = dragRef.current;
    if (!drag || drag.rackId !== rack.id || drag.source !== "viewport") return;
    event.stopPropagation();
    const target = event.target as Element & { releasePointerCapture?: (pointerId: number) => void };
    target.releasePointerCapture?.(event.pointerId);
    commitScenarioHistory(drag.previousScenario, `Dragged ${drag.rackName} on the floor plane.`);
    dragRef.current = null;
    setDraggingRackId(undefined);
  }

  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true, antialias: true }}
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
          onLabelDragStart={(event) => beginRackScreenDrag(rack, event.clientX, event.clientY)}
          onViewportDragStart={(event) => beginRackViewportDrag(rack, event)}
          onViewportDragMove={(event) => updateRackViewportDrag(rack, event)}
          onViewportDragEnd={(event) => endRackViewportDrag(rack, event)}
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
      {warningClusters.map((cluster) => (
        <Html key={cluster.id} position={[cluster.position.x, cluster.position.y + 0.25, cluster.position.z]} center zIndexRange={[20, 0]}>
          <button
            type="button"
            className={`warning-pin ${cluster.severity} ${cluster.warnings.length > 1 ? "cluster" : ""}`}
            onClick={() => (cluster.warnings.length > 1 ? focusWarningCluster(cluster.warnings) : focusWarning(cluster.warnings[0]))}
            data-testid={cluster.warnings.length > 1 ? "warning-cluster" : "warning-pin"}
          >
            {cluster.severity === "critical" ? "!" : "?"}
            <span>{cluster.warnings.length > 1 ? `${cluster.warnings.length} ${cluster.label}` : cluster.label}</span>
          </button>
        </Html>
      ))}
      <CameraFocus point={focusedPoint} />
      <OrbitControls makeDefault enabled={!draggingRackId} enableDamping dampingFactor={0.08} target={[scenario.room.width / 2, 1.1, scenario.room.depth / 2]} />
    </Canvas>
  );
}

interface RackDragState {
  source: "viewport" | "screen";
  rackId: string;
  rackName: string;
  previousScenario: Scenario;
  startRackPosition: { x: number; z: number };
  startClient: { x: number; y: number };
  startPoint?: { x: number; z: number };
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
  onLabelSelect,
  onLabelDragStart,
  onViewportDragStart,
  onViewportDragMove,
  onViewportDragEnd
}: {
  rack: Rack;
  selected: boolean;
  inletTemp?: number;
  onSelect: (event: ThreeEvent<MouseEvent>) => void;
  onLabelSelect: (multi: boolean) => void;
  onLabelDragStart: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onViewportDragStart: (event: ThreeEvent<PointerEvent>) => void;
  onViewportDragMove: (event: ThreeEvent<PointerEvent>) => void;
  onViewportDragEnd: (event: ThreeEvent<PointerEvent>) => void;
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
    <group
      position={[rack.position.x, rack.size.height / 2, rack.position.z]}
      onClick={onSelect}
      onPointerDown={onViewportDragStart}
      onPointerMove={onViewportDragMove}
      onPointerUp={onViewportDragEnd}
    >
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
          onPointerDown={(event) => {
            event.stopPropagation();
            onLabelDragStart(event);
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
  const texture = useMemo(() => {
    const data = new Uint8Array(result.grid.nx * result.grid.nz);
    const low = result.settings.ambientTemperatureC - 3;
    const high = result.settings.criticalTemperatureC + 8;
    for (let z = 0; z < result.grid.nz; z += 1) {
      for (let x = 0; x < result.grid.nx; x += 1) {
        const index = z * result.grid.nx * result.grid.ny + y * result.grid.nx + x;
        const temp = result.temperatureFieldC[index] ?? result.settings.ambientTemperatureC;
        data[z * result.grid.nx + x] = Math.round(clamp((temp - low) / (high - low), 0, 1) * 255);
      }
    }
    const map = new THREE.DataTexture(data, result.grid.nx, result.grid.nz, THREE.RedFormat, THREE.UnsignedByteType);
    map.needsUpdate = true;
    map.magFilter = THREE.NearestFilter;
    map.minFilter = THREE.NearestFilter;
    map.wrapS = THREE.ClampToEdgeWrapping;
    map.wrapT = THREE.ClampToEdgeWrapping;
    return map;
  }, [result, y]);
  const width = result.grid.nx * result.grid.cellSizeM;
  const depth = result.grid.nz * result.grid.cellSizeM;

  return (
    <group>
      <mesh position={[width / 2, 0.036, depth / 2]} rotation={[-Math.PI / 2, 0, 0]} data-testid="shader-heatmap">
        <planeGeometry args={[width, depth, 1, 1]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          uniforms={{
            uTemperature: { value: texture },
            uOpacity: { value: 0.62 }
          }}
          vertexShader={thermalVertexShader}
          fragmentShader={thermalFragmentShader}
        />
      </mesh>
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

const thermalVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const thermalFragmentShader = `
  uniform sampler2D uTemperature;
  uniform float uOpacity;
  varying vec2 vUv;

  vec3 thermalRamp(float t) {
    vec3 cold = vec3(0.219, 0.741, 0.973);
    vec3 cool = vec3(0.133, 0.827, 0.933);
    vec3 neutral = vec3(0.580, 0.639, 0.721);
    vec3 warm = vec3(0.961, 0.620, 0.043);
    vec3 hot = vec3(0.976, 0.451, 0.086);
    vec3 critical = vec3(0.937, 0.267, 0.267);
    if (t < 0.22) return mix(cold, cool, t / 0.22);
    if (t < 0.48) return mix(cool, neutral, (t - 0.22) / 0.26);
    if (t < 0.68) return mix(neutral, warm, (t - 0.48) / 0.20);
    if (t < 0.84) return mix(warm, hot, (t - 0.68) / 0.16);
    return mix(hot, critical, (t - 0.84) / 0.16);
  }

  void main() {
    float t = texture2D(uTemperature, vUv).r;
    float alpha = mix(0.18, uOpacity, smoothstep(0.08, 1.0, t));
    gl_FragColor = vec4(thermalRamp(t), alpha);
  }
`;

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

interface WarningCluster {
  id: string;
  label: string;
  severity: SimulationWarningSeverity;
  warnings: SimulationWarning[];
  position: Vector3;
}

function clusterWarnings(warnings: SimulationWarning[]): WarningCluster[] {
  const clusters: WarningCluster[] = [];
  const maxDistanceM = 1.35;
  for (const warning of warnings) {
    const existing = clusters.find(
      (cluster) => cluster.warnings[0]?.type === warning.type && distance(cluster.position, warning.position) <= maxDistanceM
    );
    if (existing) {
      existing.warnings.push(warning);
      existing.position = averagePosition(existing.warnings.map((item) => item.position));
      existing.severity = maxSeverity(existing.warnings.map((item) => item.severity));
    } else {
      clusters.push({
        id: `cluster-${warning.id}`,
        label: warning.label,
        severity: warning.severity,
        warnings: [warning],
        position: warning.position
      });
    }
  }
  return clusters;
}

function averagePosition(points: Vector3[]): Vector3 {
  const total = points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y, z: sum.z + point.z }),
    { x: 0, y: 0, z: 0 }
  );
  return { x: total.x / points.length, y: total.y / points.length, z: total.z / points.length };
}

function maxSeverity(severities: SimulationWarningSeverity[]): SimulationWarningSeverity {
  if (severities.includes("critical")) return "critical";
  if (severities.includes("warning")) return "warning";
  return "info";
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

function distance(a: Vector3, b: Vector3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
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
