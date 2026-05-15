import type { ColorbarPosition, ThermalColorMode, ThermalPaletteKey, ThermalScaleMode } from "./store";

export interface ThermalDisplaySettings {
  palette: ThermalPaletteKey;
  colorMode: ThermalColorMode;
  scaleMode: ThermalScaleMode;
  minC: number;
  maxC: number;
  criticalC: number;
  contrast: number;
  opacity: number;
  colorbarPosition: ColorbarPosition;
}

export interface ThermalScale {
  minC: number;
  maxC: number;
  criticalC: number;
  mode: ThermalScaleMode;
}

export interface PaletteStop {
  value: number;
  color: string;
  label: string;
}

export const thermalPalettes: Record<ThermalPaletteKey, { name: string; stops: PaletteStop[] }> = {
  "cfd-classic": {
    name: "CFD Classic",
    stops: [
      { value: 0, color: "#1d4ed8", label: "Blue" },
      { value: 0.22, color: "#06b6d4", label: "Cyan" },
      { value: 0.46, color: "#22c55e", label: "Green" },
      { value: 0.68, color: "#facc15", label: "Yellow" },
      { value: 0.84, color: "#f97316", label: "Orange" },
      { value: 1, color: "#ef4444", label: "Red" }
    ]
  },
  "thermal-professional": {
    name: "Thermal Professional",
    stops: [
      { value: 0, color: "#1e3a8a", label: "Deep blue" },
      { value: 0.22, color: "#2563eb", label: "Blue" },
      { value: 0.44, color: "#22d3ee", label: "Cyan" },
      { value: 0.66, color: "#facc15", label: "Yellow" },
      { value: 0.84, color: "#f97316", label: "Orange" },
      { value: 1, color: "#dc2626", label: "Red" }
    ]
  },
  "high-contrast": {
    name: "High Contrast",
    stops: [
      { value: 0, color: "#0f172a", label: "Navy" },
      { value: 0.28, color: "#06b6d4", label: "Cyan" },
      { value: 0.52, color: "#84cc16", label: "Lime" },
      { value: 0.74, color: "#fde047", label: "Yellow" },
      { value: 1, color: "#ef4444", label: "Red" }
    ]
  },
  "dark-view": {
    name: "Dark View Optimized",
    stops: [
      { value: 0, color: "#22d3ee", label: "Cyan" },
      { value: 0.32, color: "#22c55e", label: "Green" },
      { value: 0.62, color: "#f59e0b", label: "Amber" },
      { value: 0.82, color: "#f97316", label: "Orange" },
      { value: 1, color: "#ef4444", label: "Red" }
    ]
  }
};

export function resolveThermalScale(values: number[], settings: ThermalDisplaySettings, fallbackAmbientC: number, fallbackCriticalC: number): ThermalScale {
  if (settings.scaleMode === "manual") {
    return {
      minC: Math.min(settings.minC, settings.maxC - 0.5),
      maxC: Math.max(settings.maxC, settings.minC + 0.5),
      criticalC: settings.criticalC,
      mode: "manual"
    };
  }
  const finite = values.filter(Number.isFinite);
  const min = finite.length ? Math.min(...finite) : fallbackAmbientC - 2;
  const max = finite.length ? Math.max(...finite) : fallbackCriticalC + 3;
  const paddedMin = Math.min(fallbackAmbientC - 2, Math.floor(min - 1));
  const paddedMax = Math.max(fallbackCriticalC + 2, Math.ceil(max + 1));
  return { minC: paddedMin, maxC: paddedMax, criticalC: settings.criticalC || fallbackCriticalC, mode: "auto" };
}

export function temperatureToColor(tempC: number, scale: ThermalScale, settings: ThermalDisplaySettings): { r: number; g: number; b: number; hex: string } {
  const palette = thermalPalettes[settings.palette] ?? thermalPalettes["thermal-professional"];
  const raw = (tempC - scale.minC) / Math.max(0.1, scale.maxC - scale.minC);
  const contrasted = clamp((raw - 0.5) * settings.contrast + 0.5, 0, 1);
  const t = settings.colorMode === "stepped" ? steppedValue(contrasted, palette.stops.length) : contrasted;
  const color = sampleStops(palette.stops, t);
  return { ...color, hex: rgbToHex(color.r, color.g, color.b) };
}

export function thermalGradientCss(paletteKey: ThermalPaletteKey, stepped: boolean): string {
  const stops = thermalPalettes[paletteKey]?.stops ?? thermalPalettes["thermal-professional"].stops;
  if (!stepped) {
    return `linear-gradient(90deg, ${stops.map((stop) => `${stop.color} ${Math.round(stop.value * 100)}%`).join(", ")})`;
  }
  const segments: string[] = [];
  for (let index = 0; index < stops.length; index += 1) {
    const start = (index / stops.length) * 100;
    const end = ((index + 1) / stops.length) * 100;
    segments.push(`${stops[index].color} ${start.toFixed(2)}%`, `${stops[index].color} ${end.toFixed(2)}%`);
  }
  return `linear-gradient(90deg, ${segments.join(", ")})`;
}

export function thermalGradientCssVertical(paletteKey: ThermalPaletteKey, stepped: boolean): string {
  return thermalGradientCss(paletteKey, stepped).replace("90deg", "0deg");
}

export function thermalTicks(scale: ThermalScale, count = 5): number[] {
  return Array.from({ length: count }, (_, index) => scale.minC + ((scale.maxC - scale.minC) * index) / (count - 1));
}

function sampleStops(stops: PaletteStop[], value: number): { r: number; g: number; b: number } {
  const t = clamp(value, 0, 1);
  const upperIndex = stops.findIndex((stop) => stop.value >= t);
  if (upperIndex <= 0) return hexToRgb(stops[0].color);
  const lower = stops[upperIndex - 1];
  const upper = stops[upperIndex];
  const span = Math.max(0.0001, upper.value - lower.value);
  const local = (t - lower.value) / span;
  const a = hexToRgb(lower.color);
  const b = hexToRgb(upper.color);
  return {
    r: Math.round(a.r + (b.r - a.r) * local),
    g: Math.round(a.g + (b.g - a.g) * local),
    b: Math.round(a.b + (b.b - a.b) * local)
  };
}

function steppedValue(value: number, steps: number): number {
  return clamp((Math.floor(value * steps) + 0.5) / steps, 0, 1);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
