# Engineering Memo: v0.6 Thermal Topology and Universal Transform Plan

Version: v0.6
Date: 2026-05-15
Author: Codex
Area: Architecture / Solver / Visualization / UI / Testing

## 1. Summary

v0.6 upgrades AirPath from rack-centric layout helpers to a consistent thermal topology and transform model. The work focuses on row modules, in-row cooling continuity, hot/cold aisle detection, 3D thermal zone volumes, containment-constrained streamlines, topology warnings, and object-agnostic move/rotate/mirror behavior.

The product boundary remains unchanged: AirPath is a five-minute pre-sales thermal review tool, not certified CFD, not OpenFOAM, not multi-room, and not a construction approval product.

## 2. Current Gaps

| Area | Observed Gap | Product Impact |
|---|---|---|
| Data model | Racks carry front/rear semantics, but in-row cooling does not preserve row membership, slot index, orientation, intake side, or supply side. | Converting rack slots to in-row cooling can break aisle/topology reasoning. |
| Aisle detection | `detectAisles` is pairwise and rack-only. It detects adjacent rack pairs but does not understand row modules or converted slots. | A 6 x 2 row can lose hot aisle continuity when slots become in-row units. |
| In-row conversion | Conversion removes racks and creates independent cooling objects with only position, size, and direction. | The row still looks visually aligned, but domain topology no longer knows the slot belongs to the row. |
| 3D containment volume | Plan View aisle zones are 2D floor rectangles. 3D View shows containment objects if added, but not generated thermal-zone volumes tied to detected aisles. | Users cannot see the hot aisle boundary / thermal enclosure / 熱通道結界 as a domain object. |
| Containment boundary | Solver containment reduces crossing influence, but airflow streamlines are traced through the vector field without topology-bound clipping. | Streamlines can visually escape contained hot aisles, reducing trust. |
| Streamline domain | Airflow paths are vector-field driven, but seeds are grid-distributed rather than explicitly seeded from rack rear exhaust and cooling supply/return topology. | Airflow visuals can look plausible but not explicitly governed by rack front/rear and thermal zones. |
| Object manipulation | Plan View box select and move are rack-focused. Cooling and containment can be selected, but transforms are not universal. 3D drag is rack-specific. | The layout editor cannot support a true five-minute workflow once cooling, containment, and thermal objects must be adjusted. |
| Report topology | Report describes cooling and containment tables, but not detected topology, in-row assumptions, thermal zone generation, or containment-constrained airflow. | Consultant deliverable lacks traceability for the domain model. |

## 3. Required Architecture Changes

### Scenario Schema / Topology Layer

- Add optional semantic fields to cooling objects:
  - `orientation`
  - `rowId`
  - `slotIndex`
  - `rowModuleType`
  - `intakeSide`
  - `supplySide`
  - `coolingModeSemantic`
- Introduce reusable topology types and helpers:
  - `RowModule`
  - `ThermalZone`
  - `TopologyWarning`
  - `buildRowModules(scenario)`
  - `detectAislesFromTopology(scenario)`
  - `buildThermalZones(scenario)`
  - `analyzeThermalTopology(scenario)`
  - `pointInThermalZone(point, zone)`
  - `clampPointToThermalZone(point, zone)`
- Keep old scenario JSON compatible by making new fields optional and deriving row membership where possible.
- Preserve `detectAisles` as a compatibility wrapper that delegates to topology-aware aisle detection.

### Solver Core

- Use rack rear side for heat source placement and rack front side for inlet sampling. v0.5 already does this for racks; v0.6 will retain it and add tests.
- Add in-row cooling semantics:
  - intake/return side faces hot aisle by default,
  - supply side faces cold aisle / rack fronts by default,
  - Mode A implemented first: hot-side return plus cold-side supply,
  - Mode B/C documented as limitations if not fully exposed in UI.
- Append topology warnings to simulation warnings:
  - ambiguous aisle orientation,
  - in-row intake not facing hot aisle,
  - contained hot aisle without valid sink,
  - rack exhaust not connected to hot aisle,
  - missing generated 3D thermal zone.
- Preserve conceptual, deterministic behavior and model assumptions.

### Visualization Layer

- Render detected thermal zones as 3D extruded volumes:
  - hot aisle: transparent orange/red volume with edges,
  - cold aisle: transparent blue/cyan volume with edges,
  - contained aisles: side boundaries, top cap, and end boundary cues.
- Keep thermal-zone boundaries visible in slice mode.
- Add thermal-zone visibility controls:
  - zones,
  - containment panels,
  - labels,
  - boundary opacity / airflow boundary cue.
- Constrain streamlines that originate inside contained zones:
  - clamp or terminate at zone boundary,
  - bias hot exhaust paths toward valid in-row/return sinks where available,
  - never casually draw contained hot aisle flow escaping through panels.

### Transform Architecture

- Add a universal transform model in the store:
  - selection may include racks, cooling objects, and containment objects,
  - move selected objects,
  - rotate selected objects where meaningful,
  - mirror selected objects and groups,
  - preserve undo/redo and stale-result marking.
- Plan View:
  - box-select racks, cooling objects, and containment objects,
  - move group with existing snap grid,
  - rotate and mirror selected object groups,
  - display group bounding box from all transformable objects.
- 3D View:
  - add a simplified Rhino-style gumball equivalent for selected objects/groups,
  - expose X/Z axis movement, XY plane movement, and rotation handle,
  - keep rack lock/select/move safety model,
  - default floor-mounted objects to XY movement only.
- Derived thermal zones regenerate after transforms rather than being directly edited as persisted geometry.

### Report Layer

- Add a topology summary section:
  - detected aisle type,
  - containment type,
  - rack front/rear assumption,
  - in-row intake/supply assumption,
  - whether 3D thermal zones were generated,
  - whether airflow visualization was constrained by containment,
  - topology warnings.

## 4. Execution Order

1. Schema/topology foundation:
   - row module types,
   - topology-aware aisle detection,
   - thermal zone generation,
   - topology warnings.
2. Unit tests for topology:
   - hot aisle survives in-row conversion,
   - cold aisle detection,
   - mixed-orientation warning,
   - thermal zone generation.
3. Store integration:
   - derived topology state,
   - universal move/rotate/mirror actions,
   - in-row conversion preserving row module semantics,
   - stale-result updates.
4. Solver integration:
   - in-row intake/supply source/sink points,
   - topology warnings in result warnings.
5. Plan View integration:
   - universal box selection,
   - all-object group move,
   - rotate/mirror controls,
   - topology zones in plan.
6. 3D View integration:
   - thermal zone volumes,
   - gumball-style transform gizmo,
   - containment-constrained streamlines.
7. Report integration:
   - topology summary section and tests.
8. Playwright evidence:
   - v0.6 case matrix,
   - screenshots under `engineering-memos/screenshots/v0_6/`.
9. Full validation:
   - `npm run test`,
   - `npm run lint`,
   - `npm run build`,
   - `npm run acceptance`.
10. Handoff:
   - final memo,
   - logical commits,
   - push origin/main,
   - Telegram updates.

## 5. Acceptance Cases

Required evidence matrix will be documented in `engineering-memos/027_v0_6_topology_and_transform_case_matrix.md`.

Minimum required cases:

- T1: 6 x 2 back-to-back rack rows produce a central hot aisle.
- T2: converting two rack slots to in-row cooling preserves the central hot aisle.
- T3: contained hot aisle with in-row cooling keeps hot streamlines inside and terminating at in-row return side.
- T4: face-to-face rows produce a central cold aisle.
- T5: mixed orientations produce topology warning.
- T6: in-row intake facing wrong aisle produces topology warning.
- T7: contained hot aisle without valid sink produces topology warning.
- T8: rack inlet temperature samples front side.
- T9: rack exhaust heat applies at rear side.
- T10: report includes topology summary.
- Z1-Z6: 3D thermal zone volume, contained boundaries, in-row continuity, constrained streamlines, sink warning, slice heatmap boundary.
- G1-G10: move CRAC, move/rotate in-row, move containment, box-select/mirror group, 3D gumball, Plan/3D sync, undo/redo, stale state, mirrored central hot aisle.

## 6. Risks and Limits

| Risk | Mitigation |
|---|---|
| Row inference may be imperfect for irregular layouts. | Use explicit row fields where generated by AirPath and deterministic clustering as fallback. Emit topology warnings on ambiguity. |
| Universal 3D gizmo can become complex. | Implement a simplified gumball-equivalent with clear axis/plane/rotate handles and Playwright evidence. Keep Plan View the primary fast editor. |
| Thermal-zone containment constraints may overstate physical precision. | Document that constraints affect conceptual streamline visualization and solver boundaries, not certified CFD. |
| In-row cooling modes B/C may be too large for this pass. | Implement Mode A with extensible schema and document Mode B/C as accepted limitations if not fully exposed. |
| Derived thermal zones could conflict with manual containment objects. | Treat thermal zones as derived domain objects; use containment objects to mark contained state and boundaries. |

## 7. Final Status

Status: Plan complete. Implementation pending.
