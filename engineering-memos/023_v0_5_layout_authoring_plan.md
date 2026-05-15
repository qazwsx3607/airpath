# Engineering Memo: v0.5 Layout Authoring + Simulation Trust + Thermal Visualization Plan

Version: v0.5
Date: 2026-05-15
Author: Codex
Area: Product Architecture / Layout Authoring / Simulation Trust / Thermal Visualization

## 1. Governing Inputs Read

- `SPEC.md`
- `DESIGN.md`
- `MODEL_ASSUMPTIONS.md`
- `CHECKLIST.md`
- `COMPUTER_USE_ACCEPTANCE.md`
- `engineering-memos/016_v0_4_quality_loop_plan.md`
- `engineering-memos/017_v0_4_case_matrix.md`
- `engineering-memos/018_v0_4_quality_handoff.md`
- v0.4 screenshot evidence under `engineering-memos/screenshots/v0_4/`

No v0.4b memo is present in the repository at the start of this pass.

## 2. Current Bottlenecks Preventing the 5-Minute Simulation Promise

1. Layout authoring is still primarily 3D-first. It is usable for review, but not fast enough for first-time rack row construction, symmetric aisle creation, group moves, or correcting layout mistakes.
2. Formal simulation status is not trustworthy enough. Preview solves run during edits, but the UI does not clearly separate preview freshness from the last formal run used for report-quality review.
3. Rack direction exists as orientation data, but front/rear semantics are not visible enough and not explicitly tied to user-facing inlet/exhaust language.
4. Hot/cold aisle construction remains manual. Users need AirPath to infer the aisle between rack rows and offer one-click containment generation.
5. Slice mode has a thermal plane, but it lacks strong color-to-temperature trust. The colorbar is still a 3D-world legend and can be occluded or rotate away in report captures.
6. Thermal colors are too subtle for engineering review. Users need palette, range, stepped bands, opacity, and threshold controls that remain consistent across viewport, slice, and report screenshots.
7. Conversion from rack slot to in-row cooling is not direct. Users currently need to delete or add objects manually, which slows common pre-sales layout iteration.

## 3. Required Architecture Changes

- Add a store-level simulation run trust model:
  - `runStatus`: `idle | dirty | running | completed | failed`
  - `simulationRunId`
  - `lastRunAt`
  - `lastRunElapsedMs`
  - `resultsStale`
  - formal run metadata remains distinct from preview solve output.
- Add a store-level view authoring mode:
  - `workspaceMode`: `three | plan`
  - Plan View and 3D View consume the same scenario state and selection state.
- Add store-level layout authoring actions:
  - select by rectangle
  - move selected group
  - mirror selected racks
  - create central hot/cold aisle row variants
  - convert selected rack(s) to in-row cooler(s)
- Add aisle detection as deterministic scenario-derived data:
  - detected aisle zones are calculated from rack geometry, rack orientation, and row spacing.
  - generated containment objects remain normal scenario objects.
- Add shared thermal visualization state:
  - palette
  - smooth or stepped mode
  - auto/manual scale
  - min/max temperature
  - critical threshold
  - opacity and contrast
  - screen-space colorbar position.

## 4. UI Changes

- Add a top-level View selector for `3D View` and `Plan View` without removing the existing Solid/Thermal/Airflow/Combined/Slice/Report modes.
- Add a Plan View component:
  - top-down room frame
  - grid
  - rack rectangles
  - cooling object rectangles
  - containment and detected aisle zones
  - front/rear markers
  - box selection
  - group bounding box
  - move handles for X and Y floor axes
  - mirror and convert actions.
- Add a compact layout authoring toolbar:
  - Detect Aisles
  - Add Hot Aisle Containment
  - Add Cold Aisle Containment
  - Mirror X
  - Mirror Y
  - Back-to-back hot aisle
  - Face-to-face cold aisle
  - Convert to In-row Cooling.
- Add simulation status to the viewport and results panel:
  - status chip
  - run id
  - last run timestamp
  - elapsed time
  - stale warning when edits happen after a formal run.
- Add thermal controls to Review:
  - palette selector
  - smooth/stepped color mode
  - auto/manual scale
  - min/max/critical values
  - heatmap opacity and contrast
  - bottom/right/hidden screen-space colorbar.

## 5. Data Model Changes

- Keep `Rack.orientation` as the explicit orientation model.
- Treat rack front as inlet side and rack rear as exhaust side.
- Add helper functions for rack front/rear direction and orientation flipping instead of adding redundant persisted fields.
- No new product category is added. In-row cooling already exists and conversion creates existing `in-row-cooler` cooling objects.
- Aisle detection is transient derived state unless containment is generated. Generated containment uses existing `ContainmentObject` schema.
- Thermal display settings remain app state; they do not need to be exported in v0.5 unless required by report generation.

## 6. Simulation Semantics Changes

- Preview solves remain available for immediate visual feedback during editing.
- Formal simulation has explicit run identity and freshness.
- Scenario edits to room, racks, cooling, containment, heat load, liquid capture, or object movement mark formal results dirty.
- Running formal simulation increments run id, records timestamp, records elapsed time, clears stale state, and updates report data.
- Rack inlet sampling already uses the rack front direction. v0.5 will make that semantics visible and ensure heat/exhaust language aligns with the rear side.
- Rack heat influence continues to originate from the rear/exhaust-adjacent zone where practical.
- Aisle detection is geometric and heuristic, not certified airflow analysis. It is a fast authoring helper and must be documented that edge cases require user review.

## 7. Thermal Visualization Changes

- Replace the 3D-world heat legend with a screen-space colorbar overlay inside the viewport.
- Add supported palettes:
  - CFD Classic
  - Thermal Professional
  - High Contrast
  - Dark View Optimized
- Add color modes:
  - Smooth gradient
  - Stepped bands.
- Add scale controls:
  - Auto scale from current result field
  - Manual min/max range, default 18 C to 35 C
  - Critical threshold marker.
- Use the same thermal mapping for:
  - slice plane shader
  - viewport colorbar
  - report screenshots.
- Report screenshots must include the fixed colorbar. If DOM overlay capture cannot be made reliable, the report engine must render an equivalent colorbar near captured images.

## 8. Execution Order

1. Write this plan and the v0.5 case matrix.
2. Add simulation trust state and status UI.
3. Add thermal palette/range/colorbar state and screen-space overlay.
4. Upgrade slice shader to consume the shared thermal palette, range, contrast, and stepped mode.
5. Add rack front/rear indicators and helper functions.
6. Add aisle detection utilities and containment generation actions.
7. Add Plan View with box selection, group move, axis handles, mirror, and rack-to-inrow conversion.
8. Update report capture/report output to include a professional fixed thermal legend.
9. Add tests for schema/solver helpers and Playwright v0.5 cases.
10. Run build/test/lint/acceptance, inspect v0.5 screenshots, fix blocker/major issues, write handoff, commit, push.

## 9. Acceptance Criteria

v0.5 cannot be marked complete unless:

- Simulation dirty state appears after a layout edit and clears after rerun.
- Formal run id, last run timestamp, elapsed time, and status are visible.
- Rack front/rear indicators are visible and tied to inlet/exhaust labels.
- Hot and cold aisle detection works for back-to-back and face-to-face rack rows.
- Plan View supports top-down layout editing, box selection, group move, mirror, and rack-to-inrow conversion.
- Slice heatmap displays thermal data for XY and at least one vertical axis.
- Thermal palettes, stepped bands, manual range, contrast/opacity, and screen-space colorbar work through UI.
- Report screenshots include a clear thermal legend.
- `engineering-memos/024_v0_5_case_matrix.md` records all required cases.
- `engineering-memos/025_v0_5_handoff.md` records final evidence, limitations, and validation status.
- `npm run test`, `npm run lint`, `npm run build`, and `npm run acceptance` pass.
- v0.5 screenshots are captured under `engineering-memos/screenshots/v0_5/`.
- Safe changes are committed and pushed to `origin/main`.

## 10. Risks and Limitations

| Risk | Impact | Mitigation |
|---|---|---|
| Plan View scope could become full CAD | Slows delivery and expands scope | Keep to room grid, rectangles, selection, group move, mirror, and conversion only |
| Aisle detection edge cases | Incorrect containment suggestion on irregular layouts | Display detected zones as suggestions and document heuristic assumptions |
| DOM overlay not captured by canvas screenshot | Report may miss colorbar | Add report-side colorbar rendering or capture viewport wrapper when feasible |
| Manual scale can mislead comparison if changed between scenarios | Visual inconsistency | Show auto/manual indicator and current min/max on colorbar |
| Preview solve vs formal result can confuse users | Trust issue | Use explicit stale banner and formal run metadata |
| Added controls can clutter the cockpit | Slower first-use | Keep controls grouped, compact, and only expose advanced thermal controls in Review |

## 11. Initial Status

Status: Planned. Product code has not been modified for v0.5 at the time this memo is created.
