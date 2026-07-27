import type { TwinEntry, TwinScores, SimulationInput } from "./types";

/**
 * Digital Twin scoring engine.
 *
 * Simplified, transparent heuristics loosely anchored to common reference
 * ranges (ADA HbA1c bands, WHO activity guidance) — NOT a diagnostic tool.
 * Every score is a deterministic function of the entry, so results are
 * reproducible and explainable without calling an AI model.
 */

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function metabolicScore(
  entry: Pick<TwinEntry, "hba1cPercent" | "fastingGlucoseMgDl">
): number {
  const hba1cScore = clamp(100 - (entry.hba1cPercent - 5.0) * 25, 0, 100);
  const glucoseScore = clamp(100 - (entry.fastingGlucoseMgDl - 90) * 0.8, 0, 100);
  return Math.round((hba1cScore + glucoseScore) / 2);
}

export function activityScore(
  entry: Pick<TwinEntry, "exerciseMinutesPerWeek" | "sleepHours">
): number {
  const exerciseSubscore = clamp((entry.exerciseMinutesPerWeek / 150) * 100, 0, 100);
  const sleepSubscore = clamp(100 - Math.abs(entry.sleepHours - 8) * 20, 0, 100);
  return Math.round((exerciseSubscore + sleepSubscore) / 2);
}

export function nutritionScore(entry: Pick<TwinEntry, "dietQuality">): number {
  return Math.round(clamp((entry.dietQuality / 5) * 100, 0, 100));
}

export function computeScores(entry: TwinEntry): TwinScores {
  const metabolic = metabolicScore(entry);
  const activity = activityScore(entry);
  const nutrition = nutritionScore(entry);
  const composite = Math.round(metabolic * 0.45 + activity * 0.3 + nutrition * 0.25);
  return { metabolic, activity, nutrition, composite };
}

/**
 * Applies a hypothetical change and recomputes scores — the "what if"
 * simulation. Purely deterministic: re-runs the formulas above on
 * adjusted inputs rather than asking an AI model to guess a number.
 */
export function simulate(base: TwinEntry, sim: SimulationInput): TwinEntry {
  return {
    ...base,
    id: `sim-${base.id}`,
    weightKg: Math.max(0, base.weightKg + sim.weightDeltaKg),
    exerciseMinutesPerWeek: Math.max(0, base.exerciseMinutesPerWeek + sim.exerciseDeltaMinutes),
    dietQuality: clamp(base.dietQuality + sim.dietDeltaPoints, 1, 5),
    sleepHours: clamp(base.sleepHours + (sim.sleepDeltaHours ?? 0), 2, 14),
    hba1cPercent: clamp(
      base.hba1cPercent -
        sim.exerciseDeltaMinutes / 300 -
        sim.dietDeltaPoints * 0.05 +
        sim.weightDeltaKg * 0.02,
      4.5,
      12
    ),
    fastingGlucoseMgDl: clamp(
      base.fastingGlucoseMgDl -
        sim.exerciseDeltaMinutes / 5 -
        sim.dietDeltaPoints * 2 +
        sim.weightDeltaKg * 1.5,
      70,
      300
    ),
  };
}

/**
 * Deterministic, rule-based explanation of which sub-score is weakest and
 * why — no AI call involved, just reads back the same numbers the scoring
 * functions above used.
 */
export function explainScores(entry: TwinEntry, scores: TwinScores): string {
  const subs = [
    { name: "Metabolic", score: scores.metabolic },
    { name: "Activity", score: scores.activity },
    { name: "Nutrition", score: scores.nutrition },
  ];
  const weakest = subs.reduce((a, b) => (b.score < a.score ? b : a));

  if (weakest.name === "Metabolic") {
    if (entry.hba1cPercent >= 6.5) {
      return `Your HbA1c of ${entry.hba1cPercent}% is in the diabetes range (>=6.5%) — the main factor pulling your Metabolic score down.`;
    }
    if (entry.fastingGlucoseMgDl >= 100) {
      return `Your fasting glucose of ${entry.fastingGlucoseMgDl} mg/dL is above the healthy range (<100 mg/dL), weighing down your Metabolic score.`;
    }
    return `Your Metabolic score has the most room to improve right now.`;
  }
  if (weakest.name === "Activity") {
    if (entry.exerciseMinutesPerWeek < 150) {
      return `You're logging ${entry.exerciseMinutesPerWeek} min/week of exercise, below the 150 min/week guideline — your biggest lever for the Activity score.`;
    }
    return `Your sleep of ${entry.sleepHours}h/night is furthest from the 8h target, holding back your Activity score.`;
  }
  return `A diet quality rating of ${entry.dietQuality}/5 is your biggest opportunity — small, consistent changes move your Nutrition score fastest.`;
}
