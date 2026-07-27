# Comprehensive Gap Analysis & Technical Integration Plan

**Project:** DiabetX UI Redesign & Gemini AI Coach Integration  
**Author:** Explorer 3 (Integration & Gap Analyst)  
**Target Theme:** Google Stitch `diabetx_balanced_aligned_dashboard` (`d:\diabetx\stitch_diabetx_ai_digital_twin\diabetx_balanced_aligned_dashboard\code.html`)  
**Design Tokens:** `d:\diabetx\stitch_diabetx_ai_digital_twin\aura_health_systems\DESIGN.md`  
**Existing App:** Next.js 16 (App Router), React 19, Recharts 2.15, Tailwind CSS 3.4 (`d:\diabetx`)

---

## 1. Executive Summary & Scope

The existing DiabetX application (`d:\diabetx`) provides a functional Next.js/React digital twin dashboard with local storage, score calculation (`lib/twin.ts`), interactive simulation sliders (`components/SimulationPanel.tsx`), trend charting (`components/TimelineChart.tsx`), and a REST-backed Gemini AI Coach (`app/api/coach/route.ts`).

However, the existing UI features a simple dark cyber-theme with tabbed switching and standard glassmorphic cards. The Stitch theme (`diabetx_balanced_aligned_dashboard`) introduces a modern, high-tech glassmorphism visual language with:
1. **Collapsible/Fixed Navigation Infrastructure**: Vertical desktop sidebar (`w-64`), top mobile header, and bottom mobile navigation bar.
2. **Animated Background Canvas**: WebGL noise shader canvas with ambient radial cyan/violet glows.
3. **Interactive 3D Digital Twin Silhouette**: Three.js WebGL canvas displaying a responsive humanoid digital twin silhouette with mouse interaction and ambient lighting.
4. **Hero Score Ring & Sub-Scores**: Breathing SVG progress ring (84 score display) with integrated sub-score mini bars.
5. **Unified Responsive Grid**: Side-by-side hero section (Score Gauge + 3D Model) and multi-column grid layout for Form Controls, AI Coach, Chart, and Simulator.

This document maps every existing Next.js React component to its Stitch target, defines the precise Tailwind/CSS integration requirements, provides an end-to-end Gemini state synchronization plan, and outlines step-by-step worker migration instructions.

---

## 2. Component Mapping Matrix

| Existing React Component (`d:\diabetx`) | Stitch HTML/CSS Target (`code.html`) | Gap / Structural Differences | Action Required |
| :--- | :--- | :--- | :--- |
| **`app/layout.tsx`** | `<html>` / `<head>` / `<body>` | Lacks `Comfortaa` font import, WebGL canvas tag, ambient glow `<div>` containers. | Update `layout.tsx` to load fonts (`Comfortaa`, `Space Grotesk`, `Inter`, `Material Symbols Outlined`) and wrap content in ambient glows & WebGL background. |
| **`app/page.tsx` Header** | `<nav class="hidden md:flex flex-col h-screen ...">` (Sidebar) + `<header class="md:hidden ...">` (Mobile Top) | Existing `header` in `app/page.tsx` is a top horizontal header with simple buttons. Stitch uses a fixed vertical sidebar (`w-64`) on desktop + top bar on mobile. | Replace top header in `page.tsx` with dedicated `SideNavBar`, `TopNavBar`, and `BottomNavBar` components. |
| **NEW: Navigation Components** | `SideNavBar` (l. 413-449), `TopNavBar` (l. 451-464), `BottomNavBar` (l. 680-700) | Missing in `d:\diabetx`. | Create `components/SideNavBar.tsx`, `components/TopNavBar.tsx`, `components/BottomNavBar.tsx`. |
| **NEW: 3D Twin Silhouette** | Section `Right Hero: 3D Digital Twin` (l. 517-677) using Three.js | Missing in `d:\diabetx`. | Create `components/ThreeDigitalTwinCanvas.tsx` using `three` package or dynamic Three.js canvas in React `useEffect`. |
| **NEW: WebGL Background Shader** | Canvas `#shader-background` (l. 280-408) using WebGL GLSL noise | Missing in `d:\diabetx`. | Create `components/ShaderBackground.tsx` to render the animated WebGL fragment shader canvas. |
| **`ScoreRing.tsx`** | Section `Left Hero: Twin Score` (l. 471-494) | Existing ring is size 200px. Stitch uses 256px/320px (`w-64 h-64 md:w-80 md:h-80`), `font-display-lg text-[80px] md:text-[120px]`, `progress-ring-circle` breathing animation, and SVG linear gradient `#5f5e5e` to `#bdef82`. | Update `ScoreRing.tsx` styling, SVG gradient, and pulse animation to match Stitch design. |
| **`ScoreCards.tsx`** | Section `Mini Stats` (l. 496-515) | Existing cards are separate 3-column cards (`Metabolic`, `Activity`, `Nutrition`). Stitch integrates sub-scores as mini progress bars directly inside the Left Hero card beneath the score gauge. | Redesign `ScoreCards.tsx` to render horizontal mini progress bars matching Stitch sub-score progress tracks. |
| **`EntryForm.tsx`** | Form Controls / Logbook Input | Existing form has basic dark input fields. Stitch design specifies `surface-container-lowest/60`, rounded-lg/xl, cyan hairline focus glows, and custom range sliders. | Restyle `EntryForm.tsx` using Stitch input tokens, glassmorphism card styling, and custom cyan-violet range controls. |
| **`SimulationPanel.tsx`** | `Simulate Change` / Simulator Panel | Existing simulator has basic range sliders and delta comparisons. Stitch features glass card styling, pill slider thumbs (`.slider-thumb`), live metric comparison badges. | Update `SimulationPanel.tsx` with Stitch slider thumbs, glowing status pills, and live simulator state callbacks. |
| **`AiCoach.tsx`** | Coach Chat Interface / Sidebar | Existing AI Coach has a standard chat bubble layout. Stitch specifies `chat-scroll` custom scrollbar, `bg-surface-container-lowest/70`, quick suggestion pill chips, and real-time state badge. | Update `AiCoach.tsx` to accept live simulation state, render prompt chips with Stitch styling, and add model badge indicators. |
| **`TimelineChart.tsx`** | Trends & Analytics Chart | Existing chart uses Recharts with dark tooltips. Stitch styling requires rounded glass containers, customized axis ticks (`#4a4543` / `#94a3b8`), and matching line colors (`#22D3EE` / `#8B5CF6`). | Restyle `TimelineChart.tsx` glass wrapper and Recharts tooltip/grid colors. |
| **`EntryHistory.tsx`** | Logbook History Table | Existing history has basic list items. | Restyle `EntryHistory.tsx` items into Stitch glass rows with pill score badges. |
| **Footer (`app/page.tsx`)** | `<footer>` (l. 701-711) | Standard footer in `page.tsx`. Stitch specifies `md:ml-64 py-xl px-gutter` container alignment with legal links. | Create `components/Footer.tsx` matching Stitch footer layout. |

---

## 3. Grid & Alignment Plan

### 3.1 Overall Layout Structure & Grid Architecture

The Stitch `diabetx_balanced_aligned_dashboard` theme is structured around a **Fixed Vertical Navigation Sidebar** (`w-64` = 256px wide) on desktop, with main content offset by `md:ml-64`.

```
+------------------------------------------------------------------------------------+
|                               SHADER BACKGROUND CANVAS                             |
|                           + AMBIENT GLOW CYAN / VIOLET                             |
+-------------------+----------------------------------------------------------------+
| SIDEBAR (w-64)    | MAIN CONTENT CANVAS (md:ml-64 px-gutter max-w-container-max)  |
| [Fixed Desktop]   |                                                                |
|                   | +------------------------------------------------------------+ |
| Logo: DiabetX     | | HERO GRID (grid-cols-1 lg:grid-cols-2 gap-xl)              | |
| Status: Twin Active| | +--------------------------+ +---------------------------+ | |
|                   | | | HERO LEFT: SCORE RING  | | | HERO RIGHT: 3D TWIN   | | |
| Nav Links:        | | | - Progress Ring (84)   | | | - Three.js WebGL Model| | |
| - Dashboard       | | | - Insight Summary Text | | | - Live Sync Indicator | | |
| - Twin Engine     | | | - Mini Sub-scores      | | | - Mouse Interact Tag  | | |
| - Insights        | | +--------------------------+ +---------------------------+ | |
| - Logbook         | +------------------------------------------------------------+ |
| - Coach           |                                                                |
|                   | +------------------------------------------------------------+ |
| [Simulate Button] | | DASHBOARD MAIN GRID (grid-cols-1 lg:grid-cols-12 gap-xl)   | |
| [User Profile]    | | +------------------------+ +-----------------------------+ | |
|                   | | | LOG FORM (lg:col-span-5| | | AI COACH (lg:col-span-7)  | | |
|                   | | | / col-span-6)          | | | / col-span-6)           | | |
|                   | | +------------------------+ +-----------------------------+ | |
|                   | +------------------------------------------------------------+ |
|                   |                                                                |
|                   | +------------------------------------------------------------+ |
|                   | | ANALYTICS GRID (grid-cols-1 lg:grid-cols-12 gap-xl)        | |
|                   | | +------------------------+ +-----------------------------+ | |
|                   | | | TIMELINE CHART         | | | SIMULATOR PANEL           | | |
|                   | | | (lg:col-span-7)        | | | (lg:col-span-5)           | | |
|                   | | +------------------------+ +-----------------------------+ | |
|                   | +------------------------------------------------------------+ |
|                   |                                                                |
|                   | +------------------------------------------------------------+ |
|                   | | ENTRY HISTORY (full-width glass card)                      | |
|                   | +------------------------------------------------------------+ |
|                   |                                                                |
|                   | FOOTER (md:ml-64 calc(100% - 16rem))                           | |
+-------------------+----------------------------------------------------------------+
| BOTTOM NAV BAR (md:hidden fixed bottom-0 h-16)                                     |
+------------------------------------------------------------------------------------+
```

### 3.2 Detailed Breakpoint & Grid Specifications

1. **Desktop View (`md:` 768px+, `lg:` 1024px+)**:
   - `SideNavBar`: `hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40`.
   - Main Container: `flex-1 md:ml-64 pt-xxl md:pt-xl px-gutter pb-xxl max-w-container-max mx-auto`.
   - Hero Section: `grid grid-cols-1 lg:grid-cols-2 gap-xl w-full items-stretch`.
   - Core Row 1: `grid grid-cols-1 lg:grid-cols-12 gap-xl w-full` (EntryForm: `lg:col-span-5`, AiCoach: `lg:col-span-7`).
   - Core Row 2: `grid grid-cols-1 lg:grid-cols-12 gap-xl w-full` (TimelineChart: `lg:col-span-7`, SimulationPanel: `lg:col-span-5`).
   - Footer: `md:ml-64 w-[calc(100%-16rem)]`.

2. **Mobile View (`< 768px`)**:
   - `SideNavBar`: Hidden (`hidden`).
   - `TopNavBar`: `md:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-gutter py-md`.
   - `BottomNavBar`: `md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16`.
   - Main Container padding: `pt-20 pb-24 px-4`.
   - All grids collapse cleanly to `grid-cols-1`.

---

## 4. Gemini AI Coach Integration & Real-Time State Sync Plan

### 4.1 AI Coach API Architecture (`app/api/coach/route.ts`)

The existing API route handles Gemini API calls using server-side REST requests with model fallback:
- Prioritized models: `gemini-3.1-flash-lite`, `gemini-2.5-flash-lite`, `gemini-2.5-flash`, `gemini-1.5-flash`.
- API Key lookup: `process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY`.
- Payload format:
  ```json
  {
    "system_instruction": { "parts": [{ "text": SYSTEM_PROMPT }] },
    "contents": [{ "role": "user", "parts": [{ "text": "<dataBlock>\n\nUSER QUESTION: <question>" }] }],
    "generationConfig": { "maxOutputTokens": 400 }
  }
  ```

### 4.2 Real-Time Simulator State Synchronization Flow

In the current implementation, `AiCoach` only receives the static `latest` entry and `scores`. When users manipulate sliders in `SimulationPanel.tsx`, the simulated entry and scores are computed in React memory, but `AiCoach` is unaware of the simulated scenario.

To deliver a **seamless real-time AI digital twin experience**, we establish an explicit state synchronization model:

```
+-----------------------------------------------------------------------------------+
|                                 REACT PAGE STATE                                  |
|                                                                                   |
|  [Active Baseline Entry]  +-- (User moves slider) -->  [Simulation Sliders State] |
|            |                                                    |                 |
|            v                                                    v                 |
|  computeScores(latest)                                simulate(latest, simInputs) |
|            |                                                    |                 |
|            +-------------------------+                          v                 |
|                                      |               computeScores(simulated)     |
|                                      |                          |                 |
|                                      v                          v                 |
|                            +-----------------------------------------+            |
|                            |   AI Coach Active Mode Controller       |            |
|                            |   - Mode: "BASELINE" | "SIMULATED"       |            |
|                            +-----------------------------------------+            |
|                                                  |                                |
+--------------------------------------------------|--------------------------------+
                                                   v
                            +-----------------------------------------+
                            |       AiCoach Component Rendering       |
                            | - Displays active mode badge ("What-If") |
                            | - Dynamic prompt chips:                 |
                            |   "Explain my simulated A1c drop"       |
                            |   "Is +60m exercise realistic?"         |
                            | - Sends simulated data in API payload   |
                            +-----------------------------------------+
```

### 4.3 Interface Contracts & React Props Protocol

Update `components/AiCoach.tsx` props signature:

```typescript
export interface AiCoachProps {
  entry: TwinEntry;
  scores: TwinScores;
  simulatedEntry?: TwinEntry | null;
  simulatedScores?: TwinScores | null;
  isSimulating?: boolean;
  onResetSimulation?: () => void;
}
```

When `isSimulating` is `true` (i.e. `simulatedEntry` differs from `entry`):
1. `AiCoach` header displays a **cyan animated badge**: `"AI Twin Simulator Active — What-If Mode"`.
2. A toggle button allows switching between **"Log Baseline"** and **"Simulated Scenario"**.
3. Dynamic prompt suggestion chips automatically update to scenario-aware suggestions:
   - *"How does this +60 min exercise impact my glucose?"*
   - *"Explain why my projected HbA1c drops to 6.1%"*
   - *"What dietary tweaks optimize this what-if score?"*
4. API call sends `isSimulated: true` and formats the prompt payload with explicit simulation deltas, enabling Gemini to produce tailored, scenario-specific advice grounded in the digital twin's math.

---

## 5. Tailwind CSS & Styling Integration Plan

### 5.1 `tailwind.config.ts` Extension Strategy

We must merge the design tokens from `aura_health_systems/DESIGN.md` and `code.html` into `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch Surface & Neutral Palette
        surface: "#0f131f",
        "surface-dim": "#0f131f",
        "surface-bright": "#353946",
        "surface-container-lowest": "#0a0e1a",
        "surface-container-low": "#171b28",
        "surface-container": "#1b1f2c",
        "surface-container-high": "#262a37",
        "surface-container-highest": "#313442",
        "on-surface": "#dfe2f3",
        "on-surface-variant": "#bbc9cd",
        "inverse-surface": "#dfe2f3",
        "inverse-on-surface": "#2c303d",
        outline: "#859397",
        "outline-variant": "#3c494c",
        "surface-tint": "#2fd9f4",
        // Primary Accents
        primary: "#8aebff",
        "on-primary": "#00363e",
        "primary-container": "#22d3ee",
        "on-primary-container": "#005763",
        "inverse-primary": "#006877",
        // Secondary Accents
        secondary: "#d0bcff",
        "on-secondary": "#3c0091",
        "secondary-container": "#bdef82",
        "on-secondary-container": "#446e0d",
        // Tertiary Accents
        tertiary: "#61f6b9",
        "on-tertiary": "#003825",
        "tertiary-container": "#3dd99e",
        "on-tertiary-container": "#005a3e",
        // Status & Error
        error: "#ffb4ab",
        "error-container": "#93000a",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Comfortaa", "Space Grotesk", "ui-sans-serif", "sans-serif"],
        body: ["Comfortaa", "Inter", "ui-sans-serif", "sans-serif"],
        mono: ["monospace"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "40px",
        xxl: "64px",
        gutter: "24px",
        "container-max": "1280px",
      },
      animation: {
        "sidebar-slide": "slide-in-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "card-fade": "fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "breathe-pulse": "breathe-pulse 4s ease-in-out infinite",
      },
      keyframes: {
        "slide-in-left": {
          from: { transform: "translateX(-100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in-up": {
          from: { transform: "translateY(20px) scale(0.98)", opacity: "0" },
          to: { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        "breathe-pulse": {
          "0%, 100%": { filter: "drop-shadow(0 0 2px rgba(189, 239, 130, 0.3))", strokeWidth: "8" },
          "50%": { filter: "drop-shadow(0 0 8px rgba(189, 239, 130, 0.7))", strokeWidth: "9" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### 5.2 Global CSS Updates (`app/globals.css`)

We must inject Stitch custom classes into `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  color-scheme: dark;
}

body {
  background-color: #0a0e1a;
  color: #dfe2f3;
  position: relative;
  overflow-x: hidden;
  margin: 0;
  -webkit-font-smoothing: antialiased;
}

#shader-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -2;
  pointer-events: none;
}

.ambient-glow-cyan {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 50vw;
  height: 50vw;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, rgba(34, 211, 238, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;
}

.ambient-glow-violet {
  position: absolute;
  top: 20%;
  right: -20%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(189, 239, 130, 0.12) 0%, rgba(189, 239, 130, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;
}

.glass-card {
  background: rgba(19, 24, 38, 0.65);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.4s ease-out;
}

.glass-card:hover {
  background: rgba(19, 24, 38, 0.8);
  transform: translateY(-2px) scale(1.005);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(34, 211, 238, 0.3);
}

.gradient-text {
  background: linear-gradient(to right, #22d3ee, #bdef82);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-bg {
  background: linear-gradient(to right, #22d3ee, #bdef82);
}

.progress-ring-circle {
  transition: stroke-dashoffset 1s ease-in-out;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  animation: breathe-pulse 4s ease-in-out infinite;
}

.slider-thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(to right, #22d3ee, #bdef82);
  cursor: pointer;
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.4);
}

.chat-scroll::-webkit-scrollbar {
  width: 4px;
}
.chat-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}
.chat-scroll::-webkit-scrollbar-thumb {
  background: rgba(34, 211, 238, 0.2);
  border-radius: 2px;
}
```

### 5.3 Fonts & Head Metadata (`app/layout.tsx`)

In `app/layout.tsx`, add Google Fonts link tags for `Comfortaa`:
```tsx
<link
  href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
  rel="stylesheet"
/>
```

---

## 6. Step-by-Step Migration Strategy for Implementer Workers

To ensure zero downtime, clean TypeScript compilation, and flawless grid alignment, implementation is split into 4 distinct worker tasks:

### Phase 2: Design Tokens & Layout Infrastructure (`worker_design_tokens`)
1. **Configure Tailwind Tokens**: Update `tailwind.config.ts` with Stitch color values, `Comfortaa` font families, spacing units, and animation keyframes.
2. **Update Global Styles**: Update `app/globals.css` with WebGL canvas canvas styling, ambient glow circles, glass-card rules, slider thumb styling, and progress ring pulse animations.
3. **Load Google Fonts**: Add `Comfortaa` to `app/layout.tsx`.
4. **Create WebGL Shader Background Component**: Create `components/ShaderBackground.tsx` containing the WebGL canvas noise fragment shader from `code.html` (lines 280-408).
5. **Create Navigation Components**:
   - `components/SideNavBar.tsx`: Fixed desktop navigation panel (`w-64`).
   - `components/TopNavBar.tsx`: Mobile header (`md:hidden`).
   - `components/BottomNavBar.tsx`: Mobile bottom tab bar (`md:hidden`).
   - `components/Footer.tsx`: Desktop/Mobile responsive footer.

### Phase 3: Dashboard Components Redesign & Grid Alignment (`worker_components`)
1. **Create 3D Twin Model Canvas (`components/ThreeDigitalTwinCanvas.tsx`)**:
   - Wrap Three.js WebGL canvas in a React `useEffect` hook.
   - Build procedural semi-transparent humanoid silhouette geometry (head, torso, arms, pelvis, legs) with mouse interaction and `ResizeObserver`.
2. **Redesign Score Ring (`components/ScoreRing.tsx`)**:
   - Update to 256px/320px responsive container (`w-64 h-64 md:w-80 md:h-80`).
   - Add SVG linear gradient (`#5f5e5e` to `#bdef82`), breathing pulse animation, and large score typography.
3. **Redesign Sub-scores & Hero Section**:
   - Integrate mini progress bars into `ScoreCards.tsx` or directly inside the Left Hero card.
   - Assemble Hero Section inside `app/page.tsx` with 2-column grid (`Left Hero: ScoreRing` + `Right Hero: ThreeDigitalTwinCanvas`).
4. **Redesign Form Controls & History**:
   - Update `EntryForm.tsx` inputs to use Stitch form fields and range sliders.
   - Update `EntryHistory.tsx` to display glass log cards with pill badges.
5. **Redesign Timeline Chart**:
   - Update `TimelineChart.tsx` with Stitch glass container and Recharts theme colors.

### Phase 4: Gemini AI Coach Integration & State Sync (`worker_ai_coach`)
1. **Redesign AI Coach UI (`components/AiCoach.tsx`)**:
   - Update chat container to match Stitch glass styling (`chat-scroll`, prompt chips, header icons).
2. **Implement Real-Time Simulation Sync**:
   - Update `app/page.tsx` state to pass both active `latest` entry/scores AND `simulatedEntry`/`simulatedScores` to `AiCoach`.
   - Add visual indicator badge in `AiCoach` when simulation mode is active.
   - Provide scenario-aware prompt suggestions ("Explain my simulated A1c drop", "How does +60 min exercise help?").
   - Update `app/api/coach/route.ts` prompt context builder to support simulated what-if comparisons.

### Phase 5: Verification & Build Validation (`worker_build`)
1. **Type & Lint Check**: Execute TypeScript compiler checks.
2. **Build Test**: Run `npx next build` to ensure clean compilation without warnings or errors.
3. **Layout & Responsiveness Inspection**: Verify grid alignment on desktop (1280px+), tablet (768px-1023px), and mobile (<768px).

---

## 7. Verification Method

To verify the migration independently:
1. **Build Test**: Run `npx next build` inside `d:\diabetx`. Verify zero compilation or lint errors.
2. **Layout Grid Audit**:
   - Inspect desktop view: verify fixed 256px (`w-64`) sidebar on left, main content aligned with `md:ml-64`.
   - Inspect mobile view: verify sidebar hidden, top header and bottom 16px navigation bar visible.
   - Inspect Hero Grid: verify equal height twin score gauge (left) and 3D Three.js canvas (right).
3. **State Sync Verification**:
   - Adjust `SimulationPanel` sliders (e.g. increase exercise by 60 mins).
   - Verify `AiCoach` instantly updates badge status to "What-If Mode" and offers simulation prompt chips.
   - Submit question to AI Coach and verify Gemini API response addresses the simulated values.
