import type { Language } from "./store";

type UiKey =
  | "sample"
  | "loadSample"
  | "solid"
  | "thermal"
  | "airflow"
  | "combined"
  | "slice"
  | "report"
  | "exportJson"
  | "importJson"
  | "runSimulation"
  | "exportReport"
  | "collapseLeft"
  | "collapseRight"
  | "toggleLabels"
  | "toggleWarnings"
  | "language"
  | "fiveMinuteMode"
  | "setupWizard"
  | "room"
  | "rackArray"
  | "cooling"
  | "containment"
  | "review"
  | "roomSetup"
  | "template"
  | "smallRoom"
  | "mediumRoom"
  | "largeRoom"
  | "custom"
  | "width"
  | "depth"
  | "height"
  | "ambientTarget"
  | "continueRackArray"
  | "rackArrayBuilder"
  | "arrayName"
  | "rows"
  | "columns"
  | "rowSpacing"
  | "columnSpacing"
  | "aisleWidth"
  | "rackHeat"
  | "heatLoadMode"
  | "perRackKw"
  | "totalArrayKw"
  | "mixedCustom"
  | "orientation"
  | "coolingMode"
  | "airCooled"
  | "hybridLiquid"
  | "directLiquid"
  | "liquidCapture"
  | "advancedRackDimensions"
  | "createReplace"
  | "addArray"
  | "coolingSetup"
  | "containmentSetup"
  | "reviewSimulate"
  | "runFormalSimulation"
  | "thermalView"
  | "airflowView"
  | "particleDensity"
  | "particleSpeed"
  | "airflowOpacity"
  | "heatmapOpacity"
  | "sliceControls"
  | "slicePlane"
  | "slicePosition"
  | "visibleAssumptions"
  | "assumptionHint"
  | "inspectorResults"
  | "scenarioOutput"
  | "inspector"
  | "results"
  | "warnings"
  | "selection"
  | "selectionHint"
  | "simulationResults"
  | "maxRackInlet"
  | "averageInlet"
  | "hotspots"
  | "coolingMargin"
  | "critical"
  | "elapsed"
  | "iterations"
  | "rackInletEstimates"
  | "reportExport"
  | "generate"
  | "downloadHtml"
  | "open"
  | "reportMetadata"
  | "companyName"
  | "clientName"
  | "projectName"
  | "caseName"
  | "reportTitle"
  | "author"
  | "reportDate"
  | "revision"
  | "logo"
  | "logoPlaceholder"
  | "editMode"
  | "locked"
  | "selectMode"
  | "moveMode"
  | "layers"
  | "grid"
  | "labels"
  | "heatmap"
  | "dimensions"
  | "streamlines"
  | "statusFooter"
  | "duplicateB"
  | "improveB"
  | "compare"
  | "scenarioAMax"
  | "scenarioBMax"
  | "delta"
  | "recommendation";

const ui: Record<Language, Record<UiKey, string>> = {
  en: {
    sample: "Sample",
    loadSample: "Load sample...",
    solid: "Solid",
    thermal: "Thermal",
    airflow: "Airflow",
    combined: "Combined",
    slice: "Slice",
    report: "Report",
    exportJson: "Export JSON",
    importJson: "Import JSON",
    runSimulation: "Run Simulation",
    exportReport: "Export Report",
    collapseLeft: "Collapse left setup panel",
    collapseRight: "Collapse right result panel",
    toggleLabels: "Toggle object labels",
    toggleWarnings: "Toggle warning pins",
    language: "Language",
    fiveMinuteMode: "Five-Minute Mode",
    setupWizard: "Setup Wizard",
    room: "Room",
    rackArray: "Rack Array",
    cooling: "Cooling",
    containment: "Containment",
    review: "Review",
    roomSetup: "Room Setup",
    template: "Template",
    smallRoom: "Small server room",
    mediumRoom: "Medium room",
    largeRoom: "Large room",
    custom: "Custom",
    width: "Width",
    depth: "Depth",
    height: "Height",
    ambientTarget: "Ambient target",
    continueRackArray: "Continue to Rack Array",
    rackArrayBuilder: "Rack Array Builder",
    arrayName: "Array name",
    rows: "Rows",
    columns: "Columns",
    rowSpacing: "Row spacing",
    columnSpacing: "Column spacing",
    aisleWidth: "Aisle width",
    rackHeat: "Rack heat",
    heatLoadMode: "Heat load mode",
    perRackKw: "Per-rack kW",
    totalArrayKw: "Total array kW",
    mixedCustom: "Mixed custom per-rack",
    orientation: "Orientation",
    coolingMode: "Cooling mode",
    airCooled: "Air cooled",
    hybridLiquid: "Hybrid liquid cooled",
    directLiquid: "Direct liquid cooled",
    liquidCapture: "Liquid capture",
    advancedRackDimensions: "Advanced rack dimensions",
    createReplace: "Create / Replace",
    addArray: "Add Array",
    coolingSetup: "Cooling Setup",
    containmentSetup: "Containment Setup",
    reviewSimulate: "Review & Simulate",
    runFormalSimulation: "Run Formal Simulation",
    thermalView: "Thermal View",
    airflowView: "Airflow View",
    particleDensity: "Streamline density",
    particleSpeed: "Flow speed",
    airflowOpacity: "Airflow opacity",
    heatmapOpacity: "Heatmap opacity",
    sliceControls: "Slice controls",
    slicePlane: "Slice plane",
    slicePosition: "Slice position",
    visibleAssumptions: "Visible assumptions",
    assumptionHint: "AirPath uses a simplified 3D voxel/grid approximation for conceptual pre-sales review. It is not a certified CFD solver.",
    inspectorResults: "Inspector / Results",
    scenarioOutput: "Scenario Output",
    inspector: "Inspector",
    results: "Results",
    warnings: "Warnings",
    selection: "Selection",
    selectionHint: "Click a rack, cooling object, containment panel, or warning pin in the 3D viewport.",
    simulationResults: "Simulation Results",
    maxRackInlet: "Max rack inlet",
    averageInlet: "Average inlet",
    hotspots: "Hotspots",
    coolingMargin: "Cooling margin",
    critical: "Critical",
    elapsed: "Elapsed",
    iterations: "Iterations",
    rackInletEstimates: "Rack inlet estimates",
    reportExport: "Report Export",
    generate: "Generate",
    downloadHtml: "Download HTML",
    open: "Open",
    reportMetadata: "Report metadata",
    companyName: "Company name",
    clientName: "Client name",
    projectName: "Project name",
    caseName: "Case name",
    reportTitle: "Report title",
    author: "Author",
    reportDate: "Report date",
    revision: "Revision",
    logo: "Logo",
    logoPlaceholder: "Use placeholder",
    editMode: "Edit mode",
    locked: "Locked",
    selectMode: "Select",
    moveMode: "Move",
    layers: "Layers",
    grid: "Grid",
    labels: "Labels",
    heatmap: "Heatmap",
    dimensions: "Dimensions",
    streamlines: "Streamlines",
    statusFooter: "Simplified 3D voxel airflow and thermal risk approximation. Not certified CFD.",
    duplicateB: "Duplicate B",
    improveB: "Improve B",
    compare: "Compare",
    scenarioAMax: "Scenario A max",
    scenarioBMax: "Scenario B max",
    delta: "Delta",
    recommendation: "Recommendation"
  },
  zh: {
    sample: "範例",
    loadSample: "載入範例...",
    solid: "配置",
    thermal: "熱場",
    airflow: "氣流",
    combined: "綜合",
    slice: "切片",
    report: "報告",
    exportJson: "匯出 JSON",
    importJson: "匯入 JSON",
    runSimulation: "執行模擬",
    exportReport: "匯出報告",
    collapseLeft: "收合左側設定面板",
    collapseRight: "收合右側結果面板",
    toggleLabels: "顯示物件名稱",
    toggleWarnings: "顯示警示標記",
    language: "語言",
    fiveMinuteMode: "五分鐘模式",
    setupWizard: "設定流程",
    room: "機房",
    rackArray: "機櫃陣列",
    cooling: "冷卻",
    containment: "封閉通道",
    review: "檢視",
    roomSetup: "機房設定",
    template: "範本",
    smallRoom: "小型機房",
    mediumRoom: "中型機房",
    largeRoom: "大型機房",
    custom: "自訂",
    width: "寬度",
    depth: "深度",
    height: "高度",
    ambientTarget: "環境目標",
    continueRackArray: "前往機櫃陣列",
    rackArrayBuilder: "機櫃陣列建立器",
    arrayName: "陣列名稱",
    rows: "列數",
    columns: "欄數",
    rowSpacing: "列間距",
    columnSpacing: "欄間距",
    aisleWidth: "走道寬度",
    rackHeat: "機櫃熱負載",
    heatLoadMode: "熱負載模式",
    perRackKw: "每櫃 kW",
    totalArrayKw: "陣列總 kW",
    mixedCustom: "個別機櫃自訂",
    orientation: "進風方向",
    coolingMode: "冷卻模式",
    airCooled: "氣冷",
    hybridLiquid: "混合液冷",
    directLiquid: "直接液冷",
    liquidCapture: "液冷捕獲比例",
    advancedRackDimensions: "進階機櫃尺寸",
    createReplace: "建立 / 取代",
    addArray: "新增陣列",
    coolingSetup: "冷卻設定",
    containmentSetup: "封閉通道設定",
    reviewSimulate: "檢視與模擬",
    runFormalSimulation: "執行正式模擬",
    thermalView: "熱場檢視",
    airflowView: "氣流檢視",
    particleDensity: "流線密度",
    particleSpeed: "流速",
    airflowOpacity: "氣流透明度",
    heatmapOpacity: "熱圖透明度",
    sliceControls: "切片控制",
    slicePlane: "切片平面",
    slicePosition: "切片位置",
    visibleAssumptions: "可見假設",
    assumptionHint: "AirPath 使用簡化 3D 體素/網格近似模型進行概念階段預售檢視，並非認證 CFD 求解器。",
    inspectorResults: "檢查 / 結果",
    scenarioOutput: "情境輸出",
    inspector: "檢查",
    results: "結果",
    warnings: "警示",
    selection: "選取項目",
    selectionHint: "在 3D 視窗中點選機櫃、冷卻物件、封閉面板或警示標記。",
    simulationResults: "模擬結果",
    maxRackInlet: "最高進風溫度",
    averageInlet: "平均進風溫度",
    hotspots: "熱點",
    coolingMargin: "冷卻餘裕",
    critical: "嚴重",
    elapsed: "耗時",
    iterations: "迭代",
    rackInletEstimates: "機櫃進風溫度估算",
    reportExport: "報告匯出",
    generate: "產生",
    downloadHtml: "下載 HTML",
    open: "開啟",
    reportMetadata: "報告資料",
    companyName: "公司名稱",
    clientName: "客戶名稱",
    projectName: "專案名稱",
    caseName: "案例名稱",
    reportTitle: "報告標題",
    author: "作者",
    reportDate: "報告日期",
    revision: "版次",
    logo: "標誌",
    logoPlaceholder: "使用佔位標誌",
    editMode: "編輯模式",
    locked: "鎖定",
    selectMode: "選取",
    moveMode: "移動",
    layers: "圖層",
    grid: "網格",
    labels: "名稱",
    heatmap: "熱圖",
    dimensions: "尺寸",
    streamlines: "流線",
    statusFooter: "簡化 3D 體素氣流與熱風險近似模型，非認證 CFD。",
    duplicateB: "複製 B",
    improveB: "改善 B",
    compare: "比較",
    scenarioAMax: "情境 A 最高",
    scenarioBMax: "情境 B 最高",
    delta: "差異",
    recommendation: "建議"
  }
};

export function t(language: Language, key: UiKey): string {
  return ui[language][key] ?? ui.en[key];
}

export function localizeWarningLabel(language: Language, label: string): string {
  if (language === "en") return label;
  const map: Record<string, string> = {
    "High rack inlet temperature": "機櫃進風溫度偏高",
    "Poor airflow coverage": "氣流覆蓋不足",
    "Rack heat density high": "機櫃熱密度偏高",
    "Liquid residual heat still high": "液冷殘餘空氣熱偏高",
    "Cooling capacity insufficient": "冷卻容量不足",
    "Supply-return short circuit": "送回風短路風險",
    "Return path weak": "回風路徑不足",
    "Containment gap detected": "封閉通道缺口風險",
    "Hot air recirculation risk": "熱風回流風險"
  };
  return map[label] ?? label;
}

export function localizeSeverity(language: Language, severity: string): string {
  if (language === "en") return severity;
  if (severity === "critical") return "嚴重";
  if (severity === "warning") return "警示";
  return "資訊";
}

export function localizeSampleLabel(language: Language, key: string, fallback: string): string {
  if (language === "en") return fallback;
  const map: Record<string, string> = {
    "small-baseline": "小型機房基準",
    "cold-aisle-containment": "冷通道封閉",
    "hot-aisle-containment": "熱通道封閉",
    "overhead-short-circuit": "上送風短路風險",
    "gpu-hotspot": "高密度 GPU 熱點"
  };
  return map[key] ?? fallback;
}
