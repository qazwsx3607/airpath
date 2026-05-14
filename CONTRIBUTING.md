# CONTRIBUTING.md｜AirPath Contribution Guide

Version: v0.1  
Product: AirPath  
Status: Human contribution guide.

---

## 1. Purpose

This document explains how humans should contribute to AirPath.

AirPath is a native 3D CFD-style airflow and thermal review tool for server rooms and data center pre-sales.

Contributions must protect the product mission:

> A pre-sales engineer must be able to create a useful 3D airflow and thermal review in 5 minutes.

---

## 2. Read Before Contributing

Before contributing, read:

1. `README.md`
2. `SPEC.md`
3. `DESIGN.md`
4. `MODEL_ASSUMPTIONS.md`
5. `CHECKLIST.md`

If contributing as or with an agent, also read:

1. `AGENTS.md`
2. `CODEX.md`
3. `ENGINEERING_MEMO_TEMPLATE.md`

---

## 3. Product Boundaries

AirPath is not a certified CFD solver.

Do not add claims that imply:

- Certified CFD accuracy
- Professional CFD replacement
- Construction approval readiness
- Commissioning acceptance readiness
- Compliance verification
- Exact thermal prediction
- Navier–Stokes completeness

Every simulation feature must remain transparent about its assumptions.

---

## 4. Development Setup

Expected stack:

- Node.js
- npm or pnpm
- Vite
- React
- TypeScript
- Three.js
- React Three Fiber
- Zustand
- Vitest

Typical commands may include:

```txt
npm install
npm run dev
npm run build
npm run test
npm run lint
```

Check `package.json` for exact scripts.

---

## 5. Repository Structure

Recommended structure:

```txt
apps/
  web/

packages/
  solver-core/
  scenario-schema/
  report-engine/

examples/
  scenarios/

engineering-memos/
```

Follow this separation:

- UI belongs in app components.
- Simulation logic belongs in `solver-core`.
- Schema logic belongs in `scenario-schema`.
- Report logic belongs in `report-engine`.
- Engineering decisions belong in `engineering-memos/`.

---

## 6. Contribution Types

Accepted contribution types:

- Product features
- UI / UX improvements
- 3D visualization improvements
- Solver-core improvements
- Validation cases
- Sample scenarios
- Report improvements
- Documentation improvements
- Accessibility improvements
- Performance improvements
- Bug fixes

---

## 7. Design Rules

Follow `DESIGN.md`.

Do not introduce:

- Rainbow heatmap
- Cyberpunk neon UI
- Game-like HUD
- Decorative airflow unrelated to simulation data
- CFD jargon-first parameter walls
- Modal-heavy default workflow
- Report export without disclaimer
- Warning states based only on color

---

## 8. Simulation Rules

Follow `MODEL_ASSUMPTIONS.md`.

Simulation contributions must:

- Expose assumptions
- Add or update tests
- Avoid unsupported engineering claims
- Avoid hiding model limitations
- Prefer deterministic behavior where practical
- Preserve validation cases

---

## 9. Testing Expectations

New features should include relevant tests.

Priority test areas:

- Scenario schema validation
- Unit conversion
- Rack array generation
- Heat load calculation
- Liquid cooling residual heat
- Cooling object behavior
- Containment behavior
- Warning generation
- Report data output
- JSON import / export

---

## 10. Pull Request Expectations

A pull request should include:

- Summary
- Why the change is needed
- Affected areas
- Screenshots or demo notes for UI changes
- Test results
- Known limitations
- Updated docs if needed
- Engineering memo if the change affects architecture, simulation behavior, or product assumptions

---

## 11. Engineering Memo Requirement

Write an engineering memo when a contribution changes:

- Architecture
- Solver behavior
- Simulation assumptions
- UI design system
- Report structure
- Public claims
- Scenario schema
- Major dependencies

Use `ENGINEERING_MEMO_TEMPLATE.md`.

---

## 12. Accessibility

Contributions should preserve:

- Visible focus states
- Labeled inputs
- Text values for charts
- Icons + text for warnings
- Heatmap legends
- Color contrast where practical
- Keyboard access for core actions

---

## 13. Documentation Updates

Update documentation when changing:

- Product behavior
- UI behavior
- Simulation behavior
- Model assumptions
- Setup instructions
- Report output
- Public positioning

---

## 14. Review Priorities

Reviewers should prioritize:

1. Product mission fit
2. Simulation transparency
3. UI clarity
4. Maintainable architecture
5. Test coverage
6. Public repo credibility
7. Performance
8. Visual polish

---

## 15. Final Note

AirPath should remain fast, credible, and transparent.

Do not trade the 5-minute pre-sales workflow for unnecessary complexity.
