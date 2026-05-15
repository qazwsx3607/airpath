import { lazy, Suspense, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Boxes,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileInput,
  Flame,
  Grid3X3,
  Languages,
  LockKeyhole,
  MousePointer2,
  Move3D,
  Play,
  Redo2,
  Ruler,
  Save,
  Settings2,
  Tag,
  Undo2,
  Wind
} from "lucide-react";
import { LeftPanel } from "./components/LeftPanel";
import { PlanView } from "./components/PlanView";
import { RightPanel } from "./components/RightPanel";
import { ScenarioBar } from "./components/ScenarioBar";
import { localizeSampleLabel, t } from "./i18n";
import { generateReportWithViewportScreenshots } from "./reportCapture";
import { useAirPathStore, type ViewMode } from "./store";
import { resolveThermalScale, thermalGradientCss, thermalGradientCssVertical, thermalPalettes, thermalTicks } from "./thermalPalette";

const Viewport3D = lazy(() => import("./components/Viewport3D").then((module) => ({ default: module.Viewport3D })));

const viewModes: Array<{ key: ViewMode; labelKey: Parameters<typeof t>[1] }> = [
  { key: "solid", labelKey: "solid" },
  { key: "thermal", labelKey: "thermal" },
  { key: "airflow", labelKey: "airflow" },
  { key: "combined", labelKey: "combined" },
  { key: "slice", labelKey: "slice" },
  { key: "report", labelKey: "report" }
];

export function App() {
  const scenario = useAirPathStore((state) => state.scenario);
  const result = useAirPathStore((state) => state.result);
  const viewMode = useAirPathStore((state) => state.viewMode);
  const setViewMode = useAirPathStore((state) => state.setViewMode);
  const workspaceMode = useAirPathStore((state) => state.workspaceMode);
  const setWorkspaceMode = useAirPathStore((state) => state.setWorkspaceMode);
  const language = useAirPathStore((state) => state.language);
  const setLanguage = useAirPathStore((state) => state.setLanguage);
  const editMode = useAirPathStore((state) => state.editMode);
  const setEditMode = useAirPathStore((state) => state.setEditMode);
  const runSimulation = useAirPathStore((state) => state.runSimulation);
  const exportScenarioJson = useAirPathStore((state) => state.exportScenarioJson);
  const importScenarioJson = useAirPathStore((state) => state.importScenarioJson);
  const loadSample = useAirPathStore((state) => state.loadSample);
  const samples = useAirPathStore((state) => state.samples);
  const leftCollapsed = useAirPathStore((state) => state.leftCollapsed);
  const rightCollapsed = useAirPathStore((state) => state.rightCollapsed);
  const toggleLeft = useAirPathStore((state) => state.toggleLeft);
  const toggleRight = useAirPathStore((state) => state.toggleRight);
  const showObjectLabels = useAirPathStore((state) => state.showObjectLabels);
  const showWarningPins = useAirPathStore((state) => state.showWarningPins);
  const toggleObjectLabels = useAirPathStore((state) => state.toggleObjectLabels);
  const toggleWarningPins = useAirPathStore((state) => state.toggleWarningPins);
  const showGrid = useAirPathStore((state) => state.showGrid);
  const showAirflowLayer = useAirPathStore((state) => state.showAirflowLayer);
  const showHeatmapLayer = useAirPathStore((state) => state.showHeatmapLayer);
  const showThermalZones = useAirPathStore((state) => state.showThermalZones);
  const showZoneLabels = useAirPathStore((state) => state.showZoneLabels);
  const showAirflowBoundaries = useAirPathStore((state) => state.showAirflowBoundaries);
  const showDimensions = useAirPathStore((state) => state.showDimensions);
  const toggleAirflowLayer = useAirPathStore((state) => state.toggleAirflowLayer);
  const toggleHeatmapLayer = useAirPathStore((state) => state.toggleHeatmapLayer);
  const toggleThermalZones = useAirPathStore((state) => state.toggleThermalZones);
  const toggleZoneLabels = useAirPathStore((state) => state.toggleZoneLabels);
  const toggleAirflowBoundaries = useAirPathStore((state) => state.toggleAirflowBoundaries);
  const toggleDimensions = useAirPathStore((state) => state.toggleDimensions);
  const undo = useAirPathStore((state) => state.undo);
  const redo = useAirPathStore((state) => state.redo);
  const deleteSelected = useAirPathStore((state) => state.deleteSelected);
  const clearSelection = useAirPathStore((state) => state.clearSelection);
  const selectedIds = useAirPathStore((state) => state.selectedIds);
  const moveSelectedObjects = useAirPathStore((state) => state.moveSelectedObjects);
  const rotateSelectedObjects = useAirPathStore((state) => state.rotateSelectedObjects);
  const toggleGrid = useAirPathStore((state) => state.toggleGrid);
  const historyPast = useAirPathStore((state) => state.historyPast);
  const historyFuture = useAirPathStore((state) => state.historyFuture);
  const runStatus = useAirPathStore((state) => state.runStatus);
  const simulationRunId = useAirPathStore((state) => state.simulationRunId);
  const lastRunAt = useAirPathStore((state) => state.lastRunAt);
  const lastRunElapsedMs = useAirPathStore((state) => state.lastRunElapsedMs);
  const resultsStale = useAirPathStore((state) => state.resultsStale);
  const thermalTopology = useAirPathStore((state) => state.thermalTopology);
  const thermalPalette = useAirPathStore((state) => state.thermalPalette);
  const thermalColorMode = useAirPathStore((state) => state.thermalColorMode);
  const thermalScaleMode = useAirPathStore((state) => state.thermalScaleMode);
  const thermalMinC = useAirPathStore((state) => state.thermalMinC);
  const thermalMaxC = useAirPathStore((state) => state.thermalMaxC);
  const thermalCriticalC = useAirPathStore((state) => state.thermalCriticalC);
  const thermalContrast = useAirPathStore((state) => state.thermalContrast);
  const thermalOpacity = useAirPathStore((state) => state.thermalOpacity);
  const colorbarPosition = useAirPathStore((state) => state.colorbarPosition);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT";
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === "y" || (event.shiftKey && event.key.toLowerCase() === "z"))) {
        event.preventDefault();
        redo();
        return;
      }
      if (isTyping) return;
      if (event.key === "Delete") {
        deleteSelected();
      } else if (event.key === "Escape") {
        clearSelection();
      } else if (event.key.toLowerCase() === "g") {
        toggleGrid();
      } else if (event.key.toLowerCase() === "h") {
        setViewMode(viewMode === "thermal" ? "solid" : "thermal");
      } else if (event.key.toLowerCase() === "l") {
        toggleObjectLabels();
      } else if (event.key.toLowerCase() === "w") {
        toggleWarningPins();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [clearSelection, deleteSelected, redo, setViewMode, toggleGrid, toggleObjectLabels, toggleWarningPins, undo, viewMode]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Boxes size={22} aria-hidden="true" />
          <div>
          <strong>AirPath</strong>
          <span>{scenario.metadata.name}</span>
          </div>
        </div>

        <label className="topbar-select">
          {t(language, "sample")}
          <select
            aria-label="Load sample scenario"
            data-testid="sample-select"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) loadSample(event.target.value);
            }}
          >
            <option value="">{t(language, "loadSample")}</option>
            {samples.map((sample) => (
              <option key={sample.key} value={sample.key}>
                {localizeSampleLabel(language, sample.key, sample.label)}
              </option>
            ))}
          </select>
        </label>

        <div className="segmented workspace-switch" aria-label="Workspace mode selector">
          <button type="button" className={workspaceMode === "three" ? "active" : ""} onClick={() => setWorkspaceMode("three")} data-testid="workspace-3d">
            3D
          </button>
          <button type="button" className={workspaceMode === "plan" ? "active" : ""} onClick={() => setWorkspaceMode("plan")} data-testid="workspace-plan">
            Plan
          </button>
        </div>

        <div className="segmented view-switch" aria-label="View mode selector">
          {viewModes.map((mode) => (
            <button
              key={mode.key}
              className={viewMode === mode.key ? "active" : ""}
              type="button"
              onClick={() => setViewMode(mode.key)}
              data-testid={`view-${mode.key}`}
            >
              {t(language, mode.labelKey)}
            </button>
          ))}
        </div>

        <div className="topbar-actions">
          <button type="button" className="ghost icon-button" onClick={toggleLeft} title={t(language, "collapseLeft")}>
            {leftCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
          <button type="button" className="ghost icon-button" onClick={toggleRight} title={t(language, "collapseRight")}>
            {rightCollapsed ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
          </button>
          <button
            type="button"
            className={`ghost icon-button ${showObjectLabels ? "active" : ""}`}
            onClick={toggleObjectLabels}
            title={t(language, "toggleLabels")}
            aria-label={t(language, "toggleLabels")}
            data-testid="toggle-object-labels"
          >
            <Tag size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`ghost icon-button ${showWarningPins ? "active" : ""}`}
            onClick={toggleWarningPins}
            title={t(language, "toggleWarnings")}
            aria-label={t(language, "toggleWarnings")}
            data-testid="toggle-warning-pins"
          >
            <AlertTriangle size={17} aria-hidden="true" />
          </button>
          <button type="button" className="ghost icon-button" onClick={undo} disabled={historyPast.length === 0} title="Undo" data-testid="undo-button">
            <Undo2 size={17} />
          </button>
          <button type="button" className="ghost icon-button" onClick={redo} disabled={historyFuture.length === 0} title="Redo" data-testid="redo-button">
            <Redo2 size={17} />
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => downloadText(exportScenarioJson(), `${scenario.metadata.name}.airpath.json`, "application/json")}
            data-testid="export-json"
            title={t(language, "exportJson")}
            aria-label={t(language, "exportJson")}
          >
            <Save size={16} aria-hidden="true" />
            {t(language, "exportJson")}
          </button>
          <label className="secondary file-button" title={t(language, "importJson")} aria-label={t(language, "importJson")}>
            <FileInput size={16} aria-hidden="true" />
            {t(language, "importJson")}
            <input
              type="file"
              accept="application/json,.json,.airpath.json"
              data-testid="import-json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                file.text().then(importScenarioJson).catch(() => undefined);
                event.target.value = "";
              }}
            />
          </label>
          <button type="button" className="primary" onClick={runSimulation} data-testid="run-simulation" title={t(language, "runSimulation")} aria-label={t(language, "runSimulation")}>
            <Play size={16} aria-hidden="true" />
            {t(language, "runSimulation")}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => void generateReportWithViewportScreenshots()}
            data-testid="generate-report"
            title={t(language, "exportReport")}
            aria-label={t(language, "exportReport")}
          >
            <FileDown size={16} aria-hidden="true" />
            {t(language, "exportReport")}
          </button>
          <button
            type="button"
            className="ghost icon-button"
            title={t(language, "language")}
            aria-label={t(language, "language")}
            onClick={() => setLanguage(language === "en" ? "zh" : "en")}
            data-testid="language-toggle"
          >
            <Languages size={17} aria-hidden="true" />
          </button>
          <button type="button" className="ghost icon-button" title="Settings">
            <Settings2 size={17} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className={`workspace ${leftCollapsed ? "left-collapsed" : ""} ${rightCollapsed ? "right-collapsed" : ""}`}>
        <LeftPanel />
        <section className={`viewport-wrap ${workspaceMode === "plan" ? "plan-active" : ""}`} aria-label={workspaceMode === "plan" ? "Plan layout viewport" : "3D viewport"}>
          {workspaceMode === "plan" ? (
            <PlanView />
          ) : (
            <Suspense fallback={<div className="viewport-loading">Loading 3D viewport</div>}>
              <Viewport3D />
            </Suspense>
          )}
          <div className="viewport-metrics" data-testid="viewport-metrics">
            <span>{language === "zh" ? "最高" : "Max inlet"} {result.metrics.maxRackInletTemperatureC.toFixed(1)} C</span>
            <span>{language === "zh" ? "平均" : "Avg"} {result.metrics.averageRackInletTemperatureC.toFixed(1)} C</span>
            <span className={result.metrics.criticalWarningCount > 0 ? "critical-text" : result.metrics.warningCount > 0 ? "warning-text" : ""}>
              <AlertTriangle size={14} aria-hidden="true" />
              {result.metrics.warningCount} {t(language, "warnings")}
            </span>
            <span className={`run-status ${runStatus}`} data-testid="run-status">
              Run #{simulationRunId} {runStatus}
            </span>
            <span data-testid="thermal-zone-count">
              {thermalTopology.thermalZones.length} thermal zone{thermalTopology.thermalZones.length === 1 ? "" : "s"}
            </span>
          </div>
          {resultsStale && (
            <div className="stale-banner" data-testid="stale-banner">
              Results are outdated. Run simulation again.
            </div>
          )}
          <div className="viewport-tools" data-testid="viewport-tools">
            <div className="viewport-tool-group">
              <span>{t(language, "editMode")}</span>
              <button type="button" className={editMode === "locked" ? "active" : ""} onClick={() => setEditMode("locked")} data-testid="edit-mode-locked">
                <LockKeyhole size={13} />
                {t(language, "locked")}
              </button>
              <button type="button" className={editMode === "select" ? "active" : ""} onClick={() => setEditMode("select")} data-testid="edit-mode-select">
                <MousePointer2 size={13} />
                {t(language, "selectMode")}
              </button>
              <button type="button" className={editMode === "move" ? "active" : ""} onClick={() => setEditMode("move")} data-testid="edit-mode-move">
                <Move3D size={13} />
                {t(language, "moveMode")}
              </button>
            </div>
            <div className="viewport-tool-group">
              <span>{t(language, "layers")}</span>
              <button type="button" className={showGrid ? "active" : ""} onClick={toggleGrid} data-testid="layer-grid">
                <Grid3X3 size={13} />
                {t(language, "grid")}
              </button>
              <button type="button" className={showObjectLabels ? "active" : ""} onClick={toggleObjectLabels} data-testid="layer-labels">
                <Tag size={13} />
                {t(language, "labels")}
              </button>
              <button type="button" className={showWarningPins ? "active" : ""} onClick={toggleWarningPins} data-testid="layer-warnings">
                <AlertTriangle size={13} />
                {t(language, "warnings")}
              </button>
              <button type="button" className={showHeatmapLayer ? "active" : ""} onClick={toggleHeatmapLayer} data-testid="layer-heatmap">
                <Flame size={13} />
                {t(language, "heatmap")}
              </button>
              <button type="button" className={showThermalZones ? "active" : ""} onClick={toggleThermalZones} data-testid="layer-thermal-zones">
                <Boxes size={13} />
                Zones
              </button>
              <button type="button" className={showZoneLabels ? "active" : ""} onClick={toggleZoneLabels} data-testid="layer-zone-labels">
                <Tag size={13} />
                Zone labels
              </button>
              <button type="button" className={showAirflowBoundaries ? "active" : ""} onClick={toggleAirflowBoundaries} data-testid="layer-airflow-boundaries">
                <Wind size={13} />
                Boundaries
              </button>
              <button type="button" className={showAirflowLayer ? "active" : ""} onClick={toggleAirflowLayer} data-testid="layer-airflow">
                <Wind size={13} />
                {t(language, "streamlines")}
              </button>
              <button type="button" className={showDimensions ? "active" : ""} onClick={toggleDimensions} data-testid="layer-dimensions">
                <Ruler size={13} />
                {t(language, "dimensions")}
              </button>
            </div>
          </div>
          <div className="viewport-footer">
            <Grid3X3 size={14} aria-hidden="true" />
            {t(language, "statusFooter")}
            <span data-testid="simulation-run-id">Formal run #{simulationRunId}</span>
            <span data-testid="last-run-time">{lastRunAt ? new Date(lastRunAt).toLocaleTimeString() : "Not run"}</span>
            <span data-testid="last-run-elapsed">{lastRunElapsedMs ? `${lastRunElapsedMs.toFixed(1)} ms` : "-"}</span>
          </div>
          {workspaceMode === "three" && editMode === "move" && selectedIds.length > 0 && (
            <div className="screen-gumball" data-testid="screen-gumball">
              <strong>Transform</strong>
              <button type="button" onClick={() => moveSelectedObjects(-0.25, 0)} data-testid="screen-gumball-x-minus">X-</button>
              <button type="button" onClick={() => moveSelectedObjects(0.25, 0)} data-testid="screen-gumball-x-plus">X+</button>
              <button type="button" onClick={() => moveSelectedObjects(0, -0.25)} data-testid="screen-gumball-y-minus">Y-</button>
              <button type="button" onClick={() => moveSelectedObjects(0, 0.25)} data-testid="screen-gumball-y-plus">Y+</button>
              <button type="button" onClick={() => moveSelectedObjects(0.25, 0.25)} data-testid="screen-gumball-plane">XY</button>
              <button type="button" onClick={() => rotateSelectedObjects(90)} data-testid="screen-gumball-rotate">R</button>
            </div>
          )}
          {workspaceMode === "three" && showHeatmapLayer && colorbarPosition !== "hidden" && (viewMode === "thermal" || viewMode === "combined" || viewMode === "slice") && (
            <ThermalColorbar
              palette={thermalPalette}
              colorMode={thermalColorMode}
              scaleMode={thermalScaleMode}
              minC={thermalMinC}
              maxC={thermalMaxC}
              criticalC={thermalCriticalC}
              contrast={thermalContrast}
              opacity={thermalOpacity}
              colorbarPosition={colorbarPosition}
              values={result.temperatureFieldC}
              fallbackAmbientC={result.settings.ambientTemperatureC}
              fallbackCriticalC={result.settings.criticalTemperatureC}
            />
          )}
        </section>
        <RightPanel />
      </main>
      <ScenarioBar />
    </div>
  );
}

function ThermalColorbar({
  palette,
  colorMode,
  scaleMode,
  minC,
  maxC,
  criticalC,
  contrast,
  opacity,
  colorbarPosition,
  values,
  fallbackAmbientC,
  fallbackCriticalC
}: {
  palette: Parameters<typeof thermalGradientCss>[0];
  colorMode: "smooth" | "stepped";
  scaleMode: "auto" | "manual";
  minC: number;
  maxC: number;
  criticalC: number;
  contrast: number;
  opacity: number;
  colorbarPosition: "bottom" | "right" | "hidden";
  values: number[];
  fallbackAmbientC: number;
  fallbackCriticalC: number;
}) {
  const scale = useMemo(
    () =>
      resolveThermalScale(
        values,
        { palette, colorMode, scaleMode, minC, maxC, criticalC, contrast, opacity, colorbarPosition },
        fallbackAmbientC,
        fallbackCriticalC
      ),
    [colorMode, colorbarPosition, contrast, criticalC, fallbackAmbientC, fallbackCriticalC, maxC, minC, opacity, palette, scaleMode, values]
  );
  const ticks = thermalTicks(scale, colorbarPosition === "right" ? 6 : 5);
  const stepped = colorMode === "stepped";
  const gradient = colorbarPosition === "right" ? thermalGradientCssVertical(palette, stepped) : thermalGradientCss(palette, stepped);
  const thresholdOffset = `${Math.max(0, Math.min(100, ((scale.criticalC - scale.minC) / Math.max(0.1, scale.maxC - scale.minC)) * 100))}%`;
  return (
    <div className={`thermal-colorbar ${colorbarPosition}`} data-testid={`thermal-colorbar-${colorbarPosition}`}>
      <div className="thermal-colorbar-head">
        <strong>Temperature (C)</strong>
        <span>{thermalPalettes[palette].name} · {scale.mode === "manual" ? "Manual" : "Auto"} · {stepped ? "Stepped" : "Smooth"}</span>
      </div>
      <div className="thermal-colorbar-track" style={{ background: gradient }}>
        <span className="thermal-threshold" style={colorbarPosition === "right" ? { bottom: thresholdOffset } : { left: thresholdOffset }} />
      </div>
      <div className="thermal-colorbar-ticks">
        {ticks.map((tick) => (
          <span key={tick.toFixed(2)}>{tick.toFixed(1)} C</span>
        ))}
      </div>
    </div>
  );
}

function downloadText(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
