# Engineering Memo: v0.2 Handoff

Version: v0.2  
Date: 2026-05-14  
Author: Codex  
Area: Final Handoff

## 1. Summary

Completed the v0.2 deferred-item pass from the v0.1 final handoff without changing AirPath's product positioning or expanding product scope.

## 2. Context

The v0.2 scope was limited to:

```txt
report screenshot embedding
direct 3D drag
undo / redo
shader heatmap
warning clustering
bundle-size optimization
CI / deployment
```

## 3. Work Completed

- [x] Added viewport canvas capture and embedded layout, thermal, and airflow images into generated HTML reports.
- [x] Added report generation from top bar and report panel through the same screenshot capture path.
- [x] Added direct rack dragging from the 3D viewport and 3D rack labels.
- [x] Added bounded undo/redo scenario history with UI buttons and keyboard shortcuts.
- [x] Replaced mesh-cell thermal slice with a shader/data-texture heatmap driven by solver temperature data.
- [x] Added warning clustering for nearby repeated warning types in the 3D viewport.
- [x] Added lazy-loaded 3D viewport and Vite manual chunk splitting.
- [x] Added GitHub Actions CI for install, lint, test, build, and Playwright acceptance.
- [x] Added Vercel deployment configuration.
- [x] Updated acceptance flow for v0.2 features.

## 4. Files Changed

```txt
.github/workflows/ci.yml
vercel.json
README.md
apps/web/vite.config.ts
apps/web/src/App.tsx
apps/web/src/reportCapture.ts
apps/web/src/store.ts
apps/web/src/components/RightPanel.tsx
apps/web/src/components/Viewport3D.tsx
apps/web/src/styles.css
tests/acceptance.spec.ts
engineering-memos/
```

## 5. Technical Decisions

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| Use WebGL canvas `toDataURL` for reports | Avoids adding a screenshot service or image dependency. | Playwright-only report screenshots; rejected because generated reports need embedded images. |
| Preserve WebGL drawing buffer | Required for reliable report image capture. | Render offscreen scenes; deferred. |
| Scenario-only undo history | Keeps history bounded and avoids storing report images. | Full app-state history; heavier and not needed. |
| DataTexture shader heatmap | Meets shader heatmap requirement while keeping solver field as source. | Mesh-cell heatmap; replaced. |
| Cluster nearby warnings by type | Reduces viewport clutter while keeping full warning detail in right panel. | Hide warnings; rejected. |
| Lazy 3D viewport and manual vendor chunks | Removes previous single large app bundle warning. | Leave bundle unchanged; rejected. |

## 6. Product Impact

v0.2 improves report readiness, editing ergonomics, visual credibility, warning readability, and public-demo readiness while preserving the original 5-minute pre-sales workflow.

## 7. Simulation / Model Impact

No simulation claims changed. Shader heatmap, report screenshots, and warning clusters continue to consume solver outputs.

## 8. UI / Design Impact

- Topbar actions collapse to icon-only at narrower desktop widths to avoid overlap.
- Undo/redo controls are icon buttons with accessible labels.
- Warning clusters show count and max severity in the viewport.
- Report preview remains light-theme HTML.

## 9. Tests / Checks

```txt
npm run test: pass, 17 tests
npm run lint: pass
npm run build: pass, no Vite chunk-size warning
npm run acceptance: pass, 1 Playwright flow
```

## 10. Known Issues

- Direct drag is implemented for racks. Cooling and containment objects still use creation presets and inspector/context controls rather than direct floor drag.
- Report screenshots use the current camera orientation while switching view layers; dedicated report camera presets are not implemented.
- CI is configured but not yet observed running on GitHub in this session.

## 11. Deviations from Governing Docs

| Requirement | Actual Implementation | Reason | Risk | Requires Human Review |
|---|---|---|---|---|
| Drag selected object on floor plane | Direct rack drag implemented; other object classes are not directly draggable | Rack direct manipulation was the v0.2 high-value editing gap; other object drag needs class-specific constraints | Medium for advanced cooling/containment editing | No |
| Report screenshots should include layout, thermal, airflow views | Embedded images are captured from current camera while switching view layers | Avoids fake images and keeps capture browser-local | Low; images are real but not composed by a dedicated report camera | No |

## 12. Risks

- The Three vendor chunk remains inherently large, but it is isolated from the main app chunk and no longer triggers the build warning threshold.
- Direct drag should be extended to cooling and containment once object-specific bounds and snapping are added.

## 13. Next Recommended Work

1. Add direct drag for cooling and containment objects with object-specific placement validation.
2. Add report camera presets for consistent layout, thermal, and airflow screenshots.
3. Add CI artifact upload for acceptance screenshots.

## 14. Handoff Notes

Run locally:

```txt
npm install
npm run dev
```

Verify:

```txt
npm run lint
npm run test
npm run build
npm run acceptance
```

## 15. Final Status

Status: Complete with limitations
