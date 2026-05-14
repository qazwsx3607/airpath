# SPEC.md｜AirPath Product + Engineering Specification

Version: v0.1  
Product: AirPath  
Tagline: 5-minute native 3D airflow review for server rooms and data center pre-sales.  
Status: Governing product and engineering specification for autonomous Codex development.

---

## 1. Product Mission

AirPath must allow a pre-sales engineer to create a native 3D CFD-style airflow and thermal review in 5 minutes.

The primary use case:

> A presentation starts in 10 minutes.  
> The user needs to create a pre-sales deliverable-level CFD-style solution review in 5 minutes.

The product must prioritize:

1. Native 3D visualization
2. Zero-learning-cost workflow
3. Fast rack array setup
4. Fast cooling and containment configuration
5. Simulation-driven airflow and thermal visualization
6. Pre-sales-ready report output
7. Transparent model assumptions

---

## 2. Product Category

AirPath is a native 3D CFD-style room-level airflow and thermal review tool.

It is not positioned as a certified CFD solver.

Correct positioning language:

- 5-minute native 3D airflow review
- CFD-style thermal review tool
- 3D thermal risk simulator
- Concept-stage data center airflow review
- Pre-sales airflow and thermal evaluation tool

Forbidden positioning language:

- Certified CFD solver
- Engineering-grade CFD replacement
- Construction approval simulator
- Commissioning acceptance simulator
- Compliance verification software

---

## 3. Target Users

Primary users:

- Data center pre-sales engineers
- MEP engineers
- Facility engineers
- Data center solution consultants
- Technical sales engineers
- Early-stage design reviewers

Secondary users:

- Project managers reviewing thermal risks
- Data center clients reviewing layout options
- Engineers preparing pre-sales proposals
- Technical portfolio reviewers

---

## 4. Core Product Promise

AirPath must support the following promise:

```txt
Open AirPath.
Select or define room size.
Create rack arrays.
Add cooling systems.
Add containment.
Run simulation.
Review thermal and airflow risks.
Export a report.
Finish within 5 minutes.
```

The user must not need CFD expertise to complete the default workflow.

---

## 5. Spatial Scope

### 5.1 Room Scope

AirPath handles one room at a time.

Supported room type:

- Rectangular single-room server room or data center room
- Custom room dimensions
- Native 3D height-aware space

Common room area range:

- 50–300 m²

### 5.2 Room Templates

Required templates:

| Template | Default Size |
|---|---|
| Small server room | 8m × 6m × 3m |
| Medium room | 15m × 10m × 3.5m |
| Large room | 25m × 12m × 4m |
| Custom | User-defined |

All template values must be user-editable.

---

## 6. Rack System

### 6.1 Default Rack

Default rack size:

```txt
600mm W × 1200mm D × 2200mm H
```

All values must be user-editable.

### 6.2 Rack Heat Load Presets

Required presets:

| Preset | Heat Load |
|---|---:|
| Normal | 5 kW |
| High Density | 15 kW |
| AI / GPU | 30–80 kW |
| Custom | User-defined |

### 6.3 Rack Creation Model

Rack creation must be array-first.

The user must be able to create a rack field using:

- Rows
- Columns
- Row spacing
- Column spacing
- Aisle width
- Rack orientation
- Rack size
- Heat load mode
- Cooling mode
- Start position

### 6.4 Rack Heat Load Modes

Required:

1. Per-rack kW
2. Total array kW
3. Mixed custom per-rack values

### 6.5 Rack Editing

AirPath must support:

- Single rack selection
- Multi-rack selection
- Delete
- Move
- Resize
- Rotate / change orientation
- Edit heat load
- Edit cooling mode
- Edit liquid cooling capture ratio
- Batch editing of selected racks
- Real-time 3D preview after changes

---

## 7. Cooling / Supply / Return System

### 7.1 Required Cooling Objects

AirPath must support:

- CRAC / CRAH
- In-row cooler
- Floor perforated tile
- Ceiling supply diffuser
- Ceiling return grille
- Wall supply grille
- Wall return grille
- CDU

### 7.2 Supply Modes

Required supply modes:

1. CRAC / CRAH side supply
2. Raised floor perforated tile supply
3. Overhead supply
4. In-row cooling
5. Local cooling object

### 7.3 Return Modes

Required return objects:

- Ceiling return
- Wall return
- CRAC / CRAH return
- Rear return zone

### 7.4 Cooling Object Fields

Each cooling object should support:

- Name
- Type
- Position
- Size
- Direction
- Supply temperature
- Airflow rate
- Cooling capacity
- Return mode
- Enabled / disabled

---

## 8. Raised Floor Support

Raised floor must be supported as a supply mode.

Implementation scope:

- Perforated tiles are modeled as cold-air inlet patches.
- Tile airflow can be configured.
- Tile location affects rack inlet temperatures and local airflow.
- Full underfloor plenum turbulence is not required in this scope.

Required fields:

- Tile position
- Tile size
- Tile airflow
- Tile supply temperature
- Tile enabled / disabled

---

## 9. Overhead Supply / Return Support

Overhead supply and return must be first-class features.

Required objects:

- Ceiling supply diffuser
- Ceiling return grille

Required effects:

- Vertical airflow visualization
- Supply-return short-circuit warning
- Thermal stratification approximation
- Ceiling return path visualization

---

## 10. Liquid Cooling Support

Liquid cooling must be supported as an air-side residual heat model.

Required rack fields:

- Total IT load
- Cooling mode
  - Air cooled
  - Hybrid liquid cooled
  - Direct liquid cooled
- Liquid capture ratio
- Residual air heat

Formula:

```txt
residual_air_heat = total_it_kw × (1 - liquid_capture_ratio)
```

CDU object support:

- Location
- Size
- Optional residual heat
- Optional obstruction behavior
- Optional airflow interaction

Out of scope:

- Coolant-loop hydraulic calculation
- Pipe network CFD
- Pump curve calculation
- Water temperature simulation
- CDU internal thermal modeling

---

## 11. Containment System

### 11.1 Required Containment Types

AirPath must support:

- Cold aisle containment
- Hot aisle containment
- End-of-row doors
- Top panels
- Side panels
- Full aisle containment

### 11.2 Creation Methods

Containment creation must support:

1. Auto-generate from selected rack rows
2. Manual panel drawing
3. Preset containment type

### 11.3 Simulation Behavior

Containment acts as an airflow barrier.

In current scope:

- It blocks or redirects airflow
- It reduces hot/cold mixing
- It does not model material heat transfer

---

## 12. Simulation Model

### 12.1 Core Model

AirPath uses a 3D voxel/grid-based airflow and heat advection-diffusion approximation.

It must support:

- Heat sources
- Cooling sources
- Supply boundaries
- Return boundaries
- Obstacles
- Containment barriers
- Airflow vector field
- Temperature field
- Rack inlet temperature estimates
- Hotspot warnings

### 12.2 Simulation Modes

Required:

1. Lightweight real-time preview during editing
2. Manual formal simulation for report output

### 12.3 Required Simulation Output

The formal simulation must output:

- Temperature field
- Airflow vector field
- Rack inlet temperature estimate
- Max rack inlet temperature
- Average rack inlet temperature
- Hotspot count
- Cooling capacity margin
- Warning list
- Critical warning list
- Simulation settings
- Elapsed time
- Iteration count if available

### 12.4 Confidence Score

No confidence score is required.

However, model assumptions and disclaimers are required.

---

## 13. Visualization Requirements

AirPath must include:

- Native 3D room
- Rack rows
- Cooling objects
- Containment panels
- Temperature heatmap
- Rack surface risk coloring
- 3D airflow particle lines / streamlines
- Airflow direction arrows
- Voxel or slice view toggle
- Supply and return markers
- Warning pins
- Report screenshot view

### 13.1 Airflow Particles / Streamlines

Airflow particles are mandatory.

They must:

- Be animated
- Be based on simulation vector field
- Show direction
- Be toggleable
- Support density adjustment
- Support speed adjustment
- Avoid being purely decorative

### 13.2 Heatmap

Required heatmap layers:

1. Rack surface heat coloring
2. Horizontal thermal slice
3. Optional volumetric heat cloud if performance allows

Rainbow heatmaps are forbidden.

---

## 14. Technical Architecture

### 14.1 Recommended Stack

Frontend:

- Vite
- React
- TypeScript

3D:

- Three.js
- React Three Fiber

State:

- Zustand

Testing:

- Vitest

Visualization:

- WebGL shader heatmap
- Three.js particle / line systems
- 3D overlays and labels

### 14.2 Solver Architecture

Initial solver:

- TypeScript 3D voxel solver

Required architecture:

- Solver core must be separated from UI
- Scenario schema must be separated from UI
- Report engine must be separated from UI
- Future solver adapters must be possible

Recommended packages:

```txt
apps/web
packages/solver-core
packages/scenario-schema
packages/report-engine
```

### 14.3 Future Acceleration

The architecture must reserve paths for:

- WebGPU compute
- WASM solver backend
- Python backend
- OpenFOAM adapter

These are optional future adapters and must not block the first autonomous build.

---

## 15. Project File Format

Canonical format:

```txt
JSON
```

Recommended extension:

```txt
.airpath.json
```

The project file must include:

- Schema version
- Room
- Rack arrays
- Individual rack overrides
- Cooling objects
- Return objects
- Containment objects
- Simulation settings
- Unit settings
- Report settings
- Scenario metadata

AirPath must support:

- Import JSON
- Export JSON
- Save scenario
- Load scenario
- Load sample scenario

---

## 16. Units

Required unit switching:

| Category | Units |
|---|---|
| Temperature | °C / °F |
| Airflow | CFM / CMH / L/s |
| Dimension | m / mm / ft |
| Heat | kW / W / BTU/h |

Unit conversion must be explicit and tested.

---

## 17. Report Engine

### 17.1 Report Format

First report format:

- HTML report
- Print-to-PDF styling

Also required:

- JSON simulation result export

### 17.2 Required Report Sections

The report must include:

1. Executive summary
2. Room setup
3. Rack heat load table
4. Cooling setup
5. Containment setup
6. Temperature review
7. Airflow review
8. Hotspot warnings
9. Recommended actions
10. Simulation settings
11. Model assumptions
12. Disclaimer

### 17.3 Required Screenshots

The report must include or support generating:

1. Layout overview
2. Thermal view
3. Airflow view

---

## 18. Scenario Comparison

AirPath must support scenario comparison.

Required comparison metrics:

- Max rack inlet temperature
- Average rack inlet temperature
- Hotspot count
- Cooling capacity margin
- Warning count
- Critical warning count

Required UI:

- Side-by-side metrics
- Delta table
- Selectable 3D view A / B
- Before / after recommendation summary

---

## 19. Sample Scenarios

Required sample scenarios:

1. Small server room baseline
2. Cold aisle containment
3. Hot aisle containment
4. Overhead supply short-circuit
5. High-density GPU rack hotspot

Each sample must include:

- Scenario JSON
- Expected interpretation
- Recommended report output
- Validation relevance

---

## 20. Validation Cases

AirPath must include validation cases that check:

- Heat source increases nearby temperature
- Cooling source reduces adjacent temperature
- Airflow obstruction weakens downstream flow
- Containment reduces hot/cold mixing
- Increased rack kW increases hotspot risk
- Higher airflow reduces inlet temperature risk
- Liquid cooling capture ratio reduces air-side heat load

Validation cases do not certify engineering accuracy. They protect model behavior from regressions.

---

## 21. Public Demo

AirPath should be deployable as a public demo.

Preferred deployment:

- Vercel

Backup:

- GitHub Pages

Required demo features:

- Load sample scenario
- Run simulation
- Toggle heatmap
- Toggle airflow streamlines
- Open report preview
- Export report

---

## 22. Disclaimer

Required wording:

> This tool is intended for early-stage pre-sales thermal review and conceptual airflow risk analysis. It is not a certified CFD solver and should not be used as the sole basis for construction, commissioning, or compliance decisions.

This disclaimer must appear in:

- README
- Report
- App footer or settings
- MODEL_ASSUMPTIONS.md

---

## 23. Acceptance Criteria

AirPath is acceptable when:

1. User can create a room from template or custom dimensions.
2. User can create rack arrays.
3. User can edit single and multiple racks.
4. User can add cooling objects.
5. User can add raised floor tiles.
6. User can add overhead supply / return.
7. User can add containment.
8. User can run a formal simulation.
9. User can view thermal heatmap.
10. User can view airflow streamlines.
11. User can review warnings.
12. User can export HTML report.
13. User can import / export JSON.
14. User can compare scenarios.
15. Validation cases pass.
16. Governing docs are followed or deviations are documented.

---

## 24. Source of Truth Statement

SPEC.md defines what AirPath must do.

DESIGN.md defines how AirPath must feel, look, and behave.

MODEL_ASSUMPTIONS.md defines what AirPath may and may not claim.

AGENTS.md and CODEX.md define how Codex must build, review, report, and document the project.
