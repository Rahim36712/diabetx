"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import type { TwinEntry, SimulationChangeData } from "@/lib/types";
import SimulationPanel from "@/components/SimulationPanel";
import { computeScores, simulate } from "@/lib/twin";

interface SimulatorViewProps {
  baseEntry: TwinEntry;
  simulationData: SimulationChangeData | null;
  onSimulationChange: (simData: SimulationChangeData) => void;
}

export default function SimulatorView({
  baseEntry,
  simulationData,
  onSimulationChange,
}: SimulatorViewProps) {
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const baseScores = computeScores(baseEntry);
  const activeSim = simulationData ?? {
    simulatedEntry: baseEntry,
    simScores: baseScores,
    deltas: { metabolic: 0, activity: 0, nutrition: 0, composite: 0 },
    sliderDeltas: { weightKg: 0, exerciseMinutes: 0, dietPoints: 0, sleepHours: 0 },
    isModified: false,
  };

  // Trigger Preset Scenario by computing simulated entry and emitting callback
  function applyPreset(type: "keto" | "cardio" | "sleep" | "reset") {
    let weightKg = 0;
    let exerciseMinutes = 0;
    let dietPoints = 0;
    let sleepHours = 0;

    if (type === "keto") {
      weightKg = -4;
      exerciseMinutes = 30;
      dietPoints = 2;
      sleepHours = 0;
    } else if (type === "cardio") {
      weightKg = -2;
      exerciseMinutes = 120;
      dietPoints = 1;
      sleepHours = 1;
    } else if (type === "sleep") {
      weightKg = -1;
      exerciseMinutes = 30;
      dietPoints = 1;
      sleepHours = 2;
    }

    const simEntry = simulate(baseEntry, {
      weightDeltaKg: weightKg,
      exerciseDeltaMinutes: exerciseMinutes,
      dietDeltaPoints: dietPoints,
      sleepDeltaHours: sleepHours,
    });
    const simScores = computeScores(simEntry);

    onSimulationChange({
      simulatedEntry: simEntry,
      simScores,
      deltas: {
        metabolic: simScores.metabolic - baseScores.metabolic,
        activity: simScores.activity - baseScores.activity,
        nutrition: simScores.nutrition - baseScores.nutrition,
        composite: simScores.composite - baseScores.composite,
      },
      sliderDeltas: {
        weightKg,
        exerciseMinutes,
        dietPoints,
        sleepHours,
      },
      isModified: type !== "reset",
    });

    setActionFeedback(
      type === "reset"
        ? "Sliders reset to baseline."
        : `Applied preset: ${type.toUpperCase()} scenario!`
    );
    setTimeout(() => setActionFeedback(null), 3500);
  }

  // Chart data comparing baseline vs simulated
  const comparisonData = [
    {
      metric: "Metabolic",
      Baseline: baseScores.metabolic,
      Simulated: activeSim.simScores.metabolic,
    },
    {
      metric: "Activity",
      Baseline: baseScores.activity,
      Simulated: activeSim.simScores.activity,
    },
    {
      metric: "Nutrition",
      Baseline: baseScores.nutrition,
      Simulated: activeSim.simScores.nutrition,
    },
    {
      metric: "Composite",
      Baseline: baseScores.composite,
      Simulated: activeSim.simScores.composite,
    },
  ];

  return (
    <div className="space-y-6 animate-card font-sans">
      {/* Header Bar */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lime-400 text-2xl">
              tune
            </span>
            <h2 className="font-display text-xl font-bold text-white">
              What-If Lifestyle & Biomarker Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Test custom lifestyle shifts or select preset scenarios to project health score impacts.
          </p>
        </div>

        {actionFeedback && (
          <span className="px-3.5 py-1.5 rounded-xl bg-lime-500/20 text-lime-300 border border-lime-500/40 text-xs font-mono font-bold animate-fade-in">
            ✓ {actionFeedback}
          </span>
        )}
      </div>

      {/* Scenario Preset Buttons */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-lime-400 text-base">auto_awesome</span>
            Preset Health Scenarios:
          </span>
          <span className="text-[11px] font-mono text-slate-400">One-click simulation profiles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => applyPreset("keto")}
            className="p-3.5 rounded-xl bg-[#060B08]/80 border border-lime-500/30 hover:border-lime-400 hover:bg-lime-500/10 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-xs text-lime-400">Keto / Low Carb</span>
              <span className="text-[10px] font-mono text-lime-400 bg-lime-500/20 px-2 py-0.5 rounded-md font-bold">
                Preset 1
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Weight -4kg • Diet +2 • Exercise +30m
            </p>
          </button>

          <button
            onClick={() => applyPreset("cardio")}
            className="p-3.5 rounded-xl bg-[#060B08]/80 border border-lime-400/30 hover:border-lime-300 hover:bg-lime-400/10 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-xs text-lime-300">Active Cardio Plan</span>
              <span className="text-[10px] font-mono text-lime-300 bg-lime-400/20 px-2 py-0.5 rounded-md font-bold">
                Preset 2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Exercise +120m • Weight -2kg • Sleep +1h
            </p>
          </button>

          <button
            onClick={() => applyPreset("sleep")}
            className="p-3.5 rounded-xl bg-[#060B08]/80 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-xs text-emerald-400">Sleep Recovery</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md font-bold">
                Preset 3
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Sleep +2h • Diet +1 • Exercise +30m
            </p>
          </button>

          <button
            onClick={() => applyPreset("reset")}
            className="p-3.5 rounded-xl bg-[#060B08]/80 border border-white/10 hover:border-slate-300 text-left transition-all group flex flex-col justify-center cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-xs text-slate-200">Reset Sliders</span>
              <span className="material-symbols-outlined text-slate-400 text-sm">restart_alt</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-1">Restore baseline twin state</p>
          </button>
        </div>
      </div>

      {/* Main Grid: Parameter Sliders & Baseline vs Simulated Projection Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 6 Cols: Parameter Sliders */}
        <div className="lg:col-span-6">
          <SimulationPanel
            baseEntry={baseEntry}
            onSimulationChange={onSimulationChange}
          />
        </div>

        {/* Right 6 Cols: Baseline vs Simulated Projection Bar Chart */}
        <div className="lg:col-span-6 glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
          <div className="ambient-glow-lime" />

          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-display font-bold text-white text-base">
                Baseline vs. Simulated Sub-Score Projection
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Comparative analysis of target sub-score deltas
              </p>
            </div>
            {activeSim.isModified && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-lime-500/15 border border-lime-500/30 text-lime-400">
                Score Delta: {activeSim.deltas.composite >= 0 ? "+" : ""}
                {activeSim.deltas.composite.toFixed(1)} pts
              </span>
            )}
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />
                <XAxis dataKey="metric" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#060B08",
                    borderColor: "rgba(132, 204, 22, 0.4)",
                    borderRadius: "12px",
                    color: "#FFF",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="Baseline" fill="#334155" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Simulated" fill="#84CC16" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Goal Action Buttons */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                setActionFeedback("Saved scenario to your Digital Twin health targets!");
                setTimeout(() => setActionFeedback(null), 3000);
              }}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 text-[#060B08] font-display font-extrabold text-xs shadow-lg shadow-lime-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">flag</span>
              <span>Commit Target Plan</span>
            </button>

            <button
              onClick={() => {
                const text = `DiabetX Simulation Report:\nComposite: ${baseScores.composite} -> ${activeSim.simScores.composite}\nEst HbA1c: ${activeSim.simulatedEntry.hba1cPercent.toFixed(1)}%`;
                navigator.clipboard?.writeText(text);
                setActionFeedback("Copied simulation brief to clipboard!");
                setTimeout(() => setActionFeedback(null), 3000);
              }}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 font-display font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">share</span>
              <span>Export Scenario Brief</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
