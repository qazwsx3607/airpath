import { AlertTriangle, FileText, Flame, Move, PanelRightClose, Trash2 } from "lucide-react";
import { type RackCoolingMode } from "@airpath/scenario-schema";
import { localizeSeverity, localizeWarningLabel, t } from "../i18n";
import { generateReportWithViewportScreenshots } from "../reportCapture";
import { useAirPathStore, type RightTab } from "../store";

const tabs: Array<{ key: RightTab; label: string }> = [
  { key: "inspector", label: "Inspector" },
  { key: "results", label: "Results" },
  { key: "warnings", label: "Warnings" },
  { key: "report", label: "Report" }
];

export function RightPanel() {
  const language = useAirPathStore((state) => state.language);
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
          <span>{t(language, "scenarioOutput")}</span>
          <strong>{t(language, "inspectorResults")}</strong>
        </div>
        <PanelRightClose size={17} aria-hidden="true" />
      </div>
      <div className="right-tabs">
        {tabs.map((tab) => (
          <button key={tab.key} type="button" className={rightTab === tab.key ? "active" : ""} onClick={() => setRightTab(tab.key)} data-testid={`tab-${tab.key}`}>
            {t(language, tab.key)}
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
  const language = useAirPathStore((state) => state.language);
  const scenario = useAirPathStore((state) => state.scenario);
  const selectedIds = useAirPathStore((state) => state.selectedIds);
  const batchEditSelectedRacks = useAirPathStore((state) => state.batchEditSelectedRacks);
  const batchEditSelectedCoolingObjects = useAirPathStore((state) => state.batchEditSelectedCoolingObjects);
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
        <h2>{t(language, "selection")}</h2>
        <p className="hint">{t(language, "selectionHint")}</p>
      </section>
    );
  }

  return (
    <section className="panel-section" data-testid="inspector">
      <h2>{t(language, "selection")}</h2>
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
            {language === "zh" ? "熱負載" : "Heat load"}
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
            {t(language, "coolingMode")}
            <select
              defaultValue={selectedRacks[0].coolingMode}
              data-testid="selected-cooling-mode"
              onChange={(event) => batchEditSelectedRacks({ coolingMode: event.target.value as RackCoolingMode })}
            >
              <option value="air-cooled">{t(language, "airCooled")}</option>
              <option value="hybrid-liquid-cooled">{t(language, "hybridLiquid")}</option>
              <option value="direct-liquid-cooled">{t(language, "directLiquid")}</option>
            </select>
          </label>
          <label>
            {t(language, "liquidCapture")}
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
            <summary>{language === "zh" ? "移動與調整尺寸" : "Move and resize"}</summary>
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
          </dl>
          <h3>{language === "zh" ? "冷卻屬性" : "Cooling properties"}</h3>
          <div className="form-grid two">
            <MiniNumber
              label={language === "zh" ? "送風溫度" : "Supply temperature"}
              value={selectedCooling[0].supplyTemperatureC}
              step={0.5}
              min={0}
              testId="selected-cooling-supply-temp"
              onCommit={(supplyTemperatureC) => batchEditSelectedCoolingObjects({ supplyTemperatureC })}
            />
            <MiniNumber
              label={language === "zh" ? "風量" : "Airflow rate"}
              value={selectedCooling[0].airflowLps}
              step={25}
              min={0}
              testId="selected-cooling-airflow"
              onCommit={(airflowLps) => batchEditSelectedCoolingObjects({ airflowLps })}
            />
            <MiniNumber
              label={language === "zh" ? "容量" : "Capacity"}
              value={selectedCooling[0].coolingCapacityKw}
              step={1}
              min={0}
              testId="selected-cooling-capacity"
              onCommit={(coolingCapacityKw) => batchEditSelectedCoolingObjects({ coolingCapacityKw })}
            />
            <label>
              {language === "zh" ? "啟用" : "Enabled"}
              <input
                type="checkbox"
                checked={selectedCooling[0].enabled}
                data-testid="selected-cooling-enabled"
                onChange={(event) => batchEditSelectedCoolingObjects({ enabled: event.target.checked })}
              />
            </label>
          </div>
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
  const language = useAirPathStore((state) => state.language);
  const result = useAirPathStore((state) => state.result);
  return (
    <section className="panel-section" data-testid="results-panel">
      <h2>{t(language, "simulationResults")}</h2>
      <div className="result-grid">
        <Metric label={t(language, "maxRackInlet")} value={`${result.metrics.maxRackInletTemperatureC.toFixed(1)} C`} />
        <Metric label={t(language, "averageInlet")} value={`${result.metrics.averageRackInletTemperatureC.toFixed(1)} C`} />
        <Metric label={t(language, "hotspots")} value={`${result.metrics.hotspotCount}`} />
        <Metric label={t(language, "coolingMargin")} value={`${result.metrics.coolingCapacityMarginKw.toFixed(1)} kW`} />
        <Metric label={t(language, "warnings")} value={`${result.metrics.warningCount}`} />
        <Metric label={t(language, "critical")} value={`${result.metrics.criticalWarningCount}`} />
        <Metric label={t(language, "elapsed")} value={`${result.elapsedMs.toFixed(1)} ms`} />
        <Metric label={t(language, "iterations")} value={`${result.iterationCount}`} />
      </div>
      <h3>{t(language, "rackInletEstimates")}</h3>
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
  const language = useAirPathStore((state) => state.language);
  const warnings = useAirPathStore((state) => state.result.warnings);
  const focusWarning = useAirPathStore((state) => state.focusWarning);
  return (
    <section className="panel-section" data-testid="warnings-panel">
      <h2>{t(language, "warnings")}</h2>
      {warnings.length === 0 && <p className="hint">{language === "zh" ? "目前情境未產生警示等級風險。" : "No warning-level risks were generated for the current scenario."}</p>}
      <div className="warning-stack">
        {warnings.map((warning) => (
          <button key={warning.id} type="button" className={`warning-card ${warning.severity}`} onClick={() => focusWarning(warning)} data-testid="warning-card">
            <AlertTriangle size={16} aria-hidden="true" />
            <span>{localizeSeverity(language, warning.severity)}</span>
            <strong>{localizeWarningLabel(language, warning.label)}</strong>
            <p>{warning.message}</p>
            <small>{warning.suggestedMitigation}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function ReportTab() {
  const language = useAirPathStore((state) => state.language);
  const reportHtml = useAirPathStore((state) => state.reportHtml);
  const scenario = useAirPathStore((state) => state.scenario);
  const updateReportSettings = useAirPathStore((state) => state.updateReportSettings);
  const reportSettings = scenario.reportSettings;
  return (
    <section className="panel-section report-panel" data-testid="report-panel">
      <h2>{t(language, "reportExport")}</h2>
      <details open>
        <summary>{t(language, "reportMetadata")}</summary>
        <div className="form-grid two report-meta-grid">
          <TextField label={t(language, "companyName")} value={reportSettings.companyName} testId="report-company" onCommit={(companyName) => updateReportSettings({ companyName })} />
          <TextField label={t(language, "clientName")} value={reportSettings.clientName} testId="report-client" onCommit={(clientName) => updateReportSettings({ clientName, customer: clientName })} />
          <TextField label={t(language, "projectName")} value={reportSettings.projectName} testId="report-project" onCommit={(projectName) => updateReportSettings({ projectName })} />
          <TextField label={t(language, "caseName")} value={reportSettings.caseName} testId="report-case" onCommit={(caseName) => updateReportSettings({ caseName })} />
          <TextField label={t(language, "reportTitle")} value={reportSettings.reportTitle} testId="report-title" onCommit={(reportTitle) => updateReportSettings({ reportTitle })} />
          <TextField label={t(language, "author")} value={reportSettings.author} testId="report-author" onCommit={(author) => updateReportSettings({ author })} />
          <TextField label={t(language, "reportDate")} value={reportSettings.reportDate} testId="report-date" onCommit={(reportDate) => updateReportSettings({ reportDate })} />
          <TextField label={t(language, "revision")} value={reportSettings.revision} testId="report-revision" onCommit={(revision) => updateReportSettings({ revision })} />
        </div>
        <label className="logo-upload">
          {t(language, "logo")}
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            data-testid="report-logo"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.addEventListener("load", () => updateReportSettings({ logoDataUrl: String(reader.result ?? "") }));
              reader.readAsDataURL(file);
            }}
          />
        </label>
      </details>
      <div className="button-row">
        <button type="button" className="primary" onClick={() => void generateReportWithViewportScreenshots()}>
          <FileText size={15} />
          {t(language, "generate")}
        </button>
        <button type="button" className="secondary" onClick={() => downloadReport(reportHtml, `${scenario.metadata.name}.html`)} data-testid="download-report">
          {t(language, "downloadHtml")}
        </button>
        <button type="button" className="secondary" onClick={() => openReport(reportHtml)}>
          {t(language, "open")}
        </button>
      </div>
      <iframe title="AirPath report preview" srcDoc={reportHtml} data-testid="report-preview" />
    </section>
  );
}

function TextField({ label, value, testId, onCommit }: { label: string; value: string; testId: string; onCommit: (value: string) => void }) {
  return (
    <label>
      {label}
      <input type="text" defaultValue={value} data-testid={testId} onBlur={(event) => onCommit(event.target.value)} />
    </label>
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

function MiniNumber({
  label,
  value,
  min = 0.1,
  step = 0.1,
  testId,
  onCommit
}: {
  label: string;
  value: number;
  min?: number;
  step?: number;
  testId?: string;
  onCommit: (value: number) => void;
}) {
  return (
    <label>
      {label}
      <input type="number" min={min} step={step} defaultValue={value} data-testid={testId} onBlur={(event) => onCommit(Number(event.target.value))} />
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
