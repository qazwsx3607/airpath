import { create } from "zustand";
import {
  type ContainmentType,
  type CoolingObject,
  type CoolingObjectType,
  type DetectedAisle,
  type Rack,
  type RackArrayInput,
  type RackOrientation,
  type ReportSettings,
  type RoomTemplateKey,
  type Scenario,
  type Size3,
  type ThermalTopology,
  type Vector3,
  analyzeThermalTopology,
  cloneScenario,
  createContainmentObject,
  createCoolingObject,
  createDefaultScenario,
  defaultRackArrayInput,
  deserializeScenario,
  generateRackArray,
  orientationFromDirection,
  oppositeRackOrientation,
  orientationVector,
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
export type WorkspaceMode = "three" | "plan";
export type RunStatus = "idle" | "dirty" | "running" | "completed" | "failed";
export type ThermalPaletteKey = "cfd-classic" | "thermal-professional" | "high-contrast" | "dark-view";
export type ThermalColorMode = "smooth" | "stepped";
export type ThermalScaleMode = "auto" | "manual";
export type ColorbarPosition = "bottom" | "right" | "hidden";

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
  workspaceMode: WorkspaceMode;
  language: Language;
  editMode: EditMode;
  runStatus: RunStatus;
  simulationRunId: number;
  lastRunAt?: string;
  lastRunElapsedMs?: number;
  resultsStale: boolean;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  bottomCollapsed: boolean;
  showGrid: boolean;
  showObjectLabels: boolean;
  showWarningPins: boolean;
  showAirflowLayer: boolean;
  showHeatmapLayer: boolean;
  showThermalZones: boolean;
  showZoneLabels: boolean;
  showAirflowBoundaries: boolean;
  showDimensions: boolean;
  thermalZoneOpacity: number;
  particleDensity: number;
  particleSpeed: number;
  airflowOpacity: number;
  thermalOpacity: number;
  thermalPalette: ThermalPaletteKey;
  thermalColorMode: ThermalColorMode;
  thermalScaleMode: ThermalScaleMode;
  thermalMinC: number;
  thermalMaxC: number;
  thermalCriticalC: number;
  thermalContrast: number;
  colorbarPosition: ColorbarPosition;
  sliceAxis: SliceAxis;
  slicePosition: number;
  detectedAisles: DetectedAisle[];
  thermalTopology: ThermalTopology;
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
  setWorkspaceMode: (mode: WorkspaceMode) => void;
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
  toggleThermalZones: () => void;
  toggleZoneLabels: () => void;
  toggleAirflowBoundaries: () => void;
  toggleDimensions: () => void;
  setThermalZoneOpacity: (value: number) => void;
  setParticleDensity: (value: number) => void;
  setParticleSpeed: (value: number) => void;
  setAirflowOpacity: (value: number) => void;
  setThermalOpacity: (value: number) => void;
  setThermalPalette: (value: ThermalPaletteKey) => void;
  setThermalColorMode: (value: ThermalColorMode) => void;
  setThermalScaleMode: (value: ThermalScaleMode) => void;
  setThermalRange: (minC: number, maxC: number) => void;
  setThermalCriticalC: (value: number) => void;
  setThermalContrast: (value: number) => void;
  setColorbarPosition: (value: ColorbarPosition) => void;
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
  selectObjects: (ids: string[], statusMessage?: string) => void;
  clearSelection: () => void;
  batchEditSelectedRacks: (patch: Partial<Pick<Rack, "heatLoadKw" | "coolingMode" | "liquidCaptureRatio" | "orientation">>) => void;
  batchEditSelectedCoolingObjects: (
    patch: Partial<Pick<CoolingObject, "supplyTemperatureC" | "airflowLps" | "coolingCapacityKw" | "enabled">>
  ) => void;
  resizeSelectedRacks: (size: Partial<Size3>) => void;
  moveSelectedRacks: (dx: number, dz: number) => void;
  moveSelectedObjects: (dx: number, dz: number) => void;
  rotateSelectedObjects: (degrees: number) => void;
  mirrorSelectedRacks: (axis: "x" | "z", flipOrientation?: boolean) => void;
  mirrorSelectedObjects: (axis: "x" | "z", flipOrientation?: boolean) => void;
  createBackToBackHotAisle: () => void;
  createFaceToFaceColdAisle: () => void;
  convertSelectedRacksToInRowCooling: () => void;
  detectAisleZones: () => void;
  addContainmentFromDetectedAisle: (type: "hot" | "cold") => void;
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
const initialTopology = analyzeThermalTopology(initialScenario);
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
  workspaceMode: "three",
  language: initialScenario.reportSettings.language,
  editMode: "select",
  runStatus: "completed",
  simulationRunId: 1,
  lastRunAt: initialScenario.metadata.updatedAt,
  lastRunElapsedMs: initialResult.elapsedMs,
  resultsStale: false,
  leftCollapsed: false,
  rightCollapsed: false,
  bottomCollapsed: false,
  showGrid: true,
  showObjectLabels: false,
  showWarningPins: false,
  showAirflowLayer: true,
  showHeatmapLayer: true,
  showThermalZones: true,
  showZoneLabels: true,
  showAirflowBoundaries: true,
  showDimensions: false,
  thermalZoneOpacity: 0.34,
  particleDensity: 34,
  particleSpeed: 1,
  airflowOpacity: 0.62,
  thermalOpacity: 0.48,
  thermalPalette: "thermal-professional",
  thermalColorMode: "smooth",
  thermalScaleMode: "auto",
  thermalMinC: 18,
  thermalMaxC: 35,
  thermalCriticalC: initialScenario.simulationSettings.criticalTemperatureC,
  thermalContrast: 1.16,
  colorbarPosition: "bottom",
  sliceAxis: "xz",
  slicePosition: 0.32,
  detectedAisles: initialTopology.detectedAisles,
  thermalTopology: initialTopology,
  reportScreenshots: {},
  reportHtml: renderHtmlReport(createReportData(initialScenario, initialResult)),
  statusMessage: "Ready for a 5-minute airflow review.",
  samples: buildSampleScenarios(),
  setActiveStep: (activeStep) => set({ activeStep }),
  setRightTab: (rightTab) => set({ rightTab }),
  setViewMode: (viewMode) => set({ viewMode }),
  setWorkspaceMode: (workspaceMode) => set({ workspaceMode }),
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
  toggleThermalZones: () => set((state) => ({ showThermalZones: !state.showThermalZones })),
  toggleZoneLabels: () => set((state) => ({ showZoneLabels: !state.showZoneLabels })),
  toggleAirflowBoundaries: () => set((state) => ({ showAirflowBoundaries: !state.showAirflowBoundaries })),
  toggleDimensions: () => set((state) => ({ showDimensions: !state.showDimensions })),
  setThermalZoneOpacity: (thermalZoneOpacity) => set({ thermalZoneOpacity }),
  setParticleDensity: (particleDensity) => set({ particleDensity }),
  setParticleSpeed: (particleSpeed) => set({ particleSpeed }),
  setAirflowOpacity: (airflowOpacity) => set({ airflowOpacity }),
  setThermalOpacity: (thermalOpacity) => set({ thermalOpacity }),
  setThermalPalette: (thermalPalette) => set({ thermalPalette }),
  setThermalColorMode: (thermalColorMode) => set({ thermalColorMode }),
  setThermalScaleMode: (thermalScaleMode) => set({ thermalScaleMode }),
  setThermalRange: (thermalMinC, thermalMaxC) => set({ thermalMinC, thermalMaxC }),
  setThermalCriticalC: (thermalCriticalC) => set({ thermalCriticalC }),
  setThermalContrast: (thermalContrast) => set({ thermalContrast }),
  setColorbarPosition: (colorbarPosition) => set({ colorbarPosition }),
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
      runStatus: "dirty",
      resultsStale: true,
      ...topologyPatch(previous),
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
      runStatus: "dirty",
      resultsStale: true,
      ...topologyPatch(next),
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
  selectObjects: (ids, statusMessage) =>
    set({
      selectedIds: [...new Set(ids)],
      rightTab: "inspector",
      ...(statusMessage ? { statusMessage } : {})
    }),
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
    get().moveSelectedObjects(dx, dz);
  },
  moveSelectedObjects: (dx, dz) => {
    const state = get();
    const selected = new Set(state.selectedIds);
    if (selected.size === 0) return;
    const racks = state.scenario.racks.map((rack) =>
      selected.has(rack.id) ? { ...rack, position: clampRackPosition({ ...rack.position, x: rack.position.x + dx, z: rack.position.z + dz }, rack, state.scenario.room) } : rack
    );
    const coolingObjects = state.scenario.coolingObjects.map((object) =>
      selected.has(object.id)
        ? { ...object, position: clampObjectPosition({ ...object.position, x: object.position.x + dx, z: object.position.z + dz }, object.size, state.scenario.room) }
        : object
    );
    const containmentObjects = state.scenario.containmentObjects.map((object) =>
      selected.has(object.id)
        ? { ...object, position: clampObjectPosition({ ...object.position, x: object.position.x + dx, z: object.position.z + dz }, object.size, state.scenario.room) }
        : object
    );
    const movedCount = countTransformableSelection(state.scenario, selected);
    if (movedCount === 0) return;
    setWithPreview(set, { ...state.scenario, racks, coolingObjects, containmentObjects }, { ...historyPatch(state), statusMessage: `Moved ${movedCount} selected object(s).` });
  },
  rotateSelectedObjects: (degrees) => {
    const state = get();
    const selected = new Set(state.selectedIds);
    if (selected.size === 0) return;
    const quarterTurns = Math.round(degrees / 90);
    const racks = state.scenario.racks.map((rack) =>
      selected.has(rack.id) ? { ...rack, orientation: rotateRackOrientation(rack.orientation, quarterTurns) } : rack
    );
    const coolingObjects = state.scenario.coolingObjects.map((object) => {
      if (!selected.has(object.id)) return object;
      const orientation = rotateRackOrientation(object.orientation ?? orientationFromDirection(object.direction), quarterTurns);
      const direction = rotateVectorY(object.direction, quarterTurns);
      return {
        ...object,
        orientation,
        direction,
        ...(Math.abs(quarterTurns) % 2 === 1 && rotatesFootprint(object.type) ? { size: { ...object.size, width: object.size.depth, depth: object.size.width } } : {})
      };
    });
    const containmentObjects = state.scenario.containmentObjects.map((object) =>
      selected.has(object.id) && Math.abs(quarterTurns) % 2 === 1 ? { ...object, size: { ...object.size, width: object.size.depth, depth: object.size.width } } : object
    );
    const rotatedCount = countTransformableSelection(state.scenario, selected);
    if (rotatedCount === 0) return;
    setWithPreview(set, { ...state.scenario, racks, coolingObjects, containmentObjects }, {
      ...historyPatch(state),
      statusMessage: `Rotated ${rotatedCount} selected object(s) by ${quarterTurns * 90} degrees.`
    });
  },
  mirrorSelectedRacks: (axis, flipOrientation = true) => {
    get().mirrorSelectedObjects(axis, flipOrientation);
  },
  mirrorSelectedObjects: (axis, flipOrientation = true) => {
    const state = get();
    const selected = new Set(state.selectedIds);
    const selectedObjects = selectedTransformables(state.scenario, selected);
    if (selectedObjects.length === 0) return;
    const bounds = transformableGroupBounds(selectedObjects);
    const aisleWidth = Math.max(1.2, state.scenario.rackArrays[0]?.aisleWidthM ?? 1.2);
    const mirrorLine = axis === "z" ? bounds.maxZ + aisleWidth / 2 : bounds.maxX + aisleWidth / 2;
    const existingIds = new Set(state.scenario.racks.map((rack) => rack.id));
    const existingCoolingIds = new Set(state.scenario.coolingObjects.map((object) => object.id));
    const existingContainmentIds = new Set(state.scenario.containmentObjects.map((object) => object.id));
    const rackClones = state.scenario.racks.filter((rack) => selected.has(rack.id)).map((rack, index) => {
      const mirroredPosition =
        axis === "z"
          ? { ...rack.position, z: mirrorLine * 2 - rack.position.z }
          : { ...rack.position, x: mirrorLine * 2 - rack.position.x };
      const nextId = uniqueRackId(`${rack.id}-mirror`, existingIds, index + 1);
      existingIds.add(nextId);
      return {
        ...rack,
        id: nextId,
        name: `${rack.name} mirror`,
        arrayId: undefined,
        position: clampRackPosition(mirroredPosition, rack, state.scenario.room),
        orientation: flipOrientation ? oppositeRackOrientation(rack.orientation) : rack.orientation
      };
    });
    const coolingClones = state.scenario.coolingObjects.filter((object) => selected.has(object.id)).map((object, index) => {
      const mirroredPosition = mirrorPosition(object.position, axis, mirrorLine);
      const nextId = uniqueObjectId(`${object.id}-mirror`, existingCoolingIds, index + 1);
      existingCoolingIds.add(nextId);
      const orientation = object.orientation ?? orientationFromDirection(object.direction);
      const mirroredOrientation = flipOrientation ? mirrorOrientation(orientation, axis) : orientation;
      return {
        ...object,
        id: nextId,
        name: `${object.name} mirror`,
        rowId: undefined,
        slotIndex: undefined,
        position: clampObjectPosition(mirroredPosition, object.size, state.scenario.room),
        orientation: mirroredOrientation,
        direction: flipOrientation ? orientationVector(mirroredOrientation) : mirrorDirection(object.direction, axis)
      };
    });
    const containmentClones = state.scenario.containmentObjects.filter((object) => selected.has(object.id)).map((object, index) => {
      const nextId = uniqueObjectId(`${object.id}-mirror`, existingContainmentIds, index + 1);
      existingContainmentIds.add(nextId);
      return {
        ...object,
        id: nextId,
        name: `${object.name} mirror`,
        position: clampObjectPosition(mirrorPosition(object.position, axis, mirrorLine), object.size, state.scenario.room),
        generatedFromRackIds: []
      };
    });
    const scenario = {
      ...state.scenario,
      racks: [...state.scenario.racks, ...rackClones],
      coolingObjects: [...state.scenario.coolingObjects, ...coolingClones],
      containmentObjects: [...state.scenario.containmentObjects, ...containmentClones]
    };
    const clonedIds = [...rackClones.map((rack) => rack.id), ...coolingClones.map((object) => object.id), ...containmentClones.map((object) => object.id)];
    setWithPreview(set, scenario, {
      ...historyPatch(state),
      selectedIds: clonedIds,
      workspaceMode: "plan",
      statusMessage: `Mirrored ${clonedIds.length} selected object(s) across ${axis.toUpperCase()} axis.`
    });
  },
  createBackToBackHotAisle: () => {
    const state = get();
    const selectedRacks = state.scenario.racks.filter((rack) => state.selectedIds.includes(rack.id));
    if (selectedRacks.length === 0) return;
    const axis = preferredMirrorAxis(selectedRacks);
    const { original, clone } = aisleOrientations(axis, "hot");
    mirrorSelectedRowForAisle(set, state, selectedRacks, axis, original, clone, "back-to-back hot aisle");
  },
  createFaceToFaceColdAisle: () => {
    const state = get();
    const selectedRacks = state.scenario.racks.filter((rack) => state.selectedIds.includes(rack.id));
    if (selectedRacks.length === 0) return;
    const axis = preferredMirrorAxis(selectedRacks);
    const { original, clone } = aisleOrientations(axis, "cold");
    mirrorSelectedRowForAisle(set, state, selectedRacks, axis, original, clone, "face-to-face cold aisle");
  },
  convertSelectedRacksToInRowCooling: () => {
    const state = get();
    const selected = new Set(state.selectedIds);
    const selectedRacks = state.scenario.racks.filter((rack) => selected.has(rack.id));
    if (selectedRacks.length === 0) return;
    const coolingObjects = [...state.scenario.coolingObjects];
    const converted = selectedRacks.map((rack, index) => {
      const object = createCoolingObject("in-row-cooler", coolingObjects.filter((item) => item.type === "in-row-cooler").length + index + 1, state.scenario.room);
      const rowIdentity = rackRowIdentity(rack, index);
      return {
        ...object,
        id: `in-row-from-${rack.id}`,
        name: `${rack.name} in-row cooler`,
        position: { ...rack.position },
        size: { ...rack.size },
        orientation: rack.orientation,
        rowId: rowIdentity.rowId,
        slotIndex: rowIdentity.slotIndex,
        rowModuleType: "in-row-cooling" as const,
        intakeSide: "rear" as const,
        supplySide: "front" as const,
        coolingModeSemantic: "hot-side-return-cold-side-supply" as const,
        direction: orientationDirection(rack.orientation),
        airflowLps: Math.max(900, rack.heatLoadKw * 90),
        coolingCapacityKw: Math.max(18, rack.heatLoadKw * 1.2)
      };
    });
    const scenario = {
      ...state.scenario,
      racks: state.scenario.racks.filter((rack) => !selected.has(rack.id)),
      coolingObjects: [...coolingObjects, ...converted]
    };
    setWithPreview(set, scenario, {
      ...historyPatch(state),
      selectedIds: converted.map((object) => object.id),
      ...topologyPatch(scenario),
      statusMessage: `Converted ${converted.length} selected rack(s) to in-row cooling.`
    });
  },
  detectAisleZones: () => {
    const state = get();
    const thermalTopology = analyzeThermalTopology(state.scenario);
    const detectedAisles = thermalTopology.detectedAisles;
    set({
      detectedAisles,
      thermalTopology,
      workspaceMode: "plan",
      statusMessage: detectedAisles.length ? `Detected ${detectedAisles.length} hot/cold aisle zone(s).` : "No clear hot/cold aisle pair detected."
    });
  },
  addContainmentFromDetectedAisle: (type) => {
    const state = get();
    const topology = state.thermalTopology ?? analyzeThermalTopology(state.scenario);
    const aisle = state.detectedAisles.find((candidate) => candidate.type === type) ?? topology.detectedAisles.find((candidate) => candidate.type === type);
    if (!aisle) {
      set({ statusMessage: `No ${type} aisle suggestion is available. Run Detect Aisles first.` });
      return;
    }
    const containmentType = type === "hot" ? "hot-aisle" : "cold-aisle";
    const object = {
      ...createContainmentObject(containmentType, state.scenario.containmentObjects.filter((candidate) => candidate.type === containmentType).length + 1, state.scenario.room, aisle.rackIds),
      position: { x: aisle.center.x, y: aisle.size.height / 2, z: aisle.center.z },
      size: { width: aisle.size.width, depth: aisle.size.depth, height: aisle.size.height },
      generatedFromRackIds: aisle.rackIds
    };
    setWithPreview(set, { ...state.scenario, containmentObjects: [...state.scenario.containmentObjects, object] }, {
      ...historyPatch(state),
      selectedIds: [object.id],
      activeStep: "containment",
      statusMessage: `${object.name} generated from detected ${type} aisle.`
    });
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
    const state = get();
    const runId = state.simulationRunId + 1;
    set({ runStatus: "running", statusMessage: `Running formal simulation #${runId}...` });
    try {
      const scenario = updateScenarioTimestamp(state.scenario);
      const result = solveScenario(scenario, "formal");
      const lastRunAt = new Date().toISOString();
      set({
        scenario,
        result,
        runStatus: "completed",
        simulationRunId: runId,
        lastRunAt,
        lastRunElapsedMs: result.elapsedMs,
        resultsStale: false,
        reportScreenshots: {},
        reportHtml: renderHtmlReport(createReportData(scenario, result)),
        ...topologyPatch(scenario),
        rightTab: "results",
        statusMessage: `Formal simulation #${runId} complete in ${result.elapsedMs.toFixed(1)} ms.`
      });
    } catch {
      set({ runStatus: "failed", statusMessage: `Formal simulation #${runId} failed.` });
    }
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
      runStatus: "completed",
      simulationRunId: state.simulationRunId + 1,
      lastRunAt: new Date().toISOString(),
      lastRunElapsedMs: result.elapsedMs,
      resultsStale: false,
      ...topologyPatch(scenario),
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
      runStatus: "completed",
      simulationRunId: state.simulationRunId + 1,
      lastRunAt: new Date().toISOString(),
      lastRunElapsedMs: result.elapsedMs,
      resultsStale: false,
      ...topologyPatch(scenario),
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
    runStatus: "dirty",
    resultsStale: true,
    ...topologyPatch(scenario),
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

function topologyPatch(scenario: Scenario): Pick<AirPathState, "detectedAisles" | "thermalTopology"> {
  const thermalTopology = analyzeThermalTopology(scenario);
  return {
    detectedAisles: thermalTopology.detectedAisles,
    thermalTopology
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

function clampRackPosition(position: Vector3, rack: Rack, room: Scenario["room"]): Vector3 {
  return {
    ...position,
    x: snap(clamp(position.x, rack.size.width / 2, room.width - rack.size.width / 2), 0.05),
    z: snap(clamp(position.z, rack.size.depth / 2, room.depth - rack.size.depth / 2), 0.05)
  };
}

function clampObjectPosition(position: Vector3, size: Size3, room: Scenario["room"]): Vector3 {
  return {
    ...position,
    x: snap(clamp(position.x, size.width / 2, room.width - size.width / 2), 0.05),
    z: snap(clamp(position.z, size.depth / 2, room.depth - size.depth / 2), 0.05)
  };
}

type TransformableSelection = {
  id: string;
  position: Vector3;
  size: Size3;
};

function selectedTransformables(scenario: Scenario, selected: Set<string>): TransformableSelection[] {
  return [
    ...scenario.racks.filter((rack) => selected.has(rack.id)),
    ...scenario.coolingObjects.filter((object) => selected.has(object.id)),
    ...scenario.containmentObjects.filter((object) => selected.has(object.id))
  ].map((object) => ({ id: object.id, position: object.position, size: object.size }));
}

function countTransformableSelection(scenario: Scenario, selected: Set<string>): number {
  return selectedTransformables(scenario, selected).length;
}

function transformableGroupBounds(objects: TransformableSelection[]): { minX: number; maxX: number; minZ: number; maxZ: number } {
  return objects.reduce(
    (bounds, object) => ({
      minX: Math.min(bounds.minX, object.position.x - object.size.width / 2),
      maxX: Math.max(bounds.maxX, object.position.x + object.size.width / 2),
      minZ: Math.min(bounds.minZ, object.position.z - object.size.depth / 2),
      maxZ: Math.max(bounds.maxZ, object.position.z + object.size.depth / 2)
    }),
    { minX: Number.POSITIVE_INFINITY, maxX: Number.NEGATIVE_INFINITY, minZ: Number.POSITIVE_INFINITY, maxZ: Number.NEGATIVE_INFINITY }
  );
}

function rotateRackOrientation(orientation: RackOrientation, quarterTurns: number): RackOrientation {
  const directions: RackOrientation[] = ["front-positive-z", "front-positive-x", "front-negative-z", "front-negative-x"];
  const index = directions.indexOf(orientation);
  const next = ((index + quarterTurns) % directions.length + directions.length) % directions.length;
  return directions[next];
}

function rotateVectorY(vector: Vector3, quarterTurns: number): Vector3 {
  let current = { ...vector };
  const turns = ((quarterTurns % 4) + 4) % 4;
  for (let i = 0; i < turns; i += 1) current = { x: current.z, y: current.y, z: -current.x };
  return current;
}

function rotatesFootprint(type: CoolingObjectType): boolean {
  return ["crac-crah", "in-row-cooler", "floor-perforated-tile", "ceiling-supply-diffuser", "ceiling-return-grille", "wall-supply-grille", "wall-return-grille", "cdu"].includes(type);
}

function mirrorPosition(position: Vector3, axis: "x" | "z", mirrorLine: number): Vector3 {
  return axis === "z" ? { ...position, z: mirrorLine * 2 - position.z } : { ...position, x: mirrorLine * 2 - position.x };
}

function mirrorDirection(direction: Vector3, axis: "x" | "z"): Vector3 {
  return axis === "z" ? { ...direction, z: -direction.z } : { ...direction, x: -direction.x };
}

function mirrorOrientation(orientation: RackOrientation, axis: "x" | "z"): RackOrientation {
  const front = mirrorDirection(orientationVector(orientation), axis);
  return orientationFromDirection(front);
}

function rackGroupBounds(racks: Rack[]): { minX: number; maxX: number; minZ: number; maxZ: number } {
  return racks.reduce(
    (bounds, rack) => ({
      minX: Math.min(bounds.minX, rack.position.x - rack.size.width / 2),
      maxX: Math.max(bounds.maxX, rack.position.x + rack.size.width / 2),
      minZ: Math.min(bounds.minZ, rack.position.z - rack.size.depth / 2),
      maxZ: Math.max(bounds.maxZ, rack.position.z + rack.size.depth / 2)
    }),
    { minX: Number.POSITIVE_INFINITY, maxX: Number.NEGATIVE_INFINITY, minZ: Number.POSITIVE_INFINITY, maxZ: Number.NEGATIVE_INFINITY }
  );
}

function uniqueRackId(base: string, existingIds: Set<string>, ordinal: number): string {
  let candidate = `${base}-${ordinal}`;
  let suffix = ordinal;
  while (existingIds.has(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

function uniqueObjectId(base: string, existingIds: Set<string>, ordinal: number): string {
  let candidate = `${base}-${ordinal}`;
  let suffix = ordinal;
  while (existingIds.has(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

function preferredMirrorAxis(racks: Rack[]): "x" | "z" {
  const front = orientationVector(racks[0]?.orientation ?? "front-positive-z");
  return Math.abs(front.z) >= Math.abs(front.x) ? "z" : "x";
}

function orientationDirection(orientation: RackOrientation): Vector3 {
  return orientationVector(orientation);
}

function rackRowIdentity(rack: Rack, fallbackIndex: number): { rowId: string; slotIndex: number } {
  const match = rack.arrayId ? rack.id.match(/-r(\d+)c(\d+)/) : undefined;
  if (match) return { rowId: `${rack.arrayId}-row-${Number(match[1])}`, slotIndex: Number(match[2]) - 1 };
  const front = orientationVector(rack.orientation);
  const rowAxis = Math.abs(front.z) >= Math.abs(front.x) ? "x" : "z";
  const lateral = rowAxis === "x" ? rack.position.z : rack.position.x;
  return { rowId: `derived-${rowAxis}-${rack.orientation}-${Math.round(lateral / 0.5)}`, slotIndex: fallbackIndex };
}

function aisleOrientations(axis: "x" | "z", type: "hot" | "cold"): { original: RackOrientation; clone: RackOrientation } {
  if (axis === "z") {
    return type === "hot"
      ? { original: "front-negative-z", clone: "front-positive-z" }
      : { original: "front-positive-z", clone: "front-negative-z" };
  }
  return type === "hot"
    ? { original: "front-negative-x", clone: "front-positive-x" }
    : { original: "front-positive-x", clone: "front-negative-x" };
}

function mirrorSelectedRowForAisle(
  set: AirPathSet,
  state: AirPathState,
  selectedRacks: Rack[],
  axis: "x" | "z",
  originalOrientation: RackOrientation,
  cloneOrientation: RackOrientation,
  label: string
): void {
  const selectedIds = new Set(selectedRacks.map((rack) => rack.id));
  const bounds = rackGroupBounds(selectedRacks);
  const aisleWidth = Math.max(1.2, state.scenario.rackArrays[0]?.aisleWidthM ?? 1.2);
  const mirrorLine = axis === "z" ? bounds.maxZ + aisleWidth / 2 : bounds.maxX + aisleWidth / 2;
  const existingIds = new Set(state.scenario.racks.map((rack) => rack.id));
  const clones = selectedRacks.map((rack, index) => {
    const mirroredPosition =
      axis === "z"
        ? { ...rack.position, z: mirrorLine * 2 - rack.position.z }
        : { ...rack.position, x: mirrorLine * 2 - rack.position.x };
    const nextId = uniqueRackId(`${rack.id}-${label.replaceAll(" ", "-")}`, existingIds, index + 1);
    existingIds.add(nextId);
    return {
      ...rack,
      id: nextId,
      name: `${rack.name} ${label}`,
      arrayId: undefined,
      position: clampRackPosition(mirroredPosition, rack, state.scenario.room),
      orientation: cloneOrientation
    };
  });
  const racks = [
    ...state.scenario.racks.map((rack) => (selectedIds.has(rack.id) ? { ...rack, orientation: originalOrientation } : rack)),
    ...clones
  ];
  const scenario = { ...state.scenario, racks };
  setWithPreview(set, scenario, {
    ...historyPatch(state),
    selectedIds: clones.map((rack) => rack.id),
    workspaceMode: "plan",
    ...topologyPatch(scenario),
    statusMessage: `Created ${label} with ${selectedRacks.length} mirrored rack(s).`
  });
}

function averagePosition(points: Vector3[]): Vector3 | undefined {
  if (points.length === 0) return undefined;
  const total = points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y, z: sum.z + point.z }),
    { x: 0, y: 0, z: 0 }
  );
  return { x: total.x / points.length, y: total.y / points.length, z: total.z / points.length };
}
