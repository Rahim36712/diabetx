"use client";

import { useState } from "react";
import type { TwinEntry } from "@/lib/types";
import { makeId } from "@/lib/storage";

interface Props {
  onSubmit: (entry: TwinEntry) => void;
  defaults?: Partial<TwinEntry>;
}

const DIET_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: "Poor", color: "text-rose-400" },
  2: { text: "Fair", color: "text-amber-400" },
  3: { text: "Good", color: "text-cyan-400" },
  4: { text: "Great", color: "text-emerald-400" },
  5: { text: "Optimal", color: "text-emerald-300" },
};

export default function EntryForm({ onSubmit, defaults }: Props) {
  const [weightKg, setWeightKg] = useState(defaults?.weightKg ?? 75);
  const [hba1c, setHba1c] = useState(defaults?.hba1cPercent ?? 6.4);
  const [glucose, setGlucose] = useState(defaults?.fastingGlucoseMgDl ?? 110);
  const [sleep, setSleep] = useState(defaults?.sleepHours ?? 7);
  const [exercise, setExercise] = useState(defaults?.exerciseMinutesPerWeek ?? 90);
  const [diet, setDiet] = useState(defaults?.dietQuality ?? 3);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry: TwinEntry = {
      id: makeId(),
      timestamp: Date.now(),
      weightKg: Number(weightKg) || 0,
      hba1cPercent: Number(hba1c) || 0,
      fastingGlucoseMgDl: Number(glucose) || 0,
      sleepHours: Number(sleep) || 0,
      exerciseMinutesPerWeek: Number(exercise) || 0,
      dietQuality: Number(diet) || 1,
    };
    onSubmit(entry);
  }

  const dietInfo = DIET_LABELS[diet] ?? { text: "Good", color: "text-cyan-400" };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 md:p-7 rounded-2xl space-y-6 border border-white/10 shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="material-symbols-outlined text-slate-950 font-bold text-xl">edit_note</span>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-100">Log Daily Metrics</h2>
            <p className="text-xs text-slate-400 font-medium">Biometric & Lifestyle Input</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider">
          Digital Twin Log
        </span>
      </div>

      <div className="space-y-4">
        {/* Fasting Glucose */}
        <div>
          <label className="block text-[11px] font-mono font-semibold text-cyan-400/90 uppercase tracking-wider mb-1.5 flex justify-between items-center">
            <span>Fasting Glucose Level</span>
            <span className="text-slate-400 font-normal text-[10px]">(Target: 70–99 mg/dL)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="1"
              value={glucose}
              onChange={(e) => setGlucose(parseFloat(e.target.value))}
              placeholder="98"
              className="w-full bg-[#0A0E1A]/80 border border-white/10 rounded-xl px-3.5 py-2.5 pr-16 text-sm font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all shadow-inner"
              required
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono font-semibold">
              mg/dL
            </span>
          </div>
        </div>

        {/* Weight & HbA1c */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-mono font-semibold text-cyan-400/90 uppercase tracking-wider mb-1.5 flex justify-between items-center">
              <span>Weight</span>
              <span className="text-slate-400 font-normal text-[10px]">kg</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value))}
              className="w-full bg-[#0A0E1A]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all shadow-inner"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-semibold text-cyan-400/90 uppercase tracking-wider mb-1.5 flex justify-between items-center">
              <span>HbA1c Level</span>
              <span className="text-slate-400 font-normal text-[10px]">%</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={hba1c}
              onChange={(e) => setHba1c(parseFloat(e.target.value))}
              className="w-full bg-[#0A0E1A]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all shadow-inner"
              required
            />
          </div>
        </div>

        {/* Sleep & Exercise */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-mono font-semibold text-cyan-400/90 uppercase tracking-wider mb-1.5 flex justify-between items-center">
              <span>Sleep</span>
              <span className="text-slate-400 font-normal text-[10px]">hrs/night</span>
            </label>
            <input
              type="number"
              step="0.5"
              value={sleep}
              onChange={(e) => setSleep(parseFloat(e.target.value))}
              className="w-full bg-[#0A0E1A]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all shadow-inner"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-semibold text-cyan-400/90 uppercase tracking-wider mb-1.5 flex justify-between items-center">
              <span>Exercise</span>
              <span className="text-slate-400 font-normal text-[10px]">min/wk</span>
            </label>
            <input
              type="number"
              step="5"
              value={exercise}
              onChange={(e) => setExercise(parseFloat(e.target.value))}
              className="w-full bg-[#0A0E1A]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all shadow-inner"
              required
            />
          </div>
        </div>

        {/* Diet Quality Slider */}
        <div className="pt-1">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[11px] font-mono font-semibold text-cyan-400/90 uppercase tracking-wider">
              Diet Quality Self-Rating
            </label>
            <span className={`text-xs font-mono font-extrabold ${dietInfo.color}`}>
              {diet} / 5 ({dietInfo.text})
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={diet}
            onChange={(e) => setDiet(parseInt(e.target.value))}
            className="w-full accent-cyan-400 slider-thumb cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>1 - Poor</span>
            <span>3 - Moderate</span>
            <span>5 - Optimal</span>
          </div>
        </div>
      </div>

      {/* Primary CTA Button */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 active:scale-[0.99] text-slate-950 font-display font-extrabold py-3.5 rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span className="material-symbols-outlined text-xl">add_circle</span>
        <span>Submit Daily Log</span>
      </button>
    </form>
  );
}
