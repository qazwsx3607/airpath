# ENGINEERING_MEMO_TEMPLATE.md｜AirPath Engineering Memo Template

Version: v0.1  
Product: AirPath  
Status: Required memo template for Codex and human contributors.

---

# Engineering Memo｜<Memo Title>

Version: v0.1  
Date: <YYYY-MM-DD>  
Author: <Codex / Human / Agent Name>  
Area: <Architecture / UI / Solver / Visualization / Report / Testing / Documentation / Deviation / Final Handoff>

---

## 1. Summary

Briefly describe what was implemented, changed, reviewed, or decided.

---

## 2. Context

Explain why this work was needed.

Relevant governing documents:

- `SPEC.md`
- `DESIGN.md`
- `MODEL_ASSUMPTIONS.md`
- `AGENTS.md`
- `CODEX.md`
- `CHECKLIST.md`

Relevant product requirement:

```txt
<Quote or summarize requirement>
```

---

## 3. Work Completed

List completed work.

- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

---

## 4. Files Changed

List important files or directories.

```txt
<path/to/file>
<path/to/file>
```

---

## 5. Technical Decisions

Document important decisions.

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| <decision> | <reason> | <alternatives> |

---

## 6. Product Impact

Explain impact on:

- 5-minute workflow
- Native 3D visualization
- Simulation transparency
- Report output
- Public repo credibility

---

## 7. Simulation / Model Impact

Answer if applicable:

- Does this change affect simulation results?
- Does it affect model assumptions?
- Does it affect warnings?
- Does it affect heatmap or airflow particles?
- Does it require updates to `MODEL_ASSUMPTIONS.md`?

If not applicable, write:

```txt
Not applicable.
```

---

## 8. UI / Design Impact

Answer if applicable:

- Does this follow `DESIGN.md`?
- Does it affect visual tokens?
- Does it affect panel layout?
- Does it affect 3D viewport behavior?
- Does it affect report styling?

If not applicable, write:

```txt
Not applicable.
```

---

## 9. Tests / Checks

Record checks performed.

```txt
npm run build: <pass/fail/not run>
npm run test: <pass/fail/not run>
npm run lint: <pass/fail/not run>
```

Additional validation:

- [ ] Heat source test
- [ ] Cooling source test
- [ ] Containment test
- [ ] Unit conversion test
- [ ] Report output test
- [ ] UI smoke test

---

## 10. Known Issues

List known issues.

- Issue 1
- Issue 2

If none:

```txt
No known issues.
```

---

## 11. Deviations from Governing Docs

If any requirement was not followed, record:

| Requirement | Actual Implementation | Reason | Risk | Requires Human Review |
|---|---|---|---|---|
| <requirement> | <actual> | <reason> | <risk> | Yes / No |

If none:

```txt
No deviations.
```

---

## 12. Risks

List technical, product, or credibility risks.

- Risk 1
- Risk 2

---

## 13. Next Recommended Work

List next actions.

1. Next action
2. Next action
3. Next action

---

## 14. Handoff Notes

Add anything the next agent or human reviewer must know.

---

## 15. Final Status

Choose one:

```txt
Status: Complete
Status: Complete with limitations
Status: Blocked
Status: Needs human review
```
