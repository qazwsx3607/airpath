import { useMemo, useRef, useState, type PointerEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CopyPlus, Move, RotateCcw, RotateCw, Snowflake, ThermometerSun, Wind } from "lucide-react";
import { isReturnObject, rackFrontVector, rackRearVector, type Rack, type Scenario, type Size3, type Vector3 } from "@airpath/scenario-schema";
import { useAirPathStore } from "../store";

interface PlanPoint {
  x: number;
  z: number;
}

type DragState =
  | { type: "box"; start: PlanPoint; current: PlanPoint }
  | { type: "move"; start: PlanPoint; current: PlanPoint };

export function PlanView() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const scenario = useAirPathStore((state) => state.scenario);
  const selectedIds = useAirPathStore((state) => state.selectedIds);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const editMode = useAirPathStore((state) => state.editMode);
  const selectObject = useAirPathStore((state) => state.selectObject);
  const selectObjects = useAirPathStore((state) => state.selectObjects);
  const clearSelection = useAirPathStore((state) => state.clearSelection);
  const moveSelectedObjects = useAirPathStore((state) => state.moveSelectedObjects);
  const rotateSelectedObjects = useAirPathStore((state) => state.rotateSelectedObjects);
  const mirrorSelectedObjects = useAirPathStore((state) => state.mirrorSelectedObjects);
  const createBackToBackHotAisle = useAirPathStore((state) => state.createBackToBackHotAisle);
  const createFaceToFaceColdAisle = useAirPathStore((state) => state.createFaceToFaceColdAisle);
  const convertSelectedRacksToInRowCooling = useAirPathStore((state) => state.convertSelectedRacksToInRowCooling);
  const detectAisleZones = useAirPathStore((state) => state.detectAisleZones);
  const addContainmentFromDetectedAisle = useAirPathStore((state) => state.addContainmentFromDetectedAisle);
  const detectedAisles = useAirPathStore((state) => state.detectedAisles);
  const [drag, setDrag] = useState<DragState | undefined>();
  const selectedRacks = scenario.racks.filter((rack) => selectedSet.has(rack.id));
  const selectedObjects = transformableObjects(scenario).filter((object) => selectedSet.has(object.id));
  const selectedBounds = selectedObjects.length > 0 ? groupBounds(selectedObjects) : undefined;
  const selectionRect = drag?.type === "box" ? rectFromPoints(drag.start, drag.current) : undefined;

  function toPlanPoint(event: PointerEvent<SVGSVGElement | SVGGElement | SVGRectElement>): PlanPoint {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return { x: 0, z: 0 };
    return {
      x: clamp(((event.clientX - box.left) / box.width) * scenario.room.width, 0, scenario.room.width),
      z: clamp(((event.clientY - box.top) / box.height) * scenario.room.depth, 0, scenario.room.depth)
    };
  }

  function handleRootPointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0) return;
    const start = toPlanPoint(event);
    setDrag({ type: "box", start, current: start });
  }

  function handleObjectPointerDown(event: PointerEvent<SVGGElement | SVGRectElement>, id: string) {
    if (event.button !== 0 || editMode === "locked") return;
    event.stopPropagation();
    const start = toPlanPoint(event);
    selectObject(id, event.shiftKey);
    if (editMode === "move") setDrag({ type: "move", start, current: start });
  }

  function handleRackPointerDown(event: PointerEvent<SVGGElement>, rack: Rack) {
    handleObjectPointerDown(event, rack.id);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!drag) return;
    setDrag({ ...drag, current: toPlanPoint(event) });
  }

  function handlePointerUp(event: PointerEvent<SVGSVGElement>) {
    if (!drag) return;
    const end = toPlanPoint(event);
    if (drag.type === "box") {
      const box = rectFromPoints(drag.start, end);
      const ids = transformableObjects(scenario)
        .filter((object) => object.position.x >= box.x && object.position.x <= box.x + box.width && object.position.z >= box.z && object.position.z <= box.z + box.depth)
        .map((object) => object.id);
      if (ids.length > 0) selectObjects(ids, `Selected ${ids.length} object(s) with box selection.`);
      else clearSelection();
    } else {
      const dx = snap(end.x - drag.start.x, 0.25);
      const dz = snap(end.z - drag.start.z, 0.25);
      if (Math.abs(dx) >= 0.01 || Math.abs(dz) >= 0.01) moveSelectedObjects(dx, dz);
    }
    setDrag(undefined);
  }

  return (
    <div className="plan-view" data-testid="plan-view">
      <div className="plan-toolbar" data-testid="plan-toolbar">
        <div>
          <strong>Plan View</strong>
          <span>{selectedObjects.length} object(s) selected - snap 0.25 m</span>
        </div>
        <div className="plan-toolbar-actions">
          <button type="button" className="secondary" onClick={detectAisleZones} data-testid="detect-aisles">
            <Wind size={14} />
            Detect Aisles
          </button>
          <button type="button" className="secondary hot" onClick={() => addContainmentFromDetectedAisle("hot")} data-testid="generate-hot-containment">
            <ThermometerSun size={14} />
            Hot containment
          </button>
          <button type="button" className="secondary cold" onClick={() => addContainmentFromDetectedAisle("cold")} data-testid="generate-cold-containment">
            <Snowflake size={14} />
            Cold containment
          </button>
          <button type="button" className="secondary" onClick={() => mirrorSelectedObjects("z", true)} disabled={selectedObjects.length === 0} data-testid="mirror-z">
            <CopyPlus size={14} />
            Mirror Y
          </button>
          <button type="button" className="secondary" onClick={() => mirrorSelectedObjects("x", true)} disabled={selectedObjects.length === 0} data-testid="mirror-x">
            <CopyPlus size={14} />
            Mirror X
          </button>
          <button type="button" className="secondary" onClick={() => rotateSelectedObjects(-90)} disabled={selectedObjects.length === 0} data-testid="plan-rotate-ccw">
            <RotateCcw size={14} />
            Rotate -90
          </button>
          <button type="button" className="secondary" onClick={() => rotateSelectedObjects(90)} disabled={selectedObjects.length === 0} data-testid="plan-rotate-cw">
            <RotateCw size={14} />
            Rotate +90
          </button>
          <button type="button" className="secondary hot" onClick={createBackToBackHotAisle} disabled={selectedRacks.length === 0} data-testid="create-hot-aisle">
            Back-to-back hot aisle
          </button>
          <button type="button" className="secondary cold" onClick={createFaceToFaceColdAisle} disabled={selectedRacks.length === 0} data-testid="create-cold-aisle">
            Face-to-face cold aisle
          </button>
          <button type="button" className="secondary" onClick={convertSelectedRacksToInRowCooling} disabled={selectedRacks.length === 0} data-testid="convert-inrow">
            Convert to In-row Cooling
          </button>
        </div>
      </div>
      <div className="plan-stage">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${scenario.room.width} ${scenario.room.depth}`}
          preserveAspectRatio="xMidYMid meet"
          data-testid="plan-svg"
          onPointerDown={handleRootPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <defs>
            <pattern id="plan-grid" width="1" height="1" patternUnits="userSpaceOnUse">
              <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(51,71,91,0.58)" strokeWidth="0.018" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={scenario.room.width} height={scenario.room.depth} className="plan-room" />
          <rect x="0" y="0" width={scenario.room.width} height={scenario.room.depth} fill="url(#plan-grid)" />
          {detectedAisles.map((aisle) => (
            <g key={aisle.id} data-testid={`detected-${aisle.type}-aisle`}>
              <rect
                x={aisle.center.x - aisle.size.width / 2}
                y={aisle.center.z - aisle.size.depth / 2}
                width={aisle.size.width}
                height={aisle.size.depth}
                className={`plan-aisle-zone ${aisle.type}`}
              />
              <text x={aisle.center.x} y={aisle.center.z} className="plan-zone-label">
                {aisle.type === "hot" ? "Hot aisle" : "Cold aisle"}
              </text>
            </g>
          ))}
          {scenario.containmentObjects.map((object) => (
            <rect
              key={object.id}
              x={object.position.x - object.size.width / 2}
              y={object.position.z - object.size.depth / 2}
              width={object.size.width}
              height={object.size.depth}
              className={`plan-containment ${object.type.includes("hot") ? "hot" : "cold"} ${selectedSet.has(object.id) ? "selected" : ""}`}
              onPointerDown={(event) => handleObjectPointerDown(event, object.id)}
              data-testid="plan-containment-object"
            />
          ))}
          {scenario.coolingObjects.map((object) => {
            const coolingClass = isReturnObject(object) || object.type.includes("return") ? "return" : "supply";
            return (
              <g key={object.id} onPointerDown={(event) => handleObjectPointerDown(event, object.id)}>
                <rect
                  x={object.position.x - object.size.width / 2}
                  y={object.position.z - object.size.depth / 2}
                  width={object.size.width}
                  height={object.size.depth}
                  className={`plan-cooling ${coolingClass} ${selectedSet.has(object.id) ? "selected" : ""}`}
                  data-testid={object.type === "in-row-cooler" ? "plan-inrow-cooling" : "plan-cooling-object"}
                />
                <text x={object.position.x} y={object.position.z} className="plan-object-mini-label">
                  {object.type === "in-row-cooler" ? "IRC" : coolingClass === "return" ? "RET" : "SUP"}
                </text>
              </g>
            );
          })}
          {scenario.racks.map((rack) => (
            <RackPlanNode key={rack.id} rack={rack} selected={selectedSet.has(rack.id)} scenario={scenario} onPointerDown={(event) => handleRackPointerDown(event, rack)} />
          ))}
          {selectedBounds && (
            <rect
              x={selectedBounds.minX}
              y={selectedBounds.minZ}
              width={selectedBounds.maxX - selectedBounds.minX}
              height={selectedBounds.maxZ - selectedBounds.minZ}
              className="plan-group-box"
              data-testid="plan-group-box"
            />
          )}
          {selectionRect && (
            <rect x={selectionRect.x} y={selectionRect.z} width={selectionRect.width} height={selectionRect.depth} className="plan-selection-box" data-testid="plan-selection-box" />
          )}
        </svg>
        <div className="plan-gizmo" data-testid="plan-gizmo">
          <button type="button" className="ghost icon-button" onClick={() => moveSelectedObjects(0, -0.25)} disabled={selectedObjects.length === 0} data-testid="plan-gizmo-y-minus" title="Move Y-">
            <ArrowUp size={16} />
          </button>
          <button type="button" className="ghost icon-button" onClick={() => moveSelectedObjects(-0.25, 0)} disabled={selectedObjects.length === 0} data-testid="plan-gizmo-x-minus" title="Move X-">
            <ArrowLeft size={16} />
          </button>
          <button type="button" className="ghost icon-button plane" onClick={() => moveSelectedObjects(0.25, 0.25)} disabled={selectedObjects.length === 0} data-testid="plan-gizmo-plane" title="Move plane">
            <Move size={16} />
          </button>
          <button type="button" className="ghost icon-button" onClick={() => moveSelectedObjects(0.25, 0)} disabled={selectedObjects.length === 0} data-testid="plan-gizmo-x-plus" title="Move X+">
            <ArrowRight size={16} />
          </button>
          <button type="button" className="ghost icon-button" onClick={() => moveSelectedObjects(0, 0.25)} disabled={selectedObjects.length === 0} data-testid="plan-gizmo-y-plus" title="Move Y+">
            <ArrowDown size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RackPlanNode({
  rack,
  selected,
  scenario,
  onPointerDown
}: {
  rack: Rack;
  selected: boolean;
  scenario: Scenario;
  onPointerDown: (event: PointerEvent<SVGGElement>) => void;
}) {
  const front = rackFrontVector(rack);
  const rear = rackRearVector(rack);
  const frontPoint = edgePoint(rack, front);
  const rearPoint = edgePoint(rack, rear);
  return (
    <g onPointerDown={onPointerDown} data-testid="plan-rack">
      <rect
        x={rack.position.x - rack.size.width / 2}
        y={rack.position.z - rack.size.depth / 2}
        width={rack.size.width}
        height={rack.size.depth}
        className={`plan-rack ${selected ? "selected" : ""}`}
      />
      <line x1={rack.position.x} y1={rack.position.z} x2={frontPoint.x} y2={frontPoint.z} className="plan-rack-front" data-testid="rack-front-indicator" />
      <line x1={rack.position.x} y1={rack.position.z} x2={rearPoint.x} y2={rearPoint.z} className="plan-rack-rear" data-testid="rack-rear-indicator" />
      <circle cx={frontPoint.x} cy={frontPoint.z} r={Math.min(0.11, Math.max(0.055, scenario.room.width * 0.004))} className="plan-front-dot" />
      <circle cx={rearPoint.x} cy={rearPoint.z} r={Math.min(0.11, Math.max(0.055, scenario.room.width * 0.004))} className="plan-rear-dot" />
      <text x={rack.position.x} y={rack.position.z + 0.05} className="plan-object-mini-label">
        {rack.name.replace("Rack Array ", "R")}
      </text>
    </g>
  );
}

function edgePoint(rack: Rack, vector: Vector3): PlanPoint {
  return {
    x: rack.position.x + vector.x * (rack.size.width / 2 + 0.18),
    z: rack.position.z + vector.z * (rack.size.depth / 2 + 0.18)
  };
}

interface PlanTransformable {
  id: string;
  position: Vector3;
  size: Size3;
}

function transformableObjects(scenario: Scenario): PlanTransformable[] {
  return [
    ...scenario.racks.map((rack) => ({ id: rack.id, position: rack.position, size: rack.size })),
    ...scenario.coolingObjects.map((object) => ({ id: object.id, position: object.position, size: object.size })),
    ...scenario.containmentObjects.map((object) => ({ id: object.id, position: object.position, size: object.size }))
  ];
}

function groupBounds(objects: PlanTransformable[]) {
  return objects.reduce(
    (bounds, object) => ({
      minX: Math.min(bounds.minX, object.position.x - object.size.width / 2),
      maxX: Math.max(bounds.maxX, object.position.x + object.size.width / 2),
      minZ: Math.min(bounds.minZ, object.position.z - object.size.depth / 2),
      maxZ: Math.max(bounds.maxZ, object.position.z + object.size.depth / 2)
    }),
    { minX: Number.POSITIVE_INFINITY, maxX: Number.NEGATIVE_INFINITY, minZ: Number.POSITIVE_INFINITY, maxZ: Number.NEGATIVE_INFINITY }
  );
}

function rectFromPoints(a: PlanPoint, b: PlanPoint) {
  return {
    x: Math.min(a.x, b.x),
    z: Math.min(a.z, b.z),
    width: Math.abs(a.x - b.x),
    depth: Math.abs(a.z - b.z)
  };
}

function snap(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}


