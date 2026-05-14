# Engineering Memo: Solver Core

Version: v0.1  
Date: 2026-05-14  
Author: Codex  
Area: Solver

## 1. Summary

Implemented a simplified 3D voxel/grid airflow and heat approximation with temperature field, vector field, rack inlet estimates, metrics, and warnings.

## 2. Context

`MODEL_ASSUMPTIONS.md` requires a transparent conceptual model and forbids certified CFD claims.

## 3. Work Completed

- [x] 3D grid generation by quality preset.
- [x] Heat source contributions from rack residual air heat and CDU residual heat.
- [x] Cooling source contributions from CRAC/CRAH, in-row, floor tile, ceiling supply, and wall supply.
- [x] Return attraction from ceiling/wall/CRAC return paths.
- [x] Rack and containment obstacle/barrier effects.
- [x] Temperature diffusion approximation.
- [x] Rack inlet temperature estimation.
- [x] Warning generation for required warning categories.
- [x] Validation tests for required model behaviors.

## 4. Files Changed

```txt
packages/solver-core/src/index.ts
packages/solver-core/src/index.test.ts
```

## 5. Technical Decisions

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| Deterministic grid solver | Easy to test and fast enough for pre-sales review. | Full CFD/Navier-Stokes; out of scope. |
| Influence fields plus diffusion | Produces directional risk behavior without unsupported accuracy claims. | Pure visual heuristics; rejected. |
| Warnings as risk indicators | Matches assumptions and report tone. | Certified pass/fail language; rejected. |

## 6. Product Impact

Simulation runs fast enough for the UI and produces fields that drive heatmap, streamlines, rack coloring, metrics, and warnings.

## 7. Simulation / Model Impact

The solver follows the documented simplified approximation and returns the governing disclaimer with every result.

## 8. UI / Design Impact

Airflow particles and heatmap are driven by solver vector and temperature fields.

## 9. Tests / Checks

```txt
npm run test: pass
```

Validation cases cover heat source, cooling source, obstacle weakening, containment mixing reduction, increased rack kW, higher airflow, liquid capture ratio, and warning generation.

## 10. Known Issues

- The model is conceptual and not calibrated to real CFD data.
- Containment geometry is simplified to axis-aligned barriers.

## 11. Deviations from Governing Docs

No solver-claim deviations. Model limitations are visible in UI/report/memos.

## 12. Risks

- Users may overinterpret numeric temperatures; disclaimer and assumptions are displayed to reduce that risk.

## 13. Next Recommended Work

1. Add calibration examples against known benchmark scenarios.
2. Add solver adapter interface.
3. Add more local warning severity tuning.

## 14. Handoff Notes

No certified CFD, construction, commissioning, compliance, SLA, or exact prediction claims were added.

## 15. Final Status

Status: Complete with limitations
