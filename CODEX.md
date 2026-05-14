# CODEX.md｜AirPath Autonomous Build Loop

Version: v0.1  
Product: AirPath  
Status: Governing workflow for Codex autonomous development, self-review, progress reporting, and engineering memos.

---

## 1. Purpose

This document defines how Codex should autonomously build AirPath.

The human role is to provide governing specifications and review final handoff. Codex is expected to plan, implement, test, review, document, and report progress autonomously.

---

## 2. Core Operating Principle

Codex must not wait for human task-by-task decomposition if the governing documents are sufficient.

Codex should:

1. Read governing documents.
2. Derive its own implementation plan.
3. Build in product layers.
4. Test continuously.
5. Self-review.
6. Document decisions.
7. Report milestones.
8. Produce final handoff.

---

## 3. Governing Documents

Codex must read:

1. `SPEC.md`
2. `DESIGN.md`
3. `MODEL_ASSUMPTIONS.md`
4. `AGENTS.md`
5. `CHECKLIST.md`
6. `CONTRIBUTING.md`
7. `ENGINEERING_MEMO_TEMPLATE.md`
8. `COMPUTER_USE_ACCEPTANCE.md`

---

## 4. Autonomous Build Loop

Codex must follow this loop:

```txt
Read governing docs
  → Create build plan
  → Implement product layer
  → Add tests
  → Run checks
  → Self-review
  → Write engineering memo
  → Send milestone update
  → Continue or final handoff
```

---

## 5. Product Layer Order

Codex should prefer this build order:

### Layer 1｜Project Foundation

- Create app scaffold
- Create package structure
- Configure TypeScript
- Configure tests
- Configure lint / formatting if practical
- Create scenario schema foundation

### Layer 2｜Scenario Schema

- Room schema
- Rack schema
- Rack array schema
- Cooling object schema
- Return object schema
- Containment schema
- Simulation settings schema
- Unit settings schema
- Report settings schema

### Layer 3｜3D UI Shell

- Main layout
- Top bar
- Left wizard panel
- Center 3D viewport
- Right inspector / results panel
- Bottom scenario bar
- Collapsible panels

### Layer 4｜Rack Array Builder

- Room setup
- Rack array generator
- Rack selection
- Multi-selection
- Rack editing
- Batch editing
- Real-time 3D rendering

### Layer 5｜Cooling and Containment

- Cooling object library
- Raised floor perforated tiles
- Overhead supply / return
- In-row cooling
- CDU
- Containment auto-generation
- Manual containment panels

### Layer 6｜Simulation Core

- 3D grid / voxel model
- Heat sources
- Cooling sources
- Return boundaries
- Obstacles
- Containment barriers
- Airflow vector field
- Temperature field
- Rack inlet temperature estimates

### Layer 7｜Visualization

- WebGL heatmap
- Rack surface risk coloring
- Airflow particles / streamlines
- Airflow arrows
- Slice view
- Warning pins

### Layer 8｜Warnings and Results

- Warning engine
- Result metrics
- Warning panel
- Click-to-focus behavior
- Suggested mitigations

### Layer 9｜Report Engine

- HTML report
- Light report styling
- Screenshots if practical
- Simulation settings
- Assumptions
- Disclaimer
- Print-to-PDF support

### Layer 10｜Scenario Comparison

- Scenario duplication
- Scenario A / B compare
- Delta metrics
- Before / after recommendation summary

### Layer 11｜Samples and Demo

- Five sample scenarios
- Demo route or demo page
- README demo instructions
- Deployment notes

---

## 6. Telegram Reporting

If Telegram environment variables exist:

```txt
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

Codex should report:

1. Milestone completed
2. Blocker encountered
3. Blocker resolved
4. Final handoff ready

### 6.1 Milestone Message Format

```txt
[AirPath Codex]
Status: Milestone completed
Milestone: <name>
Summary: <what was completed>
Checks: <build/test/lint status>
Risks: <known risks or none>
Next: <next milestone>
```

### 6.2 Blocker Message Format

```txt
[AirPath Codex]
Status: Blocker
Area: <affected area>
Issue: <what failed>
Impact: <impact on product>
Attempted Fixes: <summary>
Next Action: <planned fix or human review needed>
```

### 6.3 Final Handoff Message Format

```txt
[AirPath Codex]
Status: Final handoff ready
Completed: <summary>
Checks: <build/test/lint status>
Known Limitations: <list>
Memos: <engineering memo paths>
Next Recommended Work: <summary>
```

If Telegram is unavailable, write equivalent logs to `engineering-memos/`.

---

## 7. Engineering Memo Rules

Codex must write engineering memos during autonomous development.

Required memo categories:

- Bootstrap
- Architecture
- Scenario schema
- UI / design implementation
- Solver core
- Visualization
- Report engine
- Testing
- Deviations
- Final handoff

Recommended file names:

```txt
engineering-memos/
  000_bootstrap.md
  001_architecture.md
  002_scenario_schema.md
  003_ui_shell.md
  004_solver_core.md
  005_visualization.md
  006_report_engine.md
  007_testing.md
  008_deviations.md
  009_final_handoff.md
```

---

## 8. Self-Review Rules

Before final handoff, Codex must review against:

- `SPEC.md`
- `DESIGN.md`
- `MODEL_ASSUMPTIONS.md`
- `CHECKLIST.md`

Codex must explicitly answer:

1. Does the product support the 5-minute workflow?
2. Does the UI follow DESIGN.md?
3. Are airflow particles simulation-driven?
4. Are heatmaps simulation-driven?
5. Are model assumptions visible?
6. Is disclaimer included?
7. Are tests present?
8. Are validation cases present?
9. Are deviations documented?
10. What remains incomplete?

---

## 9. Deviation Rules

If Codex cannot implement a requirement exactly, it must not silently omit it.

It must document:

- Requirement
- Actual implementation
- Reason for deviation
- Risk
- Impact
- Proposed fix
- Whether human review is required

Place deviations in:

```txt
engineering-memos/008_deviations.md
```

---

## 10. Build and Test Expectations

Codex should run available checks:

```txt
npm install
npm run build
npm run test
npm run lint
```

If scripts differ, Codex must inspect `package.json` and run equivalent commands.

If a check cannot run, document why.

---

## 11. Final Handoff Requirements

Final handoff must include:

- Completed feature summary
- Build status
- Test status
- Known limitations
- Deviations from governing docs
- Screenshots or demo notes if available
- How to run locally
- How to deploy
- Next recommended work
- Links to engineering memos

---

## 12. Source of Truth Statement

This file governs Codex autonomous development behavior.

Codex should not treat the project as a simple one-shot coding task. It must operate as architect, developer, reviewer, tester, documenter, and handoff owner.
---

## 13. GUI Self-Acceptance Requirement

Before final handoff, Codex must complete the protocol in `COMPUTER_USE_ACCEPTANCE.md`.

The final product is not accepted only because:

- the code builds,
- tests pass,
- the UI compiles,
- screenshots render.

Codex must operate the product through a real browser-based flow, inspect the UI, identify issues, correct them, re-test, and write:

```txt
engineering-memos/010_gui_acceptance.md
```

Preferred mode:

```txt
Computer Use / GUI-driving agent with screenshot inspection.
```

Fallback mode:

```txt
Playwright E2E + screenshots + documented visual inspection.
```

If neither is available, final acceptance must be marked:

```txt
Status: Blocked
```

Codex must then document the missing capability and required next action.
