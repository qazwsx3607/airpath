import {
  AirVent,
  Box,
  DoorOpen,
  Flame,
  Layers,
  PanelLeftClose,
  PanelTop,
  Plus,
  Rows3,
  Snowflake,
  Thermometer,
  Wind
} from "lucide-react";
import { type ChangeEvent } from "react";
import {
  type ContainmentType,
  type CoolingObjectType,
  type RackArrayInput,
  type RackCoolingMode,
  type RackOrientation,
  type RoomTemplateKey
} from "@airpath/scenario-schema";
import { useAirPathStore, type WizardStep } from "../store";

const steps: Array<{ key: WizardStep; label: string }> = [
  { key: "room", label: "Room" },
  { key: "racks", label: "Rack Array" },
  { key: "cooling", label: "Cooling" },
  { key: "containment", label: "Containment" },
  { key: "review", label: "Review" }
];

const coolingButtons: Array<{ type: CoolingObjectType; label: string; icon: typeof Snowflake }> = [
  { type: "crac-crah", label: "CRAC / CRAH", icon: Snowflake },
  { type: "in-row-cooler", label: "In-row Cooler", icon: AirVent },
  { type: "floor-perforated-tile", label: "Floor Tile", icon: Layers },
  { type: "ceiling-supply-diffuser", label: "Ceiling Supply", icon: Wind },
  { type: "ceiling-return-grille", label: "Ceiling Return", icon: AirVent },
  { type: "wall-supply-grille", label: "Wall Supply", icon: Wind },
  { type: "wall-return-grille", label: "Wall Return", icon: AirVent },
  { type: "cdu", label: "CDU", icon: Box }
];

const containmentButtons: Array<{ type: ContainmentType; label: string; icon: typeof PanelTop }> = [
  { type: "cold-aisle", label: "Cold Aisle", icon: Snowflake },
  { type: "hot-aisle", label: "Hot Aisle", icon: Flame },
  { type: "end-of-row-door", label: "End Door", icon: DoorOpen },
  { type: "top-panel", label: "Top Panel", icon: PanelTop },
  { type: "side-panel", label: "Side Panel", icon: PanelLeftClose },
  { type: "full-aisle", label: "Full Aisle", icon: Rows3 }
];

export function LeftPanel() {
  const collapsed = useAirPathStore((state) => state.leftCollapsed);
  const activeStep = useAirPathStore((state) => state.activeStep);
  const setActiveStep = useAirPathStore((state) => state.setActiveStep);
  const scenario = useAirPathStore((state) => state.scenario);
  const rackDraft = useAirPathStore((state) => state.rackDraft);
  const applyRoomTemplate = useAirPathStore((state) => state.applyRoomTemplate);
  const updateRoom = useAirPathStore((state) => state.updateRoom);
  const updateRackDraft = useAirPathStore((state) => state.updateRackDraft);
  const createOrReplaceRackArray = useAirPathStore((state) => state.createOrReplaceRackArray);
  const appendRackArray = useAirPathStore((state) => state.appendRackArray);
  const addCoolingObject = useAirPathStore((state) => state.addCoolingObject);
  const addContainment = useAirPathStore((state) => state.addContainment);
  const runSimulation = useAirPathStore((state) => state.runSimulation);
  const setViewMode = useAirPathStore((state) => state.setViewMode);
  const particleDensity = useAirPathStore((state) => state.particleDensity);
  const particleSpeed = useAirPathStore((state) => state.particleSpeed);
  const thermalOpacity = useAirPathStore((state) => state.thermalOpacity);
  const setParticleDensity = useAirPathStore((state) => state.setParticleDensity);
  const setParticleSpeed = useAirPathStore((state) => state.setParticleSpeed);
  const setThermalOpacity = useAirPathStore((state) => state.setThermalOpacity);

  if (collapsed) {
    return (
      <aside className="left-panel collapsed" aria-label="Five-Minute Mode collapsed">
        {steps.map((step) => (
          <button key={step.key} type="button" title={step.label} className={activeStep === step.key ? "active" : ""} onClick={() => setActiveStep(step.key)}>
            {step.label.slice(0, 1)}
          </button>
        ))}
      </aside>
    );
  }

  return (
    <aside className="left-panel" aria-label="Five-Minute Mode setup">
      <div className="panel-header">
        <div>
          <span>Five-Minute Mode</span>
          <strong>Setup Wizard</strong>
        </div>
      </div>

      <nav className="step-tabs" aria-label="Setup steps">
        {steps.map((step, index) => (
          <button
            key={step.key}
            type="button"
            className={activeStep === step.key ? "active" : ""}
            onClick={() => setActiveStep(step.key)}
            data-testid={`step-${step.key}`}
          >
            <span>{index + 1}</span>
            {step.label}
          </button>
        ))}
      </nav>

      <div className="panel-scroll">
        {activeStep === "room" && (
          <section className="panel-section" data-testid="room-step">
            <h2>Room Setup</h2>
            <label>
              Template
              <select data-testid="template-select" defaultValue="medium" onChange={(event) => applyRoomTemplate(event.target.value as RoomTemplateKey)}>
                <option value="small">Small server room</option>
                <option value="medium">Medium room</option>
                <option value="large">Large room</option>
                <option value="custom">Custom</option>
              </select>
            </label>
            <div className="form-grid three">
              <NumberField label="Width" unit="m" value={scenario.room.width} testId="room-width" onChange={(value) => updateRoom({ width: value })} />
              <NumberField label="Depth" unit="m" value={scenario.room.depth} testId="room-depth" onChange={(value) => updateRoom({ depth: value })} />
              <NumberField label="Height" unit="m" value={scenario.room.height} testId="room-height" onChange={(value) => updateRoom({ height: value })} />
            </div>
            <NumberField label="Ambient target" unit="C" value={scenario.room.ambientTemperatureC} onChange={(value) => updateRoom({ ambientTemperatureC: value })} />
            <button className="primary full" type="button" onClick={() => setActiveStep("racks")}>
              Continue to Rack Array
            </button>
          </section>
        )}

        {activeStep === "racks" && (
          <section className="panel-section" data-testid="rack-step">
            <h2>Rack Array Builder</h2>
            <label>
              Array name
              <input value={rackDraft.name} onChange={(event) => updateRackDraft({ name: event.target.value })} />
            </label>
            <div className="form-grid two">
              <NumberField label="Rows" value={rackDraft.rows} testId="rack-rows" min={1} step={1} onChange={(value) => updateRackDraft({ rows: Math.round(value) })} />
              <NumberField label="Columns" value={rackDraft.columns} testId="rack-columns" min={1} step={1} onChange={(value) => updateRackDraft({ columns: Math.round(value) })} />
              <NumberField label="Row spacing" unit="m" value={rackDraft.rowSpacingM} testId="rack-row-spacing" onChange={(value) => updateRackDraft({ rowSpacingM: value })} />
              <NumberField label="Column spacing" unit="m" value={rackDraft.columnSpacingM} testId="rack-column-spacing" onChange={(value) => updateRackDraft({ columnSpacingM: value })} />
              <NumberField label="Aisle width" unit="m" value={rackDraft.aisleWidthM} testId="rack-aisle" onChange={(value) => updateRackDraft({ aisleWidthM: value })} />
              <NumberField label="Rack heat" unit="kW" value={rackDraft.perRackKw} testId="rack-heat" onChange={(value) => updateRackDraft({ perRackKw: value })} />
            </div>
            <label>
              Heat load mode
              <select value={rackDraft.heatLoadMode} onChange={(event) => updateRackDraft({ heatLoadMode: event.target.value as RackArrayInput["heatLoadMode"] })}>
                <option value="per-rack">Per-rack kW</option>
                <option value="total-array">Total array kW</option>
                <option value="mixed-custom">Mixed custom per-rack</option>
              </select>
            </label>
            {rackDraft.heatLoadMode === "total-array" && (
              <NumberField label="Total array heat" unit="kW" value={rackDraft.totalArrayKw} onChange={(value) => updateRackDraft({ totalArrayKw: value })} />
            )}
            <div className="form-grid two">
              <label>
                Orientation
                <select value={rackDraft.orientation} onChange={(event) => updateRackDraft({ orientation: event.target.value as RackOrientation })}>
                  <option value="front-positive-z">Front +Z</option>
                  <option value="front-negative-z">Front -Z</option>
                  <option value="front-positive-x">Front +X</option>
                  <option value="front-negative-x">Front -X</option>
                </select>
              </label>
              <label>
                Cooling mode
                <select value={rackDraft.coolingMode} onChange={(event) => updateRackDraft({ coolingMode: event.target.value as RackCoolingMode })}>
                  <option value="air-cooled">Air cooled</option>
                  <option value="hybrid-liquid-cooled">Hybrid liquid cooled</option>
                  <option value="direct-liquid-cooled">Direct liquid cooled</option>
                </select>
              </label>
            </div>
            {rackDraft.coolingMode !== "air-cooled" && (
              <NumberField
                label="Liquid capture"
                unit="ratio"
                value={rackDraft.liquidCaptureRatio}
                min={0}
                max={0.98}
                step={0.05}
                onChange={(value) => updateRackDraft({ liquidCaptureRatio: value })}
              />
            )}
            <details>
              <summary>Advanced rack dimensions</summary>
              <div className="form-grid three">
                <NumberField label="Width" unit="m" value={rackDraft.rackSize.width} onChange={(value) => updateRackDraft({ rackSize: { ...rackDraft.rackSize, width: value } })} />
                <NumberField label="Depth" unit="m" value={rackDraft.rackSize.depth} onChange={(value) => updateRackDraft({ rackSize: { ...rackDraft.rackSize, depth: value } })} />
                <NumberField label="Height" unit="m" value={rackDraft.rackSize.height} onChange={(value) => updateRackDraft({ rackSize: { ...rackDraft.rackSize, height: value } })} />
              </div>
            </details>
            <div className="button-row">
              <button className="primary" type="button" onClick={createOrReplaceRackArray} data-testid="create-rack-array">
                <Plus size={16} aria-hidden="true" />
                Create / Replace
              </button>
              <button className="secondary" type="button" onClick={appendRackArray}>
                Add Array
              </button>
            </div>
            <p className="hint">Ghost preview uses cyan for in-room placement and amber/red when boundary or collision risks are detected.</p>
          </section>
        )}

        {activeStep === "cooling" && (
          <section className="panel-section" data-testid="cooling-step">
            <h2>Cooling Setup</h2>
            <div className="tool-grid">
              {coolingButtons.map(({ type, label, icon: Icon }) => (
                <button key={type} type="button" className="tool-button" onClick={() => addCoolingObject(type)} data-testid={`add-${type}`}>
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
            <p className="hint">Supply and return markers appear in the viewport and are included in the vector field.</p>
          </section>
        )}

        {activeStep === "containment" && (
          <section className="panel-section" data-testid="containment-step">
            <h2>Containment Setup</h2>
            <div className="tool-grid">
              {containmentButtons.map(({ type, label, icon: Icon }) => (
                <button key={type} type="button" className="tool-button" onClick={() => addContainment(type)} data-testid={`add-${type}`}>
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
            <p className="hint">Containment is modeled as an airflow barrier that reduces hot/cold mixing.</p>
          </section>
        )}

        {activeStep === "review" && (
          <section className="panel-section" data-testid="review-step">
            <h2>Review & Simulate</h2>
            <button className="primary full" type="button" onClick={runSimulation}>
              <Thermometer size={16} aria-hidden="true" />
              Run Formal Simulation
            </button>
            <div className="button-row">
              <button className="secondary" type="button" onClick={() => setViewMode("thermal")}>
                Thermal View
              </button>
              <button className="secondary" type="button" onClick={() => setViewMode("airflow")}>
                Airflow View
              </button>
              <button className="secondary" type="button" onClick={() => setViewMode("combined")}>
                Combined
              </button>
            </div>
            <label>
              Particle density
              <input type="range" min={12} max={90} value={particleDensity} onChange={(event) => setParticleDensity(Number(event.target.value))} data-testid="particle-density" />
            </label>
            <label>
              Particle speed
              <input type="range" min={0.3} max={2.4} step={0.1} value={particleSpeed} onChange={(event) => setParticleSpeed(Number(event.target.value))} data-testid="particle-speed" />
            </label>
            <label>
              Heatmap opacity
              <input
                type="range"
                min={0.2}
                max={0.8}
                step={0.05}
                value={thermalOpacity}
                onChange={(event) => setThermalOpacity(Number(event.target.value))}
                data-testid="thermal-opacity"
              />
            </label>
            <details open>
              <summary>Visible assumptions</summary>
              <p className="hint">
                AirPath uses a simplified 3D voxel/grid approximation for conceptual pre-sales review. It is not a certified CFD solver.
              </p>
            </details>
          </section>
        )}
      </div>
    </aside>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  min = 0,
  max,
  step = 0.1,
  testId
}: {
  label: string;
  unit?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  testId?: string;
}) {
  return (
    <label>
      {label}
      <span className="input-with-unit">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          data-testid={testId}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value))}
        />
        {unit && <em>{unit}</em>}
      </span>
    </label>
  );
}
