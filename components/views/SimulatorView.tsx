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
      <div className="glass-card rounded-2xl p-6 border border-white/15 flex flex-wrap items-center justify-between gap-4 bg-[#060A07]/90">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lime-400 text-2xl">
              tune
            </span>
            <h2 className="font-display text-xl font-bold text-white">
              What-If Lifestyle & Biomarker Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-200 font-medium">
            Test custom lifestyle shifts or select preset scenarios to project health score impacts.
          </p>
        </div>

        {actionFeedback && (
          <span className="text-xs font-mono font-bold text-lime-300 bg-lime-400/20 px-3 py-1.5 rounded-full border border-lime-400/40 animate-pulse shadow-sm">
            ⚡ {actionFeedback}
          </span>
        )}
      </div>

      {/* Preset Quick Scenarios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Preset 1: Keto */}
        <button
          onClick={() => applyPreset("keto")}
          className="glass-card p-5 rounded-2xl border border-white/15 hover:border-lime-400/50 bg-[#060A07]/90 text-left transition-all group cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-lime-400/20 text-lime-300 border border-lime-400/40">
              <span className="material-symbols-outlined text-xl">restaurant</span>
            </div>
            <span className="text-[10px] font-mono text-lime-300 font-bold px-2 py-0.5 rounded-full bg-lime-400/20 border border-lime-400/40">
              Preset #1
            </span>
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-white group-hover:text-lime-300 transition-colors">
              Low-Carb / Keto Reset
            </h4>
            <p className="text-xs text-slate-200 mt-0.5">
              -4kg Weight, +2 Diet Quality points
            </p>
          </div>
        </button>

        {/* Preset 2: Cardio */}
        <button
          onClick={() => applyPreset("cardio")}
          className="glass-card p-5 rounded-2xl border border-white/15 hover:border-lime-400/50 bg-[#060A07]/90 text-left transition-all group cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-lime-400/20 text-lime-400 border border-lime-400/40">
              <span className="material-symbols-outlined text-xl">directions_run</span>
            </div>
            <span className="text-[10px] font-mono text-lime-400 font-bold px-2 py-0.5 rounded-full bg-lime-400/20 border border-lime-400/40">
              Preset #2
            </span>
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-white group-hover:text-lime-400 transition-colors">
              High-Intensity Cardio Boost
            </h4>
            <p className="text-xs text-slate-200 mt-0.5">
              +120 min/wk Exercise, +1h Sleep
            </p>
          </div>
        </button>

        {/* Preset 3: Sleep */}
        <button
          onClick={() => applyPreset("sleep")}
          className="glass-card p-5 rounded-2xl border border-white/15 hover:border-lime-400/50 bg-[#060A07]/90 text-left transition-all group cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-white/20 text-white border border-white/30">
              <span className="material-symbols-outlined text-xl">bedtime</span>
            </div>
            <span className="text-[10px] font-mono text-white font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
              Preset #3
            </span>
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-white group-hover:text-white transition-colors">
              Optimized Sleep Recovery
            </h4>
            <p className="text-xs text-slate-200 mt-0.5">
              +2 hrs Nocturnal Sleep, +30m Exercise
            </p>
          </div>
        </button>
      </div>

      {/* Main Grid: Interactive Sliders + Comparative Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6">
          <SimulationPanel
            baseEntry={baseEntry}
            onSimulationChange={onSimulationChange}
          />
        </div>

        <div className="lg:col-span-6 glass-card rounded-3xl p-6 md:p-7 border border-white/15 space-y-5 flex flex-col justify-between bg-[#060A07]/90 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Baseline vs. Scenario Comparison
              </h3>
              <p className="text-xs text-slate-200 font-medium mt-0.5">
                Visualizing sub-score deltas across all 3 domains
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-lime-300">
              {activeSim.isModified ? "Modified" : "Baseline"}
            </span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparisonData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
              <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="4 4" />
              <XAxis
                dataKey="metric"
                stroke="#E2E8F0"
                fontSize={12}
                fontWeight={600}
                tickLine={false}
              />
              <YAxis
                stroke="#E2E8F0"
                fontSize={12}
                fontWeight={600}
                domain={[0, 100]}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(6, 10, 7, 0.95)",
                  borderColor: "rgba(163, 230, 53, 0.4)",
                  borderRadius: "12px",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontFamily: "Comfortaa, cursive, sans-serif",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", fontFamily: "Comfortaa, cursive, sans-serif" }} />
              <Bar dataKey="Baseline" fill="#FFFFFF" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Simulated" fill="#A3E635" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="bg-[#060A07]/95 p-4 rounded-xl border border-white/15 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-200 font-semibold">Net Composite Score Shift:</span>
            <span className="text-sm font-bold text-white">
              {baseScores.composite} → {activeSim.simScores.composite} (
              <span className="text-lime-300 font-extrabold">
                {activeSim.deltas.composite >= 0 ? "+" : ""}
                {activeSim.deltas.composite.toFixed(1)} pts
              </span>
              )
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
