## 2026-07-27T13:05:52Z
<USER_REQUEST>
You are Worker 2 (Dashboard Components Specialist) for DiabetX UI Redesign.
Your working directory is `d:\diabetx\.agents\worker_components_redesign`. Please create this folder if needed.

Task Overview:
Redesign all core dashboard components (`ScoreRing.tsx`, `ScoreCards.tsx`, `EntryForm.tsx`, `TimelineChart.tsx`, `SimulationPanel.tsx`) in `d:\diabetx` to strictly match the Google Stitch `diabetx_balanced_aligned_dashboard` design system and align perfectly within the 12-column responsive layout.

Detailed Instructions:
1. **`components/ScoreRing.tsx`**:
   - SVG circular progress ring (viewBox 0 0 100 100 or 120 120), animated `stroke-dasharray`, cyan/violet gradient fill, outer ambient pulse glow, central composite score display (e.g. 84) with status badge ("OPTIMAL / GOOD / AT RISK") and description.
2. **`components/ScoreCards.tsx`**:
   - Redesign Metabolic, Activity, and Nutrition sub-score cards into Stitch glassmorphic mini-cards with rounded progress bars (`h-1.5`), score values, target ranges, and status badges.
3. **`components/EntryForm.tsx`**:
   - Biometric and lifestyle form inputs (Glucose, HbA1c, Weight, Exercise, Diet, Sleep).
   - Glass card container, floating input labels, focus rings (`focus:ring-2 focus:ring-cyan-400`), custom slider thumb controls, and primary CTA button with Stitch gradient (`from-cyan-500 to-violet-600 hover:opacity-90`).
4. **`components/TimelineChart.tsx`**:
   - Recharts timeline chart container formatted with dark glass backdrop (`bg-surface-container-lowest/80 backdrop-blur-xl`), custom cyan (`#22D3EE`) glucose curve and violet (`#8B5CF6`) HbA1c/score curve, custom glass tooltip, axis styling matching Space Grotesk font.
5. **`components/SimulationPanel.tsx`**:
   - Interactive what-if simulation sliders (Weight delta, Exercise min/day, Diet score, Sleep hrs).
   - Real-time score delta calculations (Metabolic, Activity, Nutrition, Composite Score).
   - Custom `.slider-thumb` styling, visual delta badges (e.g. `+12.4` in lime green or `-5.2` in coral red), reset button, and export callback prop `onSimulationChange(simulatedData)` to inform AI Coach.
6. **Verification**:
   - Run `npx next build` to verify clean build without TypeScript errors.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Output requirements:
- Create `d:\diabetx\.agents\worker_components_redesign\progress.md` with liveness timestamp.
- Write your detailed implementation report to `d:\diabetx\.agents\worker_components_redesign\handoff.md`.
- Communicate completion to parent via send_message with build/test results.
</USER_REQUEST>
