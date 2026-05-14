# CHECKLIST.md｜AirPath Review and Handoff Checklist

Version: v0.1  
Product: AirPath  
Status: Governing checklist for Codex self-review and human review.

---

## 1. Product Mission Checklist

- [ ] User can start from template.
- [ ] User can create a custom room.
- [ ] User can create rack arrays.
- [ ] User can add cooling objects.
- [ ] User can add containment.
- [ ] User can run simulation.
- [ ] User can review warnings.
- [ ] User can export report.
- [ ] Default workflow supports a 5-minute pre-sales review.
- [ ] UI does not require raw JSON editing for normal use.

---

## 2. Architecture Checklist

- [ ] UI is separated from solver logic.
- [ ] Scenario schema is separated from UI.
- [ ] Report engine is separated from UI where practical.
- [ ] Solver core can be tested independently.
- [ ] Future solver adapters are possible.
- [ ] TypeScript types are used for scenario and simulation objects.
- [ ] No simulation-critical logic is hidden inside visual-only components.

---

## 3. Scenario Schema Checklist

- [ ] Room schema exists.
- [ ] Rack schema exists.
- [ ] Rack array schema exists.
- [ ] Cooling object schema exists.
- [ ] Return object schema exists.
- [ ] Containment schema exists.
- [ ] Unit settings schema exists.
- [ ] Simulation settings schema exists.
- [ ] Report settings schema exists.
- [ ] Import JSON works.
- [ ] Export JSON works.
- [ ] Sample scenario JSON files exist.

---

## 4. Room Setup Checklist

- [ ] Small server room template exists.
- [ ] Medium room template exists.
- [ ] Large room template exists.
- [ ] Custom dimensions are supported.
- [ ] Room height is supported.
- [ ] Template values are editable.
- [ ] Room boundary is visible in 3D.

---

## 5. Rack System Checklist

- [ ] Default rack size is 600mm × 1200mm × 2200mm.
- [ ] Rack dimensions are editable.
- [ ] Rack array builder exists.
- [ ] Rows are configurable.
- [ ] Columns are configurable.
- [ ] Row spacing is configurable.
- [ ] Column spacing is configurable.
- [ ] Aisle width is configurable.
- [ ] Rack orientation is configurable.
- [ ] Per-rack kW mode exists.
- [ ] Total array kW mode exists.
- [ ] Custom per-rack override exists.
- [ ] Single rack selection works.
- [ ] Multi-rack selection works.
- [ ] Batch editing works.
- [ ] Delete works.
- [ ] Move works.
- [ ] Resize works.
- [ ] Rack surface risk coloring exists.

---

## 6. Cooling Checklist

- [ ] CRAC / CRAH object exists.
- [ ] In-row cooler object exists.
- [ ] Floor perforated tile object exists.
- [ ] Ceiling supply diffuser object exists.
- [ ] Ceiling return grille object exists.
- [ ] Wall supply grille object exists.
- [ ] Wall return grille object exists.
- [ ] CDU object exists.
- [ ] Supply temperature is configurable.
- [ ] Airflow rate is configurable.
- [ ] Cooling capacity is configurable.
- [ ] Direction is visible.
- [ ] Return mode is supported.

---

## 7. Raised Floor Checklist

- [ ] Raised floor mode exists.
- [ ] Perforated tiles can be placed.
- [ ] Tile airflow is configurable.
- [ ] Tile supply temperature is configurable.
- [ ] Tile effects appear in simulation.
- [ ] Raised floor assumptions are documented.

---

## 8. Overhead Supply / Return Checklist

- [ ] Ceiling supply diffuser can be placed.
- [ ] Ceiling return grille can be placed.
- [ ] Vertical airflow is visualized.
- [ ] Supply-return short-circuit warning exists.
- [ ] Overhead assumptions are documented.

---

## 9. Liquid Cooling Checklist

- [ ] Rack cooling mode supports air cooled.
- [ ] Rack cooling mode supports hybrid liquid cooled.
- [ ] Rack cooling mode supports direct liquid cooled.
- [ ] Liquid capture ratio is configurable.
- [ ] Residual air heat formula is implemented.
- [ ] CDU object exists.
- [ ] Liquid cooling assumptions are documented.
- [ ] No coolant-loop CFD claim is made.

---

## 10. Containment Checklist

- [ ] Cold aisle containment exists.
- [ ] Hot aisle containment exists.
- [ ] End-of-row doors exist.
- [ ] Top panels exist.
- [ ] Side panels exist.
- [ ] Full aisle containment exists.
- [ ] Auto-generate from selected rack rows exists.
- [ ] Manual panel creation exists if practical.
- [ ] Containment affects airflow model.
- [ ] Containment material heat transfer is not falsely claimed.

---

## 11. Simulation Checklist

- [ ] 3D voxel/grid model exists.
- [ ] Heat sources are modeled.
- [ ] Cooling sources are modeled.
- [ ] Return boundaries are modeled.
- [ ] Obstacles are modeled.
- [ ] Containment barriers are modeled.
- [ ] Temperature field is generated.
- [ ] Airflow vector field is generated.
- [ ] Rack inlet temperature estimate exists.
- [ ] Hotspot warning exists.
- [ ] Simulation settings are visible.
- [ ] Elapsed time is visible.
- [ ] Iteration count is visible if available.
- [ ] No certified CFD claim is made.

---

## 12. Visualization Checklist

- [ ] Native 3D room exists.
- [ ] Heatmap exists.
- [ ] Rainbow heatmap is not used.
- [ ] Heatmap legend exists.
- [ ] Airflow particles / streamlines exist.
- [ ] Airflow particles are based on vector field.
- [ ] Airflow direction is readable.
- [ ] Particle density is adjustable.
- [ ] Particle speed is adjustable.
- [ ] Rack surface temperature coloring exists.
- [ ] Warning pins exist.
- [ ] Slice view exists or limitation is documented.
- [ ] Report view exists or limitation is documented.

---

## 13. UI / UX Checklist

- [ ] Dark technical cockpit style is used.
- [ ] Left setup panel exists.
- [ ] Center 3D viewport exists.
- [ ] Right inspector / results panel exists.
- [ ] Bottom scenario bar exists.
- [ ] Panels are collapsible.
- [ ] Five-Minute Mode exists.
- [ ] Advanced settings are collapsible.
- [ ] 3D viewport remains central.
- [ ] UI does not become a CFD parameter wall.
- [ ] Keyboard shortcuts exist where practical.
- [ ] Undo / redo exists or limitation is documented.
- [ ] Error states are actionable.

---

## 14. Warning Checklist

- [ ] High rack inlet temperature warning exists.
- [ ] Poor airflow coverage warning exists.
- [ ] Hot air recirculation warning exists.
- [ ] Supply-return short-circuit warning exists.
- [ ] Cooling capacity insufficient warning exists.
- [ ] Rack heat density warning exists.
- [ ] Containment gap warning exists.
- [ ] Return path weak warning exists.
- [ ] Liquid cooling residual heat warning exists.
- [ ] Warning includes severity.
- [ ] Warning includes text.
- [ ] Warning includes icon or equivalent.
- [ ] Clicking warning highlights related objects.
- [ ] Suggested mitigation exists where possible.

---

## 15. Report Checklist

- [ ] HTML report exists.
- [ ] Print-to-PDF styling exists.
- [ ] Report uses light professional style.
- [ ] Executive summary exists.
- [ ] Room setup section exists.
- [ ] Rack heat load table exists.
- [ ] Cooling setup section exists.
- [ ] Containment setup section exists.
- [ ] Temperature review exists.
- [ ] Airflow review exists.
- [ ] Hotspot warnings exist.
- [ ] Recommended actions exist.
- [ ] Simulation settings exist.
- [ ] Model assumptions exist.
- [ ] Disclaimer exists.
- [ ] Layout screenshot exists or limitation is documented.
- [ ] Thermal screenshot exists or limitation is documented.
- [ ] Airflow screenshot exists or limitation is documented.

---

## 16. Scenario Comparison Checklist

- [ ] Scenario duplication exists.
- [ ] Scenario A / B comparison exists.
- [ ] Max rack inlet temperature comparison exists.
- [ ] Average rack inlet temperature comparison exists.
- [ ] Hotspot count comparison exists.
- [ ] Cooling capacity margin comparison exists.
- [ ] Warning count comparison exists.
- [ ] Delta table exists.
- [ ] Before / after recommendation summary exists.

---

## 17. Sample Scenario Checklist

- [ ] Small server room baseline exists.
- [ ] Cold aisle containment sample exists.
- [ ] Hot aisle containment sample exists.
- [ ] Overhead supply short-circuit sample exists.
- [ ] High-density GPU rack hotspot sample exists.
- [ ] Each sample has expected interpretation.

---

## 18. Validation Checklist

- [ ] Heat source increases nearby temperature.
- [ ] Cooling source reduces adjacent temperature.
- [ ] Obstacle weakens downstream airflow.
- [ ] Containment reduces hot/cold mixing.
- [ ] Increased rack kW increases hotspot risk.
- [ ] Higher airflow reduces inlet temperature risk.
- [ ] Liquid capture ratio reduces air-side heat load.

---

## 19. Documentation Checklist

- [ ] README.md exists.
- [ ] SPEC.md exists.
- [ ] DESIGN.md exists.
- [ ] MODEL_ASSUMPTIONS.md exists.
- [ ] AGENTS.md exists.
- [ ] CODEX.md exists.
- [ ] CHECKLIST.md exists.
- [ ] CONTRIBUTING.md exists.
- [ ] ENGINEERING_MEMO_TEMPLATE.md exists.
- [ ] Engineering memos are written.
- [ ] Deviations are documented.

---

## 20. Final Handoff Checklist

- [ ] Build status documented.
- [ ] Test status documented.
- [ ] Known limitations documented.
- [ ] Deviations documented.
- [ ] Demo instructions documented.
- [ ] Local run instructions documented.
- [ ] Deployment instructions documented.
- [ ] Next recommended work documented.
- [ ] Final engineering memo completed.
---

## 21. GUI Self-Acceptance Checklist

- [ ] `COMPUTER_USE_ACCEPTANCE.md` exists.
- [ ] Real browser-based acceptance pass was attempted.
- [ ] Computer Use mode was used, or fallback mode was documented.
- [ ] Start from template flow was tested.
- [ ] Rack array flow was tested.
- [ ] Cooling setup flow was tested.
- [ ] Containment setup flow was tested.
- [ ] Simulation flow was tested.
- [ ] Visualization toggles were tested.
- [ ] Warning interaction was tested.
- [ ] Scenario comparison was tested.
- [ ] Report generation was tested.
- [ ] JSON import / export was tested.
- [ ] Screenshots were captured or limitation was documented.
- [ ] Issues found during acceptance were classified.
- [ ] Blocker issues were fixed or final status is marked blocked.
- [ ] Major issues were fixed or documented as accepted limitations.
- [ ] `engineering-memos/010_gui_acceptance.md` exists.
- [ ] Final acceptance status is explicit.
