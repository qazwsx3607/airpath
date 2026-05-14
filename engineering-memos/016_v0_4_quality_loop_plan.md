# Engineering Memo: v0.4 Evidence-Gated Product Quality Loop Plan

Version: v0.4  
Date: 2026-05-15  
Author: Codex  
Area: Planning / Product Quality / QA

## 1. Summary

This plan defines the v0.4 quality loop for bringing AirPath closer to professional pre-sales product quality without expanding scope or making unsupported CFD claims.

The pass is evidence-gated. A category only passes when it is exercised through the UI, documented with browser screenshot evidence, and has no blocker or major usability issue remaining.

## 2. Governing Inputs Read

- `SPEC.md`
- `DESIGN.md`
- `MODEL_ASSUMPTIONS.md`
- `CHECKLIST.md`
- `COMPUTER_USE_ACCEPTANCE.md`
- `engineering-memos/013_v0_2_handoff.md`
- `engineering-memos/014_v0_2_gui_acceptance.md`
- `engineering-memos/015_v0_3_polish_handoff.md`
- Current v0.3 screenshots in `engineering-memos/screenshots/`

## 3. Initial Product-Quality Rubric

Pass gate: evidence equivalent to 9/10 or better. An 8/10 impression is not acceptable.

| Category | Initial Status | Initial Score | Observed Issues | Primary Fix Strategy | Evidence Required |
|---|---:|---:|---|---|---|
| Airflow realism | Fail | 5/10 | Paths have hard angular turns; balls move on rails; motion reads synthetic | Smooth streamlines with Catmull-Rom sampling and replace balls with animated flowing trail segments | Airflow screenshots and UI-operated density/speed/opacity controls |
| Viewport readability | Fail | 7/10 | Analysis views still compete with panels and layers; warning/focus views can crowd object geometry | Add visible layer controls, better defaults, and clearer camera presets | Start, thermal, airflow, warning screenshots |
| Visual layer controllability | Fail | 6/10 | Labels/warnings/grid exist, but airflow/heatmap/slice/dimensions are not managed as a coherent layer system | Add discoverable viewport layer controls and store-backed visibility/opacity settings | Browser operation of each layer control |
| Slice interaction usability | Fail | 3/10 | Slice mode is a fixed horizontal thermal layer with no axis or position controls | Add XZ/XY/YZ axis selection, position slider, visible plane label, and slice state | Slice case screenshot and UI test |
| Manipulation safety | Fail | 6/10 | Rack drag can start from direct pointer/label gestures without an explicit manipulation state | Add lock/select/move mode and disable drag unless Move is active | Drag safety case with undo/redo evidence |
| Report professionalism | Fail | 5/10 | Report resembles a generated demo page; metadata is too thin; no consultant-style cover or structure | Add metadata editor and formal report layout: cover, project info, methodology, assumptions, risk register, appendices | Consultant report screenshots and iframe checks |
| Bilingual UX completeness | Fail | 1/10 | No language switch; UI/report/warnings are English-only | Add English/Chinese language state, UI dictionary, warning/report label localization | Chinese UI and report flow screenshot |
| First external reviewer readiness | Fail | 7/10 | Default is calmer after v0.3, but product still requires owner explanation for slice/report/layers | Improve first-run guidance, controls, and report metadata | Case 01 and Case 09 evidence |
| First-run intuitiveness | Fail | 7/10 | Five-Minute Mode is understandable but control hierarchy is incomplete | Add next-action copy and compact professional controls without adding modal complexity | Case 01 screenshot and friction log |
| Visual design maturity | Fail | 7/10 | Dark cockpit is present but report and advanced visualization feel MVP-level | Tighten report CSS, viewport controls, labels, and professional visual hierarchy | Report and viewport screenshot evidence |
| Emotional usability / perceived polish | Fail | 6/10 | Airflow and report still reveal prototype feel | Make motion calmer, controls intentional, and outputs more client-ready | Before/after visual evidence |
| Pre-sales deliverable credibility | Fail | 5/10 | Metadata and formal report sections are not enough for consultant handoff | Add report metadata, risk register, recommendations, appendices, disclaimer | Consultant report case evidence |

## 4. Implementation Order

1. Planning artifacts
   - Write this plan.
   - Write `engineering-memos/017_v0_4_case_matrix.md`.

2. Data and state model
   - Extend report settings for company, client, case, title, date, revision, logo, and language.
   - Add store state for language, layer visibility, airflow opacity, slice axis/position, and edit mode.

3. Interaction safety and layer controls
   - Add lock/select/move mode.
   - Add visible viewport layer controls.
   - Keep undo/redo behavior intact.

4. Slice usability
   - Implement XZ/XY/YZ thermal slices driven by the solver temperature field.
   - Add slice position slider and readable orientation label.

5. Airflow visualization
   - Smooth vector-field paths with Catmull-Rom sampling.
   - Replace moving sphere particles with animated flowing trail segments.
   - Raise density maximum and add opacity control.

6. Report professionalism
   - Add metadata editor to Report tab.
   - Upgrade report HTML to consultant-style structure and print styling.
   - Preserve model assumptions and disclaimer.

7. English / Chinese foundation
   - Add language toggle.
   - Translate major UI labels, buttons, warnings, report section titles, report metadata labels.
   - Keep technical meaning conservative.

8. Browser evidence loop
   - Extend Playwright acceptance for a representative automated subset and v0.4 screenshots.
   - Execute all 10 case flows through the UI.
   - Inspect screenshots, log friction, fix blockers/major issues, rerun.

9. Handoff
   - Write `engineering-memos/018_v0_4_quality_handoff.md`.
   - Run `npm run test`, `npm run lint`, `npm run build`, `npm run acceptance`.
   - Commit logical checkpoints and push `origin/main`.

## 5. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| v0.4 scope is broad | Could create shallow changes | Prioritize owner symptoms plus evidence-gated category pass/fail |
| i18n could become partial and awkward | Chinese case may fail | Translate major visible UI/report/warning labels and document minor untranslated internals if any |
| Smooth airflow could become decorative | Violates model assumptions | Continue sourcing paths from `result.vectorField` only |
| Report metadata expands schema | Import compatibility risk | Use schema defaults for new fields |
| Slice controls add complexity | Five-minute workflow could feel slower | Keep controls in Review/viewport tools and sensible defaults |

## 6. Acceptance Criteria

v0.4 can only be marked complete if:

- All 10 product-use cases in `017_v0_4_case_matrix.md` are executed or explicitly documented with partial evidence.
- All 12 quality categories have screenshot/browser-flow evidence and pass status.
- No blocker or major UX defect remains.
- `npm run test`, `npm run lint`, `npm run build`, and `npm run acceptance` pass.
- Screenshots are refreshed under `engineering-memos/screenshots/v0_4/`.
- `018_v0_4_quality_handoff.md` is written.
- Final commit is pushed to `origin/main`.

## 7. Initial Status

Status: Planned, implementation not yet started
