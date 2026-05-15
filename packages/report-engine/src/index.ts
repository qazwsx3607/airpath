import {
  AIRPATH_DISCLAIMER,
  type ContainmentObject,
  type CoolingObject,
  type Rack,
  type Scenario,
  type ThermalTopology,
  analyzeThermalTopology,
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
  topology: ThermalTopology;
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
    title: scenario.reportSettings.reportTitle || `${scenario.metadata.name} Airflow Review`,
    generatedAt: new Date().toISOString(),
    scenario,
    result,
    screenshots,
    rackRows,
    topology: analyzeThermalTopology(scenario),
    recommendedActions: createRecommendedActions(result.warnings),
    assumptions: modelAssumptions(),
    disclaimer: AIRPATH_DISCLAIMER
  };
}

export function renderHtmlReport(data: ReportData): string {
  const { scenario, result } = data;
  const language = scenario.reportSettings.language;
  const dateValue = scenario.reportSettings.reportDate || data.generatedAt;
  const title = localizedReportTitle(data, language);
  const disclaimer = localizedDisclaimer(language);
  return `<!doctype html>
<html lang="${language === "zh" ? "zh-Hant" : "en"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>${reportCss()}</style>
</head>
<body>
  <main class="report">
    <section class="cover-page">
      <div class="cover-topline">
        ${logoBlock(scenario.reportSettings.logoDataUrl, scenario.reportSettings.companyName)}
        <div>
          <p class="eyebrow">${reportText(language, "eyebrow")}</p>
          <strong>${escapeHtml(scenario.reportSettings.companyName)}</strong>
        </div>
      </div>
      <h1>${escapeHtml(title)}</h1>
      <p class="cover-subtitle">${escapeHtml(scenario.reportSettings.caseName || scenario.metadata.name)}</p>
      <div class="cover-meta">
        ${metaItem(reportText(language, "clientName"), scenario.reportSettings.clientName || scenario.reportSettings.customer)}
        ${metaItem(reportText(language, "projectName"), scenario.reportSettings.projectName)}
        ${metaItem(reportText(language, "author"), scenario.reportSettings.author)}
        ${metaItem(reportText(language, "reportDate"), formatDate(dateValue, language))}
        ${metaItem(reportText(language, "revision"), scenario.reportSettings.revision)}
        ${metaItem(reportText(language, "documentId"), scenario.reportSettings.documentId || scenario.schemaVersion)}
      </div>
      <p class="claim-boundary">${escapeHtml(disclaimer)}</p>
    </section>

    <section class="page-section">
      <h2>${reportText(language, "projectMetadata")}</h2>
      <table>
        <tbody>
          <tr><th>${reportText(language, "companyName")}</th><td>${escapeHtml(scenario.reportSettings.companyName)}</td></tr>
          <tr><th>${reportText(language, "clientName")}</th><td>${escapeHtml(scenario.reportSettings.clientName || scenario.reportSettings.customer)}</td></tr>
          <tr><th>${reportText(language, "projectName")}</th><td>${escapeHtml(scenario.reportSettings.projectName)}</td></tr>
          <tr><th>${reportText(language, "caseName")}</th><td>${escapeHtml(scenario.reportSettings.caseName || scenario.metadata.name)}</td></tr>
          <tr><th>${reportText(language, "revision")}</th><td>${escapeHtml(scenario.reportSettings.revision)}</td></tr>
          <tr><th>${reportText(language, "generated")}</th><td>${formatDate(data.generatedAt, language)}</td></tr>
        </tbody>
      </table>
    </section>

    <section class="page-section">
      <h2>${reportText(language, "executiveSummary")}</h2>
      <div class="metric-grid">
        ${metricCard(reportText(language, "maxInlet"), `${result.metrics.maxRackInletTemperatureC.toFixed(1)} C`)}
        ${metricCard(reportText(language, "averageInlet"), `${result.metrics.averageRackInletTemperatureC.toFixed(1)} C`)}
        ${metricCard(reportText(language, "hotspots"), `${result.metrics.hotspotCount}`)}
        ${metricCard(reportText(language, "coolingMargin"), `${result.metrics.coolingCapacityMarginKw.toFixed(1)} kW`)}
        ${metricCard(reportText(language, "warnings"), `${result.metrics.warningCount}`)}
        ${metricCard(reportText(language, "critical"), `${result.metrics.criticalWarningCount}`)}
      </div>
      <p>${summarySentence(result, language)}</p>
    </section>

    <section class="page-section">
      <h2>${reportText(language, "methodology")}</h2>
      <p>${reportText(language, "methodologyBody")}</p>
    </section>

    <section class="page-section">
      <h2>${reportText(language, "roomRackConfig")}</h2>
      <table>
        <tbody>
          <tr><th>${reportText(language, "room")}</th><td>${escapeHtml(scenario.room.name)}</td></tr>
          <tr><th>${reportText(language, "dimensions")}</th><td>${scenario.room.width}m W x ${scenario.room.depth}m D x ${scenario.room.height}m H</td></tr>
          <tr><th>${reportText(language, "ambientTarget")}</th><td>${scenario.room.ambientTemperatureC} C</td></tr>
          <tr><th>${reportText(language, "rackCount")}</th><td>${scenario.racks.length}</td></tr>
        </tbody>
      </table>
    </section>

    <section class="page-section">
      <h2>${reportText(language, "rackHeatLoadTable")}</h2>
      <table>
        <thead>
          <tr><th>${reportText(language, "rack")}</th><th>${reportText(language, "itLoad")}</th><th>${reportText(language, "coolingMode")}</th><th>${reportText(language, "residualAirHeat")}</th><th>${reportText(language, "inletTemp")}</th><th>${reportText(language, "risk")}</th></tr>
        </thead>
        <tbody>
          ${data.rackRows.map((rack) => rackRow(rack, language)).join("")}
        </tbody>
      </table>
    </section>

    <section class="page-section">
      <h2>${reportText(language, "coolingConfiguration")}</h2>
      ${objectTable(scenario.coolingObjects, language)}
    </section>

    <section class="page-section">
      <h2>${reportText(language, "containmentConfiguration")}</h2>
      ${containmentTable(scenario.containmentObjects, language)}
    </section>

    <section class="page-section">
      <h2>Thermal Topology Summary</h2>
      ${topologySummaryTable(data.topology)}
    </section>

    <section class="page-section">
      <h2>${reportText(language, "thermalResults")}</h2>
      <p>${reportText(language, "thermalBody")}</p>
      ${imageBlock(reportText(language, "thermalView"), data.screenshots.thermal)}
    </section>

    <section class="page-section">
      <h2>${reportText(language, "airflowResults")}</h2>
      <p>${reportText(language, "airflowBody")}</p>
      ${imageBlock(reportText(language, "airflowView"), data.screenshots.airflow)}
    </section>

    <section class="page-section">
      <h2>${reportText(language, "layoutOverview")}</h2>
      ${imageBlock(reportText(language, "layoutOverview"), data.screenshots.layout)}
    </section>

    <section class="page-section">
      <h2>${reportText(language, "riskRegister")}</h2>
      ${warningList(result.warnings, language)}
    </section>

    <section class="page-section">
      <h2>${reportText(language, "recommendedActions")}</h2>
      <ol>${data.recommendedActions.map((action) => `<li>${escapeHtml(localizeRecommendation(language, action))}</li>`).join("")}</ol>
    </section>

    <section class="page-section">
      <h2>${reportText(language, "simulationSettings")}</h2>
      <table>
        <tbody>
          <tr><th>${reportText(language, "mode")}</th><td>${escapeHtml(result.settings.mode)}</td></tr>
          <tr><th>${reportText(language, "grid")}</th><td>${result.grid.nx} x ${result.grid.ny} x ${result.grid.nz} cells (${result.grid.cellSizeM.toFixed(2)}m cell)</td></tr>
          <tr><th>${reportText(language, "iterations")}</th><td>${result.iterationCount}</td></tr>
          <tr><th>${reportText(language, "elapsed")}</th><td>${result.elapsedMs.toFixed(1)} ms</td></tr>
          <tr><th>${reportText(language, "thresholds")}</th><td>${result.settings.warningTemperatureC} C / ${result.settings.criticalTemperatureC} C</td></tr>
        </tbody>
      </table>
    </section>

    <section class="page-section">
      <h2>${reportText(language, "assumptions")}</h2>
      <ul>${localizedAssumptions(language, data.assumptions).map((assumption) => `<li>${escapeHtml(assumption)}</li>`).join("")}</ul>
    </section>

    <section class="page-section">
      <h2>${reportText(language, "appendices")}</h2>
      <p>${reportText(language, "appendixBody")}</p>
    </section>

    <section class="disclaimer page-section">
      <h2>${reportText(language, "disclaimer")}</h2>
      <p>${escapeHtml(disclaimer)}</p>
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

function summarySentence(result: SimulationResult, language: "en" | "zh"): string {
  if (result.metrics.criticalWarningCount > 0) {
    return language === "zh"
      ? "此情境具有嚴重概念性熱風險指標，建議在用於客戶提案前先調整配置。"
      : "The scenario has critical conceptual thermal risk indicators that should be addressed before using the layout in a customer-facing proposal.";
  }
  if (result.metrics.warningCount > 0) {
    return language === "zh"
      ? "此情境可用於概念討論，但仍包含警示等級的熱或氣流風險。"
      : "The scenario is usable for conceptual discussion but includes warning-level thermal or airflow risks.";
  }
  return language === "zh"
    ? "在目前簡化假設下，此情境未顯示警示等級熱風險。"
    : "The scenario shows no warning-level thermal risk indicators under the current simplified assumptions.";
}

function rackRow(rack: Rack & RackInletResult, language: "en" | "zh"): string {
  return `<tr>
    <td>${escapeHtml(rack.name)}</td>
    <td>${rack.heatLoadKw.toFixed(1)} kW</td>
    <td>${escapeHtml(rack.coolingMode)}</td>
    <td>${rack.residualAirHeatKw.toFixed(1)} kW</td>
    <td>${rack.inletTemperatureC.toFixed(1)} C</td>
    <td><span class="risk ${rack.risk}">${escapeHtml(localizeRisk(language, rack.risk))}</span></td>
  </tr>`;
}

function objectTable(objects: CoolingObject[], language: "en" | "zh"): string {
  if (objects.length === 0) return `<p>${reportText(language, "noCooling")}</p>`;
  return `<table>
    <thead><tr><th>${reportText(language, "name")}</th><th>${reportText(language, "type")}</th><th>${reportText(language, "supplyTemp")}</th><th>${reportText(language, "airflow")}</th><th>${reportText(language, "capacity")}</th><th>${reportText(language, "enabled")}</th></tr></thead>
    <tbody>
      ${objects
        .map(
          (object) => `<tr>
            <td>${escapeHtml(object.name)}</td>
            <td>${escapeHtml(object.type)}</td>
            <td>${object.supplyTemperatureC.toFixed(1)} C</td>
            <td>${object.airflowLps.toFixed(0)} L/s</td>
            <td>${object.coolingCapacityKw.toFixed(1)} kW</td>
            <td>${object.enabled ? reportText(language, "yes") : reportText(language, "no")}</td>
          </tr>`
        )
        .join("")}
    </tbody>
  </table>`;
}

function containmentTable(objects: ContainmentObject[], language: "en" | "zh"): string {
  if (objects.length === 0) return `<p>${reportText(language, "noContainment")}</p>`;
  return `<table>
    <thead><tr><th>${reportText(language, "name")}</th><th>${reportText(language, "type")}</th><th>${reportText(language, "size")}</th><th>${reportText(language, "enabled")}</th></tr></thead>
    <tbody>
      ${objects
        .map(
          (object) => `<tr>
            <td>${escapeHtml(object.name)}</td>
            <td>${escapeHtml(object.type)}</td>
            <td>${object.size.width.toFixed(1)}m x ${object.size.depth.toFixed(1)}m x ${object.size.height.toFixed(1)}m</td>
            <td>${object.enabled ? reportText(language, "yes") : reportText(language, "no")}</td>
          </tr>`
        )
        .join("")}
    </tbody>
  </table>`;
}

function topologySummaryTable(topology: ThermalTopology): string {
  const aisleSummary = topology.detectedAisles.length
    ? topology.detectedAisles.map((aisle) => `${aisle.type} (${aisle.relation}, rows ${aisle.rowIds?.join(" / ") || "-"})`).join("; ")
    : "No hot/cold aisle topology was detected.";
  const zoneSummary = topology.thermalZones.length
    ? topology.thermalZones.map((zone) => `${zone.type} (${zone.containmentState}, ${zone.height.toFixed(1)}m high)`).join("; ")
    : "No 3D thermal zones were generated.";
  const inRowSummary = topology.rowModules.filter((module) => module.type === "in-row-cooling").length
    ? topology.rowModules
        .filter((module) => module.type === "in-row-cooling")
        .map((module) => `${module.sourceId}: hot-side return / cold-side supply, row ${module.rowId}`)
        .join("; ")
    : "No in-row cooling modules are part of a detected row topology.";
  const warningSummary = topology.warnings.length
    ? topology.warnings.map((warning) => `${warning.label}: ${warning.message}`).join("; ")
    : "No topology warnings generated.";
  return `<table>
    <tbody>
      <tr><th>Detected aisles</th><td>${escapeHtml(aisleSummary)}</td></tr>
      <tr><th>3D thermal zones</th><td>${escapeHtml(zoneSummary)}</td></tr>
      <tr><th>Rack orientation assumption</th><td>Cold air enters rack fronts; heated exhaust leaves rack rears. Rack inlet estimates are sampled near the front side.</td></tr>
      <tr><th>In-row cooling assumption</th><td>${escapeHtml(inRowSummary)}</td></tr>
      <tr><th>Containment airflow constraint</th><td>Contained aisle streamlines are constrained to the generated thermal zone unless a modeled return, cooling sink, or opening is available.</td></tr>
      <tr><th>Topology warnings</th><td>${escapeHtml(warningSummary)}</td></tr>
    </tbody>
  </table>`;
}

function warningList(warnings: SimulationWarning[], language: "en" | "zh"): string {
  if (warnings.length === 0) return `<p>${reportText(language, "noWarnings")}</p>`;
  return `<div class="warning-list">
    ${warnings
      .map(
        (warning) => `<article class="warning ${warning.severity}">
          <strong>${escapeHtml(localizeWarningLabel(language, warning.label))}</strong>
          <span>${escapeHtml(localizeSeverity(language, warning.severity))}</span>
          <p>${escapeHtml(localizeWarningMessage(language, warning.message))}</p>
          <small>${escapeHtml(localizeRecommendation(language, warning.suggestedMitigation))}</small>
        </article>`
      )
      .join("")}
  </div>`;
}

function metricCard(label: string, value: string): string {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function metaItem(label: string, value: string): string {
  return `<span><strong>${escapeHtml(label)}</strong>${escapeHtml(value || "-")}</span>`;
}

function logoBlock(src: string, companyName: string): string {
  if (src) return `<img class="cover-logo" src="${escapeHtml(src)}" alt="${escapeHtml(companyName)} logo" />`;
  const initials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return `<div class="logo-placeholder">${escapeHtml(initials || "AP")}</div>`;
}

function imageBlock(label: string, src?: string): string {
  if (!src) {
    return `<div class="image-placeholder">${escapeHtml(label)} screenshot not embedded in this export.</div>`;
  }
  return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(label)}" /><figcaption>${escapeHtml(label)}</figcaption></figure>`;
}

function formatDate(value: string, language: "en" | "zh" = "en"): string {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).replace("AM", language === "zh" ? "上午" : "AM").replace("PM", language === "zh" ? "下午" : "PM");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function localizedReportTitle(data: ReportData, language: "en" | "zh"): string {
  if (language === "en") return data.title || reportText(language, "title");
  const configuredTitle = data.scenario.reportSettings.reportTitle;
  if (!configuredTitle || configuredTitle === reportText("en", "title") || configuredTitle === `${data.scenario.metadata.name} Airflow Review`) {
    return reportText(language, "title");
  }
  return configuredTitle;
}

function localizedDisclaimer(language: "en" | "zh"): string {
  if (language === "en") return AIRPATH_DISCLAIMER;
  return "本工具用於早期預售熱風險檢視與概念性氣流風險分析，不是認證 CFD 求解器，不應作為施工、測試驗收或法規符合性決策的唯一依據。";
}

function localizedAssumptions(language: "en" | "zh", assumptions: string[]): string[] {
  if (language === "en") return assumptions;
  return [
    "AirPath 使用簡化 3D 體素/網格氣流與熱傳遞近似模型。",
    "機櫃熱量預設視為空氣側熱負載，液冷捕獲率會降低殘餘空氣側熱量。",
    "冷卻物件以容量、風量與送風溫度輸入，作為方向性送風邊界。",
    "回風物件會在向量場中吸引氣流，但不計算詳細風管或靜壓箱流場。",
    "封閉通道以氣流屏障近似，降低冷熱氣流混合；不計算材料導熱。",
    "高架地板出風磚以局部冷風入口近似，不是完整地板下靜壓箱求解。",
    "警示是預售概念檢視的風險指標，不代表認證工程判定。"
  ];
}

function localizeWarningMessage(language: "en" | "zh", message: string): string {
  if (language === "en") return message;
  const inlet = message.match(/^(.*) inlet is ([\d.]+) C\.$/);
  if (inlet) return `${inlet[1]} 進風溫度為 ${inlet[2]} C。`;
  const airflow = message.match(/^(.*) has weak simulated inlet airflow coverage\.$/);
  if (airflow) return `${airflow[1]} 的模擬進風覆蓋不足。`;
  const density = message.match(/^(.*) is ([\d.]+) kW\/m2\.$/);
  if (density) return `${density[1]} 熱密度為 ${density[2]} kW/m2。`;
  const residual = message.match(/^(.*) still releases ([\d.]+) kW to room air\.$/);
  if (residual) return `${residual[1]} 仍有 ${residual[2]} kW 熱量進入室內空氣。`;
  const capacity = message.match(/^Air-side heat load exceeds enabled cooling capacity by ([\d.-]+) kW\.$/);
  if (capacity) return `空氣側熱負載超過已啟用冷卻容量 ${capacity[1]} kW。`;
  const shortCircuit = message.match(/^(.*) is close to (.*)\.$/);
  if (shortCircuit) return `${shortCircuit[1]} 與 ${shortCircuit[2]} 距離過近。`;
  const map: Record<string, string> = {
    "Return airflow path is weak relative to enabled supply objects.": "相較已啟用送風物件，回風路徑偏弱。",
    "High rack load is modeled without active aisle containment.": "高負載機櫃未搭配啟用的通道封閉建模。",
    "Average rack inlet temperature indicates possible hot/cold mixing.": "平均機櫃進風溫度顯示可能存在冷熱氣流混合。"
  };
  return map[message] ?? message;
}

function localizeRecommendation(language: "en" | "zh", action: string): string {
  if (language === "en") return action;
  const map: Record<string, string> = {
    "Increase nearby supply airflow, improve containment, or reduce rack air-side heat load.": "提高鄰近送風量、改善封閉通道，或降低機櫃空氣側熱負載。",
    "Move supply closer, add a floor tile or in-row cooler, or remove downstream obstructions.": "將送風移近、增加出風地板磚或列間冷卻，或移除下游障礙。",
    "Spread load across adjacent racks or use liquid cooling capture for this rack class.": "將負載分散到相鄰機櫃，或針對此類機櫃使用液冷捕獲。",
    "Increase liquid capture ratio or add local air-side cooling around this rack.": "提高液冷捕獲率，或在此機櫃周邊增加局部空氣側冷卻。",
    "Increase cooling capacity, reduce IT load, or increase liquid capture ratio.": "提高冷卻容量、降低 IT 負載，或提高液冷捕獲率。",
    "Separate supply and return paths or redirect discharge toward rack inlets.": "拉開送風與回風路徑，或將送風方向導向機櫃進風面。",
    "Add ceiling or wall return grilles, or define a CRAC return path.": "增加天花板或牆面回風格柵，或定義 CRAC 回風路徑。",
    "Auto-generate cold or hot aisle containment for the rack rows.": "為機櫃列建立冷通道或熱通道封閉。",
    "Use containment, improve return path, or direct supply toward rack fronts.": "使用封閉通道、改善回風路徑，或將送風導向機櫃正面。",
    "No immediate thermal risk mitigation is indicated by the current simplified model.": "目前簡化模型未顯示需要立即處理的熱風險緩解措施。"
  };
  return map[action] ?? action;
}

type ReportTextKey =
  | "title"
  | "eyebrow"
  | "companyName"
  | "clientName"
  | "projectName"
  | "caseName"
  | "author"
  | "reportDate"
  | "revision"
  | "documentId"
  | "generated"
  | "projectMetadata"
  | "executiveSummary"
  | "methodology"
  | "methodologyBody"
  | "roomRackConfig"
  | "room"
  | "dimensions"
  | "ambientTarget"
  | "rackCount"
  | "rackHeatLoadTable"
  | "rack"
  | "itLoad"
  | "coolingMode"
  | "residualAirHeat"
  | "inletTemp"
  | "risk"
  | "coolingConfiguration"
  | "containmentConfiguration"
  | "thermalResults"
  | "thermalBody"
  | "thermalView"
  | "airflowResults"
  | "airflowBody"
  | "airflowView"
  | "layoutOverview"
  | "riskRegister"
  | "recommendedActions"
  | "simulationSettings"
  | "mode"
  | "grid"
  | "iterations"
  | "elapsed"
  | "thresholds"
  | "assumptions"
  | "appendices"
  | "appendixBody"
  | "disclaimer"
  | "maxInlet"
  | "averageInlet"
  | "hotspots"
  | "coolingMargin"
  | "warnings"
  | "critical"
  | "name"
  | "type"
  | "supplyTemp"
  | "airflow"
  | "capacity"
  | "enabled"
  | "size"
  | "yes"
  | "no"
  | "noCooling"
  | "noContainment"
  | "noWarnings";

const reportTextTable: Record<"en" | "zh", Record<ReportTextKey, string>> = {
  en: {
    title: "Pre-Sales Airflow and Thermal Review",
    eyebrow: "AirPath pre-sales thermal review",
    companyName: "Company name",
    clientName: "Client name",
    projectName: "Project name",
    caseName: "Case name",
    author: "Author",
    reportDate: "Report date",
    revision: "Revision",
    documentId: "Document ID",
    generated: "Generated",
    projectMetadata: "Project Metadata",
    executiveSummary: "Executive Summary",
    methodology: "Methodology",
    methodologyBody:
      "This report summarizes a concept-stage 3D airflow and thermal risk review generated from AirPath's simplified voxel/grid approximation. Results indicate relative risk and design discussion points, not certified CFD accuracy.",
    roomRackConfig: "Room and Rack Configuration",
    room: "Room",
    dimensions: "Dimensions",
    ambientTarget: "Ambient target",
    rackCount: "Rack count",
    rackHeatLoadTable: "Rack Heat Load Table",
    rack: "Rack",
    itLoad: "IT load",
    coolingMode: "Cooling mode",
    residualAirHeat: "Residual air heat",
    inletTemp: "Inlet temp",
    risk: "Risk",
    coolingConfiguration: "Cooling Configuration",
    containmentConfiguration: "Containment Configuration",
    thermalResults: "Thermal Results",
    thermalBody: "Rack inlet estimates are generated from the simplified voxel temperature field. Thermal visualization uses cyan, slate, amber, orange, and red risk colors.",
    thermalView: "Thermal view",
    airflowResults: "Airflow Results",
    airflowBody: "Airflow streamlines are generated from the solver vector field, including supply, return, obstruction, and containment effects.",
    airflowView: "Airflow view",
    layoutOverview: "Layout Overview",
    riskRegister: "Risk Register",
    recommendedActions: "Recommendations",
    simulationSettings: "Simulation Settings",
    mode: "Mode",
    grid: "Grid",
    iterations: "Iterations",
    elapsed: "Elapsed",
    thresholds: "Warning / critical threshold",
    assumptions: "Assumptions and Limitations",
    appendices: "Appendices",
    appendixBody: "Appendix screenshots and tabular outputs are intended for pre-sales discussion and should be reviewed with the model assumptions.",
    disclaimer: "Disclaimer",
    maxInlet: "Max inlet",
    averageInlet: "Average inlet",
    hotspots: "Hotspots",
    coolingMargin: "Cooling margin",
    warnings: "Warnings",
    critical: "Critical",
    name: "Name",
    type: "Type",
    supplyTemp: "Supply temp",
    airflow: "Airflow",
    capacity: "Capacity",
    enabled: "Enabled",
    size: "Size",
    yes: "Yes",
    no: "No",
    noCooling: "No cooling objects are configured.",
    noContainment: "No containment objects are configured.",
    noWarnings: "No warnings generated."
  },
  zh: {
    title: "預售氣流與熱風險檢視報告",
    eyebrow: "AirPath 預售熱風險檢視",
    companyName: "公司名稱",
    clientName: "客戶名稱",
    projectName: "專案名稱",
    caseName: "案例名稱",
    author: "作者",
    reportDate: "報告日期",
    revision: "版次",
    documentId: "文件編號",
    generated: "產生時間",
    projectMetadata: "專案資料",
    executiveSummary: "摘要",
    methodology: "方法說明",
    methodologyBody:
      "本報告彙整由 AirPath 簡化 3D 體素/網格近似模型產生的概念階段氣流與熱風險檢視。結果用於相對風險與設計討論，不代表認證 CFD 精度。",
    roomRackConfig: "機房與機櫃配置",
    room: "機房",
    dimensions: "尺寸",
    ambientTarget: "環境目標",
    rackCount: "機櫃數量",
    rackHeatLoadTable: "機櫃熱負載表",
    rack: "機櫃",
    itLoad: "IT 負載",
    coolingMode: "冷卻模式",
    residualAirHeat: "殘餘空氣熱",
    inletTemp: "進風溫度",
    risk: "風險",
    coolingConfiguration: "冷卻配置",
    containmentConfiguration: "封閉通道配置",
    thermalResults: "熱場結果",
    thermalBody: "機櫃進風溫度由簡化體素溫度場估算。熱場視覺使用青色、灰藍、琥珀、橙色與紅色風險色階。",
    thermalView: "熱場視圖",
    airflowResults: "氣流結果",
    airflowBody: "氣流流線由求解器向量場產生，包含送風、回風、障礙物與封閉通道影響。",
    airflowView: "氣流視圖",
    layoutOverview: "配置總覽",
    riskRegister: "風險登錄",
    recommendedActions: "建議事項",
    simulationSettings: "模擬設定",
    mode: "模式",
    grid: "網格",
    iterations: "迭代",
    elapsed: "耗時",
    thresholds: "警示 / 嚴重門檻",
    assumptions: "假設與限制",
    appendices: "附錄",
    appendixBody: "附錄截圖與表格輸出僅供預售討論，應搭配模型假設共同解讀。",
    disclaimer: "免責聲明",
    maxInlet: "最高進風",
    averageInlet: "平均進風",
    hotspots: "熱點",
    coolingMargin: "冷卻餘裕",
    warnings: "警示",
    critical: "嚴重",
    name: "名稱",
    type: "類型",
    supplyTemp: "送風溫度",
    airflow: "風量",
    capacity: "容量",
    enabled: "啟用",
    size: "尺寸",
    yes: "是",
    no: "否",
    noCooling: "未設定冷卻物件。",
    noContainment: "未設定封閉通道物件。",
    noWarnings: "未產生警示。"
  }
};

function reportText(language: "en" | "zh", key: ReportTextKey): string {
  return reportTextTable[language][key] ?? reportTextTable.en[key];
}

function localizeWarningLabel(language: "en" | "zh", label: string): string {
  if (language === "en") return label;
  const map: Record<string, string> = {
    "High rack inlet temperature": "機櫃進風溫度偏高",
    "Poor airflow coverage": "氣流覆蓋不足",
    "Rack heat density high": "機櫃熱密度偏高",
    "Liquid residual heat still high": "液冷殘餘空氣熱偏高",
    "Cooling capacity insufficient": "冷卻容量不足",
    "Supply-return short circuit": "送回風短路風險",
    "Return path weak": "回風路徑不足",
    "Containment gap detected": "封閉通道缺口風險",
    "Hot air recirculation risk": "熱風回流風險"
  };
  return map[label] ?? label;
}

function localizeSeverity(language: "en" | "zh", severity: string): string {
  if (language === "en") return severity;
  if (severity === "critical") return "嚴重";
  if (severity === "warning") return "警示";
  return "資訊";
}

function localizeRisk(language: "en" | "zh", risk: string): string {
  if (language === "en") return risk;
  if (risk === "critical") return "嚴重";
  if (risk === "warning") return "警示";
  return "正常";
}

function reportCss(): string {
  return `
    :root {
      --report-bg: #ffffff;
      --report-text: #111827;
      --report-heading: #0f172a;
      --report-accent: #0284c7;
      --report-accent-soft: #e0f2fe;
      --report-warning: #d97706;
      --report-critical: #dc2626;
      --report-border: #d7dee8;
      --report-muted: #64748b;
      --report-band: #f8fafc;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--report-bg);
      color: var(--report-text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.45;
    }
    .report { max-width: 1120px; margin: 0 auto; padding: 0 36px 64px; }
    .cover-page {
      min-height: 920px;
      display: grid;
      align-content: space-between;
      gap: 36px;
      padding: 56px 0 44px;
      border-bottom: 2px solid var(--report-heading);
      page-break-after: always;
    }
    .cover-topline { display: flex; align-items: center; gap: 16px; }
    .cover-logo,
    .logo-placeholder {
      width: 86px;
      height: 86px;
      border: 1px solid var(--report-border);
      border-radius: 8px;
      object-fit: contain;
      background: #ffffff;
    }
    .logo-placeholder {
      display: grid;
      place-items: center;
      color: var(--report-heading);
      font-weight: 800;
      font-size: 20px;
      background: var(--report-band);
    }
    .cover-subtitle {
      max-width: 720px;
      margin: -20px 0 0;
      color: var(--report-muted);
      font-size: 20px;
      font-weight: 600;
    }
    .cover-meta {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .cover-meta span,
    .metric {
      border: 1px solid var(--report-border);
      border-radius: 8px;
      padding: 11px 12px;
      background: var(--report-band);
    }
    .cover-meta strong,
    .metric span {
      display: block;
      color: var(--report-muted);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .claim-boundary {
      margin: 0;
      padding: 13px 16px;
      border-left: 4px solid var(--report-critical);
      background: #fff7f7;
      color: #7f1d1d;
      font-size: 13px;
    }
    .eyebrow { color: var(--report-accent); font-weight: 800; margin: 0 0 8px; text-transform: uppercase; font-size: 12px; letter-spacing: 0; }
    h1, h2 { color: var(--report-heading); margin: 0 0 14px; line-height: 1.15; }
    h1 { max-width: 880px; font-size: 46px; letter-spacing: 0; }
    h2 {
      padding: 12px 0 8px;
      border-bottom: 1px solid var(--report-border);
      font-size: 22px;
    }
    .page-section { margin: 34px 0; page-break-inside: avoid; }
    .metric-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
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
      .report { max-width: none; padding: 0 18mm; }
      .cover-page { min-height: 260mm; }
      .page-section { break-inside: avoid; }
      a[href]::after { content: ""; }
    }
    @media (max-width: 760px) {
      .report { padding: 0 18px 42px; }
      .cover-page { min-height: auto; }
      h1 { font-size: 34px; }
      .cover-meta,
      .metric-grid { grid-template-columns: 1fr; }
    }
  `;
}
