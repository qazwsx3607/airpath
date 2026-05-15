import type { ReportScreenshots } from "@airpath/report-engine";
import { useAirPathStore, type ViewMode } from "./store";
import { resolveThermalScale, temperatureToColor, thermalPalettes, thermalTicks } from "./thermalPalette";

type ReportScreenshotKey = keyof ReportScreenshots;

const captureOrder: Array<{ key: ReportScreenshotKey; mode: ViewMode }> = [
  { key: "layout", mode: "solid" },
  { key: "thermal", mode: "thermal" },
  { key: "airflow", mode: "airflow" }
];

export async function generateReportWithViewportScreenshots(): Promise<void> {
  const screenshots: ReportScreenshots = {};
  useAirPathStore.getState().setWorkspaceMode("three");
  useAirPathStore.setState({ focusedPoint: undefined, focusedWarningId: undefined, selectedIds: [] });
  for (const capture of captureOrder) {
    useAirPathStore.getState().setViewMode(capture.mode);
    await waitForViewportRender();
    const image = captureViewportCanvas(capture.key);
    if (image) screenshots[capture.key] = image;
  }
  useAirPathStore.getState().generateReport(screenshots);
}

function captureViewportCanvas(key: ReportScreenshotKey): string | undefined {
  const canvas = document.querySelector<HTMLCanvasElement>(".viewport-wrap canvas");
  if (!canvas || canvas.width === 0 || canvas.height === 0) return undefined;
  try {
    const capture = document.createElement("canvas");
    capture.width = canvas.width;
    capture.height = canvas.height;
    const context = capture.getContext("2d");
    if (!context) return undefined;
    context.drawImage(canvas, 0, 0, capture.width, capture.height);
    if (key === "thermal") drawThermalColorbar(context, capture.width, capture.height);
    const dataUrl = capture.toDataURL("image/png");
    return dataUrl.length > 128 ? dataUrl : undefined;
  } catch {
    return undefined;
  }
}

function drawThermalColorbar(context: CanvasRenderingContext2D, width: number, height: number) {
  const state = useAirPathStore.getState();
  const settings = {
    palette: state.thermalPalette,
    colorMode: state.thermalColorMode,
    scaleMode: state.thermalScaleMode,
    minC: state.thermalMinC,
    maxC: state.thermalMaxC,
    criticalC: state.thermalCriticalC,
    contrast: state.thermalContrast,
    opacity: state.thermalOpacity,
    colorbarPosition: state.colorbarPosition
  };
  if (settings.colorbarPosition === "hidden") return;
  const scale = resolveThermalScale(state.result.temperatureFieldC, settings, state.result.settings.ambientTemperatureC, state.result.settings.criticalTemperatureC);
  const palette = thermalPalettes[settings.palette];
  const isRight = settings.colorbarPosition === "right";
  const barWidth = isRight ? 24 : Math.min(520, width * 0.52);
  const barHeight = isRight ? Math.min(430, height * 0.62) : 24;
  const x = isRight ? width - 86 : (width - barWidth) / 2;
  const y = isRight ? (height - barHeight) / 2 : height - 78;
  context.save();
  context.fillStyle = "rgba(7, 10, 14, 0.82)";
  roundRect(context, x - 16, y - 30, isRight ? 76 : barWidth + 32, isRight ? barHeight + 74 : 86, 10);
  context.fill();
  context.fillStyle = "#e5edf5";
  context.font = "600 16px Inter, Arial, sans-serif";
  context.fillText("Temperature (C)", x, y - 10);
  context.fillStyle = "#a9b7c6";
  context.font = "12px Inter, Arial, sans-serif";
  context.fillText(`${palette.name} · ${scale.mode === "manual" ? "Manual" : "Auto"} · ${settings.colorMode === "stepped" ? "Stepped" : "Smooth"}`, x, isRight ? y + barHeight + 36 : y + 56);
  const steps = settings.colorMode === "stepped" ? palette.stops.length : 80;
  for (let index = 0; index < steps; index += 1) {
    const t0 = index / steps;
    const temp = scale.minC + (scale.maxC - scale.minC) * (t0 + 0.5 / steps);
    const color = temperatureToColor(temp, scale, settings);
    context.fillStyle = color.hex;
    if (isRight) {
      const segmentHeight = barHeight / steps;
      context.fillRect(x, y + barHeight - (index + 1) * segmentHeight, barWidth, Math.ceil(segmentHeight) + 1);
    } else {
      const segmentWidth = barWidth / steps;
      context.fillRect(x + index * segmentWidth, y, Math.ceil(segmentWidth) + 1, barHeight);
    }
  }
  context.strokeStyle = "rgba(229,237,245,0.72)";
  context.lineWidth = 1;
  context.strokeRect(x, y, barWidth, barHeight);
  const criticalOffset = Math.max(0, Math.min(1, (scale.criticalC - scale.minC) / Math.max(0.1, scale.maxC - scale.minC)));
  context.strokeStyle = "#f8fafc";
  context.lineWidth = 2;
  if (isRight) {
    const cy = y + barHeight - criticalOffset * barHeight;
    context.beginPath();
    context.moveTo(x - 7, cy);
    context.lineTo(x + barWidth + 7, cy);
    context.stroke();
  } else {
    const cx = x + criticalOffset * barWidth;
    context.beginPath();
    context.moveTo(cx, y - 7);
    context.lineTo(cx, y + barHeight + 7);
    context.stroke();
  }
  context.fillStyle = "#e5edf5";
  context.font = "12px JetBrains Mono, Consolas, monospace";
  const ticks = thermalTicks(scale, isRight ? 5 : 5);
  ticks.forEach((tick, index) => {
    if (isRight) {
      const ty = y + barHeight - (index / (ticks.length - 1)) * barHeight + 4;
      context.fillText(`${tick.toFixed(1)} C`, x + barWidth + 10, ty);
    } else {
      const tx = x + (index / (ticks.length - 1)) * barWidth - 18;
      context.fillText(`${tick.toFixed(1)}`, tx, y + barHeight + 20);
    }
  });
  context.restore();
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
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
