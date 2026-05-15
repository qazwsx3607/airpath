# AirPath v0.6 Handoff

Date: 2026-05-15

Status: Acceptable for v0.6 scope after evidence-gated validation.

## Scope Delivered

v0.6 upgrades AirPath from rack-only layout manipulation and 2D aisle annotations toward a shared thermal topology and object transform model.

Delivered:

- Row-module topology for racks and in-row cooling modules.
- Hot/cold aisle detection based on row module front/rear semantics.
- In-row cooling conversion preserves row continuity, slot position, orientation, intake side, and supply side.
- 3D thermal zone volumes generated from detected hot/cold aisles and containment.
- Contained hot aisle visualization with transparent orange volume, boundary cues, top/end surfaces, and labels.
- Thermal zone layer controls for zones, labels, boundaries, and opacity.
- Containment-aware streamline constraints for hot aisle visualization.
- Rack rear heat-source placement and rack front inlet-temperature sampling in solver logic.
- Topology warnings for ambiguous row orientation, in-row intake mismatch, and contained hot aisle without valid sink.
- Report thermal topology summary covering detected aisles, 3D zones, rack orientation assumptions, in-row assumptions, containment airflow constraint, and topology warnings.
- Universal transform actions for racks, in-row cooling, cooling equipment, containment, and selected groups.
- Plan View box selection, group move, group mirror, object rotate, containment move, cooling move, and stale simulation integration.
- Simplified 3D gumball-style transform controls for selected objects/groups.

## Validation

Passed on 2026-05-15:

- `npm run test`
  - 4 test files passed.
  - 27 tests passed.
- `npm run lint`
  - TypeScript project build passed.
- `npm run build`
  - Production Vite build passed.
- `npm run acceptance`
  - 4 Playwright tests passed.
  - Legacy GUI self-acceptance passed.
  - v0.4 quality acceptance passed.
  - v0.5 layout authoring acceptance passed.
  - v0.6 topology/transform acceptance passed.

Primary evidence:

- Case matrix: `engineering-memos/027_v0_6_topology_and_transform_case_matrix.md`
- Screenshots: `engineering-memos/screenshots/v0_6/`
- Automated suite: `tests/v06-topology-transform.spec.ts`

## Screenshot Review

Reviewed current v0.6 screenshots:

- `case_T2_inrow_preserves_hot_aisle.png`
  - Two converted in-row modules remain selected in Plan View.
  - Detected central hot aisle remains visible.
  - Simulation stale banner appears after topology-changing edit.
- `case_Z1_3d_hot_aisle_volume.png`
  - 3D View shows transparent contained hot aisle volume, label, boundary cues, active zone controls, and colorbar.
- `case_Z4_contained_streamlines.png`
  - Airflow streamlines are drawn in the contained zone context and do not casually cross the containment boundary.
- `case_Z6_slice_through_contained_hot_aisle.png`
  - Slice heatmap, containment boundary, and thermal colorbar remain visible together.
- `case_G6_3d_universal_gumball.png`
  - Simplified universal transform controls are visible in 3D with selected group context.
- `case_T10_report_topology_summary_full.png`
  - Report includes consultant-style topology summary, visual evidence, risk register, assumptions, and disclaimer.

## Architecture Notes

- `packages/scenario-schema` now owns the shared row-module and thermal-topology model.
- `packages/solver-core` consumes topology warnings and uses front/rear rack semantics for heat and inlet sampling.
- `apps/web/src/store.ts` centralizes universal transform actions and stale-result marking.
- Plan View and 3D View consume the same transform state rather than separate rack-only manipulation logic.
- 3D thermal zones are derived from scenario topology and rendered as visual/simulation boundary context.

## Limitations

- The 3D transform gizmo is a simplified Rhino-style equivalent. It supports X/Y movement and rotation through visible controls, with Z movement intentionally locked for floor-mounted equipment. Full free-drag arrows and custom centerline transforms remain future work.
- In-row cooling Mode A is implemented: hot-side return and cold-side supply. Mode B closed-loop contained recirculation and Mode C custom inlet/outlet are modeled as future-compatible concepts, not full UI workflows.
- Streamline containment is simplified visualization logic over the existing vector-field approximation. It constrains, clamps, or terminates paths for pre-sales review; it is not a certified CFD boundary solver.
- Thermal zones are generated from detected aisle topology and containment objects. Highly irregular layouts may produce topology warnings instead of automatic classification.
- Some solver-facing semantics, such as exact rack inlet sample point and rack rear heat source point, are validated by unit tests because they are internal numerical model details rather than directly inspectable UI affordances.

## Completion Assessment

v0.6 is acceptable under the requested constraints:

- In-row cooling no longer breaks hot aisle detection.
- Rack front/rear semantics are used by solver and visualization.
- Hot/cold aisle detection uses row topology.
- 3D thermal zones and contained hot aisle boundaries are visible.
- Contained airflow visualization respects thermal zone boundaries.
- Major layout objects are transformable through shared transform actions.
- Transform operations refresh topology and mark simulation results stale.
- Evidence cases are documented.
- Build, test, lint, and acceptance pass.

The remaining limitations are bounded and documented. They do not expand AirPath into full CFD, BIM, backend services, or certified engineering approval.
