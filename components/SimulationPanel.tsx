"use client";

import { useState, useMemo } from "react";
import type { TwinEntry, SimulationChangeData } from "@/lib/types";
import { computeScores, simulate } from "@/lib/twin";

interface SimulationPanelProps {
  baseEntry: TwinEntry;
  onSimulationChange?: (data: SimulationChangeData) => void;
}

export default function SimulationPanel({
  baseEntry,
  onSimulationChange,
}: SimulationPanelProps) {
  const [weightChange, setWeightChange] = useState<number>(0);
  const [exerciseChange, setExerciseChange] = useState<number>(0);
  const [dietChange, setDietChange] = useState<number>(0);
  const [sleepChange, setSleepChange] = useState<number>(0);

  const baseScores = useMemo(() => computeScores(baseEntry), [baseEntry]);

  const { simulatedEntry, simScores, deltas } = useMemo(() => {
    const simEntry = simulate(baseEntry, {
      weightDeltaKg: weightChange,
      exerciseDeltaMinutes: exerciseChange,
      dietDeltaPoints: dietChange,
      sleepDeltaHours: sleepChange,
    });
    const scores = computeScores(simEntry);
    return {
      simulatedEntry: simEntry,
      simScores: scores,
      deltas: {
        metabolic: scores.metabolic - baseScores.metabolic,
        activity: scores.activity - baseScores.activity,
        nutrition: scores.nutrition - baseScores.nutrition,
        composite: scores.composite - baseScores.composite,
      },
    };
  }, [baseEntry, baseScores, weightChange, exerciseChange, dietChange, sleepChange]);

  const isModified =
    weightChange !== 0 ||
    exerciseChange !== 0 ||
    dietChange !== 0 ||
    sleepChange !== 0;

  useMemo(() => {
    if (onSimulationChange) {
      onSimulationChange({
        simulatedEntry,
        simScores,
        deltas,
        isModified,
        sliderDeltas: {
          weightKg: weightChange,
          exerciseMinutes: exerciseChange,
          dietPoints: dietChange,
          sleepHours: sleepChange,
        },
      });
    }
  }, [
    simulatedEntry,
    simScores,
    deltas,
    isModified,
    weightChange,
    exerciseChange,
    dietChange,
    sleepChange,
    onSimulationChange,
  ]);

  function resetAll() {
    setWeightChange(0);
    setExerciseChange(0);
    setDietChange(0);
    setSleepChange(0);
  }

  return (
    <div className="glass-card p-6 md:p-7 rounded-2xl space-y-6 border border-white/15 shadow-2xl relative font-sans bg-[#060A07]/90">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-lime-500/30">
            <span className="material-symbols-outlined text-[#060A07] font-bold text-xl">tune</span>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">What-If Simulator</h3>
            <p className="text-xs text-slate-200 font-medium">Predict Lifestyle Shift</p>
          </div>
        </div>

        {isModified && (
          <button
            onClick={resetAll}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-slate-100 hover:text-white font-mono text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">restart_alt</span>
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Sliders Grid */}
      <div className="space-y-5">
        {/* Weight Slider */}
        <SliderControl
          label="Weight Change"
          unit="kg"
          value={weightChange}
          min={-15}
          max={10}
          step={0.5}
          onChange={setWeightChange}
          displayVal={
            weightChange === 0
              ? "0 kg (No Change)"
              : `${weightChange > 0 ? "+" : ""}${weightChange} kg (${(baseEntry.weightKg + weightChange).toFixed(1)} kg total)`
          }
        />

        {/* Exercise Slider */}
        <SliderControl
          label="Exercise Boost"
          unit="min/wk"
          value={exerciseChange}
          min={-90}
          max={200}
          step={15}
          onChange={setExerciseChange}
          displayVal={
            exerciseChange === 0
              ? "0 min (No Change)"
              : `${exerciseChange > 0 ? "+" : ""}${exerciseChange} min/wk (${baseEntry.exerciseMinutesPerWeek + exerciseChange} min total)`
          }
        />

        {/* Diet Slider */}
        <SliderControl
          label="Diet Quality Adjust"
          unit="pts"
          value={dietChange}
          min={-2}
          max={2}
          step={1}
          onChange={setDietChange}
          displayVal={
            dietChange === 0
              ? "0 pts (Current Diet)"
              : `${dietChange > 0 ? "+" : ""}${dietChange} pts (Rating ${Math.min(5, Math.max(1, baseEntry.dietQuality + dietChange))}/5)`
          }
        />

        {/* Sleep Slider */}
        <SliderControl
          label="Sleep Duration"
          unit="hrs"
          value={sleepChange}
          min={-3}
          max={3}
          step={0.5}
          onChange={setSleepChange}
          displayVal={
            sleepChange === 0
              ? "0 hrs (No Change)"
              : `${sleepChange > 0 ? "+" : ""}${sleepChange} hrs/night (${(baseEntry.sleepHours + sleepChange).toFixed(1)} hrs total)`
          }
        />
      </div>

      {/* Real-time Sub-Score Delta Badges */}
      <div className="space-y-3 pt-2 border-t border-white/15">
        <h4 className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
          <span>Projected Score Impact</span>
          <span className="text-lime-300">Baseline vs. Sim</span>
        </h4>

        {/* Composite Score Highlight Box */}
        <div className="bg-[#060A07]/95 border border-lime-400/35 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-mono font-bold text-lime-300 uppercase tracking-wider block">
              Composite Twin Score
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm font-mono text-slate-300 font-bold">{baseScores.composite}</span>
              <span className="text-slate-400 text-xs">→</span>
              <span className="text-2xl font-display font-extrabold text-white">
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
        <div className="bg-[#060A07]/80 border border-white/15 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lime-400 text-sm">vital_signs</span>
            <span className="text-xs font-mono font-bold text-white">Est. HbA1c Level</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono text-slate-300 font-semibold">{baseEntry.hba1cPercent.toFixed(1)}%</span>
            <span className="text-slate-400 text-xs">→</span>
            <span className="text-sm font-display font-bold text-white">
              {simulatedEntry.hba1cPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayVal,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  displayVal: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-white font-bold">{label}</span>
        <span className={`font-semibold ${value !== 0 ? "text-lime-300" : "text-slate-300"}`}>
          {displayVal}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-lime-400 slider-thumb cursor-pointer"
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
    <div className="bg-[#060A07]/80 border border-white/15 rounded-xl p-3 space-y-1">
      <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-200">
        <span>{label}</span>
        <DeltaBadge delta={delta} />
      </div>
      <div className="flex items-baseline gap-1.5 font-mono">
        <span className="text-xs text-slate-300 font-semibold">{before}</span>
        <span className="text-slate-400 text-[10px]">→</span>
        <span className="text-sm font-bold text-white">{after}</span>
      </div>
    </div>
  );
}

function DeltaBadge({ delta, isScore = false }: { delta: number; isScore?: boolean }) {
  if (delta === 0) {
    return (
      <span className="text-[10px] font-mono text-slate-300 font-bold px-1.5 py-0.5 rounded bg-white/10 border border-white/15">
        0
      </span>
    );
  }

  const isPositive = delta > 0;
  const badgeBg = isPositive
    ? "bg-lime-400/20 text-lime-300 border-lime-400/40"
    : "bg-white/10 text-slate-200 border-white/20";

  return (
    <span
      className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${badgeBg} shadow-sm ${
        isScore ? "text-xs px-2.5 py-1" : ""
      }`}
    >
      {isPositive ? "+" : ""}
      {delta.toFixed(isScore ? 1 : 0)}
    </span>
  );
}
