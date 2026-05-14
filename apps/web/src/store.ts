import { create } from "zustand";
import {
  type ContainmentType,
  type CoolingObjectType,
  type Rack,
  type RackArrayInput,
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
import { compareScenarioResults, createReportData, renderHtmlReport, type ScenarioComparison } from "@airpath/report-engine";
import { buildSampleScenarios } from "./sampleScenarios";

export type ViewMode = "solid" | "thermal" | "airflow" | "combined" | "slice" | "report";
export type WizardStep = "room" | "racks" | "cooling" | "containment" | "review";
export type RightTab = "inspector" | "results" | "warnings" | "report";

interface AirPathState {
  scenario: Scenario;
  result: SimulationResult;
  rackDraft: RackArrayInput;
  selectedIds: string[];
  focusedWarningId?: string;
  focusedPoint?: Vector3;
  activeStep: WizardStep;
  rightTab: RightTab;
  viewMode: ViewMode;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  bottomCollapsed: boolean;
  showGrid: boolean;
  particleDensity: number;
  particleSpeed: number;
  reportHtml: string;
  scenarioB?: Scenario;
  resultB?: SimulationResult;
  comparison?: ScenarioComparison;
  statusMessage: string;
  samples: ReturnType<typeof buildSampleScenarios>;
  setActiveStep: (step: WizardStep) => void;
  setRightTab: (tab: RightTab) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleLeft: () => void;
  toggleRight: () => void;
  toggleBottom: () => void;
  toggleGrid: () => void;
  setParticleDensity: (value: number) => void;
  setParticleSpeed: (value: number) => void;
  applyRoomTemplate: (template: RoomTemplateKey) => void;
  updateRoom: (patch: Partial<Scenario["room"]>) => void;
  updateRackDraft: (patch: Partial<RackArrayInput>) => void;
  createOrReplaceRackArray: () => void;
  appendRackArray: () => void;
  selectObject: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  batchEditSelectedRacks: (patch: Partial<Pick<Rack, "heatLoadKw" | "coolingMode" | "liquidCaptureRatio" | "orientation">>) => void;
  resizeSelectedRacks: (size: Partial<Size3>) => void;
  moveSelectedRacks: (dx: number, dz: number) => void;
  deleteSelected: () => void;
  addCoolingObject: (type: CoolingObjectType) => void;
  addContainment: (type: ContainmentType) => void;
  runSimulation: () => void;
  generateReport: () => void;
  loadSample: (key: string) => void;
  importScenarioJson: (json: string) => void;
  exportScenarioJson: () => string;
  duplicateScenarioB: () => void;
  improveScenarioB: () => void;
  compareScenarios: () => void;
  focusWarning: (warning: SimulationWarning) => void;
}

type AirPathSet = (partial: Partial<AirPathState>) => void;

const initialScenario = createDefaultScenario("medium");
const initialResult = solveScenario(initialScenario, "formal");

export const useAirPathStore = create<AirPathState>((set, get) => ({
  scenario: initialScenario,
  result: initialResult,
  rackDraft: defaultRackArrayInput(initialScenario.room),
  selectedIds: [],
  activeStep: "room",
  rightTab: "results",
  viewMode: "combined",
  leftCollapsed: false,
  rightCollapsed: false,
  bottomCollapsed: false,
  showGrid: true,
  particleDensity: 44,
  particleSpeed: 1,
  reportHtml: renderHtmlReport(createReportData(initialScenario, initialResult)),
  statusMessage: "Ready for a 5-minute airflow review.",
  samples: buildSampleScenarios(),
  setActiveStep: (activeStep) => set({ activeStep }),
  setRightTab: (rightTab) => set({ rightTab }),
  setViewMode: (viewMode) => set({ viewMode }),
  toggleLeft: () => set((state) => ({ leftCollapsed: !state.leftCollapsed })),
  toggleRight: () => set((state) => ({ rightCollapsed: !state.rightCollapsed })),
  toggleBottom: () => set((state) => ({ bottomCollapsed: !state.bottomCollapsed })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setParticleDensity: (particleDensity) => set({ particleDensity }),
  setParticleSpeed: (particleSpeed) => set({ particleSpeed }),
  applyRoomTemplate: (template) => {
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
      rackDraft: defaultRackArrayInput(room),
      selectedIds: [],
      activeStep: "racks",
      statusMessage: `${room.name} template loaded.`
    });
  },
  updateRoom: (patch) => {
    const scenario = get().scenario;
    const room = { ...scenario.room, ...patch };
    setWithPreview(set, { ...scenario, room, simulationSettings: { ...scenario.simulationSettings, ambientTemperatureC: room.ambientTemperatureC } }, {
      statusMessage: "Room dimensions updated."
    });
  },
  updateRackDraft: (patch) => set((state) => ({ rackDraft: { ...state.rackDraft, ...patch } })),
  createOrReplaceRackArray: () => {
    const state = get();
    const draft = prepareRackDraft(state.rackDraft, 1);
    const racks = generateRackArray(draft);
    setWithPreview(set, { ...state.scenario, rackArrays: [draft], racks }, {
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
    const racks = state.scenario.racks.map((rack) =>
      selected.has(rack.id)
        ? {
            ...rack,
            ...patch,
            liquidCaptureRatio: patch.coolingMode === "air-cooled" ? 0 : patch.liquidCaptureRatio ?? rack.liquidCaptureRatio
          }
        : rack
    );
    setWithPreview(set, { ...state.scenario, racks }, { statusMessage: `Updated ${selected.size} selected rack(s).` });
  },
  resizeSelectedRacks: (size) => {
    const state = get();
    const selected = new Set(state.selectedIds);
    const racks = state.scenario.racks.map((rack) => (selected.has(rack.id) ? { ...rack, size: { ...rack.size, ...size } } : rack));
    setWithPreview(set, { ...state.scenario, racks }, { statusMessage: `Resized ${selected.size} selected rack(s).` });
  },
  moveSelectedRacks: (dx, dz) => {
    const state = get();
    const selected = new Set(state.selectedIds);
    const racks = state.scenario.racks.map((rack) =>
      selected.has(rack.id) ? { ...rack, position: { ...rack.position, x: rack.position.x + dx, z: rack.position.z + dz } } : rack
    );
    setWithPreview(set, { ...state.scenario, racks }, { statusMessage: `Moved ${selected.size} selected rack(s).` });
  },
  deleteSelected: () => {
    const state = get();
    const selected = new Set(state.selectedIds);
    setWithPreview(set, {
      ...state.scenario,
      racks: state.scenario.racks.filter((rack) => !selected.has(rack.id)),
      coolingObjects: state.scenario.coolingObjects.filter((object) => !selected.has(object.id)),
      containmentObjects: state.scenario.containmentObjects.filter((object) => !selected.has(object.id))
    }, {
      selectedIds: [],
      statusMessage: `Deleted ${selected.size} selected object(s).`
    });
  },
  addCoolingObject: (type) => {
    const state = get();
    const object = createCoolingObject(type, state.scenario.coolingObjects.filter((candidate) => candidate.type === type).length + 1, state.scenario.room);
    setWithPreview(set, { ...state.scenario, coolingObjects: [...state.scenario.coolingObjects, object] }, {
      selectedIds: [object.id],
      activeStep: "containment",
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
      selectedIds: [object.id],
      activeStep: "review",
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
      reportHtml: renderHtmlReport(createReportData(scenario, result)),
      rightTab: "results",
      statusMessage: `Formal simulation complete in ${result.elapsedMs.toFixed(1)} ms.`
    });
  },
  generateReport: () => {
    const state = get();
    const reportHtml = renderHtmlReport(createReportData(state.scenario, state.result));
    set({ reportHtml, rightTab: "report", viewMode: "report", statusMessage: "Report preview generated." });
  },
  loadSample: (key) => {
    const sample = get().samples.find((candidate) => candidate.key === key);
    if (!sample) return;
    const scenario = validateScenario(sample.scenario);
    const result = solveScenario(scenario, "formal");
    set({
      scenario,
      result,
      rackDraft: defaultRackArrayInput(scenario.room),
      selectedIds: [],
      activeStep: "review",
      rightTab: "results",
      viewMode: "combined",
      reportHtml: renderHtmlReport(createReportData(scenario, result)),
      statusMessage: `${sample.label} loaded.`
    });
  },
  importScenarioJson: (json) => {
    const scenario = deserializeScenario(json);
    const result = solveScenario(scenario, "formal");
    set({
      scenario,
      result,
      rackDraft: defaultRackArrayInput(scenario.room),
      selectedIds: [],
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
    reportHtml: renderHtmlReport(createReportData(scenario, result)),
    ...patch
  });
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
