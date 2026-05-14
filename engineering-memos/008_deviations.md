# Engineering Memo: Deviations

Version: v0.1  
Date: 2026-05-14  
Author: Codex  
Area: Deviation

## 1. Summary

Documented first-build limitations and deviations from the governing documents.

## 2. Context

`CODEX.md` requires deviations to be recorded instead of silently omitted.

## 3. Work Completed

- [x] Reviewed implementation against `SPEC.md`, `DESIGN.md`, `MODEL_ASSUMPTIONS.md`, and `CHECKLIST.md`.
- [x] Classified deviations and next actions.

## 4. Files Changed

```txt
engineering-memos/008_deviations.md
```

## 5. Technical Decisions

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| Ship first build with documented limitations | Core 5-minute workflow is usable and tested. | Block final handoff until every advanced interaction exists; not practical for first build. |

## 6. Product Impact

Core workflow is available, but some advanced editing and report-capture features need future work.

## 7. Simulation / Model Impact

No forbidden CFD accuracy claims were introduced.

## 8. UI / Design Impact

UI follows the required style, with documented gaps in direct manipulation and automated report screenshots.

## 9. Tests / Checks

```txt
npm run build: pass
npm run test: pass
npm run lint: pass
npm run acceptance: pass
```

## 10. Known Issues

See deviations table.

## 11. Deviations from Governing Docs

| Requirement | Actual Implementation | Reason | Risk | Requires Human Review |
|---|---|---|---|---|
| Computer Use preferred for GUI acceptance | Playwright fallback was used | Computer Use tool was not available in this session | Low; fallback is explicitly allowed | No |
| WebGL shader-based heatmap where practical | Three.js mesh-cell thermal slice from temperature field | Faster first build with transparent data linkage | Medium; shader polish/performance deferred | No |
| Report should include/support layout, thermal, airflow screenshots | Acceptance screenshots are captured; report HTML has screenshot placeholders | Canvas capture/embedding not implemented yet | Medium for customer-ready reports | Yes before public demo |
| Drag selected object on floor plane | Inspector move buttons and clickable 3D selection exist; direct drag not implemented | Stable first-build editing path | Medium for ergonomics | No |
| Undo/redo keyboard shortcuts | Not implemented | Command history deferred | Low for first build, medium for editing depth | No |
| Manual panel drawing | Preset/manual panel add buttons and auto-generation exist; freehand drawing not implemented | Freehand editing deferred | Low to medium | No |
| Full object field editing for cooling/containment | Core fields display; direct editing is limited | First build prioritized workflow and solver linkage | Medium | No |
| Public demo deployment | App is deployable but no deployment config was added | Out of scope for local build cycle | Low | No |
| Bundle size optimization | Vite build passes with chunk-size warning | Three.js stack bundled into first app | Low now, medium for public demo performance | No |

## 12. Risks

- Report screenshot automation is the main gap before a polished public demo.
- Direct manipulation gaps can slow expert editing.

## 13. Next Recommended Work

1. Add canvas screenshot capture and embed screenshots in report HTML.
2. Add direct object drag and command history.
3. Add shader thermal slice and warning clustering.
4. Add deployment config.

## 14. Handoff Notes

No blocker remains for local self-acceptance. Status is accepted with limitations, not fully complete.

## 15. Final Status

Status: Complete with limitations
