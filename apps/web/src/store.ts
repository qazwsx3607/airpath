import { create } from "zustand";
import {
  type ContainmentType,
  type CoolingObject,
  type CoolingObjectType,
  type Rack,
  type RackArrayInput,
  type ReportSettings,
  type RoomTemplateKey,
  type Scenario,
  type Size3,
  type Vector3,
  cloneScenario,
  createContainmentObject,
  createCoolingObject,
  createDefaultScenario,
  defaultRackArrayInput,
  deserializeScenario,
  generateRackArray,
  roomTemplates,
  serializeScenario,
  updateScenarioTimestamp,
  validateScenario
} from "@airpath/scenario-schema";
import { type SimulationResult, type SimulationWarning, solveScenario } from "@airpath/solver-core";
import {
  compareScenarioResults,
  createReportData,
  renderHtmlReport,
  type ReportScreenshots,
  type ScenarioComparison
} from "@airpath/report-engine";
import { buildSampleScenarios } from "./sampleScenarios";

export type ViewMode = "solid" | "thermal" | "airflow" | "combined" | "slice" | "report";
export type WizardStep = "room" | "racks" | "cooling" | "containment" | "review";
export type RightTab = "inspector" | "results" | "warnings" | "report";
export type Language = "en" | "zh";
export type EditMode = "locked" | "select" | "move";
export type SliceAxis = "xz" | "xy" | "yz";

interface AirPathState {
  scenario: Scenario;
  result: SimulationResult;
  historyPast: Scenario[];
  historyFuture: Scenario[];
  rackDraft: RackArrayInput;
  selectedIds: string[];
  focusedWarningId?: string;
  focusedPoint?: Vector3;
  activeStep: WizardStep;
  rightTab: RightTab;
  viewMode: ViewMode;
  language: Language;
  editMode: EditMode;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  bottomCollapsed: boolean;
  showGrid: boolean;
  showObjectLabels: boolean;
  showWarningPins: boolean;
  showAirflowLayer: boolean;
  showHeatmapLayer: boolean;
  showDimensions: boolean;
  particleDensity: number;
  particleSpeed: number;
  airflowOpacity: number;
  thermalOpacity: number;
  sliceAxis: SliceAxis;
  slicePosition: number;
  reportScreenshots: ReportScreenshots;
  reportHtml: string;
  scenarioB?: Scenario;
  resultB?: SimulationResult;
  comparison?: ScenarioComparison;
  statusMessage: string;
  samples: ReturnType<typeof buildSampleScenarios>;
  setActiveStep: (step: WizardStep) => void;
  setRightTab: (tab: RightTab) => void;
  setViewMode: (mode: ViewMode) => void;
  setLanguage: (language: Language) => void;
  setEditMode: (mode: EditMode) => void;
  toggleLeft: () => void;
  toggleRight: () => void;
  toggleBottom: () => void;
  toggleGrid: () => void;
  toggleObjectLabels: () => void;
  toggleWarningPins: () => void;
  toggleAirflowLayer: () => void;
  toggleHeatmapLayer: () => void;
  toggleDimensions: () => void;
  setParticleDensity: (value: number) => void;
  setParticleSpeed: (value: number) => void;
  setAirflowOpacity: (value: number) => void;
  setThermalOpacity: (value: number) => void;
  setSliceAxis: (axis: SliceAxis) => void;
  setSlicePosition: (value: number) => void;
  updateReportSettings: (patch: Partial<ReportSettings>) => void;
  undo: () => void;
  redo: () => void;
  applyRoomTemplate: (template: RoomTemplateKey) => void;
  updateRoom: (patch: Partial<Scenario["room"]>) => void;
  updateRackDraft: (patch: Partial<RackArrayInput>) => void;
  createOrReplaceRackArray: () => void;
  appendRackArray: () => void;
  selectObject: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  batchEditSelectedRacks: (patch: Partial<Pick<Rack, "heatLoadKw" | "coolingMode" | "liquidCaptureRatio" | "orientation">>) => void;
  batchEditSelectedCoolingObjects: (
    patch: Partial<Pick<CoolingObject, "supplyTemperatureC" | "airflowLps" | "coolingCapacityKw" | "enabled">>
  ) => void;
  resizeSelectedRacks: (size: Partial<Size3>) => void;
  moveSelectedRacks: (dx: number, dz: number) => void;
  updateRackPositionPreview: (rackId: string, x: number, z: number) => void;
  commitScenarioHistory: (previousScenario: Scenario, statusMessage: string) => void;
  deleteSelected: () => void;
  addCoolingObject: (type: CoolingObjectType) => void;
  addContainment: (type: ContainmentType) => void;
  runSimulation: () => void;
  generateReport: (screenshots?: ReportScreenshots) => void;
  loadSample: (key: string) => void;
  importScenarioJson: (json: string) => void;
  exportScenarioJson: () => string;
  duplicateScenarioB: () => void;
  improveScenarioB: () => void;
  compareScenarios: () => void;
  focusWarning: (warning: SimulationWarning) => void;
  focusWarningCluster: (warnings: SimulationWarning[]) => void;
}

type AirPathSet = (partial: Partial<AirPathState>) => void;

const initialScenario = createDefaultScenario("medium");
const initialResult = solveScenario(initialScenario, "formal");
const historyLimit = 40;

export const useAirPathStore = create<AirPathState>((set, get) => ({
  scenario: initialScenario,
  result: initialResult,
  historyPast: [],
  historyFuture: [],
  rackDraft: defaultRackArrayInput(initialScenario.room),
  selectedIds: [],
  activeStep: "room",
  rightTab: "results",
  viewMode: "solid",
  language: initialScenario.reportSettings.language,
  editMode: "select",
  leftCollapsed: false,
  rightCollapsed: false,
  bottomCollapsed: false,
  showGrid: true,
  showObjectLabels: false,
  showWarningPins: false,
  showAirflowLayer: true,
  showHeatmapLayer: true,
  showDimensions: false,
  particleDensity: 34,
  particleSpeed: 1,
  airflowOpacity: 0.62,
  thermalOpacity: 0.48,
  sliceAxis: "xz",
  slicePosition: 0.32,
  reportScreenshots: {},
  reportHtml: renderHtmlReport(createReportData(initialScenario, initialResult)),
  statusMessage: "Ready for a 5-minute airflow review.",
  samples: buildSampleScenarios(),
  setActiveStep: (activeStep) => set({ activeStep }),
  setRightTab: (rightTab) => set({ rightTab }),
  setViewMode: (viewMode) => set({ viewMode }),
  setLanguage: (language) => {
    const state = get();
    const scenario = validateScenario({ ...state.scenario, reportSettings: { ...state.scenario.reportSettings, language } });
    set({
      language,
      scenario,
      reportHtml: renderHtmlReport(createReportData(scenario, state.result, state.reportScreenshots)),
      statusMessage: language === "zh" ? "已切換為中文介面。" : "Language switched to English."
    });
  },
  setEditMode: (editMode) => set({ editMode }),
  toggleLeft: () => set((state) => ({ leftCollapsed: !state.leftCollapsed })),
  toggleRight: () => set((state) => ({ rightCollapsed: !state.rightCollapsed })),
  toggleBottom: () => set((state) => ({ bottomCollapsed: !state.bottomCollapsed })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleObjectLabels: () => set((state) => ({ showObjectLabels: !state.showObjectLabels })),
  toggleWarningPins: () => set((state) => ({ showWarningPins: !state.showWarningPins })),
  toggleAirflowLayer: () => set((state) => ({ showAirflowLayer: !state.showAirflowLayer })),
  toggleHeatmapLayer: () => set((state) => ({ showHeatmapLayer: !state.showHeatmapLayer })),
  toggleDimensions: () => set((state) => ({ showDimensions: !state.showDimensions })),
  setParticleDensity: (particleDensity) => set({ particleDensity }),
  setParticleSpeed: (particleSpeed) => set({ particleSpeed }),
  setAirflowOpacity: (airflowOpacity) => set({ airflowOpacity }),
  setThermalOpacity: (thermalOpacity) => set({ thermalOpacity }),
  setSliceAxis: (sliceAxis) => set({ sliceAxis }),
  setSlicePosition: (slicePosition) => set({ slicePosition }),
  updateReportSettings: (patch) => {
    const state = get();
    const reportSettings = { ...state.scenario.reportSettings, ...patch };
    const scenario = validateScenario({ ...state.scenario, reportSettings });
    set({
      scenario,
      language: reportSettings.language,
      reportHtml: renderHtmlReport(createReportData(scenario, state.result, state.reportScreenshots)),
      statusMessage: reportSettings.language === "zh" ? "報告資料已更新。" : "Report metadata updated."
    });
  },
  undo: () => {
    const state = get();
    const previous = state.historyPast.at(-1);
    if (!previous) return;
    const historyPast = state.historyPast.slice(0, -1);
    const result = solveScenario(previous, "preview");
    set({
      scenario: previous,
      result,
      historyPast,
      historyFuture: [state.scenario, ...state.historyFuture].slice(0, historyLimit),
      selectedIds: [],
      focusedPoint: undefined,
      focusedWarningId: undefined,
      reportScreenshots: {},
      reportHtml: renderHtmlReport(createReportData(previous, result)),
      statusMessage: "Undo restored the previous scenario state."
    });
  },
  redo: () => {
    const state = get();
    const next = state.historyFuture[0];
    if (!next) return;
    const result = solveScenario(next, "preview");
    set({
      scenario: next,
      result,
      historyPast: [...state.historyPast, state.scenario].slice(-historyLimit),
      historyFuture: state.historyFuture.slice(1),
      selectedIds: [],
      focusedPoint: undefined,
      focusedWarningId: undefined,
      reportScreenshots: {},
      reportHtml: renderHtmlReport(createReportData(next, result)),
      statusMessage: "Redo restored the next scenario state."
    });
  },
  applyRoomTemplate: (template) => {
    const state = get();
    const room = template === "custom" ? { ...roomTemplates.medium, id: "room-custom", name: "Custom room" } : { ...roomTemplates[template] };
    const scenario = validateScenario({
      ...createDefaultScenario(template === "custom" ? "medium" : template),
      room,
      racks: [],
      rackArrays: [],
      coolingObjects: [createCoolingObject("crac-crah", 1, room), createCoolingObject("ceiling-return-grille", 1, room)],
      containmentObjects: [],
      simulationSettings: { ...initialScenario.simulationSettings, ambientTemperatureC: room.ambientTemperatureC },
      metadata: {
        ...initialScenario.metadata,
        id: `scenario-${template}`,
        name: room.name,
        description: `${room.name} template review.`,
        updatedAt: new Date().toISOString()
      },
      reportSettings: { ...initialScenario.reportSettings, projectName: room.name }
    });
    setWithPreview(set, scenario, {
      ...historyPatch(state),
      rackDraft: defaultRackArrayInput(room),
      selectedIds: [],
      activeStep: "racks",
      statusMessage: `${room.name} template loaded.`
    });
  },
  updateRoom: (patch) => {
    const scenario = get().scenario;
    const state = get();
    const room = { ...scenario.room, ...patch };
    setWithPreview(set, { ...scenario, room, simulationSettings: { ...scenario.simulationSettings, ambientTemperatureC: room.ambientTemperatureC } }, {
      ...historyPatch(state),
      statusMessage: "Room dimensions updated."
    });
  },
  updateRackDraft: (patch) => set((state) => ({ rackDraft: { ...state.rackDraft, ...patch } })),
  createOrReplaceRackArray: () => {
    const state = get();
    const draft = prepareRackDraft(state.rackDraft, 1);
    const racks = generateRackArray(draft);
    setWithPreview(set, { ...state.scenario, rackArrays: [draft], racks }, {
      ...historyPatch(state),
      selectedIds: racks.slice(0, 1).map((rack) => rack.id),
      statusMessage: `Created ${racks.length} racks from the array builder.`,
      rightTab: "inspector",
      activeStep: "cooling"
    });
  },
  appendRackArray: () => {
    const state = get();
    const draft = prepareRackDraft(state.rackDraft, state.scenario.rackArrays.length + 1);
    const racks = generateRackArray(draft);
    setWithPreview(set, { ...state.scenario, rackArrays: [...state.scenario.rackArrays, draft], racks: [...state.scenario.racks, ...racks] }, {
      ...historyPatch(state),
      selectedIds: racks.map((rack) => rack.id),
      statusMessage: `Added ${racks.length} racks.`
    });
  },
  selectObject: (id, multi = false) =>
    set((state) => ({
      selectedIds: multi ? toggleSelection(state.selectedIds, id) : [id],
      rightTab: "inspector"
    })),
  clearSelection: () => set({ selectedIds: [] }),
  batchEditSelectedRacks: (patch) => {
    const state = get();
    const selected = new Set(state.selectedIds);
    if (selected.size === 0) return;
    const racks = state.scenario.racks.map((rack) =>
      selected.has(rack.id)
        ? {
            ...rack,
            ...patch,
            liquidCaptureRatio: patch.coolingMode === "air-cooled" ? 0 : patch.liquidCaptureRatio ?? rack.liquidCaptureRatio
          }
        : rack
    );
    setWithPreview(set, { ...state.scenario, racks }, { ...historyPatch(state), statusMessage: `Updated ${selected.size} selected rack(s).` });
  },
  batchEditSelectedCoolingObjects: (patch) => {
    const state = get();
    const selected = new Set(state.selectedIds);
    if (selected.size === 0) return;
    const coolingObjects = state.scenario.coolingObjects.map((object) => (selected.has(object.id) ? { ...object, ...patch } : object));
    setWithPreview(set, { ...state.scenario, coolingObjects }, { ...historyPatch(state), statusMessage: `Updated ${selected.size} selected cooling object(s).` });
  },
  resizeSelectedRacks: (size) => {
    const state = get();
    const selected = new Set(state.selectedIds);
    if (selected.size === 0) return;
    const racks = state.scenario.racks.map((rack) => (selected.has(rack.id) ? { ...rack, size: { ...rack.size, ...size } } : rack));
    setWithPreview(set, { ...state.scenario, racks }, { ...historyPatch(state), statusMessage: `Resized ${selected.size} selected rack(s).` });
  },
  moveSelectedRacks: (dx, dz) => {
    const state = get();
    const selected = new Set(state.selectedIds);
    if (selected.size === 0) return;
    const racks = state.scenario.racks.map((rack) =>
      selected.has(rack.id) ? { ...rack, position: { ...rack.position, x: rack.position.x + dx, z: rack.position.z + dz } } : rack
    );
    setWithPreview(set, { ...state.scenario, racks }, { ...historyPatch(state), statusMessage: `Moved ${selected.size} selected rack(s).` });
  },
  updateRackPositionPreview: (rackId, x, z) => {
    const state = get();
    let changed = false;
    const racks = state.scenario.racks.map((rack) => {
      if (rack.id !== rackId) return rack;
      const nextX = snap(clamp(x, rack.size.width / 2, state.scenario.room.width - rack.size.width / 2), 0.05);
      const nextZ = snap(clamp(z, rack.size.depth / 2, state.scenario.room.depth - rack.size.depth / 2), 0.05);
      changed = nextX !== rack.position.x || nextZ !== rack.position.z;
      return { ...rack, position: { ...rack.position, x: nextX, z: nextZ } };
    });
    if (!changed) return;
    setWithPreview(set, { ...state.scenario, racks }, { selectedIds: [rackId], statusMessage: "Dragging rack on floor plane." });
  },
  commitScenarioHistory: (previousScenario, statusMessage) => {
    const state = get();
    set({
      historyPast: [...state.historyPast, previousScenario].slice(-historyLimit),
      historyFuture: [],
      statusMessage
    });
  },
  deleteSelected: () => {
    const state = get();
    const selected = new Set(state.selectedIds);
    if (selected.size === 0) return;
    setWithPreview(set, {
      ...state.scenario,
      racks: state.scenario.racks.filter((rack) => !selected.has(rack.id)),
      coolingObjects: state.scenario.coolingObjects.filter((object) => !selected.has(object.id)),
      containmentObjects: state.scenario.containmentObjects.filter((object) => !selected.has(object.id))
    }, {
      ...historyPatch(state),
      selectedIds: [],
      statusMessage: `Deleted ${selected.size} selected object(s).`
    });
  },
  addCoolingObject: (type) => {
    const state = get();
    const object = createCoolingObject(type, state.scenario.coolingObjects.filter((candidate) => candidate.type === type).length + 1, state.scenario.room);
    setWithPreview(set, { ...state.scenario, coolingObjects: [...state.scenario.coolingObjects, object] }, {
      ...historyPatch(state),
      selectedIds: [object.id],
      activeStep: "cooling",
      rightTab: "inspector",
      statusMessage: `${object.name} added.`
    });
  },
  addContainment: (type) => {
    const state = get();
    const object = createContainmentObject(
      type,
      state.scenario.containmentObjects.filter((candidate) => candidate.type === type).length + 1,
      state.scenario.room,
      state.selectedIds.length ? state.selectedIds : state.scenario.racks.map((rack) => rack.id)
    );
    setWithPreview(set, { ...state.scenario, containmentObjects: [...state.scenario.containmentObjects, object] }, {
      ...historyPatch(state),
      selectedIds: [object.id],
      activeStep: "containment",
      rightTab: "inspector",
      statusMessage: `${object.name} added.`
    });
  },
  runSimulation: () => {
    const scenario = updateScenarioTimestamp(get().scenario);
    const result = solveScenario(scenario, "formal");
    set({
      scenario,
      result,
      reportScreenshots: {},
      reportHtml: renderHtmlReport(createReportData(scenario, result)),
      rightTab: "results",
      statusMessage: `Formal simulation complete in ${result.elapsedMs.toFixed(1)} ms.`
    });
  },
  generateReport: (screenshots = {}) => {
    const state = get();
    const reportScreenshots = { ...state.reportScreenshots, ...screenshots };
    const reportHtml = renderHtmlReport(createReportData(state.scenario, state.result, reportScreenshots));
    set({
      reportScreenshots,
      reportHtml,
      rightTab: "report",
      viewMode: "report",
      selectedIds: [],
      focusedPoint: undefined,
      focusedWarningId: undefined,
      statusMessage: state.language === "zh" ? "報告預覽已產生並嵌入視窗截圖。" : "Report preview generated with embedded viewport images."
    });
  },
  loadSample: (key) => {
    const sample = get().samples.find((candidate) => candidate.key === key);
    if (!sample) return;
    const scenario = validateScenario(sample.scenario);
    const result = solveScenario(scenario, "formal");
    const state = get();
    set({
      scenario,
      result,
      ...historyPatch(state),
      rackDraft: defaultRackArrayInput(scenario.room),
      selectedIds: [],
      activeStep: "review",
      rightTab: "results",
      viewMode: "solid",
      language: scenario.reportSettings.language,
      reportScreenshots: {},
      reportHtml: renderHtmlReport(createReportData(scenario, result)),
      statusMessage: `${sample.label} loaded.`
    });
  },
  importScenarioJson: (json) => {
    const scenario = deserializeScenario(json);
    const result = solveScenario(scenario, "formal");
    const state = get();
    set({
      scenario,
      result,
      ...historyPatch(state),
      rackDraft: defaultRackArrayInput(scenario.room),
      selectedIds: [],
      language: scenario.reportSettings.language,
      reportScreenshots: {},
      reportHtml: renderHtmlReport(createReportData(scenario, result)),
      statusMessage: "Scenario JSON imported."
    });
  },
  exportScenarioJson: () => serializeScenario(get().scenario),
  duplicateScenarioB: () => {
    const state = get();
    const scenarioB = cloneScenario(state.scenario, `${state.scenario.metadata.id}-b`, `${state.scenario.metadata.name} - Scenario B`);
    const resultB = solveScenario(scenarioB, "formal");
    set({ scenarioB, resultB, comparison: undefined, statusMessage: "Scenario B duplicated from current layout." });
  },
  improveScenarioB: () => {
    const state = get();
    const scenarioB = state.scenarioB ?? cloneScenario(state.scenario, `${state.scenario.metadata.id}-b`, `${state.scenario.metadata.name} - Scenario B`);
    const improved = validateScenario({
      ...scenarioB,
      coolingObjects: scenarioB.coolingObjects.map((object) =>
        object.coolingCapacityKw > 0 ? { ...object, airflowLps: object.airflowLps * 1.35, coolingCapacityKw: object.coolingCapacityKw * 1.25 } : object
      ),
      containmentObjects: scenarioB.containmentObjects.length
        ? scenarioB.containmentObjects
        : [createContainmentObject("cold-aisle", 1, scenarioB.room, scenarioB.racks.map((rack) => rack.id))],
      metadata: { ...scenarioB.metadata, description: `${scenarioB.metadata.description} Scenario B includes added airflow and containment.` }
    });
    const resultB = solveScenario(improved, "formal");
    set({ scenarioB: improved, resultB, statusMessage: "Scenario B improved with added airflow and containment." });
  },
  compareScenarios: () => {
    const state = get();
    const scenarioB = state.scenarioB ?? cloneScenario(state.scenario, `${state.scenario.metadata.id}-b`, `${state.scenario.metadata.name} - Scenario B`);
    const resultB = state.resultB ?? solveScenario(scenarioB, "formal");
    set({
      scenarioB,
      resultB,
      comparison: compareScenarioResults(state.scenario, state.result, scenarioB, resultB),
      bottomCollapsed: false,
      statusMessage: "Scenario A/B comparison updated."
    });
  },
  focusWarning: (warning) =>
    set({
      focusedWarningId: warning.id,
      focusedPoint: warning.position,
      selectedIds: warning.objectIds,
      rightTab: "warnings",
      statusMessage: warning.suggestedMitigation
    }),
  focusWarningCluster: (warnings) =>
    set({
      focusedWarningId: `cluster-${warnings.map((warning) => warning.id).join("-")}`,
      focusedPoint: averagePosition(warnings.map((warning) => warning.position)),
      selectedIds: [...new Set(warnings.flatMap((warning) => warning.objectIds))],
      rightTab: "warnings",
      statusMessage: `${warnings.length} nearby ${warnings[0]?.label.toLowerCase() ?? "warning"} items clustered.`
    })
}));

function setWithPreview(
  set: AirPathSet,
  scenarioInput: Scenario,
  patch: Partial<AirPathState> = {}
): void {
  const scenario = validateScenario(updateScenarioTimestamp(scenarioInput));
  const result = solveScenario(scenario, "preview");
  set({
    scenario,
    result,
    language: scenario.reportSettings.language,
    reportScreenshots: {},
    reportHtml: renderHtmlReport(createReportData(scenario, result)),
    ...patch
  });
}

function historyPatch(state: AirPathState): Pick<AirPathState, "historyPast" | "historyFuture"> {
  return {
    historyPast: [...state.historyPast, state.scenario].slice(-historyLimit),
    historyFuture: []
  };
}

function prepareRackDraft(draft: RackArrayInput, ordinal: number): RackArrayInput {
  return {
    ...draft,
    id: `rack-array-${ordinal}`,
    name: ordinal === 1 ? "Rack Array" : `Rack Array ${ordinal}`
  };
}

function toggleSelection(selection: string[], id: string): string[] {
  return selection.includes(id) ? selection.filter((candidate) => candidate !== id) : [...selection, id];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function snap(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

function averagePosition(points: Vector3[]): Vector3 | undefined {
  if (points.length === 0) return undefined;
  const total = points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y, z: sum.z + point.z }),
    { x: 0, y: 0, z: 0 }
  );
  return { x: total.x / points.length, y: total.y / points.length, z: total.z / points.length };
}
