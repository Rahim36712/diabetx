## 2026-07-27T18:09:46Z

You are Worker 3 (AI Integration Specialist) for DiabetX UI Redesign.
Your working directory is `d:\diabetx\.agents\worker_ai_coach_integration`. Please create this folder if needed.

Task Overview:
Integrate the Gemini AI Coach with real-time digital twin state sync and redesign the AI Coach component (`components/AiCoach.tsx` & `app/api/coach/route.ts`) according to the Google Stitch `diabetx_balanced_aligned_dashboard` design system in `d:\diabetx`.

Detailed Instructions:
1. **Real-Time State Sync**:
   - In `app/page.tsx`, wire state between `SimulationPanel` and `AiCoach`.
   - Pass `simulatedData`, `simulatedScores`, and slider delta state from `SimulationPanel` into `AiCoach`.
   - When user adjusts simulation sliders, `AiCoach` should display a prominent "What-If Simulation Mode" indicator badge with scenario summary.
   - Provide scenario-aware prompt suggestion chips (e.g., "Analyze my +12 score gain from exercise", "What diet tweaks balance weight change?", "How does +30 min activity impact HbA1c?").
2. **Gemini API Proxy Route (`app/api/coach/route.ts`)**:
   - Update POST handler to accept `simulation` payload parameters (e.g., `weightDelta`, `exerciseDelta`, `dietDelta`, `projectedScore`, `projectedHbA1c`).
   - Include simulation scenario metrics in the Gemini model system prompt context block (`DATA` context block) so Gemini responds with contextually aware recommendations for simulated what-if scenarios.
   - Retain fallback model chain (`gemini-3.1-flash-lite`, `gemini-2.5-flash-lite`, `gemini-2.5-flash`, `gemini-1.5-flash`) and safety system prompts.
3. **Stitch UI Redesign (`components/AiCoach.tsx`)**:
   - Hero AI insight glass banner at top of chat panel with `auto_awesome` badge, cyan/violet gradient title, and quick insight summary.
   - Glassmorphic card chat container (`.glass-card`), dark glass background (`bg-surface-container-lowest/80 backdrop-blur-xl border border-white/10`).
   - Cyberpunk cyan/violet user and AI message bubbles, typing indicator animation, auto-scroll container (`.chat-scroll`).
   - Quick action prompt chips that fill or auto-submit prompt questions to Gemini.
4. **Verification**:
   - Run `npx next build` in `d:\diabetx` to verify a 100% clean production build with 0 TypeScript or CSS errors.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Output requirements:
- Create `d:\diabetx\.agents\worker_ai_coach_integration\progress.md` with liveness timestamp.
- Write your detailed implementation report to `d:\diabetx\.agents\worker_ai_coach_integration\handoff.md`.
- Communicate completion to parent via send_message with build/test results.
