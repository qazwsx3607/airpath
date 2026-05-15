import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const screenshotDir = resolve(process.cwd(), "engineering-memos/screenshots/v0_5");

test("v0.5 layout authoring and thermal trust case matrix", async ({ page }) => {
  mkdirSync(screenshotDir, { recursive: true });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("canvas")).toBeVisible();

  await case01DirtyState(page);
  await case02RackDirection(page);
  await case03BackToBackHotAisle(page);
  await case04FaceToFaceColdAisle(page);
  await case05BoxSelectGroupMove(page);
  await case06MirrorSelectedRow(page);
  await case07ConvertRackToInRow(page);
  await case08SliceHeatmapXY(page);
  await case09SliceHeatmapVertical(page);
  await case10FiveMinuteCentralHotAisle(page);
  await case11PaletteSwitching(page);
  await case12SteppedBandMode(page);
  await case13ManualRange(page);
  await case14BottomColorbar(page);
  await case15RightColorbar(page);
  await case16SliceHeatmapWithColorbar(page);
  await case17ReportScreenshotColorbar(page);
});

async function case01DirtyState(page: Page) {
  await freshPlan(page);
  await page.getByTestId("run-simulation").click();
  await expect(page.getByTestId("run-status")).toContainText("completed");
  await selectFirstPlanRack(page);
  await page.getByTestId("plan-gizmo-x-plus").click();
  await expect(page.getByTestId("stale-banner")).toContainText("Results are outdated");
  await page.screenshot({ path: shot("case01_dirty_state.png"), fullPage: true });
  await page.getByTestId("run-simulation").click();
  await expect(page.getByTestId("run-status")).toContainText("completed");
  await expect(page.getByTestId("stale-banner")).toHaveCount(0);
}

async function case02RackDirection(page: Page) {
  await freshPlan(page);
  await expect(page.getByTestId("rack-front-indicator")).toHaveCount(8);
  await expect(page.getByTestId("rack-rear-indicator")).toHaveCount(8);
  await page.screenshot({ path: shot("case02_rack_front_rear.png"), fullPage: true });
}

async function case03BackToBackHotAisle(page: Page) {
  await freshPlan(page);
  await selectFirstRackRow(page);
  await page.getByTestId("create-hot-aisle").click();
  await page.getByTestId("detect-aisles").click();
  await expect(page.getByTestId("detected-hot-aisle").first()).toBeVisible();
  await page.screenshot({ path: shot("case03_back_to_back_hot_aisle.png"), fullPage: true });
}

async function case04FaceToFaceColdAisle(page: Page) {
  await freshPlan(page);
  await selectFirstRackRow(page);
  await page.getByTestId("create-cold-aisle").click();
  await page.getByTestId("detect-aisles").click();
  await expect(page.getByTestId("detected-cold-aisle").first()).toBeVisible();
  await page.screenshot({ path: shot("case04_face_to_face_cold_aisle.png"), fullPage: true });
}

async function case05BoxSelectGroupMove(page: Page) {
  await freshPlan(page);
  await selectFirstRackRow(page);
  await expect(page.getByTestId("plan-group-box")).toBeVisible();
  await page.getByTestId("plan-gizmo-y-plus").click();
  await expect(page.getByTestId("stale-banner")).toBeVisible();
  await page.screenshot({ path: shot("case05_plan_box_select_group_move.png"), fullPage: true });
}

async function case06MirrorSelectedRow(page: Page) {
  await freshPlan(page);
  await selectFirstRackRow(page);
  const before = await page.getByTestId("plan-rack").count();
  await page.getByTestId("mirror-z").click();
  await expect(page.getByTestId("plan-rack")).toHaveCount(before + 4);
  await page.screenshot({ path: shot("case06_mirror_row.png"), fullPage: true });
}

async function case07ConvertRackToInRow(page: Page) {
  await freshPlan(page);
  await selectFirstPlanRack(page);
  await page.getByTestId("convert-inrow").click();
  await expect(page.getByTestId("plan-inrow-cooling").first()).toBeVisible();
  await page.getByTestId("run-simulation").click();
  await expect(page.getByTestId("run-status")).toContainText("completed");
  await page.screenshot({ path: shot("case07_convert_inrow.png"), fullPage: true });
}

async function case08SliceHeatmapXY(page: Page) {
  await freshThree(page);
  await page.getByTestId("view-slice").click();
  await page.getByTestId("step-review").click();
  await page.getByTestId("slice-axis-xy").click();
  await expect(page.getByTestId("slice-plane")).toContainText("XY");
  await expect(page.getByTestId("thermal-colorbar-bottom")).toBeVisible();
  await page.screenshot({ path: shot("case08_slice_xy_heatmap.png"), fullPage: true });
}

async function case09SliceHeatmapVertical(page: Page) {
  await freshThree(page);
  await page.getByTestId("view-slice").click();
  await page.getByTestId("step-review").click();
  await page.getByTestId("slice-axis-yz").click();
  await expect(page.getByTestId("slice-plane")).toContainText("YZ");
  await page.screenshot({ path: shot("case09_slice_vertical_heatmap.png"), fullPage: true });
}

async function case10FiveMinuteCentralHotAisle(page: Page) {
  await freshPlan(page);
  await selectFirstRackRow(page);
  await page.getByTestId("create-hot-aisle").click();
  await page.getByTestId("detect-aisles").click();
  await page.getByTestId("generate-hot-containment").click();
  await page.getByTestId("run-simulation").click();
  await page.getByTestId("workspace-3d").click();
  await page.getByTestId("view-combined").click();
  await expect(page.getByTestId("run-status")).toContainText("completed");
  await page.screenshot({ path: shot("case10_five_minute_hot_aisle.png"), fullPage: true });
}

async function case11PaletteSwitching(page: Page) {
  await freshThree(page);
  await page.getByTestId("view-thermal").click();
  await page.getByTestId("step-review").click();
  for (const palette of ["cfd-classic", "thermal-professional", "high-contrast", "dark-view"]) {
    await page.getByTestId("thermal-palette").selectOption(palette);
    await expect(page.getByTestId("thermal-colorbar-bottom")).toBeVisible();
  }
  await page.screenshot({ path: shot("case11_palette_switching.png"), fullPage: true });
}

async function case12SteppedBandMode(page: Page) {
  await page.getByTestId("thermal-mode-stepped").click();
  await expect(page.getByTestId("thermal-colorbar-bottom")).toContainText("Stepped");
  await page.screenshot({ path: shot("case12_stepped_bands.png"), fullPage: true });
}

async function case13ManualRange(page: Page) {
  await page.getByTestId("thermal-scale-manual").click();
  await page.getByTestId("thermal-min").fill("18");
  await page.getByTestId("thermal-max").fill("35");
  await expect(page.getByTestId("thermal-colorbar-bottom")).toContainText("Manual");
  await page.screenshot({ path: shot("case13_manual_range.png"), fullPage: true });
}

async function case14BottomColorbar(page: Page) {
  await page.getByTestId("colorbar-position").selectOption("bottom");
  await expect(page.getByTestId("thermal-colorbar-bottom")).toBeVisible();
  await page.screenshot({ path: shot("case14_bottom_colorbar.png"), fullPage: true });
}

async function case15RightColorbar(page: Page) {
  await page.getByTestId("colorbar-position").selectOption("right");
  await expect(page.getByTestId("thermal-colorbar-right")).toBeVisible();
  await page.screenshot({ path: shot("case15_right_colorbar.png"), fullPage: true });
}

async function case16SliceHeatmapWithColorbar(page: Page) {
  await page.getByTestId("colorbar-position").selectOption("bottom");
  await page.getByTestId("view-slice").click();
  await page.getByTestId("slice-axis-xz").click();
  await expect(page.getByTestId("thermal-colorbar-bottom")).toBeVisible();
  await page.screenshot({ path: shot("case16_slice_colorbar.png"), fullPage: true });
}

async function case17ReportScreenshotColorbar(page: Page) {
  await page.getByTestId("generate-report").click();
  await expect(page.frameLocator("[data-testid='report-preview']").getByText("Thermal Results")).toBeVisible();
  await expect(page.frameLocator("[data-testid='report-preview']").locator("img")).toHaveCount(3);
  await page.screenshot({ path: shot("case17_report_colorbar.png"), fullPage: true });
  await captureReportPage(page, "case17_report_colorbar_full.png");
}

async function freshPlan(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByTestId("workspace-plan").click();
  await expect(page.getByTestId("plan-view")).toBeVisible();
}

async function freshThree(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("canvas")).toBeVisible();
}

async function selectFirstPlanRack(page: Page) {
  await page.getByTestId("plan-rack").first().click({ force: true });
  await expect(page.getByTestId("plan-group-box")).toBeVisible();
}

async function selectFirstRackRow(page: Page) {
  const svg = page.getByTestId("plan-svg");
  const box = await svg.boundingBox();
  expect(box).toBeTruthy();
  const start = roomToScreen(box!, 15, 10, 2.7, 2.0);
  const end = roomToScreen(box!, 15, 10, 6.3, 3.5);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 6 });
  await page.mouse.up();
  await expect(page.getByTestId("plan-group-box")).toBeVisible();
}

function roomToScreen(box: { x: number; y: number; width: number; height: number }, roomWidth: number, roomDepth: number, x: number, z: number) {
  return {
    x: box.x + (x / roomWidth) * box.width,
    y: box.y + (z / roomDepth) * box.height
  };
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
