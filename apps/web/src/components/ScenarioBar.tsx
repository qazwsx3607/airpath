import { BarChart3, ChevronDown, Copy, GitCompareArrows, PlusCircle } from "lucide-react";
import { useAirPathStore } from "../store";

export function ScenarioBar() {
  const bottomCollapsed = useAirPathStore((state) => state.bottomCollapsed);
  const toggleBottom = useAirPathStore((state) => state.toggleBottom);
  const statusMessage = useAirPathStore((state) => state.statusMessage);
  const result = useAirPathStore((state) => state.result);
  const comparison = useAirPathStore((state) => state.comparison);
  const scenarioB = useAirPathStore((state) => state.scenarioB);
  const resultB = useAirPathStore((state) => state.resultB);
  const duplicateScenarioB = useAirPathStore((state) => state.duplicateScenarioB);
  const improveScenarioB = useAirPathStore((state) => state.improveScenarioB);
  const compareScenarios = useAirPathStore((state) => state.compareScenarios);

  if (bottomCollapsed) {
    return (
      <footer className="scenario-bar collapsed">
        <button type="button" onClick={toggleBottom}>
          <ChevronDown size={15} />
          {statusMessage}
        </button>
      </footer>
    );
  }

  return (
    <footer className="scenario-bar" data-testid="scenario-bar">
      <div className="scenario-status">
        <BarChart3 size={16} aria-hidden="true" />
        <span>{statusMessage}</span>
      </div>
      <div className="scenario-actions">
        <button type="button" className="secondary" onClick={duplicateScenarioB} data-testid="duplicate-scenario">
          <Copy size={15} />
          Duplicate B
        </button>
        <button type="button" className="secondary" onClick={improveScenarioB} data-testid="improve-scenario">
          <PlusCircle size={15} />
          Improve B
        </button>
        <button type="button" className="primary" onClick={compareScenarios} data-testid="compare-scenarios">
          <GitCompareArrows size={15} />
          Compare
        </button>
      </div>
      <div className="compare-grid" data-testid="comparison-panel">
        <div>
          <span>Scenario A max</span>
          <strong>{result.metrics.maxRackInletTemperatureC.toFixed(1)} C</strong>
        </div>
        <div>
          <span>Scenario B max</span>
          <strong>{resultB ? `${resultB.metrics.maxRackInletTemperatureC.toFixed(1)} C` : scenarioB ? "Ready" : "Not created"}</strong>
        </div>
        <div>
          <span>Delta</span>
          <strong>{comparison ? `${comparison.maxRackInletDeltaC > 0 ? "+" : ""}${comparison.maxRackInletDeltaC.toFixed(1)} C` : "--"}</strong>
        </div>
        <div className="compare-summary">
          <span>Recommendation</span>
          <strong>{comparison?.recommendationSummary ?? "Duplicate Scenario B, modify it, then compare."}</strong>
        </div>
      </div>
      <button type="button" className="ghost icon-button" onClick={toggleBottom} title="Collapse scenario comparison">
        <ChevronDown size={16} />
      </button>
    </footer>
  );
}
