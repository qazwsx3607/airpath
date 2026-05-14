# MODEL_ASSUMPTIONS.md｜AirPath Simulation Assumptions and Claim Boundaries

Version: v0.1  
Product: AirPath  
Status: Governing document for simulation assumptions, limitations, and permitted claims.

---

## 1. Purpose

This document defines what AirPath's simulation model assumes, what it can reasonably indicate, and what it must not claim.

AirPath is a native 3D CFD-style pre-sales airflow and thermal review tool. It is designed for fast conceptual layout review, not certified engineering calculation.

---

## 2. Core Disclaimer

AirPath is intended for early-stage pre-sales thermal review and conceptual airflow risk analysis. It is not a certified CFD solver and should not be used as the sole basis for construction, commissioning, or compliance decisions.

This disclaimer must appear in:

- README.md
- Report output
- App settings or footer
- Any public demo page
- Any generated report package

---

## 3. Model Type

AirPath uses a simplified 3D voxel/grid-based airflow and heat advection-diffusion approximation.

It does not solve full Navier–Stokes equations.

It is designed to estimate and visualize:

- Airflow tendency
- Relative thermal risk
- Rack inlet temperature risk
- Hot/cold mixing risk
- Supply-return short-circuit risk
- Containment effect direction
- Cooling placement risk

It is not designed to produce certified CFD-grade accuracy.

---

## 4. Supported Physics Approximation

AirPath may approximate:

- Heat addition from racks
- Cold air supply from cooling objects
- Return air extraction
- Airflow direction from supply and return relationships
- Obstruction effects from racks, walls, containment, and objects
- Simplified heat advection
- Simplified heat diffusion
- Simplified vertical stratification
- Simplified raised floor tile air supply
- Simplified overhead supply / return behavior
- Simplified liquid cooling residual air heat

---

## 5. Required Simulation Inputs

The model may require:

- Room dimensions
- Room height
- Rack dimensions
- Rack placement
- Rack heat load
- Rack cooling mode
- Liquid capture ratio
- Cooling object type
- Cooling airflow rate
- Cooling capacity
- Supply air temperature
- Return object position
- Containment geometry
- Unit settings
- Simulation resolution or quality preset

---

## 6. Required Simulation Outputs

The model must output:

- Temperature field
- Airflow vector field
- Rack inlet temperature estimate
- Max rack inlet temperature
- Average rack inlet temperature
- Hotspot count
- Cooling capacity margin
- Warning list
- Critical warning list
- Simulation settings
- Elapsed time
- Iteration count if available

---

## 7. Rack Heat Load Assumptions

Rack heat load may be defined as:

1. Per-rack kW
2. Total array kW
3. Custom rack-level override

Assumption:

- Air-cooled racks release most IT heat into room air.
- Hybrid or direct liquid-cooled racks release only residual heat into room air.
- Residual air heat is calculated by liquid capture ratio.

Formula:

```txt
residual_air_heat = total_it_kw × (1 - liquid_capture_ratio)
```

---

## 8. Liquid Cooling Assumptions

Liquid cooling is modeled only as air-side heat reduction.

Supported:

- Rack liquid capture ratio
- Residual air heat
- Optional CDU object
- Optional CDU local heat
- Optional CDU obstruction effect

Not supported:

- Coolant-loop CFD
- Pipe pressure loss
- Pump curve
- CDU internal thermal model
- Water temperature distribution
- Flow balancing of liquid network
- Leak detection
- Hydraulic control logic

---

## 9. Raised Floor Assumptions

Raised floor support is modeled through perforated tile supply objects.

Supported:

- Perforated tile placement
- Tile airflow
- Tile supply temperature
- Tile directionality
- Tile influence on local cold air field

Not supported:

- Full underfloor plenum pressure simulation
- Detailed tile pressure-flow curve
- Underfloor cable blockage CFD
- Leakage through floor openings
- Full plenum turbulence

---

## 10. Overhead Supply / Return Assumptions

Overhead supply and return are modeled as directional boundary objects.

Supported:

- Ceiling supply diffuser
- Ceiling return grille
- Vertical flow tendency
- Supply-return short circuit warning
- Approximate thermal stratification

Not supported:

- Diffuser blade-level modeling
- Detailed jet turbulence
- Ceiling void modeling
- Duct network calculation

---

## 11. Containment Assumptions

Containment is modeled as an airflow barrier.

Supported:

- Cold aisle containment
- Hot aisle containment
- End-of-row doors
- Top panels
- Side panels
- Full aisle containment
- Reduction of hot/cold mixing

Not supported:

- Material heat transfer
- Leakage through unmodeled gaps unless represented
- Door opening behavior
- Construction tolerance modeling

---

## 12. Airflow Particle Assumptions

Airflow particles / streamlines must be generated from simulation vector fields.

They may represent:

- Supply air path
- Return air path
- Hot air recirculation tendency
- Short-circuit tendency
- Stagnation or weak flow zones

They must not be decorative.

---

## 13. Heatmap Assumptions

Heatmap visualizations must be driven by simulation temperature fields or rack temperature risk values.

Allowed heatmap layers:

- Rack surface risk coloring
- Horizontal thermal slice
- Vertical slice
- Volumetric heat cloud if performance allows

Rainbow heatmap is forbidden.

Heatmap must include:

- Legend
- Unit
- Threshold reference when applicable

---

## 14. Warning Assumptions

Warnings are risk indicators, not certified engineering failures.

Required warning types:

- High rack inlet temperature
- Poor airflow coverage
- Hot air recirculation risk
- Supply-return short circuit
- Cooling capacity insufficient
- Rack heat density too high
- Containment gap detected
- Return path weak
- Liquid cooling residual heat still high

Warnings should include suggested mitigation when possible.

---

## 15. Permitted Claims

AirPath may claim:

- Fast conceptual airflow review
- 3D CFD-style visualization
- Pre-sales thermal risk review
- Rack inlet temperature risk estimation
- Scenario comparison
- Cooling and containment layout review
- Transparent model assumptions
- Early-stage design discussion support

---

## 16. Forbidden Claims

AirPath must not claim:

- Certified CFD accuracy
- Replacement for professional CFD software
- Construction approval readiness
- Commissioning acceptance readiness
- Compliance verification
- ASHRAE compliance proof
- Uptime / SLA guarantee
- Exact temperature prediction
- Exact airflow balancing
- Validated turbulence simulation
- Complete Navier–Stokes CFD

---

## 17. Validation Philosophy

Validation cases are required to prevent model regressions.

They do not certify engineering accuracy.

Required validation cases:

1. Heat source increases nearby temperature.
2. Cooling source reduces nearby temperature.
3. Obstacle weakens downstream airflow.
4. Containment reduces hot/cold mixing.
5. Increased rack kW increases hotspot risk.
6. Higher airflow reduces inlet temperature risk.
7. Liquid capture ratio reduces air-side heat load.

---

## 18. Report Assumptions

Every report must include:

- Simulation settings
- Room setup
- Rack heat load table
- Cooling setup
- Containment setup
- Thermal review
- Airflow review
- Warnings
- Recommended actions
- Assumptions
- Disclaimer

Reports must avoid certified CFD wording.

---

## 19. Source of Truth Statement

This document governs AirPath simulation claims, model assumptions, limitations, and disclaimers.

If implementation behavior conflicts with this document, Codex must either correct the implementation or record the deviation in an engineering memo.
