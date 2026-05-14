import {
  type Scenario,
  createContainmentObject,
  createCoolingObject,
  createDefaultScenario,
  validateScenario
} from "@airpath/scenario-schema";

export interface SampleScenarioOption {
  key: string;
  label: string;
  scenario: Scenario;
}

export function buildSampleScenarios(): SampleScenarioOption[] {
  return [
    {
      key: "small-baseline",
      label: "Small server room baseline",
      scenario: smallBaseline()
    },
    {
      key: "cold-aisle-containment",
      label: "Cold aisle containment",
      scenario: coldAisleContainment()
    },
    {
      key: "hot-aisle-containment",
      label: "Hot aisle containment",
      scenario: hotAisleContainment()
    },
    {
      key: "overhead-short-circuit",
      label: "Overhead supply short-circuit",
      scenario: overheadShortCircuit()
    },
    {
      key: "gpu-hotspot",
      label: "High-density GPU rack hotspot",
      scenario: gpuHotspot()
    }
  ];
}

function smallBaseline(): Scenario {
  const scenario = createDefaultScenario("small");
  scenario.metadata = {
    ...scenario.metadata,
    id: "sample-small-baseline",
    name: "Small server room baseline",
    description: "Small room with one rack array, side cooling, raised floor tile, and ceiling return.",
    expectedInterpretation: "Baseline should show modest rack inlet risk and clear supply-to-return flow.",
    recommendedReportOutput: "Use as the fast first-pass pre-sales report template.",
    validationRelevance: "Baseline coverage for rack heat, cooling, streamlines, and warning review."
  };
  scenario.reportSettings.projectName = scenario.metadata.name;
  return validateScenario(scenario);
}

function coldAisleContainment(): Scenario {
  const scenario = createDefaultScenario("medium");
  scenario.metadata = {
    ...scenario.metadata,
    id: "sample-cold-aisle",
    name: "Cold aisle containment",
    description: "Medium room with cold aisle containment generated around the rack field.",
    expectedInterpretation: "Containment should reduce hot/cold mixing and improve inlet temperatures versus the baseline.",
    recommendedReportOutput: "Show containment impact and reduced hotspot count.",
    validationRelevance: "Containment barrier behavior and rack inlet comparison."
  };
  scenario.containmentObjects = [
    createContainmentObject("cold-aisle", 1, scenario.room, scenario.racks.map((rack) => rack.id)),
    createContainmentObject("end-of-row-door", 1, scenario.room, scenario.racks.map((rack) => rack.id)),
    createContainmentObject("top-panel", 1, scenario.room, scenario.racks.map((rack) => rack.id))
  ];
  scenario.reportSettings.projectName = scenario.metadata.name;
  return validateScenario(scenario);
}

function hotAisleContainment(): Scenario {
  const scenario = createDefaultScenario("medium");
  scenario.metadata = {
    ...scenario.metadata,
    id: "sample-hot-aisle",
    name: "Hot aisle containment",
    description: "Medium room with hot aisle containment and strengthened ceiling return path.",
    expectedInterpretation: "Hot aisle barrier should pull warmer exhaust toward return and reduce recirculation risk.",
    recommendedReportOutput: "Show return path and hot aisle containment assumptions.",
    validationRelevance: "Return boundary behavior and containment effects."
  };
  scenario.containmentObjects = [
    createContainmentObject("hot-aisle", 1, scenario.room, scenario.racks.map((rack) => rack.id)),
    createContainmentObject("side-panel", 1, scenario.room, scenario.racks.map((rack) => rack.id)),
    createContainmentObject("top-panel", 1, scenario.room, scenario.racks.map((rack) => rack.id))
  ];
  scenario.coolingObjects.push(createCoolingObject("wall-return-grille", 1, scenario.room));
  scenario.reportSettings.projectName = scenario.metadata.name;
  return validateScenario(scenario);
}

function overheadShortCircuit(): Scenario {
  const scenario = createDefaultScenario("small");
  scenario.metadata = {
    ...scenario.metadata,
    id: "sample-overhead-short-circuit",
    name: "Overhead supply short-circuit",
    description: "Overhead supply diffuser placed near a ceiling return grille.",
    expectedInterpretation: "Warning should identify supply-return short-circuit risk.",
    recommendedReportOutput: "Show overhead supply risk and recommended separation.",
    validationRelevance: "Supply-return short-circuit warning behavior."
  };
  scenario.coolingObjects = [
    {
      ...createCoolingObject("ceiling-supply-diffuser", 1, scenario.room),
      position: { x: 2.6, y: scenario.room.height - 0.05, z: 2.1 },
      coolingCapacityKw: 10,
      airflowLps: 520
    },
    {
      ...createCoolingObject("ceiling-return-grille", 1, scenario.room),
      position: { x: 3.2, y: scenario.room.height - 0.04, z: 2.3 },
      airflowLps: 600
    }
  ];
  scenario.reportSettings.projectName = scenario.metadata.name;
  return validateScenario(scenario);
}

function gpuHotspot(): Scenario {
  const scenario = createDefaultScenario("medium");
  scenario.metadata = {
    ...scenario.metadata,
    id: "sample-gpu-hotspot",
    name: "High-density GPU rack hotspot",
    description: "High-density rack field with one direct-liquid rack and several AI/GPU heat loads.",
    expectedInterpretation: "Hotspot and residual air heat warnings should be visible for high-density racks.",
    recommendedReportOutput: "Use to explain mitigation options: containment, airflow, and liquid capture ratio.",
    validationRelevance: "Increased rack kW, liquid residual heat, hotspot warnings, and capacity margin."
  };
  scenario.racks = scenario.racks.map((rack, index) => ({
    ...rack,
    heatLoadKw: index % 3 === 0 ? 42 : index % 2 === 0 ? 30 : 18,
    coolingMode: index === 0 ? "hybrid-liquid-cooled" : rack.coolingMode,
    liquidCaptureRatio: index === 0 ? 0.62 : rack.liquidCaptureRatio
  }));
  scenario.coolingObjects = [
    createCoolingObject("crac-crah", 1, scenario.room),
    {
      ...createCoolingObject("in-row-cooler", 1, scenario.room),
      coolingCapacityKw: 18,
      airflowLps: 650
    },
    createCoolingObject("ceiling-return-grille", 1, scenario.room),
    createCoolingObject("cdu", 1, scenario.room)
  ];
  scenario.reportSettings.projectName = scenario.metadata.name;
  return validateScenario(scenario);
}
