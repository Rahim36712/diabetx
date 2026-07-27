import React from "react";
import ReactDOMServer from "react-dom/server";
import AiCoach from "../components/AiCoach";
import { computeScores } from "../lib/twin";
import type { TwinEntry } from "../lib/types";

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

const html = ReactDOMServer.renderToString(
  React.createElement(AiCoach, {
    entry: baseEntry,
    scores: baseScores,
    simulation: null,
  })
);
console.log("Includes 'AI Coach':", html.includes("AI Coach"));
console.log("Includes 'Diabet':", html.includes("Diabet"));
console.log("Includes 'DiabetX':", html.includes("DiabetX"));
