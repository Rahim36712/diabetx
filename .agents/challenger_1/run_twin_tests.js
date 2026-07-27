const fs = require('fs');
const path = require('path');

// We can load twin.ts content or transpile/run it directly.
// Let's create an inline executor of the exact functions from lib/twin.ts for empirical testing.

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function metabolicScore(entry) {
  const hba1cScore = clamp(100 - (entry.hba1cPercent - 5.0) * 25, 0, 100);
  const glucoseScore = clamp(100 - (entry.fastingGlucoseMgDl - 90) * 0.8, 0, 100);
  return Math.round((hba1cScore + glucoseScore) / 2);
}

function activityScore(entry) {
  const exerciseSubscore = clamp((entry.exerciseMinutesPerWeek / 150) * 100, 0, 100);
  const sleepSubscore = clamp(100 - Math.abs(entry.sleepHours - 8) * 20, 0, 100);
  return Math.round((exerciseSubscore + sleepSubscore) / 2);
}

function nutritionScore(entry) {
  return Math.round(clamp((entry.dietQuality / 5) * 100, 0, 100));
}

function computeScores(entry) {
  const metabolic = metabolicScore(entry);
  const activity = activityScore(entry);
  const nutrition = nutritionScore(entry);
  const composite = Math.round(metabolic * 0.45 + activity * 0.3 + nutrition * 0.25);
  return { metabolic, activity, nutrition, composite };
}

function simulate(base, sim) {
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

function explainScores(entry, scores) {
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

// Empirical Test Execution
const results = {
  totalTests: 0,
  passed: 0,
  failures: []
};

function assert(condition, message, details = {}) {
  results.totalTests++;
  if (condition) {
    results.passed++;
  } else {
    results.failures.push({ message, details });
    console.error(`FAIL: ${message}`, details);
  }
}

console.log("=== EMPIRICAL TEST SUITE: lib/twin.ts ===");

// 1. Baseline standard entry test
const baseEntry = {
  id: "test-1",
  timestamp: Date.now(),
  weightKg: 70,
  hba1cPercent: 6.4,
  fastingGlucoseMgDl: 110,
  sleepHours: 7,
  exerciseMinutesPerWeek: 60,
  dietQuality: 3,
};

const baseScores = computeScores(baseEntry);
console.log("Base Entry Scores:", baseScores);
assert(baseScores.metabolic >= 0 && baseScores.metabolic <= 100, "Metabolic score in [0, 100]");
assert(baseScores.activity >= 0 && baseScores.activity <= 100, "Activity score in [0, 100]");
assert(baseScores.nutrition >= 0 && baseScores.nutrition <= 100, "Nutrition score in [0, 100]");
assert(baseScores.composite >= 0 && baseScores.composite <= 100, "Composite score in [0, 100]");

// 2. Extreme Slider & Boundary Simulation Tests
console.log("\n--- Testing Slider Extremes ---");

// Min Weight (-15kg on 70kg baseline = 55kg)
const simMinWeight = simulate(baseEntry, { weightDeltaKg: -15, exerciseDeltaMinutes: 0, dietDeltaPoints: 0, sleepDeltaHours: 0 });
console.log("Sim Min Weight (-15kg):", simMinWeight);
assert(simMinWeight.weightKg === 55, "Weight reduced to 55kg");
assert(simMinWeight.hba1cPercent <= baseEntry.hba1cPercent, "Weight loss lowers or maintains HbA1c");

// Extreme negative weight (Weight becomes 0)
const simExtremeNegWeight = simulate(baseEntry, { weightDeltaKg: -100, exerciseDeltaMinutes: 0, dietDeltaPoints: 0, sleepDeltaHours: 0 });
console.log("Sim Extreme Neg Weight (-100kg):", simExtremeNegWeight);
assert(simExtremeNegWeight.weightKg === 0, "Weight clamped to 0kg via Math.max");

// Max Weight (+10kg)
const simMaxWeight = simulate(baseEntry, { weightDeltaKg: 10, exerciseDeltaMinutes: 0, dietDeltaPoints: 0, sleepDeltaHours: 0 });
assert(simMaxWeight.weightKg === 80, "Weight increased to 80kg");

// Exercise 0 min/wk vs Max (+200 min/wk)
const simZeroEx = simulate(baseEntry, { weightDeltaKg: 0, exerciseDeltaMinutes: -60, dietDeltaPoints: 0, sleepDeltaHours: 0 });
assert(simZeroEx.exerciseMinutesPerWeek === 0, "Exercise clamped to 0 min/wk");

const simMaxEx = simulate(baseEntry, { weightDeltaKg: 0, exerciseDeltaMinutes: 200, dietDeltaPoints: 0, sleepDeltaHours: 0 });
assert(simMaxEx.exerciseMinutesPerWeek === 260, "Exercise increased to 260 min/wk");

// Extreme Diet Score Shift (-3 to +3)
const simMinDiet = simulate(baseEntry, { weightDeltaKg: 0, exerciseDeltaMinutes: 0, dietDeltaPoints: -3, sleepDeltaHours: 0 });
assert(simMinDiet.dietQuality === 1, "Diet quality clamped to min 1");

const simMaxDiet = simulate(baseEntry, { weightDeltaKg: 0, exerciseDeltaMinutes: 0, dietDeltaPoints: 3, sleepDeltaHours: 0 });
assert(simMaxDiet.dietQuality === 5, "Diet quality clamped to max 5");

// Extreme Diet Shift outside slider range (-10 to +10)
const simOverDiet = simulate(baseEntry, { weightDeltaKg: 0, exerciseDeltaMinutes: 0, dietDeltaPoints: 10, sleepDeltaHours: 0 });
assert(simOverDiet.dietQuality === 5, "Diet quality clamped strictly to upper limit 5");

const simUnderDiet = simulate(baseEntry, { weightDeltaKg: 0, exerciseDeltaMinutes: 0, dietDeltaPoints: -10, sleepDeltaHours: 0 });
assert(simUnderDiet.dietQuality === 1, "Diet quality clamped strictly to lower limit 1");

// 3. HbA1c & Fasting Glucose Clamp Boundaries
console.log("\n--- Testing Metabolic Clamping Boundaries ---");
// Max positive deltas to push HbA1c low
const simMaxLowHbA1c = simulate({ ...baseEntry, hba1cPercent: 4.6 }, { weightDeltaKg: -15, exerciseDeltaMinutes: 200, dietDeltaPoints: 3, sleepDeltaHours: 0 });
console.log("Sim Max Low HbA1c:", simMaxLowHbA1c.hba1cPercent);
assert(simMaxLowHbA1c.hba1cPercent === 4.5, "HbA1c clamped at lower bound 4.5%");

// Max weight gain & bad diet to push HbA1c high
const simMaxHighHbA1c = simulate({ ...baseEntry, hba1cPercent: 11.5 }, { weightDeltaKg: 50, exerciseDeltaMinutes: -100, dietDeltaPoints: -4, sleepDeltaHours: 0 });
console.log("Sim Max High HbA1c:", simMaxHighHbA1c.hba1cPercent);
assert(simMaxHighHbA1c.hba1cPercent === 12.0, "HbA1c clamped at upper bound 12.0%");

// Glucose Clamping
const simMaxLowGlucose = simulate({ ...baseEntry, fastingGlucoseMgDl: 75 }, { weightDeltaKg: -20, exerciseDeltaMinutes: 500, dietDeltaPoints: 4, sleepDeltaHours: 0 });
assert(simMaxLowGlucose.fastingGlucoseMgDl === 70, "Fasting glucose clamped at lower bound 70 mg/dL");

const simMaxHighGlucose = simulate({ ...baseEntry, fastingGlucoseMgDl: 290 }, { weightDeltaKg: 50, exerciseDeltaMinutes: -100, dietDeltaPoints: -4, sleepDeltaHours: 0 });
assert(simMaxHighGlucose.fastingGlucoseMgDl === 300, "Fasting glucose clamped at upper bound 300 mg/dL");

// 4. Rapid Fuzzing / 10,000 Iteration Stress Test
console.log("\n--- Running 10,000 Iteration Monte Carlo Fuzzing ---");
let nanFound = false;
let outOfBoundsScore = false;

for (let i = 0; i < 10000; i++) {
  const randEntry = {
    id: `fuzz-${i}`,
    timestamp: Date.now(),
    weightKg: Math.random() * 200,
    hba1cPercent: 3.0 + Math.random() * 12,
    fastingGlucoseMgDl: 40 + Math.random() * 400,
    sleepHours: Math.random() * 24,
    exerciseMinutesPerWeek: Math.random() * 1500,
    dietQuality: Math.floor(Math.random() * 5) + 1,
  };

  const randSim = {
    weightDeltaKg: (Math.random() - 0.5) * 50,
    exerciseDeltaMinutes: (Math.random() - 0.5) * 300,
    dietDeltaPoints: (Math.random() - 0.5) * 10,
    sleepDeltaHours: (Math.random() - 0.5) * 10,
  };

  const sEntry = simulate(randEntry, randSim);
  const sScores = computeScores(sEntry);

  if (
    Number.isNaN(sScores.metabolic) ||
    Number.isNaN(sScores.activity) ||
    Number.isNaN(sScores.nutrition) ||
    Number.isNaN(sScores.composite)
  ) {
    nanFound = true;
  }

  if (
    sScores.metabolic < 0 || sScores.metabolic > 100 ||
    sScores.activity < 0 || sScores.activity > 100 ||
    sScores.nutrition < 0 || sScores.nutrition > 100 ||
    sScores.composite < 0 || sScores.composite > 100
  ) {
    outOfBoundsScore = true;
  }
}

assert(!nanFound, "No NaN scores generated in 10,000 randomized simulations");
assert(!outOfBoundsScore, "All scores in 10,000 randomized simulations stayed strictly in [0, 100]");

// 5. Check explainScores edge case: tie breaks
console.log("\n--- Testing explainScores Tie-Breaks ---");
const equalScoresEntry = { ...baseEntry, hba1cPercent: 5.0, fastingGlucoseMgDl: 90, exerciseMinutesPerWeek: 150, sleepHours: 8, dietQuality: 5 };
const equalScores = computeScores(equalScoresEntry);
console.log("Equal scores:", equalScores);
const explanation = explainScores(equalScoresEntry, equalScores);
console.log("Explanation for equal scores:", explanation);
assert(typeof explanation === "string" && explanation.length > 0, "Explanation returned for tie scores");

console.log("\n=== TEST RESULTS SUMMARY ===");
console.log(`Passed: ${results.passed} / ${results.totalTests}`);
console.log(`Failures: ${results.failures.length}`);

if (results.failures.length > 0) {
  process.exit(1);
}
