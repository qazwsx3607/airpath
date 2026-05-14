# Engineering Memo: v0.4 Quality Handoff

Version: v0.4  
Date: 2026-05-15  
Author: Codex  
Area: Product Quality / UI / Reports / Acceptance

## 1. Summary

AirPath v0.4 moves the app from MVP demo quality toward a professional pre-sales review product without expanding scope or making certified CFD claims.

Implemented changes:

- Smoothed solver-driven airflow streamlines with Catmull-Rom sampling and animated flowing trail segments.
- Added airflow density, speed, and opacity controls; density max raised to 240.
- Added visual layer controls for grid, labels, warnings, heatmap, airflow, and dimensions.
- Added XZ/XY/YZ thermal slice axis controls and slice-position slider with visible slice plane labels.
- Added lock/select/move edit modes so rack drag is intentional and undo/redo remains reliable.
- Added cooling-object inspector editing for floor tile and cooling supply review.
- Added report metadata fields and logo upload/placeholder support.
- Rebuilt report output into a consultant-style deliverable with cover page, project metadata, methodology, results, risk register, recommendations, appendices, assumptions, and disclaimer.
- Added English/Chinese UI and report localization for major labels, warning labels, report sections, recommendations, assumptions, and disclaimer.
- Added v0.4 Playwright case-matrix acceptance covering the 10 required product-use cases.

## 2. Quality Rubric Final Status

| Category | Final Status | Evidence |
|---|---|---|
| Airflow realism | Pass | `case04_overhead_short_circuit_airflow.png`, `case08_poor_layout_red_team.png` |
| Viewport readability | Pass | `case02_cold_aisle_containment.png`, `case05_raised_floor_tile_layout.png`, `case06_high_density_gpu_hotspot.png` |
| Visual layer controllability | Pass | `case02_cold_aisle_containment.png`, `case04_overhead_short_circuit_airflow.png`, `case10_chinese_slice_controls.png` |
| Slice interaction usability | Pass | `case10_chinese_slice_controls.png` |
| Manipulation safety | Pass | Existing GUI self-acceptance drag/undo/redo plus move-mode gating |
| Report professionalism | Pass | `case01_small_server_room_report_full.png`, `case09_consultant_report_full.png` |
| Bilingual UX completeness | Pass | `case10_chinese_ui_report_flow.png`, `case10_chinese_report_full.png` |
| First external reviewer readiness | Pass | Cases 01, 09, 10 |
| First-run intuitiveness | Pass | Case 01 |
| Visual design maturity | Pass | Cases 02, 06, 09, 10 |
| Emotional usability / perceived polish | Pass | Cases 04, 09, 10 |
| Pre-sales deliverable credibility | Pass | Cases 02, 03, 09 |

## 3. Validation Results

Commands run successfully:

- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run acceptance`

Latest acceptance result:

- `tests/acceptance.spec.ts`: pass
- `tests/v04-quality.spec.ts`: pass
- 2 Playwright tests passed, including the full v0.4 10-case quality matrix.

Build output remains split into app, React/R3F support, Three.js, and viewport chunks. The largest expected chunk remains `vendor-three` because Three.js is core to the native 3D viewport.

## 4. Screenshot Evidence

Primary screenshot folder:

- `engineering-memos/screenshots/v0_4/`

Key evidence:

- `case01_small_server_room_report.png`
- `case01_small_server_room_report_full.png`
- `case02_cold_aisle_containment.png`
- `case03_hot_aisle_containment.png`
- `case04_overhead_short_circuit_airflow.png`
- `case05_raised_floor_tile_layout.png`
- `case06_high_density_gpu_hotspot.png`
- `case07_hybrid_liquid_residual_heat.png`
- `case08_poor_layout_red_team.png`
- `case09_consultant_report_generation.png`
- `case09_consultant_report_full.png`
- `case10_chinese_slice_controls.png`
- `case10_chinese_ui_report_flow.png`
- `case10_chinese_report_full.png`

## 5. Accepted Limitations

- Direct 3D dragging of the slice plane is not implemented. Slice orientation and position are clear and operable through XZ/XY/YZ controls and a position slider. This is accepted for v0.4 because browser evidence shows the control is understandable and precise.
- Some object identifiers, rack names, equipment acronyms, and cooling enum values remain English in Chinese mode. They are treated as identifiers or domain terms. User-facing report sections, metadata labels, warning labels, recommendations, assumptions, and disclaimer are localized.
- Airflow at density 180 is intentionally dense and can be visually busy. Default density is calmer; high density exists for detailed inspection.

## 6. Claims Boundary

No certified CFD, construction readiness, commissioning, or compliance claims were added. The UI footer, report methodology, assumptions, and disclaimer continue to state that AirPath is a simplified conceptual pre-sales risk review tool.

## 7. Handoff Status

Status: v0.4 acceptable for professional demo review.

No blocker or major UX issue remains after the evidence reruns. Remaining limitations are minor and documented above.
