# DiabetX Milestone 3 — Tab View Screens & Stitch MCP UI Integration Analysis Report

## Executive Summary
This report provides a comprehensive, read-only architectural and design audit of the tab view screens in the DiabetX Next.js web application (`app/page.tsx`, `components/`, and `stitch_diabetx_ai_digital_twin/DESIGN.md`). The audit evaluates five primary view screens—**Dashboard**, **Digital Twin (3D)**, **Timeline**, **Simulator**, and **AI Coach**—analyzes design token alignment, checks Stitch MCP tool capability, and identifies missing or incomplete components needed for Milestone 3 implementation.

---

## 1. Codebase Architecture & Page Layout Inspection

### 1.1 `app/page.tsx` Orchestration
- **Active Navigation State**: Managed via `useNav()` hook (`context/NavContext.tsx`). Supported tab IDs: `'dashboard' | 'digital_twin' | 'twin' | 'timeline' | 'simulator' | 'ai_coach' | 'aicoach'`.
- **Top Hero Section**: Always rendered above tab views whenever baseline entries exist (`latest` and `scores`). Renders `ScoreRing` (composite health index), `ThreeDigitalTwinCanvas` (3D silhouette), and `ScoreCards` (sub-scores).
- **Directory Structure Violation / Gap**: `PROJECT.md` mandates a dedicated `components/views/` directory containing view components (`DashboardView.tsx`, `DigitalTwinView.tsx`, `TimelineView.tsx`, `SimulatorView.tsx`, `AiCoachView.tsx`). Currently, **`components/views/` does not exist**, and all tab views are rendered as inline component blocks within `app/page.tsx`.

---

## 2. Evaluation of Tab View Screens

### 2.1 Dashboard View
- **Components Examined**: `ScoreCards.tsx`, `ScoreRing.tsx`, `EntryForm.tsx`, `EntryHistory.tsx`.
- **Current Behavior**:
  - Top Hero Section renders `ScoreRing` (0–100 radial ring) + `ScoreCards` (Metabolic, Activity, Nutrition).
  - Main 12-column grid renders `EntryForm` (5 cols) + `AiCoach` (7 cols).
  - Secondary 12-column grid renders `TimelineChart` (7 cols) + `SimulationPanel` (5 cols).
  - Bottom section renders `EntryHistory` table.
- **Assessment**:
  - **Functionality**: Complete functional flow for logging metrics and viewing sub-scores.
  - **Deficiencies**: Lacks encapsulation in `components/views/DashboardView.tsx`. The multi-section grid layout is cluttered due to duplicate inline chart/simulator instances.

### 2.2 Digital Twin (3D) View
- **Components Examined**: `ThreeDigitalTwinCanvas.tsx`.
- **Current Canvas Implementation**:
  - Three.js WebGL renderer displaying a translucent 3D human silhouette (Sphere head, Cylinder torso/limbs, Icosahedron metabolic core node, Torus cybernetic ring, orbiting particle cloud).
  - Emissive material color dynamically adjusts based on score (Cyan >=80, Yellow >=60, Red <60).
  - Mouse hover rotation lerp and window resize handling.
- **Current Tab Behavior in `app/page.tsx`**:
  - Selecting `activeTab === "digital_twin"` or `"twin"` renders the default `EntryForm` + `AiCoach` + `EntryHistory` layout beneath the hero canvas.
- **Deficiencies & Gaps**:
  - **No Dedicated View Component**: `digital_twin` tab simply duplicates the dashboard form layout.
  - **Missing Biometric Overlays**: Only renders a simple static text pill badge at the canvas bottom. Lacks interactive organ system hotspots (Pancreatic B-cell health index, Glucose uptake efficiency, Vascular resistance, Metabolic load), telemetry sidebar cards, camera position preset buttons, or 360-degree rotation controls.

### 2.3 Timeline View
- **Components Examined**: `TimelineChart.tsx`.
- **Current Implementation**:
  - Recharts `ResponsiveContainer` rendering `LineChart` mapping entry dates to Twin Composite Score (0–100 left Y-axis) and HbA1c % (4–12 right Y-axis).
  - Custom glassmorphic tooltip displaying glucose, HbA1c, and score.
- **Current Tab Behavior in `app/page.tsx`**:
  - Renders `TimelineChart` full-width (12 cols), followed by `EntryForm` (6 cols) and `SimulationPanel` (6 cols), plus `EntryHistory`.
- **Deficiencies & Gaps**:
  - **No Dedicated View Component**: Missing `components/views/TimelineView.tsx`.
  - **Single Chart Limitation**: Only plots Composite Score vs. HbA1c. Lacks tabbed/selectable charts for Fasting Glucose trends, Weight trajectory, Sleep vs. Exercise correlation, time-range filter toggles (7D, 30D, 90D, 1Y), and compliance statistics summary cards.

### 2.4 Simulator View
- **Components Examined**: `SimulationPanel.tsx`.
- **Current Implementation**:
  - 4 interactive HTML range sliders: Weight Change (-15..+10 kg), Exercise Shift (-90..+200 min/wk), Diet Quality Shift (-3..+3 pts), Sleep Shift (-3..+3 hrs).
  - Real-time score delta calculations via `lib/twin.ts` `simulate()`.
  - Displays composite score highlight box, sub-score comparison cards (Metabolic, Activity, Nutrition), and estimated HbA1c level badge.
  - Emits `onSimulationChange` to ground `AiCoach` in active scenario.
- **Current Tab Behavior in `app/page.tsx`**:
  - Renders `SimulationPanel` (6 cols) side-by-side with `AiCoach` (6 cols), plus `EntryHistory`.
- **Deficiencies & Gaps**:
  - **No Dedicated View Component**: Missing `components/views/SimulatorView.tsx`.
  - **Lacks Visual Scenario Comparison**: No side-by-side radar or bar charts contrasting baseline vs. simulated twin state. Missing one-click preset scenario buttons (e.g., "Low Carb Shift", "Active Cardio Plan", "Sleep Recovery Goal").

### 2.5 AI Coach View
- **Components Examined**: `AiCoach.tsx`, `app/api/coach/route.ts`.
- **Current Implementation**:
  - Dedicated chat interface connected via `fetch("/api/coach")`.
  - Displays prominent What-If Simulation Active banner when simulation sliders are adjusted.
  - Dynamically computes contextual prompt suggestion chips based on real-time biometric grounding and simulation deltas.
  - Auto-scrolling message history with user and AI message styling, typing animation, and error feedback.
- **Current Tab Behavior in `app/page.tsx`**:
  - Renders `AiCoach` across 12 cols, but still displays the top hero section above and `EntryHistory` table below.
- **Deficiencies & Gaps**:
  - **No Dedicated View Component**: Missing `components/views/AiCoachView.tsx`.
  - **Workspace Constraints**: Chat height is constrained inside inline grid cards instead of providing a full-screen, dedicated AI health coaching workspace with an integrated biometric telemetry side panel.

---

## 3. Design Token Alignment with `stitch_diabetx_ai_digital_twin/DESIGN.md`

### 3.1 Design System Specification Summary
- **Brand & Theme**: "Organic Minimalist" — calm, centered, paper-like foundation.
- **Color Tokens**:
  - `primary`: `#2b2b2b` / `#5f5e5e` (Charcoal)
  - `secondary`: `#406907` / `#3d6603` (Forest Green)
  - `background` / `surface`: `#fdf8f7` / `#e8e2e0` (Warm Neutral)
  - `surface-container-low`: `#f7f3f2`
  - `surface-container-high`: `#ebe7e6`
  - `outline`: `#7f7570`
- **Typography Tokens**:
  - **Comfortaa** font across all levels (`headline-lg`: 32px/40px bold, `headline-md`: 24px/32px semibold, `body-lg`: 16px/24px regular, `body-md`: 14px/20px regular, `label-md`: 12px/16px medium).
- **Corner Radius Tokens**:
  - Standard: `8px` (`0.5rem`)
  - Containers: `16px` (`1rem`)
  - Modals / Overlays: `24px` (`1.5rem`)
  - Chips: Pill (`9999px`)

### 3.2 Current Implementation vs. Design Token Gap
1. **Color Palette Mismatch**: The current application uses a dark cyber glassmorphism palette (`#0A0E1A` background, `#131826` panel surfaces, `#22D3EE` cyan, `#8B5CF6` violet). `tailwind.config.ts` defines `twin` and `surface-container` colors pointing to `#0A0E1A`.
2. **Typography Alignment**: `tailwind.config.ts` includes `Comfortaa` under `fontFamily` (e.g. `headline-lg`, `body-md`), but components frequently mix `Inter`, `Space Grotesk`, and Tailwind font classes.
3. **Corner Radii & Spacing**: Components use rounded radii ranging from `rounded-xl` (12px) to `rounded-3xl` (24px). Spacing rhythms align moderately well with 8px base grid.

---

## 4. Stitch MCP Tool Availability & Capabilities

The environment provides 15 Stitch MCP tools:
1. `list_projects` / `get_project` / `create_project` / `delete_project`
2. `list_screens` / `get_screen` / `generate_screen_from_text` / `edit_screens` / `generate_variants`
3. `upload_design_md` / `create_design_system` / `create_design_system_from_design_md` / `update_design_system` / `list_design_systems` / `apply_design_system`

### Key Stitch Assets:
- `stitch_diabetx_ai_digital_twin/DESIGN.md`: Contains Organic Minimalist design tokens and design rules.
- `stitch_diabetx_ai_digital_twin/code.html`: Clean HTML layout generated by Stitch for DiabetX dashboard.

---

## 5. Summary of Missing Components & Required Enhancements for Milestone 3

| View | Missing / Required Component | Planned File Path | Key Enhancements |
|------|------------------------------|-------------------|------------------|
| **Views Directory** | View Directory Structure | `components/views/` | Create directory to house all 5 dedicated view components |
| **Dashboard** | Dedicated Dashboard View Screen | `components/views/DashboardView.tsx` | Modularize Hero, ScoreRing, Sub-Score cards, Daily Logger, and Recent Activity |
| **Digital Twin 3D** | Dedicated 3D Digital Twin View Screen | `components/views/DigitalTwinView.tsx` | Expanded 3D Canvas, interactive organ system hotspots (Pancreas, Vascular, Metabolic), telemetry inspection cards, camera preset controls |
| **Timeline** | Dedicated Historical Timeline View Screen | `components/views/TimelineView.tsx` | Multi-metric trend charts (Glucose, HbA1c, Score, Weight), date range filters (7D/30D/90D/1Y), summary statistics cards |
| **Simulator** | Dedicated What-If Simulator View Screen | `components/views/SimulatorView.tsx` | Parameter sliders, baseline vs. simulated radar/bar graph comparison, preset scenario buttons (Keto, Cardio, Sleep), risk projection indicators |
| **AI Coach** | Dedicated Full-Screen AI Coach View Screen | `components/views/AiCoachView.tsx` | Full-height chat interface, live biometric telemetry sidebar, dynamic prompt chips, scenario grounding |
