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
import { t } from "../i18n";
import { useAirPathStore, type SliceAxis, type WizardStep } from "../store";

const steps: Array<{ key: WizardStep; labelKey: Parameters<typeof t>[1] }> = [
  { key: "room", labelKey: "room" },
  { key: "racks", labelKey: "rackArray" },
  { key: "cooling", labelKey: "cooling" },
  { key: "containment", labelKey: "containment" },
  { key: "review", labelKey: "review" }
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
  const language = useAirPathStore((state) => state.language);
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
  const airflowOpacity = useAirPathStore((state) => state.airflowOpacity);
  const thermalOpacity = useAirPathStore((state) => state.thermalOpacity);
  const sliceAxis = useAirPathStore((state) => state.sliceAxis);
  const slicePosition = useAirPathStore((state) => state.slicePosition);
  const setParticleDensity = useAirPathStore((state) => state.setParticleDensity);
  const setParticleSpeed = useAirPathStore((state) => state.setParticleSpeed);
  const setAirflowOpacity = useAirPathStore((state) => state.setAirflowOpacity);
  const setThermalOpacity = useAirPathStore((state) => state.setThermalOpacity);
  const setSliceAxis = useAirPathStore((state) => state.setSliceAxis);
  const setSlicePosition = useAirPathStore((state) => state.setSlicePosition);

  if (collapsed) {
    return (
      <aside className="left-panel collapsed" aria-label="Five-Minute Mode collapsed">
        {steps.map((step) => (
          <button key={step.key} type="button" title={t(language, step.labelKey)} className={activeStep === step.key ? "active" : ""} onClick={() => setActiveStep(step.key)}>
            {t(language, step.labelKey).slice(0, 1)}
          </button>
        ))}
      </aside>
    );
  }

  return (
    <aside className="left-panel" aria-label="Five-Minute Mode setup">
      <div className="panel-header">
        <div>
          <span>{t(language, "fiveMinuteMode")}</span>
          <strong>{t(language, "setupWizard")}</strong>
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
            {t(language, step.labelKey)}
          </button>
        ))}
      </nav>

      <div className="panel-scroll">
        {activeStep === "room" && (
          <section className="panel-section" data-testid="room-step">
            <h2>{t(language, "roomSetup")}</h2>
            <label>
              {t(language, "template")}
              <select data-testid="template-select" defaultValue="medium" onChange={(event) => applyRoomTemplate(event.target.value as RoomTemplateKey)}>
                <option value="small">{t(language, "smallRoom")}</option>
                <option value="medium">{t(language, "mediumRoom")}</option>
                <option value="large">{t(language, "largeRoom")}</option>
                <option value="custom">{t(language, "custom")}</option>
              </select>
            </label>
            <div className="form-grid three">
              <NumberField label={t(language, "width")} unit="m" value={scenario.room.width} testId="room-width" onChange={(value) => updateRoom({ width: value })} />
              <NumberField label={t(language, "depth")} unit="m" value={scenario.room.depth} testId="room-depth" onChange={(value) => updateRoom({ depth: value })} />
              <NumberField label={t(language, "height")} unit="m" value={scenario.room.height} testId="room-height" onChange={(value) => updateRoom({ height: value })} />
            </div>
            <NumberField label={t(language, "ambientTarget")} unit="C" value={scenario.room.ambientTemperatureC} onChange={(value) => updateRoom({ ambientTemperatureC: value })} />
            <button className="primary full" type="button" onClick={() => setActiveStep("racks")}>
              {t(language, "continueRackArray")}
            </button>
          </section>
        )}

        {activeStep === "racks" && (
          <section className="panel-section" data-testid="rack-step">
            <h2>{t(language, "rackArrayBuilder")}</h2>
            <label>
              {t(language, "arrayName")}
              <input value={rackDraft.name} onChange={(event) => updateRackDraft({ name: event.target.value })} />
            </label>
            <div className="form-grid two">
              <NumberField label={t(language, "rows")} value={rackDraft.rows} testId="rack-rows" min={1} step={1} onChange={(value) => updateRackDraft({ rows: Math.round(value) })} />
              <NumberField label={t(language, "columns")} value={rackDraft.columns} testId="rack-columns" min={1} step={1} onChange={(value) => updateRackDraft({ columns: Math.round(value) })} />
              <NumberField label={t(language, "rowSpacing")} unit="m" value={rackDraft.rowSpacingM} testId="rack-row-spacing" onChange={(value) => updateRackDraft({ rowSpacingM: value })} />
              <NumberField label={t(language, "columnSpacing")} unit="m" value={rackDraft.columnSpacingM} testId="rack-column-spacing" onChange={(value) => updateRackDraft({ columnSpacingM: value })} />
              <NumberField label={t(language, "aisleWidth")} unit="m" value={rackDraft.aisleWidthM} testId="rack-aisle" onChange={(value) => updateRackDraft({ aisleWidthM: value })} />
              <NumberField label={t(language, "rackHeat")} unit="kW" value={rackDraft.perRackKw} testId="rack-heat" onChange={(value) => updateRackDraft({ perRackKw: value })} />
            </div>
            <label>
              {t(language, "heatLoadMode")}
              <select value={rackDraft.heatLoadMode} onChange={(event) => updateRackDraft({ heatLoadMode: event.target.value as RackArrayInput["heatLoadMode"] })}>
                <option value="per-rack">{t(language, "perRackKw")}</option>
                <option value="total-array">{t(language, "totalArrayKw")}</option>
                <option value="mixed-custom">{t(language, "mixedCustom")}</option>
              </select>
            </label>
            {rackDraft.heatLoadMode === "total-array" && (
              <NumberField label={t(language, "totalArrayKw")} unit="kW" value={rackDraft.totalArrayKw} onChange={(value) => updateRackDraft({ totalArrayKw: value })} />
            )}
            <div className="form-grid two">
              <label>
                {t(language, "orientation")}
                <select value={rackDraft.orientation} onChange={(event) => updateRackDraft({ orientation: event.target.value as RackOrientation })}>
                  <option value="front-positive-z">Front +Z</option>
                  <option value="front-negative-z">Front -Z</option>
                  <option value="front-positive-x">Front +X</option>
                  <option value="front-negative-x">Front -X</option>
                </select>
              </label>
              <label>
                {t(language, "coolingMode")}
                <select value={rackDraft.coolingMode} onChange={(event) => updateRackDraft({ coolingMode: event.target.value as RackCoolingMode })}>
                  <option value="air-cooled">{t(language, "airCooled")}</option>
                  <option value="hybrid-liquid-cooled">{t(language, "hybridLiquid")}</option>
                  <option value="direct-liquid-cooled">{t(language, "directLiquid")}</option>
                </select>
              </label>
            </div>
            {rackDraft.coolingMode !== "air-cooled" && (
              <NumberField
                label={t(language, "liquidCapture")}
                unit="ratio"
                value={rackDraft.liquidCaptureRatio}
                min={0}
                max={0.98}
                step={0.05}
                onChange={(value) => updateRackDraft({ liquidCaptureRatio: value })}
              />
            )}
            <details>
              <summary>{t(language, "advancedRackDimensions")}</summary>
              <div className="form-grid three">
                <NumberField label="Width" unit="m" value={rackDraft.rackSize.width} onChange={(value) => updateRackDraft({ rackSize: { ...rackDraft.rackSize, width: value } })} />
                <NumberField label="Depth" unit="m" value={rackDraft.rackSize.depth} onChange={(value) => updateRackDraft({ rackSize: { ...rackDraft.rackSize, depth: value } })} />
                <NumberField label="Height" unit="m" value={rackDraft.rackSize.height} onChange={(value) => updateRackDraft({ rackSize: { ...rackDraft.rackSize, height: value } })} />
              </div>
            </details>
            <div className="button-row">
              <button className="primary" type="button" onClick={createOrReplaceRackArray} data-testid="create-rack-array">
                <Plus size={16} aria-hidden="true" />
                {t(language, "createReplace")}
              </button>
              <button className="secondary" type="button" onClick={appendRackArray}>
                {t(language, "addArray")}
              </button>
            </div>
            <p className="hint">Ghost preview uses cyan for in-room placement and amber/red when boundary or collision risks are detected.</p>
          </section>
        )}

        {activeStep === "cooling" && (
          <section className="panel-section" data-testid="cooling-step">
            <h2>{t(language, "coolingSetup")}</h2>
            <div className="tool-grid">
              {coolingButtons.map(({ type, label, icon: Icon }) => (
                <button key={type} type="button" className="tool-button" onClick={() => addCoolingObject(type)} data-testid={`add-${type}`}>
                  <Icon size={16} aria-hidden="true" />
                  {coolingLabel(language, type, label)}
                </button>
              ))}
            </div>
            <p className="hint">Supply and return markers appear in the viewport and are included in the vector field.</p>
          </section>
        )}

        {activeStep === "containment" && (
          <section className="panel-section" data-testid="containment-step">
            <h2>{t(language, "containmentSetup")}</h2>
            <div className="tool-grid">
              {containmentButtons.map(({ type, label, icon: Icon }) => (
                <button key={type} type="button" className="tool-button" onClick={() => addContainment(type)} data-testid={`add-${type}`}>
                  <Icon size={16} aria-hidden="true" />
                  {containmentLabel(language, type, label)}
                </button>
              ))}
            </div>
            <p className="hint">Containment is modeled as an airflow barrier that reduces hot/cold mixing.</p>
          </section>
        )}

        {activeStep === "review" && (
          <section className="panel-section" data-testid="review-step">
            <h2>{t(language, "reviewSimulate")}</h2>
            <button className="primary full" type="button" onClick={runSimulation}>
              <Thermometer size={16} aria-hidden="true" />
              {t(language, "runFormalSimulation")}
            </button>
            <div className="button-row">
              <button className="secondary" type="button" onClick={() => setViewMode("thermal")}>
                {t(language, "thermalView")}
              </button>
              <button className="secondary" type="button" onClick={() => setViewMode("airflow")}>
                {t(language, "airflowView")}
              </button>
              <button className="secondary" type="button" onClick={() => setViewMode("combined")}>
                {t(language, "combined")}
              </button>
            </div>
            <label>
              {t(language, "particleDensity")} ({particleDensity})
              <input type="range" min={12} max={240} value={particleDensity} onChange={(event) => setParticleDensity(Number(event.target.value))} data-testid="particle-density" />
            </label>
            <label>
              {t(language, "particleSpeed")} ({particleSpeed.toFixed(1)}x)
              <input type="range" min={0.3} max={2.4} step={0.1} value={particleSpeed} onChange={(event) => setParticleSpeed(Number(event.target.value))} data-testid="particle-speed" />
            </label>
            <label>
              {t(language, "airflowOpacity")} ({Math.round(airflowOpacity * 100)}%)
              <input type="range" min={0.2} max={0.95} step={0.05} value={airflowOpacity} onChange={(event) => setAirflowOpacity(Number(event.target.value))} data-testid="airflow-opacity" />
            </label>
            <label>
              {t(language, "heatmapOpacity")} ({Math.round(thermalOpacity * 100)}%)
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
              <summary>{t(language, "sliceControls")}</summary>
              <div className="segmented compact" data-testid="slice-axis-control">
                {(["xz", "xy", "yz"] as SliceAxis[]).map((axis) => (
                  <button key={axis} type="button" className={sliceAxis === axis ? "active" : ""} onClick={() => setSliceAxis(axis)} data-testid={`slice-axis-${axis}`}>
                    {axis.toUpperCase()}
                  </button>
                ))}
              </div>
              <label>
                {t(language, "slicePosition")} ({Math.round(slicePosition * 100)}%)
                <input type="range" min={0.02} max={0.98} step={0.01} value={slicePosition} onChange={(event) => setSlicePosition(Number(event.target.value))} data-testid="slice-position" />
              </label>
            </details>
            <details open>
              <summary>{t(language, "visibleAssumptions")}</summary>
              <p className="hint">{t(language, "assumptionHint")}</p>
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

function coolingLabel(language: "en" | "zh", type: CoolingObjectType, fallback: string): string {
  if (language === "en") return fallback;
  const labels: Record<CoolingObjectType, string> = {
    "crac-crah": "CRAC / CRAH",
    "in-row-cooler": "列間冷卻",
    "floor-perforated-tile": "高架地板風口",
    "ceiling-supply-diffuser": "天花送風",
    "ceiling-return-grille": "天花回風",
    "wall-supply-grille": "牆面送風",
    "wall-return-grille": "牆面回風",
    cdu: "CDU"
  };
  return labels[type];
}

function containmentLabel(language: "en" | "zh", type: ContainmentType, fallback: string): string {
  if (language === "en") return fallback;
  const labels: Record<ContainmentType, string> = {
    "cold-aisle": "冷通道",
    "hot-aisle": "熱通道",
    "end-of-row-door": "列端門",
    "top-panel": "頂板",
    "side-panel": "側板",
    "full-aisle": "完整通道"
  };
  return labels[type];
}
