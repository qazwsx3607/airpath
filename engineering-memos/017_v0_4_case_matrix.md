# Engineering Memo: v0.4 Product-Use Case Matrix

Version: v0.4  
Date: 2026-05-15  
Author: Codex  
Area: Case-Based QA / Product Evidence

## 1. Purpose

This matrix records the v0.4 evidence-gated product-quality cases. Each case was operated through the browser UI with Playwright, screenshot evidence was captured under `engineering-memos/screenshots/v0_4/`, and blocker/major issues found during inspection were fixed and rerun.

## 2. Executed Case Matrix

| Case | Name | UI Flow Exercised | Evidence Path | Final Status |
|---|---|---|---|---|
| 01 | Small server room baseline | Room template, rack array, cooling setup, simulation, report generation | `case01_small_server_room_report.png`, `case01_small_server_room_report_full.png` | Pass |
| 02 | Medium room with cold aisle containment | Sample load, simulation, combined thermal/airflow view, dimensions, A/B compare | `case02_cold_aisle_containment.png` | Pass |
| 03 | Hot aisle containment comparison | Hot aisle sample, simulation, combined view, rack inlet review | `case03_hot_aisle_containment.png` | Pass |
| 04 | Overhead supply / return short-circuit review | Short-circuit sample, warnings panel, airflow mode, high-density streamlines | `case04_overhead_short_circuit_airflow.png` | Pass |
| 05 | Raised floor perforated tile layout | Added floor tile, edited tile airflow and supply temperature in inspector, reran thermal view | `case05_raised_floor_tile_layout.png` | Pass |
| 06 | High-density GPU rack hotspot | GPU sample, thermal heatmap, critical warnings | `case06_high_density_gpu_hotspot.png` | Pass |
| 07 | Hybrid liquid cooling residual heat | Selected rack through labels, set hybrid liquid mode and capture ratio, reran results | `case07_hybrid_liquid_residual_heat.png` | Pass |
| 08 | Poor layout red-team case | Increased rack heat, reran warnings, combined heatmap/airflow/warning view | `case08_poor_layout_red_team.png` | Pass |
| 09 | Consultant report generation | Entered company/client/project/case/title/author/date/revision, uploaded logo, generated report | `case09_consultant_report_generation.png`, `case09_consultant_report_full.png` | Pass |
| 10 | Chinese UI and Chinese report flow | Switched language, operated slice controls, generated Chinese report, inspected localized output | `case10_chinese_slice_controls.png`, `case10_chinese_ui_report_flow.png`, `case10_chinese_report_full.png` | Pass |

## 3. Defect Log

| ID | Case | Severity | Finding | Fix | Retest |
|---|---|---|---|---|---|
| V04-01 | 04, 10 | Major evidence gap | Playwright range helper moved slider thumbs without updating React state, so density/slice screenshots did not prove state changes | Updated range helper to use the native input value setter and asserted density label changed to 180 | `npm run acceptance` passed; `case04_overhead_short_circuit_airflow.png` now shows density 180 |
| V04-02 | 09 | Major evidence gap | Report screenshots mostly showed the metadata editor, not the full consultant report output | Added iframe preview screenshots and full-width generated report screenshots from UI-produced `srcdoc` | `case09_consultant_report_full.png` captured |
| V04-03 | 10 | Major UX issue | Chinese flow still showed English scenario comparison recommendation | Added localized comparison summary and localized report-generation status | `case10_chinese_ui_report_flow.png` shows Chinese recommendation/status |
| V04-04 | 10 | Major UX issue | Chinese report had localized headings but English disclaimer, assumptions, risk messages, and recommendations | Localized report disclaimer, assumptions, warning messages, mitigations, recommendations, and default Chinese report title | `case10_chinese_report_full.png` captured |
| V04-05 | 05 | Major workflow gap | Floor tile supply could not be adjusted through UI; cooling inspector was read-only | Added selected cooling-object editing for supply temperature, airflow, capacity, and enabled state | Case 05 passed through UI |

## 4. Rubric Evidence Mapping

| Quality Category | Evidence | Final Status |
|---|---|---|
| Airflow realism | Cases 04, 08; smoothed vector-field streamlines with density/speed UI | Pass |
| Viewport readability | Cases 02, 05, 06, 10; calmer defaults and layer controls | Pass |
| Visual layer controllability | Cases 02, 04, 05, 10; grid/labels/warnings/heatmap/airflow/dimensions controls | Pass |
| Slice interaction usability | Case 10; XY slice selected and position changed through slider | Pass |
| Manipulation safety | Existing self-acceptance plus move-mode-gated rack dragging, undo/redo | Pass |
| Report professionalism | Cases 01 and 09 full report screenshots | Pass |
| Bilingual UX completeness | Case 10 UI/report evidence | Pass with minor limitation |
| First external reviewer readiness | Cases 01, 09, 10 | Pass |
| First-run intuitiveness | Case 01 | Pass |
| Visual design maturity | Cases 02, 06, 09, 10 | Pass |
| Emotional usability / perceived polish | Cases 04, 09, 10 | Pass |
| Pre-sales deliverable credibility | Cases 02, 03, 09 | Pass |

## 5. Remaining Minor Limitations

- Slice plane position is adjusted by slider rather than direct 3D drag. This is acceptable for v0.4 because the orientation and position are visible, precise, and operated through UI; no blocker usability issue remains.
- Some equipment names, rack IDs, cooling type enum values, and standard acronyms remain English in Chinese reports. This is acceptable because they are identifiers or industry terms; labels, report sections, warnings, recommendations, assumptions, and disclaimer are localized.
- High-density airflow views can be intentionally cluttered at density 180. Default density remains calmer; the high-density case exists to prove the upper range.

## 6. Execution Status

Status: Pass. All 10 required product-use cases were executed through the UI and rerun after fixes.
