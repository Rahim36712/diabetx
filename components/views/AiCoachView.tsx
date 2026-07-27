"use client";

import React from "react";
import type { TwinEntry, TwinScores, SimulationChangeData } from "@/lib/types";
import AiCoach from "@/components/AiCoach";
import ScoreRing from "@/components/ScoreRing";
import { explainScores } from "@/lib/twin";

interface AiCoachViewProps {
  entry: TwinEntry;
  scores: TwinScores;
  simulation?: SimulationChangeData | null;
}

export default function AiCoachView({
  entry,
  scores,
  simulation,
}: AiCoachViewProps) {
  const isSim = Boolean(simulation && simulation.isModified);
  const activeScores = isSim && simulation ? simulation.simScores : scores;
  const activeEntry = isSim && simulation ? simulation.simulatedEntry : entry;

  return (
    <div className="space-y-6 animate-card">
      {/* Header Bar */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-cyan-400 text-2xl">
              smart_toy
            </span>
            <h2 className="font-display text-xl font-bold text-slate-100">
              Dedicated AI Health Coach Workspace
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Full-height AI chat interface grounded in your digital twin telemetry and simulation models.
          </p>
        </div>

        {isSim && (
          <span className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            GROUNDED IN SIMULATION SCENARIO
          </span>
        )}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[640px]">
        {/* Left 8 Cols: Full Height AI Chat Area */}
        <div className="lg:col-span-8 flex flex-col min-h-[640px]">
          <AiCoach entry={entry} scores={scores} simulation={simulation} />
        </div>

        {/* Right 4 Cols: Live Biometric Telemetry & Twin Status Sidebar */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          {/* Twin Composite Ring & Explainability Card */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center space-y-4 text-center">
            <ScoreRing score={activeScores.composite} size={170} />
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                Active Grounding Context
              </span>
              <p className="text-xs font-medium text-slate-300 leading-relaxed">
                {explainScores(activeEntry, activeScores)}
              </p>
            </div>
          </div>

          {/* Sub-Scores Telemetry Readout */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Telemetry Sub-Scores</span>
              <span className="text-cyan-400">Live</span>
            </h3>

            <div className="space-y-2.5">
              <TelemetryRow
                label="Metabolic Resilience"
                score={activeScores.metabolic}
                color="bg-emerald-400"
                value={`${activeEntry.fastingGlucoseMgDl} mg/dL | HbA1c ${activeEntry.hba1cPercent.toFixed(1)}%`}
              />
              <TelemetryRow
                label="Physical Activity"
                score={activeScores.activity}
                color="bg-cyan-400"
                value={`${activeEntry.exerciseMinutesPerWeek} min/wk | ${activeEntry.sleepHours}h sleep`}
              />
              <TelemetryRow
                label="Nutrition Quality"
                score={activeScores.nutrition}
                color="bg-violet-400"
                value={`Diet rating: ${activeEntry.dietQuality}/5`}
              />
            </div>
          </div>

          {/* Simulation Delta Info Card */}
          {isSim && simulation && (
            <div className="glass-card rounded-2xl p-5 border border-cyan-500/30 bg-cyan-500/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                <span className="material-symbols-outlined text-sm">tune</span>
                <span>Active Scenario Shifts</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 pt-1">
                <div>Weight: {simulation.sliderDeltas.weightKg >= 0 ? "+" : ""}{simulation.sliderDeltas.weightKg} kg</div>
                <div>Exercise: {simulation.sliderDeltas.exerciseMinutes >= 0 ? "+" : ""}{simulation.sliderDeltas.exerciseMinutes} min</div>
                <div>Diet: {simulation.sliderDeltas.dietPoints >= 0 ? "+" : ""}{simulation.sliderDeltas.dietPoints} pts</div>
                <div>Sleep: {simulation.sliderDeltas.sleepHours >= 0 ? "+" : ""}{simulation.sliderDeltas.sleepHours} hrs</div>
              </div>
            </div>
          )}

          {/* System Safety Notice */}
          <div className="glass-card rounded-2xl p-4 border border-white/10 text-[11px] text-slate-400 leading-relaxed font-mono flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-base shrink-0">shield</span>
            <span>
              DiabetX AI insights are generated locally using biometric score algorithms. Always consult your endocrinologist for clinical therapy changes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TelemetryRow({
  label,
  score,
  color,
  value,
}: {
  label: string;
  score: number;
  color: string;
  value: string;
}) {
  return (
    <div className="bg-[#0A0E1A]/80 p-3 rounded-xl border border-white/10 space-y-1.5">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="font-bold text-slate-100">{score}/100</span>
      </div>
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-slate-400 block pt-0.5">{value}</span>
    </div>
  );
}
