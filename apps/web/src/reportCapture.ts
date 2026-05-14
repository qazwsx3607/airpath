import type { ReportScreenshots } from "@airpath/report-engine";
import { useAirPathStore, type ViewMode } from "./store";

type ReportScreenshotKey = keyof ReportScreenshots;

const captureOrder: Array<{ key: ReportScreenshotKey; mode: ViewMode }> = [
  { key: "layout", mode: "solid" },
  { key: "thermal", mode: "thermal" },
  { key: "airflow", mode: "airflow" }
];

export async function generateReportWithViewportScreenshots(): Promise<void> {
  const screenshots: ReportScreenshots = {};
  for (const capture of captureOrder) {
    useAirPathStore.getState().setViewMode(capture.mode);
    await waitForViewportRender();
    const image = captureViewportCanvas();
    if (image) screenshots[capture.key] = image;
  }
  useAirPathStore.getState().generateReport(screenshots);
}

function captureViewportCanvas(): string | undefined {
  const canvas = document.querySelector<HTMLCanvasElement>(".viewport-wrap canvas");
  if (!canvas || canvas.width === 0 || canvas.height === 0) return undefined;
  try {
    const dataUrl = canvas.toDataURL("image/png");
    return dataUrl.length > 128 ? dataUrl : undefined;
  } catch {
    return undefined;
  }
}

function waitForViewportRender(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(resolve, 80);
      });
    });
  });
}
