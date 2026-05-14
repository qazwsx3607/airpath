# Engineering Memo: Visualization

Version: v0.1  
Date: 2026-05-14  
Author: Codex  
Area: Visualization

## 1. Summary

Implemented native 3D room rendering, racks, cooling objects, containment, thermal slice heatmap, airflow streamlines/particles, warning pins, and fixed-size labels.

## 2. Context

`DESIGN.md` and `MODEL_ASSUMPTIONS.md` require simulation-driven heatmaps and airflow particles, no rainbow heatmap, and readable warning UI.

## 3. Work Completed

- [x] React Three Fiber viewport with room boundary and floor grid.
- [x] Racks colored by rack inlet risk.
- [x] Cooling and return objects with direction arrows.
- [x] Transparent cold/hot containment panels.
- [x] Thermal slice generated from solver temperature field.
- [x] Airflow streamlines and animated particles generated from solver vector field.
- [x] Warning pins tied to solver warnings.
- [x] Fixed oversized object-label issue found during screenshot inspection.

## 4. Files Changed

```txt
apps/web/src/components/Viewport3D.tsx
apps/web/src/styles.css
```

## 5. Technical Decisions

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| Three mesh thermal slice | Practical for first build and still field-driven. | Custom shader heatmap; deferred. |
| Streamline traces from vector field | Avoids decorative airflow. | Static decorative curves; rejected. |
| Fixed screen-size labels | Prevents camera focus from creating huge labels. | Distance-scaled labels; caused visual defect. |

## 6. Product Impact

The viewport can support pre-sales review screenshots and conveys simulation outputs directly.

## 7. Simulation / Model Impact

Visualization consumes solver fields and rack risk outputs.

## 8. UI / Design Impact

Uses semantic cyan/slate/amber/orange/red thermal colors and avoids rainbow heatmaps.

## 9. Tests / Checks

```txt
npm run acceptance: pass
Screenshots: engineering-memos/screenshots/05_thermal_view.png, 06_airflow_view.png
```

## 10. Known Issues

- Heatmap is mesh-cell based, not a custom WebGL shader.
- Warning-heavy scenarios can visually crowd the viewport.

## 11. Deviations from Governing Docs

See `engineering-memos/008_deviations.md`.

## 12. Risks

- Dense warnings may obscure the viewport in high-risk scenarios.

## 13. Next Recommended Work

1. Add warning clustering/filtering.
2. Add true shader-based thermal plane.
3. Add report screenshot capture from the canvas.

## 14. Handoff Notes

Screenshots were visually inspected after acceptance.

## 15. Final Status

Status: Complete with limitations
