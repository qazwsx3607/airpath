import { BarChart3, ChevronDown, Copy, GitCompareArrows, PlusCircle } from "lucide-react";
import { t } from "../i18n";
import { useAirPathStore } from "../store";

export function ScenarioBar() {
  const language = useAirPathStore((state) => state.language);
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
          {t(language, "duplicateB")}
        </button>
        <button type="button" className="secondary" onClick={improveScenarioB} data-testid="improve-scenario">
          <PlusCircle size={15} />
          {t(language, "improveB")}
        </button>
        <button type="button" className="primary" onClick={compareScenarios} data-testid="compare-scenarios">
          <GitCompareArrows size={15} />
          {t(language, "compare")}
        </button>
      </div>
      <div className="compare-grid" data-testid="comparison-panel">
        <div>
          <span>{t(language, "scenarioAMax")}</span>
          <strong>{result.metrics.maxRackInletTemperatureC.toFixed(1)} C</strong>
        </div>
        <div>
          <span>{t(language, "scenarioBMax")}</span>
          <strong>{resultB ? `${resultB.metrics.maxRackInletTemperatureC.toFixed(1)} C` : scenarioB ? (language === "zh" ? "就緒" : "Ready") : (language === "zh" ? "未建立" : "Not created")}</strong>
        </div>
        <div>
          <span>{t(language, "delta")}</span>
          <strong>{comparison ? `${comparison.maxRackInletDeltaC > 0 ? "+" : ""}${comparison.maxRackInletDeltaC.toFixed(1)} C` : "--"}</strong>
        </div>
        <div className="compare-summary">
          <span>{t(language, "recommendation")}</span>
          <strong>{comparisonSummary(language, comparison?.recommendationSummary)}</strong>
        </div>
      </div>
      <button type="button" className="ghost icon-button" onClick={toggleBottom} title="Collapse scenario comparison">
        <ChevronDown size={16} />
      </button>
    </footer>
  );
}

function comparisonSummary(language: "en" | "zh", summary?: string): string {
  if (language === "en") return summary ?? "Duplicate Scenario B, modify it, then compare.";
  if (!summary) return "複製情境 B，調整後再比較。";
  if (summary.includes("reduces")) return "情境 B 相較情境 A 降低熱風險指標。";
  if (summary.includes("increases")) return "情境 B 相較情境 A 提高熱風險指標。";
  return "情境 B 與情境 A 在追蹤指標上大致相近。";
}
