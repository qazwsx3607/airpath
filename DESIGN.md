# DESIGN.md｜AirPath UI / UX + Visual Design System

Version: v0.1  
Product: AirPath  
Tagline: 5-minute native 3D airflow review for server rooms and data center pre-sales.  
Status: Governing design document for Codex autonomous development.

---

## 1. Design Mission

AirPath must allow a pre-sales engineer to create a native 3D CFD-style airflow and thermal review in 5 minutes.

Every design decision must support:

1. Zero-learning-cost operation
2. Fast room and rack setup
3. Native 3D visual clarity
4. Pre-sales-ready output
5. Engineering credibility
6. Report-ready screenshots and summaries

The UI must feel like a professional engineering tool, but it must not inherit the complexity of traditional CFD software.

---

## 2. Product Personality

AirPath visual identity:

- Dark technical cockpit
- Clean engineering SaaS
- Fast pre-sales review tool
- Precise and credible
- Presentation-ready
- Data-driven
- Low-friction
- High-contrast thermal visualization

Avoid:

- Gaming UI
- Cyberpunk glow
- Decorative gradients
- Toy-like 3D simulator style
- Excessive white-space SaaS style
- CAD-like complexity
- Academic CFD parameter walls

---

## 3. Design Principles

### 3.1 Speed First

The primary workflow must be completable in 5 minutes:

Room → Rack Array → Cooling → Containment → Simulate → Review → Export

### 3.2 3D First

The 3D viewport is the center of the product. Panels support the viewport; they must not dominate it.

### 3.3 Array First

Users should create racks through arrays, not one-by-one placement.

### 3.4 Visual Truth

Airflow particles, heatmaps, rack colors, and warnings must be driven by scenario data or simulation results. They must not be decorative.

### 3.5 Progressive Detail

The default UI shows the minimum controls needed for a fast review. Advanced settings must be hidden inside collapsible sections.

### 3.6 Report Readiness

Views must be suitable for screenshots and report export.

### 3.7 Assumption Visibility

Any simulation output must be paired with model assumptions and disclaimers.

---

## 4. Theme System

### 4.1 Default App Theme

AirPath defaults to dark mode.

Reason:
The primary surface is a 3D viewport. Dark UI improves contrast for heatmaps, airflow streamlines, warning overlays, and technical metrics.

### 4.2 Optional Theme

Light mode may be supported later, but dark mode is the primary working environment.

### 4.3 Report Theme

Reports default to light mode.

Reason:
Pre-sales reports are usually shared as PDFs, screenshots, or inserted into slide decks.

---

## 5. Typography

### 5.1 Font Families

```css
--font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
```

### 5.2 Usage

| Use Case | Font |
|---|---|
| Main UI | Inter / system sans |
| Panel labels | Inter / system sans |
| Report body | Inter / system sans |
| Coordinates | Mono |
| Dimensions | Mono |
| Simulation stats | Mono |
| Engineering tables | Mono |
| Numeric chips | Mono |
| 3D labels | Inter / system sans |

### 5.3 Font Weights

| Weight | Usage |
|---|---|
| 400 Regular | Body text |
| 500 Medium | Labels, tabs, buttons |
| 600 Semibold | Panel titles, card headings |
| 700 Bold | Major headings, critical values only |

### 5.4 Type Scale

| Token | Size | Usage |
|---|---:|---|
| Display | 28–32px | Landing / empty state hero |
| Page Title | 22–24px | Main screen title |
| Panel Title | 16–18px | Left / right panel title |
| Section Title | 14–15px | Form groups |
| Body | 13–14px | Main UI text |
| Small Label | 11–12px | Field labels, metadata |
| Numeric Chip | 12–13px | Metrics, dimensions |
| 3D Label | 11–12px | Object labels |

---

## 6. Color Tokens

### 6.1 Background

```css
--bg-app: #0B0F14;
--bg-panel: #111821;
--bg-panel-elevated: #16202B;
--bg-viewport: #070A0E;
--bg-card: #131C26;
--bg-input: #0E151D;
```

### 6.2 Borders

```css
--border-subtle: #243241;
--border-strong: #33475B;
--border-focus: #38BDF8;
```

### 6.3 Text

```css
--text-primary: #E5EDF5;
--text-secondary: #A9B7C6;
--text-muted: #6F8194;
--text-disabled: #465666;
```

### 6.4 Brand / Action

```css
--brand-primary: #38BDF8;
--brand-primary-hover: #0EA5E9;
--brand-primary-soft: rgba(56, 189, 248, 0.16);
```

### 6.5 Semantic States

```css
--success: #22C55E;
--warning: #F59E0B;
--critical: #EF4444;
--info: #38BDF8;
```

### 6.6 Thermal Scale

Rainbow color scales are forbidden.

Use semantic thermal scale:

```css
--thermal-cold: #38BDF8;
--thermal-cool: #22D3EE;
--thermal-neutral: #94A3B8;
--thermal-warm: #F59E0B;
--thermal-hot: #F97316;
--thermal-critical: #EF4444;
```

### 6.7 Airflow Colors

```css
--airflow-supply: #38BDF8;
--airflow-return: #F97316;
--airflow-neutral: #CBD5E1;
--airflow-low: rgba(148, 163, 184, 0.55);
```

### 6.8 Containment Colors

```css
--containment-cold: rgba(56, 189, 248, 0.22);
--containment-cold-border: #38BDF8;

--containment-hot: rgba(249, 115, 22, 0.22);
--containment-hot-border: #F97316;
```

---

## 7. Spacing Scale

Use a 4px base grid.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
```

### 7.1 Spacing Rules

| Element | Spacing |
|---|---:|
| Panel internal padding | 16px |
| Compact control group gap | 8px |
| Form field vertical gap | 12px |
| Major panel section gap | 20–24px |
| Report section gap | 32px |
| Toolbar item gap | 8px |

AirPath uses compact-professional density. Avoid large marketing-style whitespace.

---

## 8. Radius Scale

```css
--radius-xs: 4px;
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-pill: 999px;
```

### 8.1 Radius Usage

| Component | Radius |
|---|---:|
| Buttons | 8px |
| Inputs | 8px |
| Cards | 12px |
| Panels | 12–16px |
| Chips / badges | 999px |
| 3D labels | 6px |
| Report cards | 12px |

Avoid excessive rounded corners. The visual tone should remain precise and technical.

---

## 9. Border and Elevation

Dark UI should rely on borders and subtle elevation, not heavy shadows.

```css
--shadow-panel: 0 12px 32px rgba(0, 0, 0, 0.32);
--shadow-popover: 0 16px 48px rgba(0, 0, 0, 0.42);
--shadow-focus: 0 0 0 3px rgba(56, 189, 248, 0.28);
```

### 9.1 Usage

| Element | Treatment |
|---|---|
| Default panels | 1px border + subtle shadow |
| Cards | 1px border, minimal shadow |
| Popovers | Stronger shadow |
| Selected object | Cyan outline + subtle glow |
| Critical warning | Red border + icon + compact severity label |

Do not flood entire panels in red except for severe blocking states.

---

## 10. Component Density

AirPath uses compact-professional density.

| Component | Height |
|---|---:|
| Compact button | 32px |
| Default button | 36px |
| Primary action button | 40px |
| Input | 32–36px |
| Panel header | 44–48px |
| Top bar | 52–56px |
| Bottom bar | 44–56px |

---

## 11. App Layout

### 11.1 Main Screen Structure

```txt
┌──────────────────────────────────────────────────────────┐
│ Top Bar: Project / Scenario / Units / Export / Settings  │
├───────────────┬────────────────────────┬─────────────────┤
│ Left Panel    │ 3D Viewport             │ Right Panel      │
│ Setup Wizard  │ Room + Airflow + Heat   │ Inspector/Result │
├───────────────┴────────────────────────┴─────────────────┤
│ Bottom Bar: Scenario Compare / Simulation / Timeline      │
└──────────────────────────────────────────────────────────┘
```

### 11.2 Top Bar

Top bar includes:

- AirPath logo
- Project name
- Current scenario name
- Save / Load
- Units selector
- View mode selector
- Run Simulation
- Export Report
- Settings

### 11.3 Left Panel

Purpose:

- Guided setup wizard
- Room setup
- Rack array builder
- Cooling object library
- Containment builder
- Review & simulate flow

### 11.4 Center Viewport

Purpose:

- Native 3D interaction
- Layout editing
- Simulation visualization
- Screenshot source for reports

### 11.5 Right Panel

Tabs:

- Inspector
- Results
- Warnings
- Report

### 11.6 Bottom Bar

Purpose:

- Scenario status
- Simulation status
- A/B comparison
- Timeline / snapshots
- Quick export status

---

## 12. Panel System

All major panels must be collapsible.

### 12.1 Collapse Behavior

- Left panel collapses to icon rail.
- Right panel collapses to result badges.
- Bottom bar collapses to simulation status chip.
- Collapsed panels must remain discoverable.
- Hover tooltips required for icon-only states.
- Panels must not permanently block the 3D viewport.

### 12.2 Resizing

Resizable panels are preferred when practical.

Recommended widths:

| Panel | Width |
|---|---:|
| Left panel | 320–380px |
| Right panel | 340–420px |
| Collapsed rail | 48–56px |

---

## 13. Five-Minute Mode

Five-Minute Mode is the default primary workflow.

### 13.1 Steps

1. Room
2. Rack Array
3. Cooling
4. Containment
5. Review & Simulate

### 13.2 UI Rules

- Show only essential controls by default.
- Hide advanced settings in collapsible sections.
- Each step must show completion status.
- Every step must provide sensible defaults.
- Users must be able to finish a scenario without touching raw JSON.

---

## 14. 3D Viewport Interaction

### 14.1 Mouse Controls

| Input | Action |
|---|---|
| Left drag | Orbit |
| Right drag | Pan |
| Scroll | Zoom |
| Click | Select object |
| Shift + click | Multi-select |
| Drag selected object | Move on floor plane |

### 14.2 Keyboard Controls

| Key | Action |
|---|---|
| Delete | Delete selected |
| Esc | Clear selection |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Y | Redo |
| Ctrl/Cmd + S | Save |
| G | Toggle grid |
| H | Toggle heatmap |
| F | Frame selected |

Keyboard shortcuts must improve productivity but must not be required for normal use.

---

## 15. View Modes

Required view modes:

1. Solid View
2. Thermal View
3. Airflow View
4. Combined View
5. Slice View
6. Report View

---

## 16. 3D Viewport Visual Language

- Very dark viewport background
- Subtle grid floor
- No decorative starfields, gradients, or cyberpunk effects
- Major grid line every 1m
- Minor grid line every 0.5m when zoomed in
- Thin cool-gray room boundary
- Semi-transparent walls when needed
- Neutral engineering lighting
- No cinematic rendering

---

## 17. Rack Visual System

- Graphite body
- Subtle front-face marker
- Clear orientation indicator
- Cyan outline when selected
- Amber / orange / red surface coloring when overheated
- Warning pin for critical racks
- Multi-selection outline and batch-edit inspector

---

## 18. Rack Array Builder

Rack Array Builder includes:

- Array name
- Rack model / size
- Rows
- Columns
- Rack orientation
- Row spacing
- Column spacing
- Aisle width
- Start position
- Heat load mode
  - Per rack kW
  - Total array kW
  - Mixed custom
- Cooling mode
  - Air cooled
  - Hybrid liquid cooled
  - Direct liquid cooled
- Liquid capture ratio

Ghost preview:

| State | Visual |
|---|---|
| Valid placement | Cyan outline |
| Collision | Red outline |
| Out of room boundary | Amber outline |

---

## 19. Cooling Object Visual System

Required cooling objects:

- CRAC / CRAH
- In-row cooler
- Floor perforated tile
- Ceiling supply diffuser
- Ceiling return grille
- Wall supply grille
- Wall return grille
- CDU

Visual rules:

| Object | Visual Rule |
|---|---|
| Supply side | Blue / cyan marking |
| Return side | Orange marking |
| Direction | Visible arrow |
| Disabled cooling object | Reduced opacity |
| Selected cooling object | Cyan outline |
| Invalid placement | Red outline |

---

## 20. Containment Visual System

Required types:

- Cold aisle containment
- Hot aisle containment
- End-of-row doors
- Top panels
- Side panels
- Full aisle containment

Creation methods:

1. Auto-generate from selected rack rows
2. Draw panel manually
3. Use preset containment type

Visual style:

| Containment Type | Visual |
|---|---|
| Cold aisle containment | Transparent blue panels |
| Hot aisle containment | Transparent orange panels |
| Selected containment | Brighter outline |
| Disabled containment | Dashed outline |
| Invalid containment | Red outline |

Containment acts as an airflow barrier. It does not model material heat transfer in current scope.

---

## 21. Heatmap and Thermal Visualization

Required thermal layers:

1. Rack surface heat coloring
2. Horizontal thermal slice
3. Optional volumetric / transparent heat cloud if performance allows

Rules:

- Rainbow heatmap is forbidden.
- Thermal visualization must use cyan → slate → amber → orange → red scale.
- Heatmap must include visible legend.
- Legend must include unit.
- Critical threshold must be user-configurable.
- Heatmap must represent simulation result, not static decoration.

---

## 22. Airflow Particle / Streamline Visualization

Airflow particles / streamlines are required.

Behavior:

- Animated particle trails
- Based on simulation vector field
- Toggleable
- Density adjustable
- Speed adjustable
- Direction must be readable
- Must not be purely decorative

Visual rules:

| Property | Rule |
|---|---|
| Supply particles | Cyan / blue |
| Return / hot air particles | Orange |
| Neutral airflow | Light slate |
| Line width | 1–2px equivalent |
| Opacity | 0.35–0.75 |
| Trail length | Short to medium |
| Motion | Smooth, readable, not chaotic |

Avoid heavy neon glow.

---

## 23. Warning and Risk Components

Warning levels:

| Level | Meaning |
|---|---|
| Info | General observation |
| Warning | Potential thermal risk |
| Critical | Rack inlet temperature above threshold or severe airflow issue |

Warning types:

- High rack inlet temperature
- Poor airflow coverage
- Hot air recirculation risk
- Supply-return short circuit
- Cooling capacity insufficient
- Rack heat density too high
- Containment gap detected
- Return path weak
- Liquid cooling residual heat still high

Clicking a warning must:

1. Highlight related objects
2. Frame camera to issue location
3. Show suggested mitigation
4. Open warning details in right panel

---

## 24. Result Components

Required metrics:

- Max rack inlet temperature
- Average rack inlet temperature
- Hotspot count
- Cooling capacity margin
- Warning count
- Critical warning count
- Simulation elapsed time

Allowed charts:

- Simple bars
- Tables
- Delta chips
- Small trend summaries

Forbidden:

- Decorative 3D charts
- Complex charts that slow interpretation
- Charts without numeric labels

---

## 25. Report Visual System

Reports use light professional style by default.

```css
--report-bg: #FFFFFF;
--report-text: #111827;
--report-heading: #0F172A;
--report-accent: #0284C7;
--report-warning: #D97706;
--report-critical: #DC2626;
```

Required report sections:

1. Executive summary
2. Room setup
3. Rack heat load table
4. Cooling setup
5. Containment setup
6. Temperature review
7. Airflow review
8. Hotspot warnings
9. Recommended actions
10. Simulation settings
11. Model assumptions
12. Disclaimer

Required screenshots:

1. Layout overview
2. Thermal view
3. Airflow view

Report tone:

- Concise
- Professional
- Risk-oriented
- Pre-sales engineering tone
- No exaggerated claims
- No certified CFD claims

---

## 26. Scenario Comparison UI

Scenario A vs Scenario B should compare:

- Max rack inlet temperature
- Average rack inlet temperature
- Hotspot count
- Cooling capacity margin
- Warning count
- Critical warning count

Comparison UI includes:

- Side-by-side metric cards
- Delta table
- Selectable 3D view A / B
- Before / after recommendation summary

---

## 27. Button System

| Type | Style | Usage |
|---|---|---|
| Primary | Filled cyan / blue | Run Simulation, Export Report, Start Review |
| Secondary | Dark surface + border | Normal actions |
| Ghost | Transparent with hover | Toolbar actions |
| Danger | Red | Destructive actions |

Use clear verbs:

- Run Simulation
- Export Report
- Add Rack Array
- Generate Containment
- Compare Scenario
- Load Sample
- Import JSON

Avoid vague labels:

- OK
- Done
- Apply without context

---

## 28. Form Components

Rules:

- Every input must have label.
- Units must be visible.
- Defaults must be prefilled.
- Invalid values must show actionable error.
- Advanced settings must be collapsible.

Required units:

| Category | Units |
|---|---|
| Temperature | °C / °F |
| Airflow | CFM / CMH / L/s |
| Dimension | m / mm / ft |
| Heat | kW / W / BTU/h |

---

## 29. Empty / Loading / Error States

Empty state:

```txt
Start your first 5-minute airflow review.
```

Actions:

- Use Template
- Load Sample
- Import JSON

Required loading states:

- Loading project
- Calculating preview
- Running formal simulation
- Generating report

Errors must explain what happened and how to fix it.

Example:

```txt
Rack array exceeds room boundary.
Suggested fix: Reduce columns, decrease spacing, or rotate the array.
```

---

## 30. Motion and Animation

Motion is functional, not decorative.

Allowed motion:

- Panel collapse
- Hover feedback
- Selected object transition
- Airflow particle animation
- Simulation progress
- Warning focus camera movement

Durations:

| Motion | Duration |
|---|---:|
| Small UI transition | 120–180ms |
| Panel transition | 250–350ms |
| Camera focus | 500–800ms |

Avoid:

- Bouncy easing
- Playful animations
- Excessive glow
- Loading gimmicks
- Motion unrelated to user action or simulation state

---

## 31. Icon System

Use Lucide-style line icons.

Recommended package:

```txt
lucide-react
```

Rules:

- Stroke width: 1.75–2px
- No filled cartoon icons
- No multicolor decorative icons
- Icons must improve scanning
- Warning icons must pair with text labels

---

## 32. Accessibility

Baseline:

- Text contrast should meet WCAG AA where practical.
- Do not rely on color alone.
- Warning state must include icon + label + color.
- Heatmap must always include legend.
- Keyboard focus must be visible.
- Inputs must have labels.
- Charts and report tables must include text values.
- Buttons must have accessible names.

Core functions should be keyboard accessible where practical:

- Save
- Undo / redo
- Delete selected
- Clear selection
- Run simulation
- Export report

---

## 33. Responsive Behavior

AirPath is desktop-first.

Desktop:

- Primary editing experience

Tablet:

- Acceptable for viewing and light editing

Mobile:

- Read-only / report-only
- Open report
- View scenario summary
- Review warnings
- View exported screenshots

Mobile does not need full 3D layout editing.

---

## 34. Forbidden Visual Patterns

Codex must not implement:

- Rainbow heatmap
- Decorative airflow unrelated to simulation vectors
- Cyberpunk neon UI
- Game-like HUD
- CFD jargon-first parameter wall
- Hidden required fields
- UI panels that permanently block the viewport
- Modal-heavy 5-minute workflow
- Report export without disclaimer
- Object editing only through raw JSON
- Charts without values
- Warning states indicated only by color
- Excessive rounded corners
- Excessive gradients
- Overly soft consumer-app style

---

## 35. Codex Implementation Rules

Codex must treat this file as the visual and interaction source of truth.

Codex must:

1. Follow the design tokens defined here.
2. Implement dark app theme first.
3. Implement light report style.
4. Keep all panels collapsible.
5. Keep 3D viewport central.
6. Implement Five-Minute Mode as the primary workflow.
7. Implement rack array builder before object-by-object rack placement.
8. Use semantic thermal colors.
9. Ensure airflow particles are simulation-driven.
10. Provide warnings with icon + text + severity.
11. Include report screenshots if technically feasible.
12. Preserve accessibility baseline.

If Codex deviates from this document, it must record:

- What changed
- Why it changed
- Impact on the 5-minute workflow
- Whether it requires human review

Record deviations in:

```txt
engineering-memos/
```

---

## 36. Source of Truth Statement

This DESIGN.md governs AirPath UI, UX, visual system, interaction behavior, and report styling.

If SPEC.md defines what the product must do, DESIGN.md defines how the product must feel, look, and behave.

Codex must read DESIGN.md before implementing UI, 3D visualization, report layout, warning components, or interaction behavior.
