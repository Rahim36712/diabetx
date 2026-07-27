import React from "react";
import ReactDOMServer from "react-dom/server";
import DashboardView from "../components/views/DashboardView";
import DigitalTwinView from "../components/views/DigitalTwinView";
import TimelineView from "../components/views/TimelineView";
import SimulatorView from "../components/views/SimulatorView";
import AiCoachView from "../components/views/AiCoachView";
import AiCoach from "../components/AiCoach";
import { computeScores, simulate, explainScores } from "../lib/twin";
import type { TwinEntry, TwinScores, SimulationChangeData } from "../lib/types";

let passCount = 0;
let failCount = 0;
const issuesFound: string[] = [];

function assert(condition: boolean, testName: string, failureDetails: string = "") {
  if (condition) {
    passCount++;
    console.log(`[PASS] ${testName}`);
  } else {
    failCount++;
    issuesFound.push(`${testName}: ${failureDetails}`);
    console.error(`[FAIL] ${testName}: ${failureDetails}`);
  }
}

async function runStressTests() {
  console.log("==================================================");
  console.log("   DIABETX DEEP STRESS & EDGE CASE HARNESS       ");
  console.log("==================================================\n");

  const baseEntry: TwinEntry = {
    id: "base-stress-1",
    timestamp: Date.now(),
    weightKg: 85,
    hba1cPercent: 7.1,
    fastingGlucoseMgDl: 145,
    sleepHours: 5.5,
    exerciseMinutesPerWeek: 45,
    dietQuality: 2,
  };
  const baseScores = computeScores(baseEntry);

  // 1. STRESS TEST: 1000 Historical Telemetry Entries in TimelineView
  console.log("--- 1. Stress Testing TimelineView with 1,000 Historical Entries ---");
  const largeEntries: TwinEntry[] = [];
  const now = Date.now();
  for (let i = 0; i < 1000; i++) {
    largeEntries.push({
      id: `entry-${i}`,
      timestamp: now - i * 86400000, // daily for 1000 days
      weightKg: 70 + (i % 20),
      hba1cPercent: 5.5 + (i % 30) * 0.1,
      fastingGlucoseMgDl: 80 + (i % 60),
      sleepHours: 6 + (i % 4) * 0.5,
      exerciseMinutesPerWeek: 30 + (i % 150),
      dietQuality: 1 + (i % 5),
    });
  }

  const startMs = Date.now();
  let timelineHtml = "";
  try {
    timelineHtml = ReactDOMServer.renderToString(
      React.createElement(TimelineView, {
        entries: largeEntries,
        latest: baseEntry,
      })
    );
    const elapsedMs = Date.now() - startMs;
    assert(
      elapsedMs < 1000,
      "TimelineView renders 1,000 entries within 1000ms",
      `Took ${elapsedMs}ms`
    );
    assert(
      timelineHtml.includes("Log Compliance") && timelineHtml.includes("1000 entries recorded"),
      "TimelineView correctly counts and displays compliance for 1,000 entries"
    );
  } catch (err: any) {
    assert(false, "TimelineView 1000 entries stress test", err.message || String(err));
  }

  // 2. STRESS TEST: Extreme Boundary Telemetry Values in DigitalTwinView & SimulatorView
  console.log("\n--- 2. Extreme Boundary Telemetry Values ---");
  const extremeLowEntry: TwinEntry = {
    id: "ext-low",
    timestamp: Date.now(),
    weightKg: 10,
    hba1cPercent: 2.0,
    fastingGlucoseMgDl: 30,
    sleepHours: 1.0,
    exerciseMinutesPerWeek: 0,
    dietQuality: 1,
  };

  const extremeHighEntry: TwinEntry = {
    id: "ext-high",
    timestamp: Date.now(),
    weightKg: 300,
    hba1cPercent: 20.0,
    fastingGlucoseMgDl: 600,
    sleepHours: 24.0,
    exerciseMinutesPerWeek: 5000,
    dietQuality: 5,
  };

  try {
    const htmlLowTwin = ReactDOMServer.renderToString(
      React.createElement(DigitalTwinView, {
        latest: extremeLowEntry,
        scores: computeScores(extremeLowEntry),
      })
    );
    assert(htmlLowTwin.length > 0, "DigitalTwinView handles extreme low telemetry values");

    const htmlHighTwin = ReactDOMServer.renderToString(
      React.createElement(DigitalTwinView, {
        latest: extremeHighEntry,
        scores: computeScores(extremeHighEntry),
      })
    );
    assert(htmlHighTwin.length > 0, "DigitalTwinView handles extreme high telemetry values");
  } catch (err: any) {
    assert(false, "DigitalTwinView extreme values test", err.message || String(err));
  }

  // 3. STRESS TEST: Long AI Coach Chat Component & Special Characters
  console.log("\n--- 3. AI Coach Chat Component & Special Characters ---");
  try {
    const htmlCoachSpecial = ReactDOMServer.renderToString(
      React.createElement(AiCoach, {
        entry: baseEntry,
        scores: baseScores,
        simulation: null,
      })
    );
    assert(
      htmlCoachSpecial.includes("AI Coach"),
      "AiCoach component renders initial state safely"
    );
  } catch (err: any) {
    assert(false, "AiCoach component rendering", err.message || String(err));
  }

  // 4. STRESS TEST: Simulation Engine Combinations
  console.log("\n--- 4. Simulation Engine Combinations & Invariants ---");
  const simNegative = simulate(baseEntry, {
    weightDeltaKg: -50,
    exerciseDeltaMinutes: -500,
    dietDeltaPoints: -10,
    sleepDeltaHours: -10,
  });
  const scoresNeg = computeScores(simNegative);
  assert(
    scoresNeg.composite >= 0 && scoresNeg.composite <= 100,
    "Composite score bounded [0, 100] under extreme negative simulation deltas",
    `Got ${scoresNeg.composite}`
  );
  assert(
    scoresNeg.metabolic >= 0 && scoresNeg.metabolic <= 100,
    "Metabolic score bounded [0, 100] under extreme negative simulation deltas",
    `Got ${scoresNeg.metabolic}`
  );
  assert(
    scoresNeg.activity >= 0 && scoresNeg.activity <= 100,
    "Activity score bounded [0, 100] under extreme negative simulation deltas",
    `Got ${scoresNeg.activity}`
  );
  assert(
    scoresNeg.nutrition >= 0 && scoresNeg.nutrition <= 100,
    "Nutrition score bounded [0, 100] under extreme negative simulation deltas",
    `Got ${scoresNeg.nutrition}`
  );

  console.log("\n==================================================");
  console.log(` SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  if (issuesFound.length > 0) {
    console.log(" ISSUES FOUND:");
    issuesFound.forEach((iss) => console.log(` - ${iss}`));
  } else {
    console.log(" ALL DEEP STRESS TESTS PASSED!");
  }
  console.log("==================================================");
}

runStressTests();
