# Engineering Memo: Architecture

Version: v0.1  
Date: 2026-05-14  
Author: Codex  
Area: Architecture

## 1. Summary

Implemented AirPath in product layers: schema, solver core, report engine, examples, and React/Three UI.

## 2. Context

`AGENTS.md` forbids mixing simulation logic directly into UI components. `SPEC.md` requires future solver adapters to remain possible.

## 3. Work Completed

- [x] `@airpath/scenario-schema` owns scenario types, validation, rack generation, units, and JSON helpers.
- [x] `@airpath/solver-core` owns the voxel approximation, temperature field, vector field, rack inlet estimates, and warnings.
- [x] `@airpath/report-engine` owns report data, comparison metrics, HTML output, print styling, assumptions, and disclaimer.
- [x] `apps/web` consumes package APIs through Zustand state and React components.
- [x] `examples/scenarios` contains five importable `.airpath.json` samples.

## 4. Files Changed

```txt
packages/scenario-schema/src/index.ts
packages/solver-core/src/index.ts
packages/report-engine/src/index.ts
apps/web/src/
examples/scenarios/
```

## 5. Technical Decisions

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| Zod schema package | Runtime validation protects JSON import/export and sample files. | Types only; rejected because JSON import needs runtime checks. |
| Deterministic TypeScript solver | Fast enough for first build and testable independently. | WebGPU/WASM/OpenFOAM adapters; deferred. |
| Zustand app store | Keeps UI actions centralized and avoids solver logic in components. | Component-local state only; rejected due workflow complexity. |

## 6. Product Impact

The app supports the core 5-minute workflow and separates claims, model behavior, and presentation enough for credible public iteration.

## 7. Simulation / Model Impact

Architecture enables solver replacement later while preserving UI contracts.

## 8. UI / Design Impact

The UI is a dark technical cockpit with collapsible left, right, and bottom panels and a central native 3D viewport.

## 9. Tests / Checks

```txt
npm run build: pass
npm run test: pass
npm run lint: pass
npm run acceptance: pass
```

## 10. Known Issues

- Production bundle is large due the 3D stack.

## 11. Deviations from Governing Docs

See `engineering-memos/008_deviations.md`.

## 12. Risks

- Future advanced editing can stress the single Zustand store; selectors and slice organization may be needed.

## 13. Next Recommended Work

1. Add package-level API docs.
2. Add future adapter interfaces for WebGPU/WASM.
3. Split app bundle by route or feature.

## 14. Handoff Notes

No simulation-critical behavior is implemented only as visual decoration.

## 15. Final Status

Status: Complete with limitations
