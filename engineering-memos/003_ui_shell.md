# Engineering Memo: UI Shell and Workflow

Version: v0.1  
Date: 2026-05-14  
Author: Codex  
Area: UI / Design implementation

## 1. Summary

Implemented the AirPath dark cockpit UI, Five-Minute Mode wizard, 3D viewport, inspector/results/warnings/report panel, bottom comparison bar, import/export, and report preview.

## 2. Context

`DESIGN.md` requires a dark technical cockpit, central 3D viewport, collapsible panels, compact professional density, and no decorative airflow or rainbow heatmap.

## 3. Work Completed

- [x] Top bar with project, sample loading, view mode selector, JSON import/export, simulation, report actions.
- [x] Left Five-Minute Mode wizard for room, rack array, cooling, containment, and review.
- [x] Right panel tabs for inspector, results, warnings, and report.
- [x] Bottom scenario comparison bar.
- [x] Collapsible left, right, and bottom panels.
- [x] Single and multi-rack selection through 3D labels/shift-click; batch heat/cooling edits; move/resize/delete controls.
- [x] Browser acceptance fixed two workflow defects: cooling and containment now stay in their respective setup steps after adding objects.

## 4. Files Changed

```txt
apps/web/src/App.tsx
apps/web/src/store.ts
apps/web/src/components/LeftPanel.tsx
apps/web/src/components/RightPanel.tsx
apps/web/src/components/ScenarioBar.tsx
apps/web/src/styles.css
```

## 5. Technical Decisions

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| Five-Minute Mode as default first screen | Directly supports the product promise. | Landing page; rejected. |
| Compact panel forms | Keeps viewport central and avoids CFD parameter wall. | Full-page forms; rejected. |
| Inspector move/resize controls | Provides reliable editing for first build. | Full drag manipulation; deferred. |

## 6. Product Impact

The workflow can create a useful room/rack/cooling/containment/simulation/report path in a browser acceptance run.

## 7. Simulation / Model Impact

UI consumes scenario and simulation outputs from packages; it does not own solver logic.

## 8. UI / Design Impact

Follows the dark cockpit direction and uses semantic warnings with icon, text, and color.

## 9. Tests / Checks

```txt
npm run acceptance: pass
Screenshots: engineering-memos/screenshots/
```

## 10. Known Issues

- Direct drag-on-floor 3D movement is not implemented; inspector movement buttons are available.
- Undo/redo keyboard shortcuts are not implemented.

## 11. Deviations from Governing Docs

See `engineering-memos/008_deviations.md`.

## 12. Risks

- Advanced editing needs richer object manipulation and validation messaging.

## 13. Next Recommended Work

1. Add drag handles and floor-plane movement.
2. Add undo/redo command history.
3. Add keyboard shortcut coverage.

## 14. Handoff Notes

Visual defects found during acceptance were fixed before final checks.

## 15. Final Status

Status: Complete with limitations
