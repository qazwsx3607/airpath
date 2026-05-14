# Engineering Memo: v0.3 Polish Handoff

Version: v0.3  
Date: 2026-05-14  
Author: Codex  
Area: UI / Visualization / Testing / Final Handoff

## 1. Summary

Completed a v0.3 polish pass focused on making AirPath cleaner, safer to manipulate, more visually controllable, and more suitable for a first external reviewer without expanding product scope.

## 2. Context

The owner goal was to treat observed issues as symptoms rather than a fixed checklist. The pass focused on visual clutter, manipulation safety, default demo posture, report clarity, and acceptance evidence.

Relevant governing documents:

- `SPEC.md`
- `DESIGN.md`
- `MODEL_ASSUMPTIONS.md`
- `AGENTS.md`
- `CODEX.md`
- `CHECKLIST.md`
- `COMPUTER_USE_ACCEPTANCE.md`

## 3. Work Completed

- [x] Changed the default viewport to Solid mode instead of Combined mode.
- [x] Added explicit topbar controls for object labels and warning pins.
- [x] Restricted automatic object labels to layout/editing views so thermal and airflow reviews are less cluttered.
- [x] Made warning pins opt-in outside the warnings tab and kept clustered warning details in the right panel.
- [x] Tuned airflow default density and opacity for review readability.
- [x] Added heatmap opacity control in Review mode.
- [x] Changed Solid/Airflow rack material to neutral layout coloring while preserving thermal tinting in thermal views.
- [x] Added rack drag snapping to 0.05 m increments to reduce jitter during direct manipulation.
- [x] Added camera presets/reset behavior for thermal, airflow, report, and warning focus flows.
- [x] Cleared warning focus during report screenshot capture so generated reports start from clean layout, thermal, and airflow views.
- [x] Rebalanced the default baseline scenario to open with no critical warnings and positive cooling margin.
- [x] Updated Playwright acceptance to cover the v0.3 visual controls and avoid brittle object ordinal assumptions.
- [x] Regenerated and inspected acceptance screenshots.

## 4. Files Changed

```txt
apps/web/src/App.tsx
apps/web/src/components/LeftPanel.tsx
apps/web/src/components/Viewport3D.tsx
apps/web/src/reportCapture.ts
apps/web/src/store.ts
apps/web/src/styles.css
packages/scenario-schema/src/index.ts
tests/acceptance.spec.ts
engineering-memos/015_v0_3_polish_handoff.md
```

## 5. Technical Decisions

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| Solid mode uses neutral rack materials | Prevents the app from looking like a thermal failure before a user chooses thermal review. | Keep risk tint in all modes; rejected as visually misleading. |
| Labels are explicit and layout-focused | Keeps editing discoverability without cluttering thermal and airflow analysis views. | Always show labels; caused clutter. |
| Warning pins are opt-in except on Warnings tab | Keeps the default viewport clean while preserving warning review. | Hide pins entirely; rejected because warning localization matters. |
| Rebalance default baseline | The app should open in a plausible non-critical demo state. | Leave critical default; rejected for first-reviewer readiness. |
| Camera reset before report capture | Prevents warning focus or close camera positions from contaminating report screenshots. | Use current camera; rejected after screenshot inspection. |

## 6. Product Impact

- Five-minute workflow is intact.
- Native 3D review is less visually noisy by default.
- Thermal, airflow, warnings, and report views remain available and solver-driven.
- The default demo now starts with a calmer baseline: max inlet 31.2 C, average inlet 28.4 C, 7 warnings, 0 critical, and +68.0 kW cooling margin.
- Report preview is cleaner and does not inherit warning-focus camera positions.

## 7. Simulation / Model Impact

No solver formulas or model claims changed.

The default scenario data changed:

- Default rack array changed from 2 x 6 at 10 kW/rack to 2 x 4 at 4 kW/rack.
- Default baseline now includes CRAC/CRAH, floor tile, ceiling supply, in-row cooling, and ceiling return.

This is a demo posture change, not a change to `MODEL_ASSUMPTIONS.md`.

## 8. UI / Design Impact

- Dark cockpit theme remains.
- Light report theme remains.
- Thermal scale remains non-rainbow.
- Labels, warnings, airflow density, and heatmap intensity are now more controllable.
- Report view now presents a clean layout scene beside the report preview.

## 9. Tests / Checks

```txt
npm run lint: pass
npm test: pass, 17 tests
npm run build: pass
npm run acceptance: pass, 1 Playwright Chromium flow
```

Browser acceptance used the Playwright fallback path from `COMPUTER_USE_ACCEPTANCE.md`.

Screenshots inspected:

```txt
engineering-memos/screenshots/01_start_template.png
engineering-memos/screenshots/02_rack_array.png
engineering-memos/screenshots/03_cooling_setup.png
engineering-memos/screenshots/05_thermal_view.png
engineering-memos/screenshots/06_airflow_view.png
engineering-memos/screenshots/07_warnings.png
engineering-memos/screenshots/08_report.png
engineering-memos/screenshots/09_scenario_compare.png
```

## 10. Issues Found and Fixed

| Issue | Severity | Fix Applied | Retest |
|---|---|---|---|
| Default screen opened in a visually critical state | Major | Rebalanced default baseline and neutralized Solid mode rack coloring | Passed |
| Thermal/airflow views inherited editing labels | Major | Restricted automatic labels to Solid layout/editing views | Passed |
| Report view inherited warning-focus camera state | Major | Cleared focus before report capture and added camera presets | Passed |
| Warning pins cluttered default viewport | Major | Made pins opt-in except Warnings tab and compacted cluster UI | Passed |
| Direct rack drag was too granular | Minor | Added 0.05 m snapping during drag preview | Passed |
| Acceptance expected fixed in-row cooler ordinal | Minor | Matched the added-cooler status by behavior instead of ordinal | Passed |

## 11. Known Issues

- Direct drag remains rack-only from v0.2. Cooling and containment direct drag are not added in v0.3 to avoid scope expansion.
- Airflow in dense, highly warned scenarios can still be visually busy, but density is adjustable and the default is lower.
- Object labels are intentionally constrained to layout-oriented modes unless future UX work designs a better analysis-label layer.

## 12. Deviations from Governing Docs

No governing-document deviations were introduced.

## 13. Risks

- The default baseline is now calmer, so reviewers should use the high-density sample or create a higher-kW rack array when demonstrating severe warning behavior.
- The report camera reset improves consistency but is still a browser viewport capture, not a separate offscreen render pipeline.

## 14. Handoff Notes

Run locally:

```txt
npm install
npm run dev
```

Verify:

```txt
npm run lint
npm test
npm run build
npm run acceptance
```

## 15. Final Status

Status: Complete with limitations
