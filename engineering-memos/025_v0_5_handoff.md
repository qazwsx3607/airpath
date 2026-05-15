# Engineering Memo: v0.5 Layout Authoring + Simulation Trust + Thermal Visualization Handoff

Version: v0.5
Date: 2026-05-15
Author: Codex
Area: Product Handoff / Validation / Acceptance

## 1. Summary

AirPath v0.5 upgrades the product core toward the five-minute pre-sales promise without expanding scope or making certified CFD claims.

Implemented:

- Plan View for top-down CAD-like room layout editing.
- Box selection, group move, snap-based XY floor gizmo, mirror tools, central hot/cold aisle creation, and rack-to-in-row-cooling conversion.
- Rack front/rear inlet/exhaust semantics and visual indicators.
- Hot/cold aisle detection for back-to-back and face-to-face rack rows, plus one-click detected-aisle containment generation.
- Formal simulation trust state: run id, status, timestamp, elapsed time, stale-result banner, and rerun clearing.
- Solver rack inlet/exhaust sampling refinement for X- and Z-oriented racks.
- Shared thermal palette/range system with CFD Classic, Thermal Professional, High Contrast, and Dark View Optimized palettes.
- Smooth and stepped thermal color modes.
- Auto/manual temperature scale, min/max, critical threshold, contrast, opacity, and colorbar position controls.
- Slice heatmap plane using the simulation temperature field and shared thermal settings.
- Fixed screen-space colorbar overlay and report screenshot colorbar compositing.
- v0.5 Playwright case matrix covering all 17 requested evidence cases.

## 2. Validation Results

Commands passed:

- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run acceptance`

Acceptance detail:

- `tests/acceptance.spec.ts`: pass
- `tests/v04-quality.spec.ts`: pass
- `tests/v05-layout-authoring.spec.ts`: pass

Latest full acceptance result: 3 Playwright tests passed.

## 3. Evidence

Screenshot folder:

```txt
engineering-memos/screenshots/v0_5/
```

Key screenshots:

- `case01_dirty_state.png`
- `case03_back_to_back_hot_aisle.png`
- `case04_face_to_face_cold_aisle.png`
- `case05_plan_box_select_group_move.png`
- `case07_convert_inrow.png`
- `case08_slice_xy_heatmap.png`
- `case09_slice_vertical_heatmap.png`
- `case10_five_minute_hot_aisle.png`
- `case11_palette_switching.png`
- `case12_stepped_bands.png`
- `case13_manual_range.png`
- `case14_bottom_colorbar.png`
- `case15_right_colorbar.png`
- `case17_report_colorbar_full.png`

## 4. Quality Gate Review

| Requirement | Status |
|---|---|
| Simulation rerun trust | Pass |
| Rack front/rear semantics | Pass |
| Hot/cold aisle auto-detection | Pass |
| Plan View | Pass |
| Box selection | Pass |
| Mirror workflow | Pass |
| Rack-to-inrow conversion | Pass |
| Slice heatmap plane | Pass |
| Thermal palette controls | Pass |
| Stepped band mode | Pass |
| Manual min/max temperature scale | Pass |
| Fixed screen-space colorbar | Pass |
| Report screenshot thermal legend | Pass |
| v0.5 case matrix documented | Pass |
| Build/test/lint/acceptance | Pass |

## 5. Accepted Limitations

- Aisle detection is deterministic geometry-based assistance, not certified airflow classification. It handles the intended back-to-back and face-to-face rack row workflows and should be reviewed by the user on irregular layouts.
- Plan View is intentionally a simple room-layout editor, not a full CAD system. It supports the required fast pre-sales actions but does not include custom line drawing or multi-room modeling.
- Slice position is controlled through axis buttons and a slider. Direct slice-plane drag remains out of scope for this pass because the v0.5 requirement was met with visible thermal slice planes, axis selection, and position controls.
- Dense Plan View rack labels can still compress in very tight rack arrays. The selected objects and right inspector remain readable, and this is minor compared with the previous blocker-level layout-authoring gaps.

## 6. Claim Boundary

No certified CFD, construction approval, commissioning, compliance, OpenFOAM, backend account, cloud database, BIM/Revit, or multi-room scope was added. Model assumptions and disclaimer remain intact.

## 7. Handoff Status

Status: v0.5 accepted.

All required v0.5 items were implemented or documented as minor accepted limitations. No blocker or major UX issue remains after rerun.
