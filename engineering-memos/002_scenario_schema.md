# Engineering Memo: Scenario Schema

Version: v0.1  
Date: 2026-05-14  
Author: Codex  
Area: Scenario schema

## 1. Summary

Implemented canonical scenario data structures, validation, rack array generation, units, liquid residual heat, sample files, and JSON import/export helpers.

## 2. Context

`SPEC.md` requires JSON project files with room, racks, cooling, containment, units, simulation settings, report settings, and metadata.

## 3. Work Completed

- [x] Room, rack, rack array, cooling object, containment, units, simulation settings, and report settings schemas.
- [x] Room templates for small, medium, large, and custom workflow.
- [x] Rack array generator with rows, columns, spacing, aisle width, orientation, heat mode, cooling mode, and liquid capture ratio.
- [x] Unit conversions for temperature, airflow, dimension, and heat.
- [x] JSON serialize/deserialize helpers.
- [x] Five sample `.airpath.json` files with expected interpretation metadata.

## 4. Files Changed

```txt
packages/scenario-schema/src/index.ts
packages/scenario-schema/src/index.test.ts
packages/scenario-schema/src/examples.test.ts
examples/scenarios/
```

## 5. Technical Decisions

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| Meters and Celsius internal units | Keeps solver math consistent and conversions explicit. | Mixed internal units; rejected for risk. |
| Zod validation | Catches malformed imported JSON and sample drift. | JSON schema only; deferred. |
| Sample metadata includes interpretation | Satisfies public demo and validation relevance requirements. | Separate markdown per sample; deferred. |

## 6. Product Impact

Users can create, import, export, and validate scenarios without editing raw JSON during normal workflow.

## 7. Simulation / Model Impact

Liquid cooling residual air heat follows the governing formula:

```txt
residual_air_heat = total_it_kw * (1 - liquid_capture_ratio)
```

## 8. UI / Design Impact

Schema defaults drive the Five-Minute Mode room/rack/cooling/containment controls.

## 9. Tests / Checks

```txt
npm run test: pass
```

Covered schema validation, unit conversion, rack array generation, liquid residual heat, JSON round-trip, and sample validation.

## 10. Known Issues

- No published JSON Schema artifact yet.

## 11. Deviations from Governing Docs

No schema deviations.

## 12. Risks

- Scenario version migration is not implemented yet.

## 13. Next Recommended Work

1. Add JSON Schema export.
2. Add scenario migration helpers.
3. Add more invalid import error messages in the UI.

## 14. Handoff Notes

Sample files are valid against the package schema.

## 15. Final Status

Status: Complete
