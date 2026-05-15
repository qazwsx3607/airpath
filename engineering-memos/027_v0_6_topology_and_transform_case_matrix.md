# AirPath v0.6 Topology and Transform Case Matrix

Date: 2026-05-15

Scope: v0.6 Thermal Topology + 3D Containment Volume + Universal Layout Manipulation.

Evidence policy: UI-operable cases were run through Playwright against the app and captured in `engineering-memos/screenshots/v0_6/`. Solver-only semantics that are not directly visible on screen are covered by unit tests and tied to the closest UI/report evidence. All evidence preserves the AirPath disclaimer that this is a simplified pre-sales thermal review model, not certified CFD.

## Automated Evidence

- Playwright suite: `tests/v06-topology-transform.spec.ts`
- Acceptance command: `npm run acceptance`
- Unit tests: `packages/scenario-schema/src/index.test.ts`, `packages/solver-core/src/index.test.ts`, `packages/report-engine/src/index.test.ts`
- Screenshot folder: `engineering-memos/screenshots/v0_6/`

## Topology Cases

| Case | Expected Behavior | Evidence | Status | Notes |
| --- | --- | --- | --- | --- |
| T1: 6 x 2 back-to-back rack rows, central hot aisle, no in-row cooling | Central aisle is detected as hot. | `case_T1_back_to_back_hot_aisle.png`; Playwright `caseT1BackToBackHotAisle`; schema tests for hot aisle detection. | Pass | Detection is row-topology based, not only a floor annotation. |
| T2: 6 x 2 back-to-back rows with two rack slots converted to in-row cooling | Central hot aisle remains detected; in-row modules participate in row topology. | `case_T2_inrow_preserves_hot_aisle.png`; schema test "preserves central hot aisle topology when rack slots become in-row cooling". | Pass | In-row coolers preserve footprint, orientation, row id, and slot index. |
| T3: Contained hot aisle with in-row cooling | Hot streamlines remain visually constrained inside contained aisle and route toward valid sink behavior. | `case_Z4_contained_streamlines.png`; `case_Z1_3d_hot_aisle_volume.png`; Playwright `caseZ1ToZ4ContainedHotAisleVolumeAndAirflow`. | Pass | Streamlines are clamped/terminated by zone bounds in the visual model. This is simplified vector-field visualization, not CFD certification. |
| T4: Face-to-face rack rows | Central cold aisle is detected. | `case_T4_face_to_face_cold_aisle.png`; schema tests for cold aisle detection. | Pass | Face-to-face rule uses row module fronts. |
| T5: Mixed rack orientations | System warns that aisle detection is ambiguous. | `case_T5_mixed_orientation_warning.png`; schema test "warns when a row has mixed front/rear orientation semantics". | Pass | Warning appears in the UI warnings tab after simulation. |
| T6: In-row cooling intake side facing wrong aisle | Topology warning is generated. | Schema test "warns when in-row cooling intake faces away from the detected hot aisle"; related UI evidence `case_G2_G3_move_rotate_inrow.png`. | Pass | The exact intake vector is an internal semantic, so direct proof is unit-level with UI rotation evidence. |
| T7: Contained hot aisle with no cooling sink / return | Warning indicates no valid sink. | Solver test "surfaces topology warnings for contained hot aisles without a valid sink"; related 3D zone evidence `case_Z1_3d_hot_aisle_volume.png`. | Pass | Warning logic is solver/topology-level. A dedicated UI fixture can be added later for a no-sink scenario. |
| T8: Rack inlet temperature sampling | Inlet temperature is sampled near rack front, not rack center. | Solver test "samples rack inlet temperature near the configured rack front side"; report evidence `case_T10_report_topology_summary_full.png`. | Pass | The report states the assumption; unit test verifies the sample point. |
| T9: Rack exhaust heat source | Rack heat is applied nearer rear/exhaust side. | Solver test "applies rack heat nearer the configured rear exhaust side than the front side"; `case_Z6_slice_through_contained_hot_aisle.png`. | Pass | The screenshot shows thermal intensity in the aisle; unit test verifies rear-side bias. |
| T10: Report topology summary | Report identifies aisle type, containment, rack orientation, in-row assumptions, thermal zone generation, warnings. | `case_T10_report_topology_summary.png`; `case_T10_report_topology_summary_full.png`; report-engine unit test. | Pass | Report keeps assumptions and disclaimer visible. |

## 3D Thermal Zone Cases

| Case | Expected Behavior | Evidence | Status | Notes |
| --- | --- | --- | --- | --- |
| Z1: Back-to-back rack rows produce 3D hot aisle volume | 3D View shows transparent hot aisle enclosure / boundary. | `case_Z1_3d_hot_aisle_volume.png` | Pass | Orange contained hot aisle volume and label are visible. |
| Z2: Contained hot aisle with top panel and end boundaries | 3D volume has visible side, top, and end boundary surfaces. | `case_Z1_3d_hot_aisle_volume.png`; `case_T10_report_topology_summary_full.png` | Pass | The volume is extruded to containment height with boundary cues. |
| Z3: Two rack slots converted to in-row cooling | 3D hot aisle volume remains continuous and in-row units are integrated. | `case_T2_inrow_preserves_hot_aisle.png`; `case_Z1_3d_hot_aisle_volume.png` | Pass | The zone is generated from row modules, including in-row modules. |
| Z4: Hot streamlines inside contained hot aisle | Streamlines remain inside the 3D hot aisle volume and do not escape through containment. | `case_Z4_contained_streamlines.png` | Pass | Visual constraints clamp/terminate streamlines at containment bounds. |
| Z5: No valid sink in contained hot aisle | Topology warning appears. | Solver test for `contained-zone-no-sink`; related visual evidence `case_Z1_3d_hot_aisle_volume.png`. | Pass | UI evidence is indirect; solver warning is direct. |
| Z6: Slice through contained hot aisle | Slice heatmap shows thermal distribution and boundary remains visible. | `case_Z6_slice_through_contained_hot_aisle.png` | Pass | Slice plane, thermal scale, and containment boundary are simultaneously visible. |

## Transform Cases

| Case | Expected Behavior | Evidence | Status | Notes |
| --- | --- | --- | --- | --- |
| G1: Move CRAC / CRAH object | Cooling object position updates; simulation becomes stale. | `case_G1_move_crac_or_cooling.png` | Pass | Plan View transform controls operate on cooling objects. |
| G2: Move in-row cooling object | In-row unit remains part of row topology or updates membership. | `case_G2_G3_move_rotate_inrow.png` | Pass | In-row selection, movement, and stale state are visible. |
| G3: Rotate in-row cooling | Intake/supply side updates and warning can appear if orientation is wrong. | `case_G2_G3_move_rotate_inrow.png`; schema in-row mismatch test. | Pass | Rotation updates object orientation and marks results stale. |
| G4: Move containment panel | Thermal zone boundary updates and airflow constraints refresh. | `case_G4_move_containment_panel.png` | Pass | Containment object is selectable and transformable in Plan View. |
| G5: Box-select rack group and mirror | Mirrored row appears with correct orientation and hot/cold detection. | `case_G5_G10_group_mirror_hot_aisle.png` | Pass | Box selection and mirror workflow create a central hot aisle. |
| G6: Use universal transform gizmo in 3D | Selected object/group shows gumball-style transform controls; X/Y movement works. | `case_G6_3d_universal_gumball.png` | Pass | Simplified world + screen gumball is implemented; Z is intentionally locked for floor equipment. |
| G7: Plan View and 3D View synchronization | Moving in one view is reflected in the other. | `case_G7_plan_3d_sync.png` | Pass | Shared store transform actions drive both views. |
| G8: Undo / redo transform | Move/rotate/mirror can be undone and redone. | `case_G8_G9_undo_redo_stale_transform.png`; legacy GUI acceptance test. | Pass | Existing undo stack covers universal transform operations. |
| G9: Transform marks simulation stale | Result panel shows outdated state until rerun. | `case_G8_G9_undo_redo_stale_transform.png`; `case_G1_move_crac_or_cooling.png` | Pass | Stale banner appears after transforms. |
| G10: Mirror central hot aisle layout | Mirror workflow creates back-to-back rows and central hot aisle is detected. | `case_G5_G10_group_mirror_hot_aisle.png` | Pass | Hot aisle generation remains topology-driven after mirror. |

## Remaining Limitations

- The universal gizmo is a simplified Rhino-style equivalent with X/Y axis buttons, an XY move control, and rotation. It does not yet provide full free-drag 3D arrows, custom centerlines, or unrestricted Z transforms. This is acceptable for v0.6 because floor-mounted equipment should remain XY-constrained by default.
- In-row cooling implements Mode A semantics: hot-side return and cold-side supply. Mode B contained recirculation and Mode C custom inlet/outlet are schema-compatible future work, not fully exposed as UI modes.
- Streamline containment is a visualization/topology constraint. It clamps or terminates simplified streamlines at containment boundaries and should not be read as certified CFD behavior.
- Thermal zones are derived from row topology and containment objects. Irregular or conflicting row orientations produce warnings rather than silent classification.
