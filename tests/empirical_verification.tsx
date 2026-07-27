import React from "react";
import ReactDOMServer from "react-dom/server";
import DashboardView from "../components/views/DashboardView";
import DigitalTwinView from "../components/views/DigitalTwinView";
import TimelineView from "../components/views/TimelineView";
import SimulatorView from "../components/views/SimulatorView";
import AiCoachView from "../components/views/AiCoachView";
import { computeScores, simulate, explainScores, metabolicScore, activityScore, nutritionScore } from "../lib/twin";
import type { TwinEntry, TwinScores, SimulationChangeData } from "../lib/types";

// Mock sample entries
const mockEntry1: TwinEntry = {
  id: "test-entry-1",
  timestamp: Date.now() - 86400000 * 7,
  weightKg: 82.5,
  hba1cPercent: 6.8,
  fastingGlucoseMgDl: 125,
  sleepHours: 6.5,
  exerciseMinutesPerWeek: 90,
  dietQuality: 3,
};

const mockEntry2: TwinEntry = {
  id: "test-entry-2",
  timestamp: Date.now() - 86400000 * 3,
  weightKg: 81.0,
  hba1cPercent: 6.5,
  fastingGlucoseMgDl: 110,
  sleepHours: 7.5,
  exerciseMinutesPerWeek: 140,
  dietQuality: 4,
};

const mockEntryLatest: TwinEntry = {
  id: "test-entry-latest",
  timestamp: Date.now(),
  weightKg: 79.5,
  hba1cPercent: 6.2,
  fastingGlucoseMgDl: 105,
  sleepHours: 8.0,
  exerciseMinutesPerWeek: 160,
  dietQuality: 4,
};

const mockEntries = [mockEntry1, mockEntry2, mockEntryLatest];
const mockScores = computeScores(mockEntryLatest);

const mockSimData: SimulationChangeData = {
  simulatedEntry: simulate(mockEntryLatest, {
    weightDeltaKg: -3,
    exerciseDeltaMinutes: 60,
    dietDeltaPoints: 1,
    sleepDeltaHours: 0.5,
  }),
  simScores: computeScores(
    simulate(mockEntryLatest, {
      weightDeltaKg: -3,
      exerciseDeltaMinutes: 60,
      dietDeltaPoints: 1,
      sleepDeltaHours: 0.5,
    })
  ),
  deltas: { metabolic: 8, activity: 12, nutrition: 15, composite: 11 },
  sliderDeltas: { weightKg: -3, exerciseMinutes: 60, dietPoints: 1, sleepHours: 0.5 },
  isModified: true,
};

let passCount = 0;
let failCount = 0;
const results: { test: string; status: "PASS" | "FAIL"; details: string }[] = [];

function assert(condition: boolean, testName: string, failureDetails: string = "") {
  if (condition) {
    passCount++;
    results.push({ test: testName, status: "PASS", details: "OK" });
    console.log(`[PASS] ${testName}`);
  } else {
    failCount++;
    results.push({ test: testName, status: "FAIL", details: failureDetails });
    console.error(`[FAIL] ${testName}: ${failureDetails}`);
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("   DIABETX EMPIRICAL TEST SUITE — MILESTONE 3 & 4  ");
  console.log("==================================================\n");

  // TEST SUITE 1: Component Export Verification
  console.log("--- 1. View Component Export Verification ---");
  assert(typeof DashboardView === "function", "DashboardView export default is function");
  assert(typeof DigitalTwinView === "function", "DigitalTwinView export default is function");
  assert(typeof TimelineView === "function", "TimelineView export default is function");
  assert(typeof SimulatorView === "function", "SimulatorView export default is function");
  assert(typeof AiCoachView === "function", "AiCoachView export default is function");

  // TEST SUITE 2: Pure Engine Scoring & Simulation Verification
  console.log("\n--- 2. Scoring Engine & Simulation Unit Verification ---");
  const scores = computeScores(mockEntryLatest);
  assert(
    scores.metabolic >= 0 && scores.metabolic <= 100,
    "Metabolic score within [0, 100]",
    `Got ${scores.metabolic}`
  );
  assert(
    scores.activity >= 0 && scores.activity <= 100,
    "Activity score within [0, 100]",
    `Got ${scores.activity}`
  );
  assert(
    scores.nutrition >= 0 && scores.nutrition <= 100,
    "Nutrition score within [0, 100]",
    `Got ${scores.nutrition}`
  );
  assert(
    scores.composite >= 0 && scores.composite <= 100,
    "Composite score within [0, 100]",
    `Got ${scores.composite}`
  );

  const explanation = explainScores(mockEntryLatest, scores);
  assert(
    typeof explanation === "string" && explanation.length > 0,
    "explainScores returns non-empty explanation string"
  );

  // TEST SUITE 3: Component SSR Rendering Verification
  console.log("\n--- 3. React Component SSR Rendering Verification ---");
  
  // 3a. DashboardView
  try {
    const htmlDash = ReactDOMServer.renderToString(
      React.createElement(DashboardView, {
        entries: mockEntries,
        latest: mockEntryLatest,
        scores: mockScores,
        onNewEntry: () => {},
        onDeleteEntry: () => {},
        simulationData: mockSimData,
        onSimulationChange: () => {},
      })
    );
    assert(
      htmlDash.includes("Twin Health Index") || htmlDash.includes("DashboardView"),
      "DashboardView renders HTML successfully",
      `HTML length: ${htmlDash.length}`
    );
  } catch (err: any) {
    assert(false, "DashboardView renders HTML successfully", err.message || String(err));
  }

  // 3b. DigitalTwinView
  try {
    const htmlTwin = ReactDOMServer.renderToString(
      React.createElement(DigitalTwinView, {
        latest: mockEntryLatest,
        scores: mockScores,
        simulationData: mockSimData,
      })
    );
    assert(
      htmlTwin.includes("Interactive 3D Digital Twin Viewport") || htmlTwin.includes("Organ Hotspots"),
      "DigitalTwinView renders HTML successfully",
      `HTML length: ${htmlTwin.length}`
    );
  } catch (err: any) {
    assert(false, "DigitalTwinView renders HTML successfully", err.message || String(err));
  }

  // 3c. TimelineView
  try {
    const htmlTimeline = ReactDOMServer.renderToString(
      React.createElement(TimelineView, {
        entries: mockEntries,
        latest: mockEntryLatest,
      })
    );
    assert(
      htmlTimeline.includes("Historical Trends") || htmlTimeline.includes("Log Compliance"),
      "TimelineView renders HTML successfully",
      `HTML length: ${htmlTimeline.length}`
    );
  } catch (err: any) {
    assert(false, "TimelineView renders HTML successfully", err.message || String(err));
  }

  // 3d. SimulatorView
  try {
    const htmlSim = ReactDOMServer.renderToString(
      React.createElement(SimulatorView, {
        baseEntry: mockEntryLatest,
        simulationData: mockSimData,
        onSimulationChange: () => {},
      })
    );
    assert(
      htmlSim.includes("What-If Lifestyle") || htmlSim.includes("Baseline vs. Simulated"),
      "SimulatorView renders HTML successfully",
      `HTML length: ${htmlSim.length}`
    );
  } catch (err: any) {
    assert(false, "SimulatorView renders HTML successfully", err.message || String(err));
  }

  // 3e. AiCoachView
  try {
    const htmlCoach = ReactDOMServer.renderToString(
      React.createElement(AiCoachView, {
        entry: mockEntryLatest,
        scores: mockScores,
        simulation: mockSimData,
      })
    );
    assert(
      htmlCoach.includes("AI Health Coach Workspace") || htmlCoach.includes("Twin Intelligence"),
      "AiCoachView renders HTML successfully",
      `HTML length: ${htmlCoach.length}`
    );
  } catch (err: any) {
    assert(false, "AiCoachView renders HTML successfully", err.message || String(err));
  }

  // TEST SUITE 4: Edge Conditions & Stress Testing
  console.log("\n--- 4. Edge Conditions & Stress Testing ---");

  // Edge Test 4a: Empty entries in TimelineView
  try {
    const htmlEmptyTimeline = ReactDOMServer.renderToString(
      React.createElement(TimelineView, {
        entries: [],
        latest: mockEntryLatest,
      })
    );
    assert(
      htmlEmptyTimeline.includes("0%") || htmlEmptyTimeline.includes("No entries"),
      "TimelineView handles empty entries array without crashing",
      `HTML length: ${htmlEmptyTimeline.length}`
    );
  } catch (err: any) {
    assert(false, "TimelineView handles empty entries array without crashing", err.message || String(err));
  }

  // Edge Test 4b: Extreme Simulator Sliders & Boundary Metrics
  try {
    const extremeSim = simulate(mockEntryLatest, {
      weightDeltaKg: 100, // extreme weight gain
      exerciseDeltaMinutes: 10000, // extreme exercise
      dietDeltaPoints: 10,
      sleepDeltaHours: 24,
    });
    const extremeScores = computeScores(extremeSim);

    assert(
      !isNaN(extremeScores.composite) && isFinite(extremeScores.composite),
      "Extreme simulation produces finite numbers (no NaN/Infinity)",
      `Composite score: ${extremeScores.composite}`
    );
    assert(
      extremeSim.hba1cPercent >= 4.5 && extremeSim.hba1cPercent <= 12,
      "Extreme HbA1c is clamped within valid bounds [4.5, 12]",
      `HbA1c: ${extremeSim.hba1cPercent}`
    );
    assert(
      extremeSim.fastingGlucoseMgDl >= 70 && extremeSim.fastingGlucoseMgDl <= 300,
      "Extreme glucose is clamped within valid bounds [70, 300]",
      `Glucose: ${extremeSim.fastingGlucoseMgDl}`
    );
    assert(
      extremeSim.dietQuality >= 1 && extremeSim.dietQuality <= 5,
      "Extreme diet quality is clamped within valid bounds [1, 5]",
      `Diet quality: ${extremeSim.dietQuality}`
    );
    assert(
      extremeSim.sleepHours >= 2 && extremeSim.sleepHours <= 14,
      "Extreme sleep hours is clamped within valid bounds [2, 14]",
      `Sleep hours: ${extremeSim.sleepHours}`
    );
  } catch (err: any) {
    assert(false, "Extreme simulator sliders handling", err.message || String(err));
  }

  // Edge Test 4c: Boundary Metrics (Zero & Negative values in scoring)
  try {
    const zeroEntry: TwinEntry = {
      id: "zero-entry",
      timestamp: Date.now(),
      weightKg: 0,
      hba1cPercent: 0,
      fastingGlucoseMgDl: 0,
      sleepHours: 0,
      exerciseMinutesPerWeek: 0,
      dietQuality: 0,
    };
    const zeroScores = computeScores(zeroEntry);
    assert(
      zeroScores.composite >= 0 && zeroScores.composite <= 100 && !isNaN(zeroScores.composite),
      "Zero/Boundary inputs handled safely by computeScores",
      `Composite: ${zeroScores.composite}`
    );
  } catch (err: any) {
    assert(false, "Zero/Boundary inputs handled safely by computeScores", err.message || String(err));
  }

  // Edge Test 4d: Null/Unmodified SimulationData prop in Views
  try {
    const htmlTwinNoSim = ReactDOMServer.renderToString(
      React.createElement(DigitalTwinView, {
        latest: mockEntryLatest,
        scores: mockScores,
        simulationData: null,
      })
    );
    assert(
      htmlTwinNoSim.length > 0,
      "DigitalTwinView handles null simulationData prop gracefully"
    );

    const htmlCoachNoSim = ReactDOMServer.renderToString(
      React.createElement(AiCoachView, {
        entry: mockEntryLatest,
        scores: mockScores,
        simulation: null,
      })
    );
    assert(
      htmlCoachNoSim.length > 0,
      "AiCoachView handles null simulation prop gracefully"
    );
  } catch (err: any) {
    assert(false, "Null simulationData prop in views", err.message || String(err));
  }

  console.log("\n==================================================");
  console.log(` SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("==================================================");
}

runTests();
