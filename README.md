# AirPath

**5-minute native 3D airflow review for server rooms and data center pre-sales.**

AirPath is a native 3D CFD-style room-level airflow and thermal review tool designed for pre-sales engineers, MEP teams, facility engineers, and data center solution teams.

Its core use case is simple:

> A presentation starts in 10 minutes.  
> A pre-sales engineer needs to create a credible 3D airflow and thermal review in 5 minutes.

AirPath is not a certified CFD solver. It is a fast, transparent, pre-sales-oriented 3D thermal risk review tool for conceptual layout evaluation.

---

## Product Positioning

AirPath helps users quickly build a server room or data center room, place rack arrays, add cooling systems, define containment, run a simplified 3D simulation, review thermal risks, and export a pre-sales-ready report.

It is designed to support:

- Native 3D room-level visualization
- Rack array creation
- CRAC / CRAH side supply
- Raised floor perforated tile supply
- Overhead supply / return
- In-row cooling
- Liquid cooling residual air-heat modeling
- Cold aisle and hot aisle containment
- 3D airflow particle lines / streamlines
- Thermal heatmaps
- Rack inlet temperature estimates
- Hotspot warnings
- Scenario comparison
- HTML report export with print-to-PDF styling

---

## What AirPath Is

AirPath is:

- A 3D airflow and thermal review tool
- A pre-sales engineering aid
- A fast concept-stage simulator
- A visualization-first risk review product
- A public technical project suitable for iterative development by Codex

---

## What AirPath Is Not

AirPath is not:

- A certified CFD solver
- A replacement for Ansys Fluent, Autodesk CFD, OpenFOAM, 6SigmaDCX, or professional CFD consulting
- A construction approval tool
- A commissioning acceptance tool
- A compliance verification tool
- A coolant-loop hydraulic simulator

---

## Core Workflow

```txt
Room Setup
  → Rack Array
  → Cooling Setup
  → Containment Setup
  → Simulate
  → Review Warnings
  → Export Report
```

The default workflow is **Five-Minute Mode**, which exposes only the controls needed to complete a fast pre-sales review.

---

## Recommended Tech Stack

- Vite
- React
- TypeScript
- Three.js
- React Three Fiber
- Zustand
- Vitest
- WebGL shader-based heatmap visualization
- TypeScript 3D voxel simulation core
- Optional future adapters for WebGPU compute and WASM solver backend

---

## Repository Structure

Recommended structure:

```txt
airpath/
  README.md
  SPEC.md
  DESIGN.md
  MODEL_ASSUMPTIONS.md
  AGENTS.md
  CODEX.md
  CHECKLIST.md
  CONTRIBUTING.md
  ENGINEERING_MEMO_TEMPLATE.md

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

## Current Implementation

The first AirPath build uses the requested monorepo layers:

- `apps/web` - Vite, React, TypeScript, Three.js, React Three Fiber, Zustand UI.
- `packages/scenario-schema` - scenario types, Zod validation, unit conversion, rack array generation, JSON import/export helpers.
- `packages/solver-core` - simplified 3D voxel airflow and thermal approximation, vector field, temperature field, rack inlet estimates, and warnings.
- `packages/report-engine` - report data generation, HTML report rendering, print-to-PDF styling, assumptions, and disclaimer.
- `examples/scenarios` - five sample `.airpath.json` scenarios for import, validation, and demos.

## Local Development

```txt
npm install
npm run dev
npm run build
npm run test
npm run lint
npm run acceptance
```

The app runs locally through Vite. The default workflow is Five-Minute Mode:

```txt
Room -> Rack Array -> Cooling -> Containment -> Simulate -> Review -> Export
```

Validation and acceptance checks are intentionally regression-oriented. They do not certify engineering accuracy.

---

## Governing Documents

The project is governed by the following files:

| File | Purpose |
|---|---|
| `SPEC.md` | Product and engineering source of truth |
| `DESIGN.md` | UI / UX / visual design system |
| `MODEL_ASSUMPTIONS.md` | Simulation assumptions, limits, and claims boundary |
| `AGENTS.md` | Instructions for Codex and coding agents |
| `CODEX.md` | Autonomous build loop, Telegram updates, and memo rules |
| `CHECKLIST.md` | Review and handoff checklist |
| `CONTRIBUTING.md` | Human contribution guide |
| `ENGINEERING_MEMO_TEMPLATE.md` | Required memo format for autonomous development cycles |
| `COMPUTER_USE_ACCEPTANCE.md` | GUI self-acceptance protocol using Computer Use or fallback browser testing |

---

## Disclaimer

AirPath is intended for early-stage pre-sales thermal review and conceptual airflow risk analysis. It is not a certified CFD solver and should not be used as the sole basis for construction, commissioning, or compliance decisions.

---

## License

TBD.
