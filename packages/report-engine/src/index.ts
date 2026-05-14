import {
  AIRPATH_DISCLAIMER,
  type ContainmentObject,
  type CoolingObject,
  type Rack,
  type Scenario,
  residualAirHeatKw,
  round
} from "@airpath/scenario-schema";
import type { RackInletResult, SimulationResult, SimulationWarning } from "@airpath/solver-core";

export interface ReportScreenshots {
  layout?: string;
  thermal?: string;
  airflow?: string;
}

export interface ReportData {
  title: string;
  generatedAt: string;
  scenario: Scenario;
  result: SimulationResult;
  screenshots: ReportScreenshots;
  rackRows: Array<Rack & RackInletResult>;
  recommendedActions: string[];
  assumptions: string[];
  disclaimer: string;
}

export interface ScenarioComparison {
  scenarioAName: string;
  scenarioBName: string;
  maxRackInletDeltaC: number;
  averageRackInletDeltaC: number;
  hotspotDelta: number;
  coolingMarginDeltaKw: number;
  warningDelta: number;
  criticalWarningDelta: number;
  recommendationSummary: string;
}

export function createReportData(
  scenario: Scenario,
  result: SimulationResult,
  screenshots: ReportScreenshots = {}
): ReportData {
  const rackRows = scenario.racks.map((rack) => {
    const rackResult =
      result.rackInlets.find((candidate) => candidate.rackId === rack.id) ??
      ({
        rackId: rack.id,
        rackName: rack.name,
        inletTemperatureC: scenario.simulationSettings.ambientTemperatureC,
        residualAirHeatKw: residualAirHeatKw(rack.heatLoadKw, rack.liquidCaptureRatio, rack.coolingMode),
        airflowCoverage: 0,
        risk: "normal",
        position: rack.position
      } satisfies RackInletResult);
    return { ...rack, ...rackResult };
  });

  return {
    title: `${scenario.metadata.name} Airflow Review`,
    generatedAt: new Date().toISOString(),
    scenario,
    result,
    screenshots,
    rackRows,
    recommendedActions: createRecommendedActions(result.warnings),
    assumptions: modelAssumptions(),
    disclaimer: AIRPATH_DISCLAIMER
  };
}

export function renderHtmlReport(data: ReportData): string {
  const { scenario, result } = data;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(data.title)}</title>
  <style>${reportCss()}</style>
</head>
<body>
  <main class="report">
    <header class="report-header">
      <p class="eyebrow">AirPath pre-sales thermal review</p>
      <h1>${escapeHtml(data.title)}</h1>
      <div class="meta-grid">
        <span><strong>Generated</strong>${formatDate(data.generatedAt)}</span>
        <span><strong>Customer</strong>${escapeHtml(scenario.reportSettings.customer || "Concept review")}</span>
        <span><strong>Author</strong>${escapeHtml(scenario.reportSettings.author || "AirPath")}</span>
        <span><strong>Schema</strong>${escapeHtml(scenario.schemaVersion)}</span>
      </div>
    </header>

    <section>
      <h2>Executive Summary</h2>
      <div class="metric-grid">
        ${metricCard("Max inlet", `${result.metrics.maxRackInletTemperatureC.toFixed(1)} C`)}
        ${metricCard("Average inlet", `${result.metrics.averageRackInletTemperatureC.toFixed(1)} C`)}
        ${metricCard("Hotspots", `${result.metrics.hotspotCount}`)}
        ${metricCard("Cooling margin", `${result.metrics.coolingCapacityMarginKw.toFixed(1)} kW`)}
        ${metricCard("Warnings", `${result.metrics.warningCount}`)}
        ${metricCard("Critical", `${result.metrics.criticalWarningCount}`)}
      </div>
      <p>${summarySentence(result)}</p>
    </section>

    <section>
      <h2>Room Setup</h2>
      <table>
        <tbody>
          <tr><th>Room</th><td>${escapeHtml(scenario.room.name)}</td></tr>
          <tr><th>Dimensions</th><td>${scenario.room.width}m W x ${scenario.room.depth}m D x ${scenario.room.height}m H</td></tr>
          <tr><th>Ambient target</th><td>${scenario.room.ambientTemperatureC} C</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>Rack Heat Load Table</h2>
      <table>
        <thead>
          <tr><th>Rack</th><th>IT load</th><th>Cooling mode</th><th>Residual air heat</th><th>Inlet temp</th><th>Risk</th></tr>
        </thead>
        <tbody>
          ${data.rackRows.map((rack) => rackRow(rack)).join("")}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Cooling Setup</h2>
      ${objectTable(scenario.coolingObjects)}
    </section>

    <section>
      <h2>Containment Setup</h2>
      ${containmentTable(scenario.containmentObjects)}
    </section>

    <section>
      <h2>Temperature Review</h2>
      <p>Rack inlet estimates are generated from the simplified voxel temperature field. Thermal visualization uses cyan, slate, amber, orange, and red risk colors.</p>
      ${imageBlock("Thermal view", data.screenshots.thermal)}
    </section>

    <section>
      <h2>Airflow Review</h2>
      <p>Airflow particles and streamlines are generated from the solver vector field, including supply, return, obstruction, and containment effects.</p>
      ${imageBlock("Airflow view", data.screenshots.airflow)}
    </section>

    <section>
      <h2>Layout Overview</h2>
      ${imageBlock("Layout overview", data.screenshots.layout)}
    </section>

    <section>
      <h2>Hotspot Warnings</h2>
      ${warningList(result.warnings)}
    </section>

    <section>
      <h2>Recommended Actions</h2>
      <ol>${data.recommendedActions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ol>
    </section>

    <section>
      <h2>Simulation Settings</h2>
      <table>
        <tbody>
          <tr><th>Mode</th><td>${escapeHtml(result.settings.mode)}</td></tr>
          <tr><th>Grid</th><td>${result.grid.nx} x ${result.grid.ny} x ${result.grid.nz} cells (${result.grid.cellSizeM.toFixed(2)}m cell)</td></tr>
          <tr><th>Iterations</th><td>${result.iterationCount}</td></tr>
          <tr><th>Elapsed</th><td>${result.elapsedMs.toFixed(1)} ms</td></tr>
          <tr><th>Warning / critical threshold</th><td>${result.settings.warningTemperatureC} C / ${result.settings.criticalTemperatureC} C</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>Model Assumptions</h2>
      <ul>${data.assumptions.map((assumption) => `<li>${escapeHtml(assumption)}</li>`).join("")}</ul>
    </section>

    <section class="disclaimer">
      <h2>Disclaimer</h2>
      <p>${escapeHtml(data.disclaimer)}</p>
    </section>
  </main>
</body>
</html>`;
}

export function exportSimulationResultJson(result: SimulationResult): string {
  return JSON.stringify(result, null, 2);
}

export function compareScenarioResults(
  scenarioA: Scenario,
  resultA: SimulationResult,
  scenarioB: Scenario,
  resultB: SimulationResult
): ScenarioComparison {
  const comparison: ScenarioComparison = {
    scenarioAName: scenarioA.metadata.name,
    scenarioBName: scenarioB.metadata.name,
    maxRackInletDeltaC: round(resultB.metrics.maxRackInletTemperatureC - resultA.metrics.maxRackInletTemperatureC, 1),
    averageRackInletDeltaC: round(resultB.metrics.averageRackInletTemperatureC - resultA.metrics.averageRackInletTemperatureC, 1),
    hotspotDelta: resultB.metrics.hotspotCount - resultA.metrics.hotspotCount,
    coolingMarginDeltaKw: round(resultB.metrics.coolingCapacityMarginKw - resultA.metrics.coolingCapacityMarginKw, 1),
    warningDelta: resultB.metrics.warningCount - resultA.metrics.warningCount,
    criticalWarningDelta: resultB.metrics.criticalWarningCount - resultA.metrics.criticalWarningCount,
    recommendationSummary: ""
  };
  comparison.recommendationSummary =
    comparison.maxRackInletDeltaC < 0 || comparison.warningDelta < 0
      ? "Scenario B reduces thermal risk indicators compared with Scenario A."
      : comparison.maxRackInletDeltaC > 0 || comparison.warningDelta > 0
        ? "Scenario B increases thermal risk indicators compared with Scenario A."
        : "Scenario B is broadly similar to Scenario A on the tracked risk metrics.";
  return comparison;
}

export function modelAssumptions(): string[] {
  return [
    "AirPath uses a simplified 3D voxel/grid airflow and heat advection-diffusion approximation.",
    "Rack heat is modeled as room air heat unless liquid capture ratio reduces the residual air-side heat.",
    "Cooling objects act as directional supply boundaries with capacity, airflow, and supply temperature inputs.",
    "Return objects attract airflow in the vector field; detailed duct or plenum calculations are not modeled.",
    "Containment is modeled as an airflow barrier that reduces hot/cold mixing; material heat transfer is not modeled.",
    "Raised floor tiles are modeled as local cold-air inlet patches, not as a full underfloor plenum solver.",
    "Warnings are conceptual risk indicators for pre-sales review, not certified engineering failures."
  ];
}

function createRecommendedActions(warnings: SimulationWarning[]): string[] {
  const actions = [...new Set(warnings.map((warning) => warning.suggestedMitigation))];
  return actions.length > 0 ? actions.slice(0, 8) : ["No immediate thermal risk mitigation is indicated by the current simplified model."];
}

function summarySentence(result: SimulationResult): string {
  if (result.metrics.criticalWarningCount > 0) {
    return "The scenario has critical conceptual thermal risk indicators that should be addressed before using the layout in a customer-facing proposal.";
  }
  if (result.metrics.warningCount > 0) {
    return "The scenario is usable for conceptual discussion but includes warning-level thermal or airflow risks.";
  }
  return "The scenario shows no warning-level thermal risk indicators under the current simplified assumptions.";
}

function rackRow(rack: Rack & RackInletResult): string {
  return `<tr>
    <td>${escapeHtml(rack.name)}</td>
    <td>${rack.heatLoadKw.toFixed(1)} kW</td>
    <td>${escapeHtml(rack.coolingMode)}</td>
    <td>${rack.residualAirHeatKw.toFixed(1)} kW</td>
    <td>${rack.inletTemperatureC.toFixed(1)} C</td>
    <td><span class="risk ${rack.risk}">${escapeHtml(rack.risk)}</span></td>
  </tr>`;
}

function objectTable(objects: CoolingObject[]): string {
  if (objects.length === 0) return "<p>No cooling objects are configured.</p>";
  return `<table>
    <thead><tr><th>Name</th><th>Type</th><th>Supply temp</th><th>Airflow</th><th>Capacity</th><th>Enabled</th></tr></thead>
    <tbody>
      ${objects
        .map(
          (object) => `<tr>
            <td>${escapeHtml(object.name)}</td>
            <td>${escapeHtml(object.type)}</td>
            <td>${object.supplyTemperatureC.toFixed(1)} C</td>
            <td>${object.airflowLps.toFixed(0)} L/s</td>
            <td>${object.coolingCapacityKw.toFixed(1)} kW</td>
            <td>${object.enabled ? "Yes" : "No"}</td>
          </tr>`
        )
        .join("")}
    </tbody>
  </table>`;
}

function containmentTable(objects: ContainmentObject[]): string {
  if (objects.length === 0) return "<p>No containment objects are configured.</p>";
  return `<table>
    <thead><tr><th>Name</th><th>Type</th><th>Size</th><th>Enabled</th></tr></thead>
    <tbody>
      ${objects
        .map(
          (object) => `<tr>
            <td>${escapeHtml(object.name)}</td>
            <td>${escapeHtml(object.type)}</td>
            <td>${object.size.width.toFixed(1)}m x ${object.size.depth.toFixed(1)}m x ${object.size.height.toFixed(1)}m</td>
            <td>${object.enabled ? "Yes" : "No"}</td>
          </tr>`
        )
        .join("")}
    </tbody>
  </table>`;
}

function warningList(warnings: SimulationWarning[]): string {
  if (warnings.length === 0) return "<p>No warnings generated.</p>";
  return `<div class="warning-list">
    ${warnings
      .map(
        (warning) => `<article class="warning ${warning.severity}">
          <strong>${escapeHtml(warning.label)}</strong>
          <span>${escapeHtml(warning.severity)}</span>
          <p>${escapeHtml(warning.message)}</p>
          <small>${escapeHtml(warning.suggestedMitigation)}</small>
        </article>`
      )
      .join("")}
  </div>`;
}

function metricCard(label: string, value: string): string {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function imageBlock(label: string, src?: string): string {
  if (!src) {
    return `<div class="image-placeholder">${escapeHtml(label)} screenshot not embedded in this export.</div>`;
  }
  return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(label)}" /><figcaption>${escapeHtml(label)}</figcaption></figure>`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function reportCss(): string {
  return `
    :root {
      --report-bg: #ffffff;
      --report-text: #111827;
      --report-heading: #0f172a;
      --report-accent: #0284c7;
      --report-warning: #d97706;
      --report-critical: #dc2626;
      --report-border: #d7dee8;
      --report-muted: #64748b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--report-bg);
      color: var(--report-text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.45;
    }
    .report { max-width: 1040px; margin: 0 auto; padding: 36px 32px 56px; }
    .report-header { border-bottom: 2px solid var(--report-accent); padding-bottom: 20px; margin-bottom: 28px; }
    .eyebrow { color: var(--report-accent); font-weight: 700; margin: 0 0 8px; text-transform: uppercase; font-size: 12px; letter-spacing: 0; }
    h1, h2 { color: var(--report-heading); margin: 0 0 14px; line-height: 1.15; }
    h1 { font-size: 32px; }
    h2 { font-size: 21px; padding-top: 8px; }
    section { margin: 0 0 30px; page-break-inside: avoid; }
    .meta-grid, .metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    .meta-grid span, .metric {
      border: 1px solid var(--report-border);
      border-radius: 8px;
      padding: 10px 12px;
      background: #f8fafc;
    }
    .meta-grid strong, .metric span { display: block; color: var(--report-muted); font-size: 12px; font-weight: 600; }
    .metric strong { display: block; font-size: 20px; margin-top: 4px; }
    table { border-collapse: collapse; width: 100%; font-size: 13px; }
    th, td { border: 1px solid var(--report-border); padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; color: var(--report-heading); }
    .risk { border-radius: 999px; padding: 3px 8px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
    .risk.normal { background: #dcfce7; color: #166534; }
    .risk.warning { background: #fef3c7; color: #92400e; }
    .risk.critical { background: #fee2e2; color: #991b1b; }
    .warning-list { display: grid; gap: 10px; }
    .warning { border: 1px solid var(--report-border); border-left: 5px solid var(--report-warning); border-radius: 8px; padding: 10px 12px; }
    .warning.critical { border-left-color: var(--report-critical); }
    .warning span { margin-left: 8px; color: var(--report-muted); text-transform: uppercase; font-size: 11px; font-weight: 700; }
    .warning p { margin: 6px 0; }
    .warning small { color: var(--report-muted); }
    .image-placeholder { border: 1px dashed var(--report-border); border-radius: 8px; padding: 28px; color: var(--report-muted); background: #f8fafc; }
    figure { margin: 0; }
    img { display: block; max-width: 100%; border: 1px solid var(--report-border); border-radius: 8px; }
    figcaption { color: var(--report-muted); font-size: 12px; margin-top: 6px; }
    .disclaimer { border: 1px solid var(--report-critical); border-radius: 8px; padding: 14px 16px; background: #fff7f7; }
    @media print {
      body { background: white; }
      .report { max-width: none; padding: 0; }
      section { break-inside: avoid; }
      a[href]::after { content: ""; }
    }
  `;
}
