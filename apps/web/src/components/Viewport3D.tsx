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
  orientationVector,
  rackRearVector
} from "@airpath/scenario-schema";
import { cellCenter, sampleVectorField, type SimulationResult, type SimulationWarning, type SimulationWarningSeverity } from "@airpath/solver-core";
import { useAirPathStore, type SliceAxis, type ViewMode } from "../store";
import { localizeWarningLabel } from "../i18n";
import { resolveThermalScale, temperatureToColor, type ThermalDisplaySettings } from "../thermalPalette";

export function Viewport3D() {
  const scenario = useAirPathStore((state) => state.scenario);
  const result = useAirPathStore((state) => state.result);
  const selectedIds = useAirPathStore((state) => state.selectedIds);
  const selectObject = useAirPathStore((state) => state.selectObject);
  const clearSelection = useAirPathStore((state) => state.clearSelection);
  const viewMode = useAirPathStore((state) => state.viewMode);
  const language = useAirPathStore((state) => state.language);
  const editMode = useAirPathStore((state) => state.editMode);
  const showGrid = useAirPathStore((state) => state.showGrid);
  const showObjectLabels = useAirPathStore((state) => state.showObjectLabels);
  const showWarningPins = useAirPathStore((state) => state.showWarningPins);
  const showAirflowLayer = useAirPathStore((state) => state.showAirflowLayer);
  const showHeatmapLayer = useAirPathStore((state) => state.showHeatmapLayer);
  const showDimensions = useAirPathStore((state) => state.showDimensions);
  const rackDraft = useAirPathStore((state) => state.rackDraft);
  const activeStep = useAirPathStore((state) => state.activeStep);
  const rightTab = useAirPathStore((state) => state.rightTab);
  const focusedPoint = useAirPathStore((state) => state.focusedPoint);
  const particleDensity = useAirPathStore((state) => state.particleDensity);
  const particleSpeed = useAirPathStore((state) => state.particleSpeed);
  const airflowOpacity = useAirPathStore((state) => state.airflowOpacity);
  const thermalOpacity = useAirPathStore((state) => state.thermalOpacity);
  const thermalPalette = useAirPathStore((state) => state.thermalPalette);
  const thermalColorMode = useAirPathStore((state) => state.thermalColorMode);
  const thermalScaleMode = useAirPathStore((state) => state.thermalScaleMode);
  const thermalMinC = useAirPathStore((state) => state.thermalMinC);
  const thermalMaxC = useAirPathStore((state) => state.thermalMaxC);
  const thermalCriticalC = useAirPathStore((state) => state.thermalCriticalC);
  const thermalContrast = useAirPathStore((state) => state.thermalContrast);
  const colorbarPosition = useAirPathStore((state) => state.colorbarPosition);
  const sliceAxis = useAirPathStore((state) => state.sliceAxis);
  const slicePosition = useAirPathStore((state) => state.slicePosition);
  const focusWarning = useAirPathStore((state) => state.focusWarning);
  const updateRackPositionPreview = useAirPathStore((state) => state.updateRackPositionPreview);
  const commitScenarioHistory = useAirPathStore((state) => state.commitScenarioHistory);
  const focusWarningCluster = useAirPathStore((state) => state.focusWarningCluster);
  const dragRef = useRef<RackDragState | null>(null);
  const [draggingRackId, setDraggingRackId] = useState<string | undefined>();

  const showThermal = showHeatmapLayer && (viewMode === "thermal" || viewMode === "combined" || viewMode === "slice");
  const showAirflow = showAirflowLayer && (viewMode === "airflow" || viewMode === "combined");
  const showGhost = activeStep === "racks";
  const manualLabelsVisible = (viewMode === "solid" || viewMode === "combined") && showObjectLabels;
  const solidLabelsVisible = viewMode === "solid";
  const rackLabelsVisible = manualLabelsVisible || (solidLabelsVisible && activeStep === "racks");
  const warningPinsVisible = showWarningPins || rightTab === "warnings";
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
    if (editMode !== "move") return;
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
    if (editMode !== "move") return;
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
      {showDimensions && <RoomDimensions room={scenario.room} language={language} />}
      {showThermal && (
        <ThermalSlice
          result={result}
          opacity={thermalOpacity}
          axis={sliceAxis}
          positionRatio={slicePosition}
          language={language}
          thermalSettings={{
            palette: thermalPalette,
            colorMode: thermalColorMode,
            scaleMode: thermalScaleMode,
            minC: thermalMinC,
            maxC: thermalMaxC,
            criticalC: thermalCriticalC,
            contrast: thermalContrast,
            opacity: thermalOpacity,
            colorbarPosition
          }}
        />
      )}
      {scenario.racks.map((rack) => (
        <RackMesh
          key={rack.id}
          rack={rack}
          selected={selectedIds.includes(rack.id)}
          dragging={draggingRackId === rack.id}
          showLabel={rackLabelsVisible || (solidLabelsVisible && selectedIds.includes(rack.id))}
          thermalTint={showThermal}
          moveEnabled={editMode === "move"}
          inletTemp={result.rackInlets.find((inlet) => inlet.rackId === rack.id)?.inletTemperatureC}
          onSelect={(event) => editMode !== "locked" && selectObject(rack.id, event.nativeEvent.shiftKey)}
          onLabelSelect={(multi) => editMode !== "locked" && selectObject(rack.id, multi)}
          onLabelDragStart={(event) => beginRackScreenDrag(rack, event.clientX, event.clientY)}
          onViewportDragStart={(event) => beginRackViewportDrag(rack, event)}
          onViewportDragMove={(event) => updateRackViewportDrag(rack, event)}
          onViewportDragEnd={(event) => endRackViewportDrag(rack, event)}
        />
      ))}
      {showGhost && <GhostRackPreview racks={generateRackArray(rackDraft)} roomWidth={scenario.room.width} roomDepth={scenario.room.depth} />}
      {scenario.coolingObjects.map((object) => (
        <CoolingMesh
          key={object.id}
          object={object}
          selected={selectedIds.includes(object.id)}
          showLabel={manualLabelsVisible || (solidLabelsVisible && (activeStep === "cooling" || selectedIds.includes(object.id)))}
          onSelect={(event) => editMode !== "locked" && selectObject(object.id, event.nativeEvent.shiftKey)}
        />
      ))}
      {scenario.containmentObjects.map((object) => (
        <ContainmentMesh
          key={object.id}
          object={object}
          selected={selectedIds.includes(object.id)}
          showLabel={manualLabelsVisible || (solidLabelsVisible && (activeStep === "containment" || selectedIds.includes(object.id)))}
          onSelect={(event) => editMode !== "locked" && selectObject(object.id, event.nativeEvent.shiftKey)}
        />
      ))}
      {showAirflow && <AirflowStreamlines result={result} density={particleDensity} speed={particleSpeed} opacity={airflowOpacity} />}
      {warningPinsVisible && warningClusters.map((cluster) => (
        <Html key={cluster.id} position={[cluster.position.x, cluster.position.y + 0.25, cluster.position.z]} center zIndexRange={[20, 0]}>
          <button
            type="button"
            className={`warning-pin ${cluster.severity} ${cluster.warnings.length > 1 ? "cluster" : ""}`}
            onClick={() => (cluster.warnings.length > 1 ? focusWarningCluster(cluster.warnings) : focusWarning(cluster.warnings[0]))}
            data-testid={cluster.warnings.length > 1 ? "warning-cluster" : "warning-pin"}
            title={warningClusterTitle(cluster, language)}
            aria-label={warningClusterTitle(cluster, language)}
          >
            {cluster.severity === "critical" ? "!" : "?"}
            <span>{cluster.warnings.length > 1 ? cluster.warnings.length : ""}</span>
          </button>
        </Html>
      ))}
      <CameraFocus point={focusedPoint} room={scenario.room} viewMode={viewMode} />
      <OrbitControls
        makeDefault
        enabled={!draggingRackId}
        enableDamping
        dampingFactor={0.08}
        target={focusedPoint ? [focusedPoint.x, focusedPoint.y, focusedPoint.z] : [scenario.room.width / 2, 1.1, scenario.room.depth / 2]}
      />
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

function RoomDimensions({ room, language }: { room: Scenario["room"]; language: "en" | "zh" }) {
  const widthLabel = language === "zh" ? `寬 ${room.width} m` : `Width ${room.width} m`;
  const depthLabel = language === "zh" ? `深 ${room.depth} m` : `Depth ${room.depth} m`;
  const heightLabel = language === "zh" ? `高 ${room.height} m` : `Height ${room.height} m`;
  return (
    <group>
      <Html position={[room.width / 2, 0.08, 0.12]} center style={{ pointerEvents: "none" }}>
        <span className="object-label dimension-label">{widthLabel}</span>
      </Html>
      <Html position={[0.12, 0.08, room.depth / 2]} center style={{ pointerEvents: "none" }}>
        <span className="object-label dimension-label">{depthLabel}</span>
      </Html>
      <Html position={[room.width + 0.1, room.height / 2, room.depth + 0.1]} center style={{ pointerEvents: "none" }}>
        <span className="object-label dimension-label">{heightLabel}</span>
      </Html>
    </group>
  );
}

function RackMesh({
  rack,
  selected,
  dragging,
  showLabel,
  thermalTint,
  moveEnabled,
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
  dragging: boolean;
  showLabel: boolean;
  thermalTint: boolean;
  moveEnabled: boolean;
  inletTemp?: number;
  onSelect: (event: ThreeEvent<MouseEvent>) => void;
  onLabelSelect: (multi: boolean) => void;
  onLabelDragStart: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onViewportDragStart: (event: ThreeEvent<PointerEvent>) => void;
  onViewportDragMove: (event: ThreeEvent<PointerEvent>) => void;
  onViewportDragEnd: (event: ThreeEvent<PointerEvent>) => void;
}) {
  const front = orientationVector(rack.orientation);
  const rear = rackRearVector(rack);
  const riskColor = thermalColor(inletTemp ?? 24, 24, 27, 32);
  const rackColor = thermalTint ? riskColor : "#334155";
  const markerPosition: [number, number, number] = [
    front.x * (rack.size.width / 2 + 0.012),
    0,
    front.z * (rack.size.depth / 2 + 0.012)
  ];
  const markerSize: [number, number, number] =
    Math.abs(front.x) > 0 ? [0.03, rack.size.height * 0.78, rack.size.depth * 0.55] : [rack.size.width * 0.55, rack.size.height * 0.78, 0.03];
  const rearMarkerPosition: [number, number, number] = [
    rear.x * (rack.size.width / 2 + 0.014),
    0,
    rear.z * (rack.size.depth / 2 + 0.014)
  ];
  const rearMarkerSize: [number, number, number] =
    Math.abs(rear.x) > 0 ? [0.026, rack.size.height * 0.68, rack.size.depth * 0.42] : [rack.size.width * 0.42, rack.size.height * 0.68, 0.026];

  return (
    <group
      position={[rack.position.x, rack.size.height / 2, rack.position.z]}
      onClick={onSelect}
      onPointerDown={moveEnabled ? onViewportDragStart : undefined}
      onPointerMove={moveEnabled ? onViewportDragMove : undefined}
      onPointerUp={moveEnabled ? onViewportDragEnd : undefined}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[rack.size.width, rack.size.height, rack.size.depth]} />
        <meshStandardMaterial
          color={rackColor}
          roughness={0.62}
          metalness={0.08}
          emissive={selected || dragging ? "#38BDF8" : "#000000"}
          emissiveIntensity={dragging ? 0.36 : selected ? 0.22 : 0}
        />
        <Edges color={selected || dragging ? "#38BDF8" : "#465666"} />
      </mesh>
      <mesh position={markerPosition}>
        <boxGeometry args={markerSize} />
        <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={rearMarkerPosition}>
        <boxGeometry args={rearMarkerSize} />
        <meshStandardMaterial color="#F97316" emissive="#F97316" emissiveIntensity={0.16} />
      </mesh>
      {showLabel && (
        <Html position={[0, rack.size.height / 2 + 0.22, 0]} center>
          <button
            type="button"
            className={`object-label ${selected ? "selected" : ""} ${dragging ? "dragging" : ""}`}
            data-testid="rack-label"
            title="Select or drag rack"
            onClick={(event) => {
              event.stopPropagation();
              onLabelSelect(event.shiftKey);
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
              if (moveEnabled) onLabelDragStart(event);
            }}
          >
            {rack.name.replace("Rack Array ", "R")}
          </button>
        </Html>
      )}
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
  showLabel,
  onSelect
}: {
  object: CoolingObject;
  selected: boolean;
  showLabel: boolean;
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
      {showLabel && (
        <Html position={[0, object.size.height / 2 + 0.16, 0]} center style={{ pointerEvents: "none" }}>
          <span className={`object-label ${isReturn ? "return" : "supply"}`}>{object.name}</span>
        </Html>
      )}
    </group>
  );
}

function ContainmentMesh({
  object,
  selected,
  showLabel,
  onSelect
}: {
  object: ContainmentObject;
  selected: boolean;
  showLabel: boolean;
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
      {showLabel && (
        <Html position={[0, object.size.height / 2 + 0.14, 0]} center style={{ pointerEvents: "none" }}>
          <span className="object-label containment">{object.name}</span>
        </Html>
      )}
    </group>
  );
}

function ThermalSlice({
  result,
  opacity,
  axis,
  positionRatio,
  language,
  thermalSettings
}: {
  result: SimulationResult;
  opacity: number;
  axis: SliceAxis;
  positionRatio: number;
  language: "en" | "zh";
  thermalSettings: ThermalDisplaySettings;
}) {
  const slice = useMemo(() => buildThermalSlice(result, axis, positionRatio), [axis, positionRatio, result]);
  const texture = useMemo(() => {
    const data = new Uint8Array(slice.widthCells * slice.heightCells * 4);
    const scale = resolveThermalScale(result.temperatureFieldC, thermalSettings, result.settings.ambientTemperatureC, result.settings.criticalTemperatureC);
    for (let i = 0; i < slice.values.length; i += 1) {
      const color = temperatureToColor(slice.values[i], scale, thermalSettings);
      data[i * 4] = color.r;
      data[i * 4 + 1] = color.g;
      data[i * 4 + 2] = color.b;
      data[i * 4 + 3] = Math.round(clamp(opacity * 255, 42, 242));
    }
    const map = new THREE.DataTexture(data, slice.widthCells, slice.heightCells, THREE.RGBAFormat, THREE.UnsignedByteType);
    map.needsUpdate = true;
    map.magFilter = THREE.NearestFilter;
    map.minFilter = THREE.NearestFilter;
    map.wrapS = THREE.ClampToEdgeWrapping;
    map.wrapT = THREE.ClampToEdgeWrapping;
    return map;
  }, [opacity, result.settings.ambientTemperatureC, result.settings.criticalTemperatureC, result.temperatureFieldC, slice.heightCells, slice.values, slice.widthCells, thermalSettings]);

  return (
    <group>
      <mesh position={slice.position} rotation={slice.rotation} data-testid="shader-heatmap">
        <planeGeometry args={[slice.widthM, slice.heightM, 1, 1]} />
        <meshBasicMaterial map={texture} transparent opacity={1} depthWrite={false} side={THREE.DoubleSide} />
        <Edges color="#E5EDF5" />
      </mesh>
      <Html position={slice.labelPosition} center transform={false} style={{ pointerEvents: "none" }}>
        <div className="slice-label" data-testid="slice-plane">
          <strong>{axis.toUpperCase()}</strong>
          <span>{language === "zh" ? "切片" : "slice"} @ {slice.metricM.toFixed(2)} m</span>
        </div>
      </Html>
    </group>
  );
}

function buildThermalSlice(result: SimulationResult, axis: SliceAxis, positionRatio: number) {
  const { nx, ny, nz, cellSizeM } = result.grid;
  const sample = (x: number, y: number, z: number): number => {
    const index = z * nx * ny + y * nx + x;
    return result.temperatureFieldC[index] ?? result.settings.ambientTemperatureC;
  };
  if (axis === "xy") {
    const z = Math.max(0, Math.min(nz - 1, Math.round(positionRatio * (nz - 1))));
    const values: number[] = [];
    for (let y = 0; y < ny; y += 1) for (let x = 0; x < nx; x += 1) values.push(sample(x, y, z));
    return {
      values,
      widthCells: nx,
      heightCells: ny,
      widthM: nx * cellSizeM,
      heightM: ny * cellSizeM,
      metricM: z * cellSizeM,
      position: [nx * cellSizeM / 2, ny * cellSizeM / 2, z * cellSizeM] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      labelPosition: [nx * cellSizeM / 2, ny * cellSizeM + 0.24, z * cellSizeM] as [number, number, number]
    };
  }
  if (axis === "yz") {
    const x = Math.max(0, Math.min(nx - 1, Math.round(positionRatio * (nx - 1))));
    const values: number[] = [];
    for (let y = 0; y < ny; y += 1) for (let z = 0; z < nz; z += 1) values.push(sample(x, y, z));
    return {
      values,
      widthCells: nz,
      heightCells: ny,
      widthM: nz * cellSizeM,
      heightM: ny * cellSizeM,
      metricM: x * cellSizeM,
      position: [x * cellSizeM, ny * cellSizeM / 2, nz * cellSizeM / 2] as [number, number, number],
      rotation: [0, Math.PI / 2, 0] as [number, number, number],
      labelPosition: [x * cellSizeM, ny * cellSizeM + 0.24, nz * cellSizeM / 2] as [number, number, number]
    };
  }
  const y = Math.max(0, Math.min(ny - 1, Math.round(positionRatio * (ny - 1))));
  const values: number[] = [];
  for (let z = 0; z < nz; z += 1) for (let x = 0; x < nx; x += 1) values.push(sample(x, y, z));
  return {
    values,
    widthCells: nx,
    heightCells: nz,
    widthM: nx * cellSizeM,
    heightM: nz * cellSizeM,
    metricM: y * cellSizeM,
    position: [nx * cellSizeM / 2, y * cellSizeM, nz * cellSizeM / 2] as [number, number, number],
    rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
    labelPosition: [nx * cellSizeM / 2, y * cellSizeM + 0.28, nz * cellSizeM / 2] as [number, number, number]
  };
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

function AirflowStreamlines({ result, density, speed, opacity }: { result: SimulationResult; density: number; speed: number; opacity: number }) {
  const paths = useMemo(() => buildStreamlines(result, density), [result, density]);
  return (
    <group>
      {paths.map((path, index) => (
        <Line
          key={`line-${index}`}
          points={path.map((point) => [point.x, point.y, point.z])}
          color={pathColor(path)}
          transparent
          opacity={opacity * 0.38}
          lineWidth={1.05}
        />
      ))}
      {paths.slice(0, Math.min(paths.length, 80)).map((path, index) => (
        <FlowTrail key={`trail-${index}`} path={path} speed={speed} opacity={opacity} offset={index / Math.max(paths.length, 1)} />
      ))}
    </group>
  );
}

function FlowTrail({ path, speed, opacity, offset }: { path: Vector3[]; speed: number; opacity: number; offset: number }) {
  const [segment, setSegment] = useState<Vector3[]>(() => path.slice(0, Math.min(path.length, 8)));
  useFrame(({ clock }) => {
    if (path.length < 3) return;
    const span = Math.max(5, Math.min(14, Math.floor(path.length * 0.22)));
    const maxHead = Math.max(span + 1, path.length - 1);
    const head = Math.min(path.length - 1, span + Math.floor(((clock.elapsedTime * speed * 0.28 + offset) % 1) * (maxHead - span)));
    setSegment(path.slice(Math.max(0, head - span), head + 1));
  });
  if (segment.length < 2) return null;
  return <Line points={segment.map((point) => [point.x, point.y, point.z])} color={pathColor(path)} transparent opacity={opacity} lineWidth={2.2} />;
}

function CameraFocus({ point, room, viewMode }: { point?: Vector3; room: Scenario["room"]; viewMode: ViewMode }) {
  const { camera } = useThree();
  useEffect(() => {
    if (point) {
      camera.position.set(point.x + 5.2, Math.min(room.height * 1.55, point.y + 3.4), point.z + 5.2);
      camera.lookAt(point.x, point.y, point.z);
      return;
    }

    const center = new THREE.Vector3(room.width / 2, 1.1, room.depth / 2);
    if (viewMode === "thermal" || viewMode === "slice") {
      camera.position.set(room.width * 1.24, room.height * 2.25, room.depth * 1.62);
    } else if (viewMode === "airflow") {
      camera.position.set(room.width * 1.08, room.height * 1.82, room.depth * 1.42);
    } else {
      camera.position.set(room.width * 0.86, room.height * 1.45, room.depth * 1.22);
    }
    camera.lookAt(center);
  }, [camera, point, room.depth, room.height, room.width, viewMode]);
  return null;
}

function buildStreamlines(result: SimulationResult, density: number): Vector3[][] {
  const paths: Vector3[][] = [];
  const cellCount = result.vectorField.length;
  const step = Math.max(1, Math.floor(cellCount / density));
  for (let index = 0; index < cellCount && paths.length < density; index += step) {
    const start = jitterPoint(cellCenter(index, result.grid), index, result.grid.cellSizeM, result);
    if (start.y < 0.2 || start.y > result.grid.ny * result.grid.cellSizeM - 0.2) continue;
    const path = smoothPath(tracePath(start, result));
    if (path.length > 2) paths.push(path);
  }
  return paths;
}

function jitterPoint(point: Vector3, index: number, amount: number, result: SimulationResult): Vector3 {
  const maxX = result.grid.nx * result.grid.cellSizeM;
  const maxY = result.grid.ny * result.grid.cellSizeM;
  const maxZ = result.grid.nz * result.grid.cellSizeM;
  const jx = pseudoRandom(index * 17 + 3) - 0.5;
  const jy = pseudoRandom(index * 19 + 11) - 0.5;
  const jz = pseudoRandom(index * 23 + 7) - 0.5;
  return {
    x: clamp(point.x + jx * amount * 0.72, 0.05, maxX - 0.05),
    y: clamp(point.y + jy * amount * 0.42, 0.08, maxY - 0.08),
    z: clamp(point.z + jz * amount * 0.72, 0.05, maxZ - 0.05)
  };
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function smoothPath(path: Vector3[]): Vector3[] {
  if (path.length < 3) return path;
  const curve = new THREE.CatmullRomCurve3(
    path.map((point) => new THREE.Vector3(point.x, point.y, point.z)),
    false,
    "catmullrom",
    0.36
  );
  const pointCount = Math.min(72, Math.max(24, path.length * 5));
  return curve.getPoints(pointCount).map((point) => ({ x: point.x, y: point.y, z: point.z }));
}

interface WarningCluster {
  id: string;
  label: string;
  severity: SimulationWarningSeverity;
  warnings: SimulationWarning[];
  position: Vector3;
}

function warningClusterTitle(cluster: WarningCluster, language: "en" | "zh"): string {
  const severity = cluster.severity === "critical" ? "Critical" : "Warning";
  const count = cluster.warnings.length;
  const label = localizeWarningLabel(language, cluster.label);
  const details = cluster.warnings
    .slice(0, 3)
    .map((warning) => warning.message)
    .join(" | ");
  return `${language === "zh" ? (cluster.severity === "critical" ? "嚴重" : "警示") : severity}: ${count} ${label}${count === 1 ? "" : language === "zh" ? "項" : " warnings"}${details ? ` - ${details}` : ""}`;
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
  let direction: Vector3 | undefined;
  const maxX = result.grid.nx * result.grid.cellSizeM;
  const maxY = result.grid.ny * result.grid.cellSizeM;
  const maxZ = result.grid.nz * result.grid.cellSizeM;
  for (let i = 0; i < 18; i += 1) {
    const vector = sampleVectorField(result.vectorField, result.grid, current);
    const magnitude = Math.hypot(vector.x, vector.y, vector.z);
    if (magnitude < 0.025) break;
    const sampled = { x: vector.x / magnitude, y: vector.y / magnitude, z: vector.z / magnitude };
    direction = direction ? normalizeVector(lerpVector(direction, sampled, 0.48)) : sampled;
    const step = result.grid.cellSizeM * 0.42;
    current = {
      x: clamp(current.x + direction.x * step, 0.05, maxX - 0.05),
      y: clamp(current.y + direction.y * step, 0.05, maxY - 0.05),
      z: clamp(current.z + direction.z * step, 0.05, maxZ - 0.05)
    };
    path.push(current);
  }
  return path;
}

function lerpVector(a: Vector3, b: Vector3, amount: number): Vector3 {
  return {
    x: a.x + (b.x - a.x) * amount,
    y: a.y + (b.y - a.y) * amount,
    z: a.z + (b.z - a.z) * amount
  };
}

function normalizeVector(vector: Vector3): Vector3 {
  const magnitude = Math.hypot(vector.x, vector.y, vector.z);
  if (magnitude < 0.0001) return { x: 0, y: 0, z: 0 };
  return { x: vector.x / magnitude, y: vector.y / magnitude, z: vector.z / magnitude };
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
