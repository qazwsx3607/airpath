# COMPUTER_USE_ACCEPTANCE.md｜AirPath GUI Self-Acceptance Protocol

Version: v0.1  
Product: AirPath  
Status: Governing protocol for final GUI acceptance, computer-use testing, visual inspection, and autonomous correction.

---

## 1. Purpose

AirPath must not be considered complete only because the code builds.

At the product completion and acceptance stage, Codex must operate the application as a real user, inspect the GUI, validate the 5-minute workflow, identify defects, correct them, and produce an acceptance memo.

This document defines the required GUI self-acceptance protocol.

---

## 2. Core Rule

Before final handoff, Codex must run a real browser-based acceptance pass.

Preferred mode:

```txt
Computer Use / GUI-driving agent with screenshot inspection.
```

Fallback mode:

```txt
Playwright E2E + screenshot capture + visual inspection + documented limitations.
```

If neither is available, Codex must mark final acceptance as blocked and document the blocker.

Codex must not claim final product completion without a completed GUI acceptance pass or a documented blocker.

---

## 3. Acceptance Environment

The acceptance pass should use:

- Local dev server or production build preview
- Desktop viewport
- Browser-based UI
- Fresh project state
- At least one sample scenario
- At least one user-created scenario
- Screenshots captured during the flow

Recommended viewport:

```txt
1440 × 900 or larger
```

Mobile is not required for full editing acceptance because AirPath is desktop-first.

---

## 4. Required Acceptance Flow

Codex must perform the following full product journey:

### Flow A｜Start from Template

1. Open AirPath.
2. Start from room template.
3. Select medium room template.
4. Confirm room dimensions are visible and editable.
5. Verify 3D room renders correctly.

### Flow B｜Rack Array Creation

1. Open Rack Array step.
2. Create rack array.
3. Set rows.
4. Set columns.
5. Set spacing.
6. Set aisle width.
7. Set rack heat load.
8. Verify ghost preview behavior.
9. Confirm rack array renders in 3D.
10. Select one rack.
11. Multi-select racks.
12. Batch-edit selected racks.
13. Delete or move one rack.
14. Verify changes render immediately.

### Flow C｜Cooling Setup

1. Add CRAC / CRAH.
2. Add raised floor perforated tile.
3. Add ceiling supply diffuser.
4. Add ceiling return grille.
5. Add in-row cooler if implemented.
6. Verify supply and return direction markers.
7. Verify cooling object inspector fields.

### Flow D｜Containment Setup

1. Select rack rows.
2. Auto-generate cold aisle containment.
3. Auto-generate hot aisle containment if applicable.
4. Add end-of-row doors.
5. Verify transparent panel styling.
6. Verify containment affects simulation or is included in model input.

### Flow E｜Simulation

1. Trigger lightweight preview if available.
2. Run formal simulation.
3. Verify calculation status.
4. Verify simulation settings display.
5. Verify elapsed time display.
6. Verify temperature field exists.
7. Verify airflow vector field exists.
8. Verify rack inlet temperature estimates exist.

### Flow F｜Visualization

1. Toggle Solid View.
2. Toggle Thermal View.
3. Toggle Airflow View.
4. Toggle Combined View.
5. Toggle Slice View if available.
6. Verify heatmap uses approved thermal scale.
7. Verify rainbow heatmap is not used.
8. Verify airflow particles / streamlines appear.
9. Verify airflow particles are driven by simulation vector field.
10. Verify warning pins are clickable if warnings exist.

### Flow G｜Warnings

1. Open Warnings panel.
2. Verify severity labels.
3. Verify warning text.
4. Click a warning.
5. Confirm related object highlights.
6. Confirm camera focuses issue location.
7. Confirm suggested mitigation appears where possible.

### Flow H｜Scenario Comparison

1. Duplicate scenario.
2. Modify cooling or containment.
3. Run simulation again.
4. Compare Scenario A and B.
5. Verify delta metrics.
6. Verify before / after recommendation summary.

### Flow I｜Report Export

1. Open Report tab.
2. Generate report.
3. Verify report uses light professional style.
4. Verify executive summary exists.
5. Verify layout screenshot exists or limitation is documented.
6. Verify thermal screenshot exists or limitation is documented.
7. Verify airflow screenshot exists or limitation is documented.
8. Verify assumptions section exists.
9. Verify disclaimer exists.
10. Verify print-to-PDF styling or export path.

### Flow J｜JSON Import / Export

1. Export project JSON.
2. Reload or reset app.
3. Import exported JSON.
4. Verify room, racks, cooling, containment, units, and scenario state are restored.

---

## 5. Visual Acceptance Criteria

Codex must inspect screenshots for:

- Dark technical cockpit style
- Collapsible panels
- 3D viewport remains central
- No panel permanently blocks viewport
- Rack arrays are legible
- Cooling objects are distinguishable
- Supply and return markers are visible
- Containment panels are transparent and readable
- Heatmap uses cyan → slate → amber → orange → red scale
- No rainbow heatmap
- Airflow particles are visible and not excessive
- Warnings are visible and readable
- Report style is light and professional

---

## 6. Product Acceptance Criteria

The GUI acceptance pass must answer:

1. Can a user complete a useful review in 5 minutes?
2. Is the rack array workflow understandable without documentation?
3. Can cooling objects be added without raw JSON?
4. Can containment be generated quickly?
5. Are simulation outputs visible and understandable?
6. Are assumptions and disclaimers visible?
7. Is report output presentable for pre-sales?
8. Does the UI feel like AirPath as defined in DESIGN.md?
9. Are major bugs blocking realistic use?
10. What must be fixed before handoff?

---

## 7. Correction Loop

If Codex finds an issue during GUI acceptance, it must:

1. Record the issue.
2. Classify severity.
3. Fix the issue if possible.
4. Re-run the relevant acceptance flow.
5. Update the acceptance memo.
6. Continue until no blocking issues remain.

Severity levels:

| Level | Meaning |
|---|---|
| Blocker | Prevents 5-minute workflow or core app use |
| Major | Product usable but important feature broken |
| Minor | Cosmetic or non-blocking defect |
| Known Limitation | Accepted limitation documented for next cycle |

---

## 8. Required Acceptance Memo

Codex must create:

```txt
engineering-memos/010_gui_acceptance.md
```

The memo must include:

- Environment
- Browser
- Viewport size
- Test mode used
  - Computer Use
  - Playwright
  - Manual screenshot inspection
  - Fallback
- Flows completed
- Screenshots captured
- Issues found
- Fixes applied
- Re-test results
- Remaining limitations
- Final acceptance status

---

## 9. Required Screenshot Artifacts

Store screenshots if technically practical:

```txt
engineering-memos/screenshots/
  01_start_template.png
  02_rack_array.png
  03_cooling_setup.png
  04_containment.png
  05_thermal_view.png
  06_airflow_view.png
  07_warnings.png
  08_report.png
  09_scenario_compare.png
```

If screenshots cannot be captured, Codex must document why.

---

## 10. Final Acceptance Status

The final GUI acceptance memo must end with one of:

```txt
Status: Accepted
Status: Accepted with limitations
Status: Blocked
Status: Needs human review
```

Codex must not use `Status: Accepted` unless all blocker and major issues are resolved.

---

## 11. Source of Truth Statement

This document governs AirPath final GUI acceptance.

A passing build is not enough.

A passing test suite is not enough.

AirPath requires product-level self-use, visual inspection, correction, and documented acceptance before final handoff.
