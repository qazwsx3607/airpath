# Engineering Memo: v0.5 Case Matrix

Version: v0.5
Date: 2026-05-15
Author: Codex
Area: Evidence / Browser Acceptance / Product QA

## 1. Purpose

This matrix defines and records the v0.5 evidence cases for layout authoring, rack semantics, simulation trust, slice heatmap, and thermal visualization. Cases were operated through the UI with Playwright fallback browser acceptance, with screenshots captured under `engineering-memos/screenshots/v0_5/`.

## 2. Required Case Matrix

| Case | Name | User Goal | Expected Evidence | Status |
|---|---|---|---|---|
| 01 | Simulation dirty state after rack move | Move a rack after a formal simulation | Results become stale until formal simulation is rerun | Pass |
| 02 | Rack front/rear orientation | Inspect rack inlet/exhaust direction | Front/rear indicators are visible in Plan View and 3D View | Pass |
| 03 | Back-to-back rack rows | Detect central hot aisle | Auto-detection marks middle aisle as hot | Pass |
| 04 | Face-to-face rack rows | Detect central cold aisle | Auto-detection marks middle aisle as cold | Pass |
| 05 | Plan View box-select and group move | Select multiple racks and move as group | Group selection and moved rack positions are visible | Pass |
| 06 | Mirror selected rack row | Create symmetric row quickly | Mirrored row appears with expected orientation option | Pass |
| 07 | Convert rack to in-row cooling | Replace selected rack slot with in-row cooling | Cooling object occupies same footprint and appears in simulation/report | Pass |
| 08 | Slice heatmap XY | Show horizontal thermal distribution | XY slice plane uses temperature field and shared palette | Pass |
| 09 | Slice heatmap XZ or YZ | Show vertical thermal distribution | Vertical slice shows thermal distribution and label | Pass |
| 10 | Five-minute central hot aisle workflow | Build and simulate central hot aisle quickly | Room, rack row, mirror, hot aisle detection, containment, run, review | Pass |
| 11 | Thermal palette switching | Switch between supported palettes | CFD Classic, Thermal Professional, High Contrast, Dark View Optimized visible | Pass |
| 12 | Stepped band mode | Make temperature zones readable as blocks | Stepped thermal bands and aligned legend are visible | Pass |
| 13 | Manual min/max temperature range | Lock comparison scale | Manual range indicator and min/max values visible | Pass |
| 14 | Screen-space bottom colorbar | Keep legend fixed in viewport | Bottom colorbar remains fixed and readable | Pass |
| 15 | Screen-space right colorbar | Move legend to right side | Right colorbar remains fixed and readable | Pass |
| 16 | Slice heatmap with colorbar | Use same palette/range in slice | Slice and colorbar agree on palette/range | Pass |
| 17 | Report screenshot with colorbar | Export report-ready evidence | Report thermal screenshot includes professional fixed thermal legend | Pass |

## 3. Defect Log

| ID | Case | Severity | Finding | Fix | Retest |
|---|---|---|---|---|---|
| V05-01 | 01-17 | Major | Adding the Plan View switch made the topbar too wide at the Playwright desktop viewport and old view-mode buttons were intercepted by action icons | Shortened workspace labels, tightened topbar responsive spacing, and constrained action button widths | `npm run acceptance` passed |
| V05-02 | 03 | Major | Plan authoring toolbar was blocked by the 3D viewport layer controls while Plan View was active | Hid the 3D viewport tools/metrics/footer in Plan View and kept Plan View's own toolbar active | `case03_back_to_back_hot_aisle.png` refreshed |
| V05-03 | 03, 15 | Minor | Plan stale banner and right-side colorbar competed with authoring/legend controls | Repositioned Plan stale banner to the lower plan stage, reduced plan labels, and moved the right colorbar lower with compact right-mode text | v0.5 screenshots refreshed |

## 4. Evidence Paths

Screenshot folder:

```txt
engineering-memos/screenshots/v0_5/
```

Captured screenshots:

- `case01_dirty_state.png`
- `case02_rack_front_rear.png`
- `case03_back_to_back_hot_aisle.png`
- `case04_face_to_face_cold_aisle.png`
- `case05_plan_box_select_group_move.png`
- `case06_mirror_row.png`
- `case07_convert_inrow.png`
- `case08_slice_xy_heatmap.png`
- `case09_slice_vertical_heatmap.png`
- `case10_five_minute_hot_aisle.png`
- `case11_palette_switching.png`
- `case12_stepped_bands.png`
- `case13_manual_range.png`
- `case14_bottom_colorbar.png`
- `case15_right_colorbar.png`
- `case16_slice_colorbar.png`
- `case17_report_colorbar.png`

## 5. Execution Status

Status: Pass. All 17 required cases were executed through Playwright browser acceptance and screenshot evidence was refreshed.
