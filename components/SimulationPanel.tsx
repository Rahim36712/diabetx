"use client";

import { useEffect, useMemo, useState } from "react";
import type { TwinEntry, TwinScores, SimulationChangeData } from "@/lib/types";
import { computeScores, simulate } from "@/lib/twin";

export type { SimulationChangeData };

interface SimulationPanelProps {
  baseEntry: TwinEntry;
  onSimulationChange?: (simData: SimulationChangeData) => void;
}

export default function SimulationPanel({
  baseEntry,
  onSimulationChange,
}: SimulationPanelProps) {
  const [weightDelta, setWeightDelta] = useState(-3);
  const [exerciseDelta, setExerciseDelta] = useState(60);
  const [dietDelta, setDietDelta] = useState(1);
  const [sleepDelta, setSleepDelta] = useState(0.5);

  const baseScores = useMemo(() => computeScores(baseEntry), [baseEntry]);

  const simulatedEntry = useMemo(
    () =>
      simulate(baseEntry, {
        weightDeltaKg: weightDelta,
        exerciseDeltaMinutes: exerciseDelta,
        dietDeltaPoints: dietDelta,
        sleepDeltaHours: sleepDelta,
      }),
    [baseEntry, weightDelta, exerciseDelta, dietDelta, sleepDelta]
  );

  const simScores = useMemo(() => computeScores(simulatedEntry), [simulatedEntry]);

  const deltas = useMemo(
    () => ({
      metabolic: simScores.metabolic - baseScores.metabolic,
      activity: simScores.activity - baseScores.activity,
      nutrition: simScores.nutrition - baseScores.nutrition,
      composite: simScores.composite - baseScores.composite,
    }),
    [baseScores, simScores]
  );

  const isModified =
    weightDelta !== 0 || exerciseDelta !== 0 || dietDelta !== 0 || sleepDelta !== 0;

  const sliderDeltas = useMemo(
    () => ({
      weightKg: weightDelta,
      exerciseMinutes: exerciseDelta,
      dietPoints: dietDelta,
      sleepHours: sleepDelta,
    }),
    [weightDelta, exerciseDelta, dietDelta, sleepDelta]
  );

  // Notify parent/AI Coach whenever simulation updates
  useEffect(() => {
    if (onSimulationChange) {
      onSimulationChange({
        simulatedEntry,
        simScores,
        deltas,
        sliderDeltas,
        isModified,
      });
    }
  }, [simulatedEntry, simScores, deltas, sliderDeltas, isModified, onSimulationChange]);


  function handleReset() {
    setWeightDelta(0);
    setExerciseDelta(0);
    setDietDelta(0);
    setSleepDelta(0);
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6 border border-white/10 shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
            <span className="material-symbols-outlined font-bold text-xl">insights</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-100">What-If Digital Twin Simulator</h2>
            <p className="text-xs text-slate-400 font-medium">Real-time lifestyle impact projection</p>
          </div>
        </div>

        {/* Reset Button */}
        {isModified && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 font-mono text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Reset all sliders to baseline"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Sliders Grid */}
      <div className="space-y-4">
        <Slider
          label="Weight Change"
          unit="kg"
          value={weightDelta}
          min={-15}
          max={10}
          step={0.5}
          onChange={setWeightDelta}
        />

        <Slider
          label="Exercise Shift"
          unit="min/wk"
          value={exerciseDelta}
          min={-90}
          max={200}
          step={10}
          onChange={setExerciseDelta}
        />

        <Slider
          label="Diet Quality Shift"
          unit="pts"
          value={dietDelta}
          min={-3}
          max={3}
          step={1}
          onChange={setDietDelta}
        />

        <Slider
          label="Sleep Shift"
          unit="hrs/night"
          value={sleepDelta}
          min={-3}
          max={3}
          step={0.5}
          onChange={setSleepDelta}
        />
      </div>

      {/* Real-time Sub-Score Delta Badges */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Projected Score Impact</span>
          <span className="text-cyan-400">Baseline vs. Sim</span>
        </h4>

        {/* Composite Score Highlight Box */}
        <div className="bg-[#0A0E1A]/90 border border-cyan-500/30 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              Composite Twin Score
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm font-mono text-slate-400">{baseScores.composite}</span>
              <span className="text-slate-500 text-xs">→</span>
              <span className="text-2xl font-display font-extrabold text-slate-100">
                {simScores.composite}
              </span>
            </div>
          </div>
          <DeltaBadge delta={deltas.composite} isScore />
        </div>

        {/* Sub-scores Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SubScoreComparison
            label="Metabolic"
            before={baseScores.metabolic}
            after={simScores.metabolic}
            delta={deltas.metabolic}
          />
          <SubScoreComparison
            label="Activity"
            before={baseScores.activity}
            after={simScores.activity}
            delta={deltas.activity}
          />
          <SubScoreComparison
            label="Nutrition"
            before={baseScores.nutrition}
            after={simScores.nutrition}
            delta={deltas.nutrition}
          />
        </div>

        {/* Est. HbA1c Metric */}
        <div className="bg-[#0A0E1A]/60 border border-white/10 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-400 text-sm">vital_signs</span>
            <span className="text-xs font-mono font-bold text-slate-300">Est. HbA1c Level</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono text-slate-400">{baseEntry.hba1cPercent.toFixed(1)}%</span>
            <span className="text-slate-500 text-xs">→</span>
            <span className="text-sm font-display font-bold text-slate-100">
              {simulatedEntry.hba1cPercent.toFixed(1)}%
            </span>
            <HbA1cDeltaBadge delta={simulatedEntry.hba1cPercent - baseEntry.hba1cPercent} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const formattedValue = `${value > 0 ? "+" : ""}${value} ${unit}`;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs font-mono font-semibold">
        <span className="text-slate-300">{label}</span>
        <span className="text-cyan-400 font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
          {formattedValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-cyan-400 slider-thumb cursor-pointer"
      />
    </div>
  );
}

function SubScoreComparison({
  label,
  before,
  after,
  delta,
}: {
  label: string;
  before: number;
  after: number;
  delta: number;
}) {
  return (
    <div className="bg-[#0A0E1A]/80 border border-white/10 rounded-xl p-3 space-y-1">
      <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
        {label}
      </div>
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-slate-400 font-mono">{before}</span>
          <span className="text-slate-500 text-xs">→</span>
          <span className="text-sm font-display font-bold text-slate-100">{after}</span>
        </div>
        <DeltaBadge delta={delta} isScore />
      </div>
    </div>
  );
}

function DeltaBadge({ delta, isScore }: { delta: number; isScore?: boolean }) {
  if (delta === 0) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-slate-400 border border-white/10">
        0
      </span>
    );
  }

  const isPositive = delta > 0;
  const badgeStyle = isPositive
    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
    : "bg-rose-500/15 text-rose-400 border-rose-500/30";

  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${badgeStyle}`}>
      {isPositive ? "+" : ""}
      {delta.toFixed(1)}
    </span>
  );
}

function HbA1cDeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.01) {
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400">
        0.0%
      </span>
    );
  }

  // Lower HbA1c is better
  const isImproved = delta < 0;
  const badgeStyle = isImproved ? "text-emerald-400" : "text-rose-400";

  return (
    <span className={`text-xs font-mono font-bold ${badgeStyle}`}>
      ({delta > 0 ? "+" : ""}
      {delta.toFixed(2)}%)
    </span>
  );
}
