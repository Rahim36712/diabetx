# DiabetX Codebase Deep-Dive Analysis

**Author:** Explorer 1 (Codebase Researcher)  
**Date:** 2026-07-27  
**Scope:** `d:\diabetx` (App Router, Components, Gemini AI Integration, Styling, Scoring Engine, Build Setup)

---

## 1. Executive Summary & High-Level Architecture

DiabetX is a Next.js 16 client-side digital twin application designed for individuals managing or monitoring Type 2 diabetes / prediabetes risk. It converts user-logged health metrics (fasting glucose, HbA1c, weight, sleep, exercise, diet quality) into a 0–100 **Digital Twin Score** using a deterministic mathematical scoring engine (`lib/twin.ts`).

### Architecture Highlights
- **Framework:** Next.js 16 (App Router) with React 19 and Turbopack.
- **Data Persistence:** Client-side `localStorage` (`diabetx.entries.v1`) with zero backend database.
- **AI Integration:** Next.js API Route (`app/api/coach/route.ts`) serving as a secure proxy to Google Gemini REST API (`generativelanguage.googleapis.com`), enforcing system prompt guidelines and passing grounded user data.
- **Styling:** Dark cyber-physiological theme utilizing Tailwind CSS 3.4, custom CSS glassmorphic components, SVG gradients, and Google Fonts (`Inter` and `Space Grotesk`).
- **Charts & Visualization:** Recharts for historical trend plotting.

---

## 2. Project Layout & Configuration

### Directory Tree
```
d:\diabetx\
├── app/
│   ├── api/
│   │   └── coach/
│   │       └── route.ts         # Gemini AI API proxy route handler
│   ├── globals.css              # Custom Tailwind directives & global styling classes
│   ├── layout.tsx               # Root layout, Google Fonts & Material Symbols injection
│   └── page.tsx                 # Main dashboard layout, state initialization, tab switching
├── components/
│   ├── AiCoach.tsx              # AI Coach sidebar/panel chat interface
│   ├── EntryForm.tsx            # Form controls for logging health markers
│   ├── EntryHistory.tsx         # List of logged entries with deletion options
│   ├── ScoreCards.tsx           # Sub-score progress cards (Metabolic, Activity, Nutrition)
│   ├── ScoreRing.tsx            # SVG circular gauge for Composite Twin Score
│   ├── SimulationPanel.tsx      # What-If simulator with live sliders and before/after metrics
│   └── TimelineChart.tsx        # Recharts dual-axis line chart for score & HbA1c history
├── lib/
│   ├── storage.ts               # LocalStorage read/write/delete utility functions
│   ├── twin.ts                  # Deterministic scoring engine & simulator logic
│   └── types.ts                 # TypeScript interfaces (TwinEntry, TwinScores, SimulationInput)
├── .env.example                 # Template env configuration (lists ANTHROPIC_API_KEY)
├── .env.local                   # Local dev env (contains GEMINI_API_KEY)
├── next.config.mjs              # Default Next.js ESM configuration
├── package.json                 # Project manifest & dependencies
├── postcss.config.mjs           # PostCSS configuration with Tailwind CSS & Autoprefixer
├── tailwind.config.ts           # Custom Tailwind theme extensions (colors, fonts)
└── tsconfig.json                # TypeScript compiler config with `@/*` path mapping
```

### Key Dependencies (`package.json`)
```json
{
  "dependencies": {
    "next": "16.2.12",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "recharts": "^2.15.4"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.6.0"
  }
}
```

---

## 3. Existing Dashboard Components Analysis

### 3.1 Score Gauge (`components/ScoreRing.tsx`)
- **Visual Design:** Animated SVG circular ring (`viewBox="0 0 100 100"`), stroke radius 45, circumference 282.7.
- **Gradient & Glow:** Linear gradient (`#22D3EE` cyan to `#8B5CF6` violet) with CSS drop-shadow (`.ring-glow`) and smooth path transition (`.score-path-transition`).
- **Props:** `score: number`, `label?: string` (default: `"Twin Score"`), `size?: number` (default: `200`).
- **Behavior:** Dynamic `strokeDashoffset = circumference - (score / 100) * circumference`.

### 3.2 Sub-Score Cards (`components/ScoreCards.tsx`)
- **Structure:** Grid of 3 cards for `Metabolic`, `Activity`, and `Nutrition`.
- **Card Props:** `label`, `score` (0-100), `hint`, `icon` (Material Symbols), `colorClass`, `bgClass`, `barClass`.
- **Metrics Breakdown:**
  - **Metabolic (Green `#10B981`):** Represents HbA1c & Fasting Glucose.
  - **Activity (Cyan `#22D3EE`):** Represents Exercise (min/wk) & Sleep (h/night).
  - **Nutrition (Violet `#8B5CF6`):** Represents Diet Quality Rating (1-5).
- **Progress Bar:** Horizontal bar with percentage width fill.

### 3.3 Form Controls (`components/EntryForm.tsx`)
- **State Management:** `useState` hooks for 6 parameters initialized from `defaults` or fallback values:
  - Fasting Glucose (`fastingGlucoseMgDl`, default 110 mg/dL)
  - Weight (`weightKg`, default 75 kg)
  - HbA1c (`hba1cPercent`, default 6.4%)
  - Sleep (`sleepHours`, default 7 h/night)
  - Exercise (`exerciseMinutesPerWeek`, default 90 min/wk)
  - Diet Quality (`dietQuality`, range slider 1-5, default 3)
- **Submit Behavior:** Calls `onSubmit(entry)` which generates a unique `id` via `makeId()` (`Date.now() + random suffix`) and saves to `localStorage`.

### 3.4 Timeline Chart (`components/TimelineChart.tsx`)
- **Library:** Recharts (`ResponsiveContainer`, `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `CartesianGrid`).
- **Dual Y-Axes:**
  - **Left Y-Axis (Cyan `#22D3EE`):** Composite Twin Score (0-100 range, solid 3px line).
  - **Right Y-Axis (Purple `#8B5CF6`):** HbA1c Percentage (4-12 range, dashed 2px line).
- **Conditional Rendering:** Requires at least 2 entries to display. If `< 2` entries, displays empty state prompt.

### 3.5 What-If Simulator (`components/SimulationPanel.tsx`)
- **State:** Sliders for `weightDelta` (-15 to +10 kg), `exerciseDelta` (-90 to +200 min/wk), `dietDelta` (-3 to +3 pts).
- **Logic:** Uses `useMemo` calling `simulate()` from `@/lib/twin`.
- **Output:** Live `Comparison` component showing baseline vs. simulated Twin Score and estimated HbA1c with colored delta tags (`#10B981` for improvement, `#F87171` for regression).

### 3.6 AI Coach (`components/AiCoach.tsx`)
- **State:** `question` string, `history` array of `ChatTurn` (`{ question, answer }`), `loading` boolean, `error` string|null.
- **Preset Suggestions:**
  - *"Why is my metabolic score low?"*
  - *"How to improve metabolic?"*
  - *"Is my sleep affecting my glucose?"*
- **Network Call:** Sends POST request to `/api/coach` with payload `{ question, entry, scores }`.

### 3.7 Entry History (`components/EntryHistory.tsx`)
- **Features:** Shows reverse-chronological list of logged entries. Displays date/time, fasting glucose, HbA1c, exercise min/wk, computed score badge, and a delete button (`onDelete(id)`).

---

## 4. Gemini AI Coach Implementation

### 4.1 Route Handler (`app/api/coach/route.ts`)
- **Runtime:** `export const runtime = "nodejs"`.
- **Endpoint:** `POST /api/coach`.
- **API Key Resolution:** Checks `process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY`.
- **Environment Note:** `.env.local` provides `GEMINI_API_KEY`. (Note: `.env.example` references `ANTHROPIC_API_KEY`, but the implementation code specifically targets the Gemini REST API).

### 4.2 Fallback Model Hierarchy
To maximize reliability and handle rate limits (RPD/RPM) gracefully, the API route iterates through Google AI Studio models in order:
1. `gemini-3.1-flash-lite` (500 RPD free limit)
2. `gemini-2.5-flash-lite` (20 RPD free limit)
3. `gemini-2.5-flash` (20 RPD free limit)
4. `gemini-1.5-flash`

### 4.3 System Prompt & Data Injection
The route prepends strict instructions and formats the user's latest entry into a structured `DATA` block:

```typescript
const SYSTEM_PROMPT = `You are the DiabetX Coach, an educational assistant inside a diabetes self-management app...
Rules:
1. You are NOT a doctor. Never diagnose, never say "you have" a condition, and never recommend specific medication changes or dosages.
2. Every claim about health MUST reference at least one specific number from the DATA block.
3. If a score/metric is missing, say so instead of guessing.
4. Keep answers short: 3-5 sentences, plain language.
5. End with one concrete, low-risk next step.
6. For medical emergencies, direct user to immediate emergency care.`;
```

---

## 5. CSS / Styling Infrastructure & Design Tokens

### 5.1 Tailwind Custom Configuration (`tailwind.config.ts`)
- **Color Palette (`twin.*`):**
  - Background: `twin.bg` = `#0A0E1A` (Deep void dark)
  - Panel: `twin.panel` = `#131826` (Translucent dark indigo)
  - Border: `twin.border` = `#232B3D`
  - Primary Accent: `twin.cyan` = `#22D3EE`
  - Secondary Accent: `twin.violet` = `#8B5CF6`
  - Status Indicators: `twin.good` = `#34D399`, `twin.warn` = `#FBBF24`, `twin.bad` = `#F87171`
  - Typography: `twin.text` = `#E5E7EB`, `twin.muted` = `#94A3B8`
- **Typography:**
  - `font-sans`: Inter, ui-sans-serif, system-ui, sans-serif
  - `font-display`: "Space Grotesk", ui-sans-serif, system-ui, sans-serif

### 5.2 Global CSS (`app/globals.css`)
- **Glassmorphic Cards (`.glass-card`):** `background: rgba(19, 24, 38, 0.75)`, `backdrop-filter: blur(20px)`, subtle white border `rgba(255, 255, 255, 0.08)`.
- **Cyber Gradients (`.gradient-text`, `.gradient-bg`):** Linear gradient from `#22D3EE` (cyan) to `#8B5CF6` (violet) with drop shadow.
- **Custom Input Styling (`.input`):** Dark semi-transparent input background `#0A0E1A`, cyan focus ring and glow shadow.

---

## 6. Scoring Engine & Mathematics (`lib/twin.ts`)

The Digital Twin Score is 100% deterministic, calculated as follows:

1. **Metabolic Score (45% weight):**
   - `hba1cScore = clamp(100 - (hba1c - 5.0) * 25, 0, 100)`
   - `glucoseScore = clamp(100 - (glucose - 90) * 0.8, 0, 100)`
   - `metabolic = round((hba1cScore + glucoseScore) / 2)`

2. **Activity Score (30% weight):**
   - `exerciseSubscore = clamp((exerciseMinutes / 150) * 100, 0, 100)`
   - `sleepSubscore = clamp(100 - Math.abs(sleepHours - 8) * 20, 0, 100)`
   - `activity = round((exerciseSubscore + sleepSubscore) / 2)`

3. **Nutrition Score (25% weight):**
   - `nutrition = round(clamp((dietQuality / 5) * 100, 0, 100))`

4. **Composite Twin Score:**
   - `composite = round(metabolic * 0.45 + activity * 0.3 + nutrition * 0.25)`

5. **Simulation Projections:**
   - Heuristic delta functions estimate HbA1c reduction (`exerciseDeltaMinutes / 300 + dietDeltaPoints * 0.05 - weightDeltaKg * 0.02`) and fasting glucose shifts.

---

## 7. Build Setup & Verification

- Script commands: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.
- Build Toolchain: Next.js 16 with Turbopack, SWC, TypeScript 5.6.
- Build Output: Successfully compiles with static generation for `/` and server-side API route for `/api/coach`.
