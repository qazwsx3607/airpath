import { lazy, Suspense, useEffect } from "react";
import { AlertTriangle, Boxes, ChevronLeft, ChevronRight, FileDown, FileInput, Grid3X3, Play, Redo2, Save, Settings2, Tag, Undo2 } from "lucide-react";
import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";
import { ScenarioBar } from "./components/ScenarioBar";
import { generateReportWithViewportScreenshots } from "./reportCapture";
import { useAirPathStore, type ViewMode } from "./store";

const Viewport3D = lazy(() => import("./components/Viewport3D").then((module) => ({ default: module.Viewport3D })));

const viewModes: Array<{ key: ViewMode; label: string }> = [
  { key: "solid", label: "Solid" },
  { key: "thermal", label: "Thermal" },
  { key: "airflow", label: "Airflow" },
  { key: "combined", label: "Combined" },
  { key: "slice", label: "Slice" },
  { key: "report", label: "Report" }
];

export function App() {
  const scenario = useAirPathStore((state) => state.scenario);
  const result = useAirPathStore((state) => state.result);
  const viewMode = useAirPathStore((state) => state.viewMode);
  const setViewMode = useAirPathStore((state) => state.setViewMode);
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
  const undo = useAirPathStore((state) => state.undo);
  const redo = useAirPathStore((state) => state.redo);
  const deleteSelected = useAirPathStore((state) => state.deleteSelected);
  const clearSelection = useAirPathStore((state) => state.clearSelection);
  const toggleGrid = useAirPathStore((state) => state.toggleGrid);
  const historyPast = useAirPathStore((state) => state.historyPast);
  const historyFuture = useAirPathStore((state) => state.historyFuture);

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
          Sample
          <select
            aria-label="Load sample scenario"
            data-testid="sample-select"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) loadSample(event.target.value);
            }}
          >
            <option value="">Load sample...</option>
            {samples.map((sample) => (
              <option key={sample.key} value={sample.key}>
                {sample.label}
              </option>
            ))}
          </select>
        </label>

        <div className="segmented" aria-label="View mode selector">
          {viewModes.map((mode) => (
            <button
              key={mode.key}
              className={viewMode === mode.key ? "active" : ""}
              type="button"
              onClick={() => setViewMode(mode.key)}
              data-testid={`view-${mode.key}`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="topbar-actions">
          <button type="button" className="ghost icon-button" onClick={toggleLeft} title="Collapse left setup panel">
            {leftCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
          <button type="button" className="ghost icon-button" onClick={toggleRight} title="Collapse right result panel">
            {rightCollapsed ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
          </button>
          <button
            type="button"
            className={`ghost icon-button ${showObjectLabels ? "active" : ""}`}
            onClick={toggleObjectLabels}
            title="Toggle object labels"
            aria-label="Toggle object labels"
            data-testid="toggle-object-labels"
          >
            <Tag size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`ghost icon-button ${showWarningPins ? "active" : ""}`}
            onClick={toggleWarningPins}
            title="Toggle warning pins"
            aria-label="Toggle warning pins"
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
            title="Export JSON"
            aria-label="Export JSON"
          >
            <Save size={16} aria-hidden="true" />
            Export JSON
          </button>
          <label className="secondary file-button" title="Import JSON" aria-label="Import JSON">
            <FileInput size={16} aria-hidden="true" />
            Import JSON
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
          <button type="button" className="primary" onClick={runSimulation} data-testid="run-simulation" title="Run Simulation" aria-label="Run Simulation">
            <Play size={16} aria-hidden="true" />
            Run Simulation
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => void generateReportWithViewportScreenshots()}
            data-testid="generate-report"
            title="Export Report"
            aria-label="Export Report"
          >
            <FileDown size={16} aria-hidden="true" />
            Export Report
          </button>
          <button type="button" className="ghost icon-button" title="Settings">
            <Settings2 size={17} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className={`workspace ${leftCollapsed ? "left-collapsed" : ""} ${rightCollapsed ? "right-collapsed" : ""}`}>
        <LeftPanel />
        <section className="viewport-wrap" aria-label="3D viewport">
          <Suspense fallback={<div className="viewport-loading">Loading 3D viewport</div>}>
            <Viewport3D />
          </Suspense>
          <div className="viewport-metrics" data-testid="viewport-metrics">
            <span>Max inlet {result.metrics.maxRackInletTemperatureC.toFixed(1)} C</span>
            <span>Avg {result.metrics.averageRackInletTemperatureC.toFixed(1)} C</span>
            <span className={result.metrics.criticalWarningCount > 0 ? "critical-text" : result.metrics.warningCount > 0 ? "warning-text" : ""}>
              <AlertTriangle size={14} aria-hidden="true" />
              {result.metrics.warningCount} warnings
            </span>
          </div>
          <div className="viewport-footer">
            <Grid3X3 size={14} aria-hidden="true" />
            Simplified 3D voxel airflow and thermal risk approximation. Not certified CFD.
          </div>
        </section>
        <RightPanel />
      </main>
      <ScenarioBar />
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
