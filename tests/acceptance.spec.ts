import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const screenshotDir = resolve(process.cwd(), "engineering-memos/screenshots");

test("AirPath GUI self-acceptance flow", async ({ page }) => {
  mkdirSync(screenshotDir, { recursive: true });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("AirPath")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();

  await expect(page.getByTestId("room-width")).toHaveValue("15");
  await expect(page.getByTestId("room-depth")).toHaveValue("10");
  await expect(page.getByTestId("room-height")).toHaveValue("3.5");
  await page.screenshot({ path: shot("01_start_template.png") });

  await page.getByRole("button", { name: "Continue to Rack Array" }).click();
  await page.getByTestId("rack-rows").fill("2");
  await page.getByTestId("rack-columns").fill("5");
  await page.getByTestId("rack-row-spacing").fill("1");
  await page.getByTestId("rack-column-spacing").fill("0.15");
  await page.getByTestId("rack-aisle").fill("1.2");
  await page.getByTestId("rack-heat").fill("16");
  await page.getByTestId("create-rack-array").click();
  await page.getByTestId("toggle-object-labels").click();
  await expect(page.getByTestId("rack-label").first()).toBeVisible({ timeout: 15_000 });
  await page.getByTestId("rack-label").first().click({ force: true });
  await page.getByTestId("rack-label").nth(1).click({ modifiers: ["Shift"], force: true });
  await page.getByTestId("selected-rack-heat").fill("18");
  await page.getByTestId("selected-rack-heat").press("Tab");
  await page.getByText("Move and resize").click();
  await page.getByRole("button", { name: "X+" }).click();
  await page.getByTestId("edit-mode-move").click();
  const rackLabelBox = await page.getByTestId("rack-label").first().boundingBox();
  expect(rackLabelBox).toBeTruthy();
  await page.mouse.move(rackLabelBox!.x + rackLabelBox!.width / 2, rackLabelBox!.y + rackLabelBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(rackLabelBox!.x + rackLabelBox!.width / 2 + 40, rackLabelBox!.y + rackLabelBox!.height / 2 + 16, { steps: 6 });
  await page.mouse.up();
  await expect(page.getByText(/Dragged .* floor plane|Moved \d+ selected object/)).toBeVisible();
  await page.getByTestId("edit-mode-select").click();
  await page.getByTestId("undo-button").click();
  await expect(page.getByText("Undo restored the previous scenario state.")).toBeVisible();
  await page.getByTestId("redo-button").click();
  await expect(page.getByText("Redo restored the next scenario state.")).toBeVisible();
  await page.getByTestId("toggle-object-labels").click();
  await page.screenshot({ path: shot("02_rack_array.png") });

  await page.getByTestId("step-cooling").click();
  await page.getByTestId("add-crac-crah").click();
  await page.getByTestId("add-floor-perforated-tile").click();
  await page.getByTestId("add-ceiling-supply-diffuser").click();
  await page.getByTestId("add-ceiling-return-grille").click();
  await page.getByTestId("add-in-row-cooler").click();
  await expect(page.getByText(/In-row cooler \d+ added\./)).toBeVisible();
  await page.screenshot({ path: shot("03_cooling_setup.png") });

  await page.getByTestId("step-containment").click();
  await page.getByTestId("add-cold-aisle").click();
  await page.getByTestId("add-hot-aisle").click();
  await page.getByTestId("add-end-of-row-door").click();
  await expect(page.getByText("End-of-row door 1 added.")).toBeVisible();
  await page.screenshot({ path: shot("04_containment.png") });

  await page.getByTestId("run-simulation").click();
  await expect(page.getByTestId("results-panel")).toContainText("Simulation Results");
  await expect(page.getByTestId("viewport-metrics")).toContainText("Max inlet");
  await page.getByTestId("toggle-warning-pins").click();
  await expect(page.getByTestId("warning-cluster").first()).toBeVisible();
  await page.getByTestId("toggle-warning-pins").click();

  await page.getByTestId("view-thermal").click();
  await expect(page.getByTestId("thermal-colorbar-bottom")).toBeVisible();
  await page.screenshot({ path: shot("05_thermal_view.png") });

  await page.getByTestId("view-airflow").click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: shot("06_airflow_view.png") });

  await page.getByTestId("tab-warnings").click();
  await expect(page.getByTestId("warnings-panel")).toBeVisible();
  if ((await page.getByTestId("warning-card").count()) > 0) {
    await page.getByTestId("warning-card").first().click();
    await expect(page.getByTestId("warning-card").first()).toBeVisible();
  }
  await page.screenshot({ path: shot("07_warnings.png") });

  await page.getByTestId("duplicate-scenario").click();
  await page.getByTestId("improve-scenario").click();
  await page.getByTestId("compare-scenarios").click();
  await expect(page.getByTestId("comparison-panel")).toContainText("Scenario B max");
  await page.screenshot({ path: shot("09_scenario_compare.png") });

  await page.getByTestId("generate-report").click();
  await expect(page.getByTestId("report-panel")).toBeVisible();
  await expect(page.frameLocator("[data-testid='report-preview']").getByText("Executive Summary")).toBeVisible();
  await expect(page.frameLocator("[data-testid='report-preview']").getByText("Disclaimer")).toBeVisible();
  await expect(page.frameLocator("[data-testid='report-preview']").locator("img")).toHaveCount(3);
  await page.screenshot({ path: shot("08_report.png") });

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-json").click();
  const download = await downloadPromise;
  const downloadedPath = await download.path();
  expect(downloadedPath).toBeTruthy();
  await page.getByTestId("import-json").setInputFiles(downloadedPath!);
  await expect(page.getByText("Scenario JSON imported.")).toBeVisible();
});

function shot(name: string): string {
  return resolve(screenshotDir, name);
}
