import { NextResponse } from "next/server";
import type { TwinEntry, TwinScores, SimulationChangeData } from "@/lib/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the DiabetX Coach, an educational assistant inside a diabetes
self-management app. You are talking to someone who is logging their own
weight, HbA1c, fasting glucose, sleep, exercise, and diet quality, and exploring interactive What-If digital twin simulations.

Rules you must follow:
1. You are NOT a doctor. Never diagnose, never say "you have" a condition,
   and never recommend specific medication changes or dosages.
2. Every claim you make about the user's health MUST reference at least one
   specific number from the DATA block below (e.g. "your fasting glucose of
   118 mg/dL is..."). Do not give generic advice that ignores their numbers.
3. If WHAT-IF SIMULATION MODE is active in the DATA block, explicitly address their simulated scenario adjustments and projected score impact (e.g., "With your +60 min/week exercise shift, your projected composite score improves from 78 to 86...").
4. If a score or metric is missing from the data, say so instead of guessing.
5. Keep answers short: 3-5 sentences, plain language, no medical jargon
   without a one-line explanation.
6. End with one concrete, low-risk next step (e.g. a sleep or activity
   suggestion) — never a drug, supplement, or diagnostic claim.
7. If the user's question is about a medical emergency (chest pain, very
   high/low glucose with symptoms, etc.), tell them to seek in-person or
   emergency medical care immediately instead of answering normally.`;

interface CoachRequestBody {
  question: string;
  entry: TwinEntry;
  scores: TwinScores;
  simulation?: SimulationChangeData | null;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing GEMINI_API_KEY in .env.local." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as CoachRequestBody;
  const { question, entry, scores, simulation } = body;

  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "Missing question." }, { status: 400 });
  }

  let dataBlock = `DATA (most recent baseline entry, logged by the user):
- Weight: ${entry.weightKg} kg
- HbA1c: ${entry.hba1cPercent}%
- Fasting glucose: ${entry.fastingGlucoseMgDl} mg/dL
- Average sleep: ${entry.sleepHours} h/night
- Exercise: ${entry.exerciseMinutesPerWeek} min/week
- Self-rated diet quality: ${entry.dietQuality}/5

COMPUTED BASELINE TWIN SCORES (0-100, deterministic formulas):
- Composite Twin Score: ${scores.composite}
- Metabolic: ${scores.metabolic}
- Activity: ${scores.activity}
- Nutrition: ${scores.nutrition}`;

  if (simulation && simulation.isModified) {
    const { sliderDeltas, simulatedEntry, simScores, deltas } = simulation;
    dataBlock += `\n\nWHAT-IF SIMULATION MODE (ACTIVE SCENARIO):
User is simulating hypothetical lifestyle changes:
- Weight Change: ${sliderDeltas.weightKg > 0 ? "+" : ""}${sliderDeltas.weightKg} kg (Projected weight: ${simulatedEntry.weightKg.toFixed(1)} kg)
- Exercise Shift: ${sliderDeltas.exerciseMinutes > 0 ? "+" : ""}${sliderDeltas.exerciseMinutes} min/week (Projected exercise: ${simulatedEntry.exerciseMinutesPerWeek} min/week)
- Diet Quality Shift: ${sliderDeltas.dietPoints > 0 ? "+" : ""}${sliderDeltas.dietPoints} points (Projected diet quality: ${simulatedEntry.dietQuality}/5)
- Sleep Shift: ${sliderDeltas.sleepHours > 0 ? "+" : ""}${sliderDeltas.sleepHours} hrs/night (Projected sleep: ${simulatedEntry.sleepHours.toFixed(1)} hrs/night)

PROJECTED SIMULATION METRICS & TWIN SCORES:
- Projected Composite Score: ${simScores.composite} (Delta: ${deltas.composite > 0 ? "+" : ""}${deltas.composite.toFixed(1)} pts vs baseline ${scores.composite})
- Projected Metabolic Score: ${simScores.metabolic} (Delta: ${deltas.metabolic > 0 ? "+" : ""}${deltas.metabolic.toFixed(1)} pts)
- Projected Activity Score: ${simScores.activity} (Delta: ${deltas.activity > 0 ? "+" : ""}${deltas.activity.toFixed(1)} pts)
- Projected Nutrition Score: ${simScores.nutrition} (Delta: ${deltas.nutrition > 0 ? "+" : ""}${deltas.nutrition.toFixed(1)} pts)
- Projected Est. HbA1c: ${simulatedEntry.hba1cPercent.toFixed(2)}% (Baseline: ${entry.hba1cPercent}%)
- Projected Est. Fasting Glucose: ${simulatedEntry.fastingGlucoseMgDl.toFixed(0)} mg/dL (Baseline: ${entry.fastingGlucoseMgDl} mg/dL)`;
  }

  // Models prioritized by highest free daily rate limit (RPD) in Google AI Studio:
  // 1. gemini-3.1-flash-lite (500 RPD, 15 RPM, 250K TPM)
  // 2. gemini-2.5-flash-lite (20 RPD, 10 RPM, 250K TPM)
  // 3. gemini-2.5-flash (20 RPD, 5 RPM, 250K TPM)
  // 4. gemini-1.5-flash
  const modelsToTry = [
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-1.5-flash"
  ];

  let lastError = "";

  for (const modelName of modelsToTry) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: `${dataBlock}\n\nUSER QUESTION: ${question}` }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 400,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (text) {
          return NextResponse.json({ answer: text, modelUsed: modelName });
        }
      } else {
        lastError = await response.text();
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json(
    { error: `AI request failed across available models: ${lastError}` },
    { status: 502 }
  );
}
