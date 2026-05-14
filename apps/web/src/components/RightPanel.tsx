import { AlertTriangle, Crosshair, FileText, Flame, Move, PanelRightClose, Trash2 } from "lucide-react";
import { type RackCoolingMode } from "@airpath/scenario-schema";
import { generateReportWithViewportScreenshots } from "../reportCapture";
import { useAirPathStore, type RightTab } from "../store";

const tabs: Array<{ key: RightTab; label: string }> = [
  { key: "inspector", label: "Inspector" },
  { key: "results", label: "Results" },
  { key: "warnings", label: "Warnings" },
  { key: "report", label: "Report" }
];

export function RightPanel() {
  const collapsed = useAirPathStore((state) => state.rightCollapsed);
  const rightTab = useAirPathStore((state) => state.rightTab);
  const setRightTab = useAirPathStore((state) => state.setRightTab);
  const result = useAirPathStore((state) => state.result);

  if (collapsed) {
    return (
      <aside className="right-panel collapsed" aria-label="Results collapsed">
        <button type="button" title="Warnings" onClick={() => setRightTab("warnings")}>
          <AlertTriangle size={17} />
          <span>{result.metrics.warningCount}</span>
        </button>
        <button type="button" title="Results" onClick={() => setRightTab("results")}>
          <Flame size={17} />
          <span>{result.metrics.maxRackInletTemperatureC.toFixed(1)} C</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="right-panel" aria-label="Inspector and results">
      <div className="panel-header">
        <div>
          <span>Scenario Output</span>
          <strong>Inspector / Results</strong>
        </div>
        <PanelRightClose size={17} aria-hidden="true" />
      </div>
      <div className="right-tabs">
        {tabs.map((tab) => (
          <button key={tab.key} type="button" className={rightTab === tab.key ? "active" : ""} onClick={() => setRightTab(tab.key)} data-testid={`tab-${tab.key}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="panel-scroll">
        {rightTab === "inspector" && <Inspector />}
        {rightTab === "results" && <Results />}
        {rightTab === "warnings" && <Warnings />}
        {rightTab === "report" && <ReportTab />}
      </div>
    </aside>
  );
}

function Inspector() {
  const scenario = useAirPathStore((state) => state.scenario);
  const selectedIds = useAirPathStore((state) => state.selectedIds);
  const batchEditSelectedRacks = useAirPathStore((state) => state.batchEditSelectedRacks);
  const resizeSelectedRacks = useAirPathStore((state) => state.resizeSelectedRacks);
  const moveSelectedRacks = useAirPathStore((state) => state.moveSelectedRacks);
  const deleteSelected = useAirPathStore((state) => state.deleteSelected);
  const clearSelection = useAirPathStore((state) => state.clearSelection);
  const selectedRacks = scenario.racks.filter((rack) => selectedIds.includes(rack.id));
  const selectedCooling = scenario.coolingObjects.filter((object) => selectedIds.includes(object.id));
  const selectedContainment = scenario.containmentObjects.filter((object) => selectedIds.includes(object.id));

  if (selectedIds.length === 0) {
    return (
      <section className="panel-section" data-testid="inspector-empty">
        <h2>Selection</h2>
        <p className="hint">Click a rack, cooling object, containment panel, or warning pin in the 3D viewport.</p>
      </section>
    );
  }

  return (
    <section className="panel-section" data-testid="inspector">
      <h2>Selection</h2>
      <div className="selection-chip-row">
        {selectedIds.slice(0, 8).map((id) => (
          <span key={id} className="chip">
            {id}
          </span>
        ))}
      </div>
      {selectedRacks.length > 0 && (
        <div className="inspector-group">
          <h3>{selectedRacks.length === 1 ? selectedRacks[0].name : `${selectedRacks.length} racks selected`}</h3>
          <label>
            Heat load
            <span className="input-with-unit">
              <input
                type="number"
                min={0}
                step={1}
                defaultValue={selectedRacks[0].heatLoadKw}
                data-testid="selected-rack-heat"
                onBlur={(event) => batchEditSelectedRacks({ heatLoadKw: Number(event.target.value) })}
              />
              <em>kW</em>
            </span>
          </label>
          <label>
            Cooling mode
            <select
              defaultValue={selectedRacks[0].coolingMode}
              data-testid="selected-cooling-mode"
              onChange={(event) => batchEditSelectedRacks({ coolingMode: event.target.value as RackCoolingMode })}
            >
              <option value="air-cooled">Air cooled</option>
              <option value="hybrid-liquid-cooled">Hybrid liquid cooled</option>
              <option value="direct-liquid-cooled">Direct liquid cooled</option>
            </select>
          </label>
          <label>
            Liquid capture ratio
            <span className="input-with-unit">
              <input
                type="number"
                min={0}
                max={0.98}
                step={0.05}
                defaultValue={selectedRacks[0].liquidCaptureRatio}
                data-testid="selected-liquid-capture"
                onBlur={(event) => batchEditSelectedRacks({ liquidCaptureRatio: Number(event.target.value) })}
              />
              <em>ratio</em>
            </span>
          </label>
          <details>
            <summary>Move and resize</summary>
            <div className="button-row compact">
              <button type="button" className="secondary" onClick={() => moveSelectedRacks(-0.25, 0)}>
                <Move size={14} />
                X-
              </button>
              <button type="button" className="secondary" onClick={() => moveSelectedRacks(0.25, 0)}>
                X+
              </button>
              <button type="button" className="secondary" onClick={() => moveSelectedRacks(0, -0.25)}>
                Z-
              </button>
              <button type="button" className="secondary" onClick={() => moveSelectedRacks(0, 0.25)}>
                Z+
              </button>
            </div>
            <div className="form-grid three">
              <MiniNumber label="W" value={selectedRacks[0].size.width} onCommit={(value) => resizeSelectedRacks({ width: value })} />
              <MiniNumber label="D" value={selectedRacks[0].size.depth} onCommit={(value) => resizeSelectedRacks({ depth: value })} />
              <MiniNumber label="H" value={selectedRacks[0].size.height} onCommit={(value) => resizeSelectedRacks({ height: value })} />
            </div>
          </details>
        </div>
      )}

      {selectedCooling.length > 0 && (
        <div className="inspector-group">
          <h3>{selectedCooling[0].name}</h3>
          <dl>
            <dt>Type</dt>
            <dd>{selectedCooling[0].type}</dd>
            <dt>Supply</dt>
            <dd>{selectedCooling[0].supplyTemperatureC.toFixed(1)} C, {selectedCooling[0].airflowLps.toFixed(0)} L/s</dd>
            <dt>Capacity</dt>
            <dd>{selectedCooling[0].coolingCapacityKw.toFixed(1)} kW</dd>
          </dl>
        </div>
      )}

      {selectedContainment.length > 0 && (
        <div className="inspector-group">
          <h3>{selectedContainment[0].name}</h3>
          <p className="hint">{selectedContainment[0].type} is included in the solver as an airflow barrier.</p>
        </div>
      )}

      <div className="button-row">
        <button className="danger" type="button" onClick={deleteSelected} data-testid="delete-selected">
          <Trash2 size={15} />
          Delete
        </button>
        <button className="secondary" type="button" onClick={clearSelection}>
          Clear
        </button>
      </div>
    </section>
  );
}

function Results() {
  const result = useAirPathStore((state) => state.result);
  return (
    <section className="panel-section" data-testid="results-panel">
      <h2>Simulation Results</h2>
      <div className="result-grid">
        <Metric label="Max rack inlet" value={`${result.metrics.maxRackInletTemperatureC.toFixed(1)} C`} />
        <Metric label="Average inlet" value={`${result.metrics.averageRackInletTemperatureC.toFixed(1)} C`} />
        <Metric label="Hotspots" value={`${result.metrics.hotspotCount}`} />
        <Metric label="Cooling margin" value={`${result.metrics.coolingCapacityMarginKw.toFixed(1)} kW`} />
        <Metric label="Warnings" value={`${result.metrics.warningCount}`} />
        <Metric label="Critical" value={`${result.metrics.criticalWarningCount}`} />
        <Metric label="Elapsed" value={`${result.elapsedMs.toFixed(1)} ms`} />
        <Metric label="Iterations" value={`${result.iterationCount}`} />
      </div>
      <h3>Rack inlet estimates</h3>
      <div className="compact-table" data-testid="rack-inlets">
        {result.rackInlets.slice(0, 12).map((rack) => (
          <div key={rack.rackId}>
            <span>{rack.rackName}</span>
            <strong className={`risk-text ${rack.risk}`}>{rack.inletTemperatureC.toFixed(1)} C</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function Warnings() {
  const warnings = useAirPathStore((state) => state.result.warnings);
  const focusWarning = useAirPathStore((state) => state.focusWarning);
  return (
    <section className="panel-section" data-testid="warnings-panel">
      <h2>Warnings</h2>
      {warnings.length === 0 && <p className="hint">No warning-level risks were generated for the current scenario.</p>}
      <div className="warning-stack">
        {warnings.map((warning) => (
          <button key={warning.id} type="button" className={`warning-card ${warning.severity}`} onClick={() => focusWarning(warning)} data-testid="warning-card">
            <AlertTriangle size={16} aria-hidden="true" />
            <span>{warning.severity}</span>
            <strong>{warning.label}</strong>
            <p>{warning.message}</p>
            <small>{warning.suggestedMitigation}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function ReportTab() {
  const reportHtml = useAirPathStore((state) => state.reportHtml);
  const scenario = useAirPathStore((state) => state.scenario);
  return (
    <section className="panel-section report-panel" data-testid="report-panel">
      <h2>Report Export</h2>
      <div className="button-row">
        <button type="button" className="primary" onClick={() => void generateReportWithViewportScreenshots()}>
          <FileText size={15} />
          Generate
        </button>
        <button type="button" className="secondary" onClick={() => downloadReport(reportHtml, `${scenario.metadata.name}.html`)} data-testid="download-report">
          Download HTML
        </button>
        <button type="button" className="secondary" onClick={() => openReport(reportHtml)}>
          Open
        </button>
      </div>
      <iframe title="AirPath report preview" srcDoc={reportHtml} data-testid="report-preview" />
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MiniNumber({ label, value, onCommit }: { label: string; value: number; onCommit: (value: number) => void }) {
  return (
    <label>
      {label}
      <input type="number" min={0.1} step={0.1} defaultValue={value} onBlur={(event) => onCommit(Number(event.target.value))} />
    </label>
  );
}

function downloadReport(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function openReport(html: string) {
  const popup = window.open("", "_blank", "noopener,noreferrer");
  if (!popup) return;
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}
