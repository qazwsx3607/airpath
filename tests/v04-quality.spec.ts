import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const screenshotDir = resolve(process.cwd(), "engineering-memos/screenshots/v0_4");

test("v0.4 evidence-gated product quality case matrix", async ({ page }) => {
  mkdirSync(screenshotDir, { recursive: true });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("canvas")).toBeVisible();

  await case01SmallServerRoomBaseline(page);
  await case02ColdAisleContainment(page);
  await case03HotAisleContainment(page);
  await case04OverheadShortCircuit(page);
  await case05RaisedFloorTileLayout(page);
  await case06HighDensityGpuHotspot(page);
  await case07HybridLiquidResidualHeat(page);
  await case08PoorLayoutRedTeam(page);
  await case09ConsultantReportGeneration(page);
  await case10ChineseUiAndReport(page);
});

async function case01SmallServerRoomBaseline(page: Page) {
  await page.getByTestId("template-select").selectOption("small");
  await page.getByTestId("rack-rows").fill("2");
  await page.getByTestId("rack-columns").fill("4");
  await page.getByTestId("rack-heat").fill("9");
  await page.getByTestId("create-rack-array").click();
  await page.getByTestId("add-crac-crah").click();
  await page.getByTestId("add-floor-perforated-tile").click();
  await page.getByTestId("add-ceiling-return-grille").click();
  await runSimulation(page);
  await page.getByTestId("generate-report").click();
  await expect(page.frameLocator("[data-testid='report-preview']").getByText("Executive Summary")).toBeVisible();
  await expect(page.frameLocator("[data-testid='report-preview']").getByText("Project Metadata")).toBeVisible();
  await page.getByTestId("report-preview").screenshot({ path: shot("case01_small_server_room_report_preview.png") });
  await captureReportPage(page, "case01_small_server_room_report_full.png");
  await page.screenshot({ path: shot("case01_small_server_room_report.png"), fullPage: true });
}

async function case02ColdAisleContainment(page: Page) {
  await loadSample(page, "cold-aisle-containment");
  await runSimulation(page);
  await page.getByTestId("view-combined").click();
  await setLayer(page, "layer-labels", true);
  await setLayer(page, "layer-dimensions", true);
  await page.getByTestId("duplicate-scenario").click();
  await page.getByTestId("improve-scenario").click();
  await page.getByTestId("compare-scenarios").click();
  await expect(page.getByTestId("comparison-panel")).toContainText("Scenario B max");
  await page.screenshot({ path: shot("case02_cold_aisle_containment.png"), fullPage: true });
}

async function case03HotAisleContainment(page: Page) {
  await loadSample(page, "hot-aisle-containment");
  await runSimulation(page);
  await page.getByTestId("view-combined").click();
  await page.getByTestId("tab-results").click();
  await expect(page.getByTestId("rack-inlets")).toBeVisible();
  await page.screenshot({ path: shot("case03_hot_aisle_containment.png"), fullPage: true });
}

async function case04OverheadShortCircuit(page: Page) {
  await loadSample(page, "overhead-short-circuit");
  await runSimulation(page);
  await page.getByTestId("tab-warnings").click();
  await expect(page.getByTestId("warnings-panel")).toContainText("Supply-return short circuit");
  await page.getByTestId("view-airflow").click();
  await setRange(page, "particle-density", 180);
  await setRange(page, "particle-speed", 1.6);
  await expect(page.getByText("Streamline density (180)")).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: shot("case04_overhead_short_circuit_airflow.png"), fullPage: true });
}

async function case05RaisedFloorTileLayout(page: Page) {
  await loadSample(page, "small-baseline");
  await page.getByTestId("step-cooling").click();
  await page.getByTestId("add-floor-perforated-tile").click();
  await expect(page.getByTestId("selected-cooling-airflow")).toBeVisible();
  await fillAndBlur(page, "selected-cooling-airflow", "950");
  await fillAndBlur(page, "selected-cooling-supply-temp", "17");
  await runSimulation(page);
  await page.getByTestId("view-thermal").click();
  await page.screenshot({ path: shot("case05_raised_floor_tile_layout.png"), fullPage: true });
}

async function case06HighDensityGpuHotspot(page: Page) {
  await loadSample(page, "gpu-hotspot");
  await runSimulation(page);
  await page.getByTestId("view-thermal").click();
  await page.getByTestId("tab-warnings").click();
  await expect(page.getByTestId("warning-card").first()).toBeVisible();
  await page.screenshot({ path: shot("case06_high_density_gpu_hotspot.png"), fullPage: true });
}

async function case07HybridLiquidResidualHeat(page: Page) {
  await loadSample(page, "gpu-hotspot");
  await setLayer(page, "layer-labels", true);
  await expect(page.getByTestId("rack-label").first()).toBeVisible();
  await page.getByTestId("rack-label").first().click({ force: true });
  await page.getByTestId("selected-cooling-mode").selectOption("hybrid-liquid-cooled");
  await fillAndBlur(page, "selected-liquid-capture", "0.85");
  await runSimulation(page);
  await page.getByTestId("tab-results").click();
  await expect(page.getByTestId("rack-inlets")).toContainText("C");
  await page.screenshot({ path: shot("case07_hybrid_liquid_residual_heat.png"), fullPage: true });
}

async function case08PoorLayoutRedTeam(page: Page) {
  await loadSample(page, "gpu-hotspot");
  await setLayer(page, "layer-labels", true);
  await page.getByTestId("rack-label").first().click({ force: true });
  await fillAndBlur(page, "selected-rack-heat", "68");
  await runSimulation(page);
  await page.getByTestId("tab-warnings").click();
  await expect(page.getByTestId("warning-card").first()).toBeVisible();
  await page.getByTestId("view-combined").click();
  await setLayer(page, "layer-warnings", true);
  await page.screenshot({ path: shot("case08_poor_layout_red_team.png"), fullPage: true });
}

async function case09ConsultantReportGeneration(page: Page) {
  await loadSample(page, "cold-aisle-containment");
  await page.getByTestId("tab-report").click();
  await fillAndBlur(page, "report-company", "Northstar Data Center Consulting");
  await fillAndBlur(page, "report-client", "ACME Cloud Operations");
  await fillAndBlur(page, "report-project", "Taipei Edge Room Refresh");
  await fillAndBlur(page, "report-case", "Cold aisle containment option");
  await fillAndBlur(page, "report-title", "Pre-Sales Airflow and Thermal Review");
  await fillAndBlur(page, "report-author", "A. Consultant");
  await fillAndBlur(page, "report-date", "2026-05-15");
  await fillAndBlur(page, "report-revision", "R1");
  const logoPath = resolve(screenshotDir, "airpath_v04_demo_logo.svg");
  writeFileSync(logoPath, `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="10" fill="#0f172a"/><path d="M20 60 L48 20 L76 60 Z" fill="#38bdf8"/><text x="48" y="78" text-anchor="middle" font-family="Arial" font-size="18" fill="#e5edf5">AP</text></svg>`);
  await page.getByTestId("report-logo").setInputFiles(logoPath);
  await page.getByTestId("generate-report").click();
  const report = page.frameLocator("[data-testid='report-preview']");
  await expect(report.getByText("Project Metadata")).toBeVisible();
  await expect(report.getByText("Northstar Data Center Consulting").first()).toBeVisible();
  await expect(report.getByText("Risk Register")).toBeVisible();
  await page.getByTestId("report-preview").screenshot({ path: shot("case09_consultant_report_preview.png") });
  await captureReportPage(page, "case09_consultant_report_full.png");
  await page.screenshot({ path: shot("case09_consultant_report_generation.png"), fullPage: true });
}

async function case10ChineseUiAndReport(page: Page) {
  await loadSample(page, "small-baseline");
  await page.getByTestId("language-toggle").click();
  await expect(page.getByTestId("view-slice")).not.toHaveText("Slice");
  await page.getByTestId("view-slice").click();
  await page.getByTestId("step-review").click();
  await page.getByTestId("slice-axis-xy").click();
  await setRange(page, "slice-position", 0.52);
  await page.screenshot({ path: shot("case10_chinese_slice_controls.png"), fullPage: true });
  await page.getByTestId("tab-report").click();
  await fillAndBlur(page, "report-client", "台北資料中心客戶");
  await fillAndBlur(page, "report-project", "邊緣機房氣流檢視");
  await page.getByTestId("generate-report").click();
  const report = page.frameLocator("[data-testid='report-preview']");
  await expect(report.getByText("專案資料")).toBeVisible();
  await expect(report.getByText("熱場結果")).toBeVisible();
  await expect(report.getByText("氣流結果")).toBeVisible();
  await page.getByTestId("report-preview").screenshot({ path: shot("case10_chinese_report_preview.png") });
  await captureReportPage(page, "case10_chinese_report_full.png");
  await page.screenshot({ path: shot("case10_chinese_ui_report_flow.png"), fullPage: true });
}

async function loadSample(page: Page, key: string) {
  await page.getByTestId("sample-select").selectOption(key);
  await expect(page.getByTestId("review-step")).toBeVisible();
  await page.waitForTimeout(250);
}

async function runSimulation(page: Page) {
  await page.getByTestId("run-simulation").click();
  await expect(page.getByTestId("results-panel")).toBeVisible();
  await expect(page.getByTestId("viewport-metrics")).toContainText(/Max inlet|最高/);
}

async function fillAndBlur(page: Page, testId: string, value: string) {
  const input = page.getByTestId(testId);
  await input.fill(value);
  await input.press("Tab");
}

async function setRange(page: Page, testId: string, value: number) {
  await page.getByTestId(testId).evaluate((element, nextValue) => {
    const input = element as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    setter?.call(input, String(nextValue));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

async function setLayer(page: Page, testId: string, enabled: boolean) {
  const button = page.getByTestId(testId);
  const active = await button.evaluate((element) => element.classList.contains("active"));
  if (active !== enabled) await button.click();
}

async function captureReportPage(page: Page, filename: string) {
  const html = await page.getByTestId("report-preview").getAttribute("srcdoc");
  expect(html).toBeTruthy();
  const reportPage = await page.context().newPage();
  await reportPage.setViewportSize({ width: 1200, height: 900 });
  await reportPage.setContent(html!);
  await reportPage.screenshot({ path: shot(filename), fullPage: true });
  await reportPage.close();
}

function shot(name: string): string {
  return resolve(screenshotDir, name);
}
