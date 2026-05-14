# Engineering Memo: Bootstrap

Version: v0.1  
Date: 2026-05-14  
Author: Codex  
Area: Bootstrap

## 1. Summary

Scaffolded AirPath as a Vite/React/TypeScript workspace with separated schema, solver, report, and web app layers.

## 2. Context

Governing documents require `apps/web`, `packages/solver-core`, `packages/scenario-schema`, `packages/report-engine`, `examples/scenarios`, tests, browser acceptance, and engineering memos.

## 3. Work Completed

- [x] Read governing root documents.
- [x] Created autonomous implementation plan.
- [x] Created npm workspace structure.
- [x] Installed dependencies inside the AirPath repo.
- [x] Configured TypeScript, Vitest, Vite, and Playwright.
- [x] Sent Telegram milestone and blocker updates using external credentials without printing or storing secrets.

## 4. Files Changed

```txt
package.json
package-lock.json
tsconfig.json
tsconfig.base.json
vitest.config.ts
playwright.config.ts
apps/web/
packages/
examples/scenarios/
```

## 5. Technical Decisions

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| npm workspaces | Matches requested monorepo layout and keeps app/package boundaries explicit. | Separate repositories; rejected for first build. |
| Internal packages versioned as `0.1.0` | Host npm rejected `workspace:*`; local workspace versions resolved cleanly. | Keep `workspace:*`; blocked install. |
| Playwright browser installed repo-local | Preserves safety boundary while enabling GUI acceptance. | Install to user cache; rejected due repo-only modification boundary. |

## 6. Product Impact

Foundation supports the 5-minute workflow, public demo path, simulation transparency, and package-level testing.

## 7. Simulation / Model Impact

Not applicable.

## 8. UI / Design Impact

Not applicable.

## 9. Tests / Checks

```txt
npm install: pass
npm run build: pass, non-blocking Vite chunk-size warning
npm run test: pass
npm run lint: pass
npm run acceptance: pass
```

## 10. Known Issues

- Vite reports a large bundled client chunk due Three.js and React Three Fiber.

## 11. Deviations from Governing Docs

No bootstrap deviations.

## 12. Risks

- First build is broad; future work should split high-risk behavior into smaller feature slices.

## 13. Next Recommended Work

1. Add code splitting for the 3D stack.
2. Expand Playwright tests around direct 3D manipulation.
3. Add CI configuration.

## 14. Handoff Notes

Telegram credentials were read only from the requested external `.env`; no secrets were printed, committed, or stored.

## 15. Final Status

Status: Complete
