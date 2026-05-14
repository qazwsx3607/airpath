# AGENTS.md｜AirPath Coding Agent Instructions

Version: v0.1  
Product: AirPath  
Status: Governing instruction file for Codex and other coding agents.

---

## 1. Agent Mission

You are building AirPath, a native 3D CFD-style airflow and thermal review tool for server rooms and data center pre-sales.

Primary product promise:

> A pre-sales engineer must be able to create a useful 3D airflow and thermal review in 5 minutes.

Your job is to build the product described in the governing documents, test it, review it, document it, and record engineering decisions.

---

## 2. Governing Documents

Before implementation, read these files in order:

1. `SPEC.md`
2. `DESIGN.md`
3. `MODEL_ASSUMPTIONS.md`
4. `CODEX.md`
5. `CHECKLIST.md`
6. `CONTRIBUTING.md`
7. `ENGINEERING_MEMO_TEMPLATE.md`
8. `COMPUTER_USE_ACCEPTANCE.md`

If documents conflict:

1. `MODEL_ASSUMPTIONS.md` controls claims and simulation boundaries.
2. `SPEC.md` controls product requirements.
3. `DESIGN.md` controls UI / UX / visual behavior.
4. `CODEX.md` controls autonomous workflow.
5. `CHECKLIST.md` controls review.
6. `CONTRIBUTING.md` controls human contribution practices.

Record conflicts and resolutions in `engineering-memos/`.

---

## 3. Required Product Behaviors

AirPath must support:

- Native 3D room setup
- Rack array creation
- Single and multi-rack editing
- CRAC / CRAH cooling
- Raised floor perforated tiles
- Overhead supply / return
- In-row cooling
- Liquid cooling residual heat modeling
- Cold aisle and hot aisle containment
- 3D airflow particles / streamlines
- Thermal heatmap
- Rack inlet temperature estimates
- Warnings
- Scenario comparison
- JSON import / export
- HTML report export
- Print-to-PDF report styling
- Model assumptions and disclaimer

---

## 4. Required Architecture

Prefer this structure:

```txt
apps/
  web/

packages/
  solver-core/
  scenario-schema/
  report-engine/

examples/
  scenarios/

engineering-memos/
```

Hard rule:

- Do not mix simulation logic directly into UI components.
- Do not fake simulation results only through visual decoration.
- UI must consume scenario data and simulation output.
- Airflow particles must be based on vector field data.
- Heatmaps must be based on temperature or risk data.

---

## 5. Technical Stack

Use the agreed stack unless there is a documented reason not to:

- Vite
- React
- TypeScript
- Three.js
- React Three Fiber
- Zustand
- Vitest
- WebGL shader-based heatmap where practical

Future adapters may include:

- WebGPU compute
- WASM solver backend
- Python backend
- OpenFOAM adapter

Do not block the first build on future adapters.

---

## 6. Design Rules

Follow `DESIGN.md`.

Required:

- Dark technical cockpit + clean engineering SaaS
- Dark app theme
- Light report theme
- Collapsible panels
- Five-Minute Mode
- Rack array builder
- Native 3D viewport
- Thermal heatmap
- Airflow streamlines
- Warning UI with icon + label + color
- Report with assumptions and disclaimer

Forbidden:

- Rainbow heatmap
- Cyberpunk neon UI
- Game-like HUD
- Decorative airflow unrelated to simulation
- CFD jargon-first parameter wall
- Modal-heavy primary workflow
- Object editing only through raw JSON
- Report export without disclaimer

---

## 7. Simulation Rules

Follow `MODEL_ASSUMPTIONS.md`.

Required:

- 3D voxel/grid-based approximation
- Heat sources
- Cooling sources
- Supply boundaries
- Return boundaries
- Obstacles
- Containment barriers
- Temperature field
- Airflow vector field
- Rack inlet temperature estimates
- Warning list

Forbidden:

- Claiming certified CFD accuracy
- Hiding assumptions
- Presenting decorative airflow as simulation result
- Claiming compliance or construction readiness

---

## 8. Development Workflow

Use the autonomous build loop defined in `CODEX.md`.

At minimum:

1. Read governing docs.
2. Create internal implementation plan.
3. Implement in product layers.
4. Add tests.
5. Run build / lint / test.
6. Review against `CHECKLIST.md`.
7. Create engineering memo.
8. Record deviations.
9. Prepare final handoff.

---

## 9. Testing Requirements

Tests must cover:

- Scenario schema validation
- Unit conversion
- Rack array generation
- Liquid cooling residual heat calculation
- Containment barrier behavior
- Cooling object effects
- Heat source effects
- Warning generation
- Report data generation
- JSON import / export

Validation cases must include:

- Heat source increases nearby temperature.
- Cooling source reduces adjacent temperature.
- Obstacle weakens downstream airflow.
- Containment reduces hot/cold mixing.
- Increased rack kW increases hotspot risk.
- Higher airflow reduces inlet temperature risk.
- Liquid capture ratio reduces air-side heat load.

---

## 10. Documentation Requirements

Maintain:

- README.md
- SPEC.md
- DESIGN.md
- MODEL_ASSUMPTIONS.md
- CODEX.md
- CHECKLIST.md
- CONTRIBUTING.md
- Engineering memos

When implementation deviates from governing docs, record:

- What changed
- Why it changed
- Risk
- Impact on product promise
- Whether human review is required

---

## 11. Telegram Progress Updates

If Telegram credentials are available, send updates for:

- Milestone completed
- Blocker encountered
- Blocker resolved
- Final handoff

Do not spam minute-by-minute updates unless explicitly configured.

Required environment variables:

```txt
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

If Telegram is unavailable, write local progress logs in `engineering-memos/`.

---

## 12. Definition of Done

A development cycle is done only when:

1. Build passes.
2. Tests pass or failures are documented.
3. UI follows `DESIGN.md`.
4. Simulation behavior follows `MODEL_ASSUMPTIONS.md`.
5. Product requirements follow `SPEC.md`.
6. New assumptions are documented.
7. Engineering memo is written.
8. Checklist is completed.
9. GUI self-acceptance memo is completed.
10. Final handoff is prepared.

---

## 13. Source of Truth Statement

This file governs agent behavior.

Do not treat it as optional.

If a task is ambiguous, choose the option that best protects:

1. The 5-minute pre-sales review mission
2. Simulation transparency
3. UI clarity
4. Public repo credibility
5. Maintainable architecture
