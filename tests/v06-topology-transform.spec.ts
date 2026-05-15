import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const screenshotDir = resolve(process.cwd(), "engineering-memos/screenshots/v0_6");

test("v0.6 thermal topology, 3D zone, and universal transform case matrix", async ({ page }) => {
  mkdirSync(screenshotDir, { recursive: true });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("canvas")).toBeVisible();

  await caseT1BackToBackHotAisle(page);
  await caseT2InRowPreservesHotAisle(page);
  await caseZ1ToZ4ContainedHotAisleVolumeAndAirflow(page);
  await caseG1ToG4UniversalObjectMoveRotate(page);
  await caseG5ToG10GroupMirrorGumballUndoStale(page);
  await caseT4ColdAisleAndT5AmbiguityWarning(page);
  await caseT10ReportTopologySummary(page);
});

async function caseT1BackToBackHotAisle(page: Page) {
  await setupSingleRackRow(page, 6);
  await selectFirstRackRow(page);
  await page.getByTestId("create-hot-aisle").click();
  await page.getByTestId("detect-aisles").click();
  await expect(page.getByTestId("detected-hot-aisle").first()).toBeVisible();
  await page.screenshot({ path: shot("case_T1_back_to_back_hot_aisle.png"), fullPage: true });
}

async function caseT2InRowPreservesHotAisle(page: Page) {
  await setupSingleRackRow(page, 6);
  await selectFirstRackRow(page);
  await page.getByTestId("create-hot-aisle").click();
  await selectRackIndexes(page, [2, 8]);
  await page.getByTestId("convert-inrow").click();
  await expect(page.getByTestId("plan-inrow-cooling")).toHaveCount(3);
  await page.getByTestId("detect-aisles").click();
  await expect(page.getByTestId("detected-hot-aisle").first()).toBeVisible();
  await page.screenshot({ path: shot("case_T2_inrow_preserves_hot_aisle.png"), fullPage: true });
}

async function caseZ1ToZ4ContainedHotAisleVolumeAndAirflow(page: Page) {
  await setupSingleRackRow(page, 6);
  await selectFirstRackRow(page);
  await page.getByTestId("create-hot-aisle").click();
  await selectRackIndexes(page, [2, 8]);
  await page.getByTestId("convert-inrow").click();
  await page.getByTestId("detect-aisles").click();
  await page.getByTestId("generate-hot-containment").click();
  await page.getByTestId("run-simulation").click();
  await page.getByTestId("workspace-3d").click();
  await page.getByTestId("view-combined").click();
  await expect(page.getByTestId("thermal-zone-count")).toContainText("thermal zone");
  await page.screenshot({ path: shot("case_Z1_3d_hot_aisle_volume.png"), fullPage: true });
  await page.getByTestId("view-airflow").click();
  await expect(page.getByTestId("thermal-zone-count")).toContainText("thermal zone");
  await page.screenshot({ path: shot("case_Z4_contained_streamlines.png"), fullPage: true });
  await page.getByTestId("view-slice").click();
  await expect(page.getByTestId("slice-plane")).toBeVisible();
  await expect(page.getByTestId("thermal-zone-count")).toContainText("thermal zone");
  await page.screenshot({ path: shot("case_Z6_slice_through_contained_hot_aisle.png"), fullPage: true });
}

async function caseG1ToG4UniversalObjectMoveRotate(page: Page) {
  await setupSingleRackRow(page, 4);
  await page.getByTestId("workspace-plan").click();
  await page.getByTestId("plan-cooling-object").first().click({ force: true });
  await page.getByTestId("plan-gizmo-x-plus").click();
  await expect(page.getByTestId("stale-banner")).toBeVisible();
  await page.screenshot({ path: shot("case_G1_move_crac_or_cooling.png"), fullPage: true });

  await selectFirstPlanRack(page);
  await page.getByTestId("convert-inrow").click();
  await page.getByTestId("plan-inrow-cooling").first().click({ force: true });
  await page.getByTestId("plan-gizmo-y-plus").click();
  await page.getByTestId("plan-rotate-cw").click();
  await page.screenshot({ path: shot("case_G2_G3_move_rotate_inrow.png"), fullPage: true });

  await selectFirstRackRow(page);
  await page.getByTestId("create-hot-aisle").click();
  await page.getByTestId("detect-aisles").click();
  await page.getByTestId("generate-hot-containment").click();
  await page.getByTestId("plan-containment-object").first().click({ force: true });
  await page.getByTestId("plan-gizmo-x-minus").click();
  await page.screenshot({ path: shot("case_G4_move_containment_panel.png"), fullPage: true });
}

async function caseG5ToG10GroupMirrorGumballUndoStale(page: Page) {
  await setupSingleRackRow(page, 4);
  await selectFirstRackRow(page);
  await page.getByTestId("create-hot-aisle").click();
  await page.getByTestId("detect-aisles").click();
  await expect(page.getByTestId("detected-hot-aisle").first()).toBeVisible();
  await page.screenshot({ path: shot("case_G5_G10_group_mirror_hot_aisle.png"), fullPage: true });

  await page.getByTestId("workspace-3d").click();
  await page.getByTestId("edit-mode-move").click();
  await expect(page.getByTestId("screen-gumball")).toBeVisible();
  await page.getByTestId("screen-gumball-x-plus").click();
  await expect(page.getByTestId("stale-banner")).toBeVisible();
  await page.screenshot({ path: shot("case_G6_3d_universal_gumball.png"), fullPage: true });

  await page.getByTestId("workspace-plan").click();
  await expect(page.getByTestId("plan-view")).toBeVisible();
  await page.screenshot({ path: shot("case_G7_plan_3d_sync.png"), fullPage: true });
  await page.getByTestId("undo-button").click();
  await page.getByTestId("redo-button").click();
  await expect(page.getByTestId("stale-banner")).toBeVisible();
  await page.screenshot({ path: shot("case_G8_G9_undo_redo_stale_transform.png"), fullPage: true });
}

async function caseT4ColdAisleAndT5AmbiguityWarning(page: Page) {
  await setupSingleRackRow(page, 6);
  await selectFirstRackRow(page);
  await page.getByTestId("create-cold-aisle").click();
  await page.getByTestId("detect-aisles").click();
  await expect(page.getByTestId("detected-cold-aisle").first()).toBeVisible();
  await page.screenshot({ path: shot("case_T4_face_to_face_cold_aisle.png"), fullPage: true });

  await setupSingleRackRow(page, 4);
  await selectRackIndexes(page, [1]);
  await page.getByTestId("plan-rotate-cw").click();
  await page.getByTestId("run-simulation").click();
  await page.getByTestId("tab-warnings").click();
  await expect(page.getByText("Ambiguous aisle orientation").first()).toBeVisible();
  await page.screenshot({ path: shot("case_T5_mixed_orientation_warning.png"), fullPage: true });
}

async function caseT10ReportTopologySummary(page: Page) {
  await setupSingleRackRow(page, 6);
  await selectFirstRackRow(page);
  await page.getByTestId("create-hot-aisle").click();
  await page.getByTestId("detect-aisles").click();
  await page.getByTestId("generate-hot-containment").click();
  await page.getByTestId("run-simulation").click();
  await page.getByTestId("generate-report").click();
  const report = page.frameLocator("[data-testid='report-preview']");
  await expect(report.getByText("Thermal Topology Summary")).toBeVisible();
  await expect(report.getByText("Rack orientation assumption")).toBeVisible();
  await page.screenshot({ path: shot("case_T10_report_topology_summary.png"), fullPage: true });
  await captureReportPage(page, "case_T10_report_topology_summary_full.png");
}

async function setupSingleRackRow(page: Page, columns: number) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByTestId("step-racks").click();
  await page.getByTestId("rack-rows").fill("1");
  await page.getByTestId("rack-columns").fill(String(columns));
  await page.getByTestId("create-rack-array").click();
  await page.getByTestId("workspace-plan").click();
  await expect(page.getByTestId("plan-view")).toBeVisible();
}

async function selectFirstPlanRack(page: Page) {
  await page.getByTestId("plan-rack").first().click({ force: true });
  await expect(page.getByTestId("plan-group-box")).toBeVisible();
}

async function selectRackIndexes(page: Page, indexes: number[]) {
  const racks = page.getByTestId("plan-rack");
  for (const [order, index] of indexes.entries()) {
    await racks.nth(index).click({ force: true, modifiers: order === 0 ? [] : ["Shift"] });
  }
  await expect(page.getByTestId("plan-group-box")).toBeVisible();
}

async function selectFirstRackRow(page: Page) {
  const svg = page.getByTestId("plan-svg");
  const box = await svg.boundingBox();
  expect(box).toBeTruthy();
  const start = roomToScreen(box!, 15, 10, 2.7, 2.0);
  const end = roomToScreen(box!, 15, 10, 8.0, 3.7);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 8 });
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
