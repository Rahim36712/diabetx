"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNav } from "@/context/NavContext";
import { DEFAULT_ENTRIES, deleteEntry, loadEntries, makeId, saveEntry } from "@/lib/storage";
import { computeScores, explainScores, simulate } from "@/lib/twin";
import type { SimulationChangeData, SimulationInput, TwinEntry, TwinScores } from "@/lib/types";
import ThreeDigitalTwinCanvas, { type OrganId } from "@/components/ThreeDigitalTwinCanvas";
import OrganTwinLab from "@/components/OrganTwinLab";
import { AnimeMotionScope } from "@/components/AnimeMotion";
import McpWorkspaceView from "@/components/McpWorkspaceView";

type Tab = "dashboard" | "digital_twin" | "timeline" | "simulator" | "ai_coach" | "connected_care";
type ChatMessage = { role: "user" | "assistant"; text: string };

const NAV_ITEMS: Array<{ id: Tab; label: string; kicker: string }> = [
  { id: "dashboard", label: "Overview", kicker: "01" },
  { id: "digital_twin", label: "Twin lab", kicker: "02" },
  { id: "timeline", label: "Trajectory", kicker: "03" },
  { id: "simulator", label: "Scenario lab", kicker: "04" },
  { id: "ai_coach", label: "Coach", kicker: "05" },
  { id: "connected_care", label: "Connected care", kicker: "06" },
];

const ORGAN_ITEMS: Array<{ id: OrganId; label: string; metric: string; description: string }> = [
  { id: "pancreas", label: "Pancreas", metric: "Insulin release", description: "Beta-cell response" },
  { id: "liver", label: "Liver", metric: "Glucose storage", description: "Glycogen balance" },
  { id: "heart", label: "Heart", metric: "Cardio load", description: "Circulatory rhythm" },
  { id: "kidneys", label: "Kidneys", metric: "Filtration context", description: "Metabolic clearance" },
  { id: "vascular", label: "Vascular", metric: "Endothelial flow", description: "Microvascular state" },
];

const QUESTIONS = [
  "What is my highest-impact next step?",
  "How is my sleep affecting my score?",
  "What does my latest glucose trend suggest?",
];

const PRESETS: Array<{ label: string; note: string; input: SimulationInput }> = [
  { label: "More movement", note: "+60 min/week exercise", input: { weightDeltaKg: 0, exerciseDeltaMinutes: 60, dietDeltaPoints: 0, sleepDeltaHours: 0 } },
  { label: "Sleep reset", note: "+1 hour sleep, +30 min exercise", input: { weightDeltaKg: 0, exerciseDeltaMinutes: 30, dietDeltaPoints: 0, sleepDeltaHours: 1 } },
  { label: "Nutrition lift", note: "+1 diet quality point", input: { weightDeltaKg: 0, exerciseDeltaMinutes: 0, dietDeltaPoints: 1, sleepDeltaHours: 0 } },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatDelta(value: number, digits = 1) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function buildSimulationData(entry: TwinEntry, scores: TwinScores, input: SimulationInput): SimulationChangeData {
  const simulatedEntry = simulate(entry, input);
  const simScores = computeScores(simulatedEntry);
  return {
    simulatedEntry,
    simScores,
    deltas: {
      metabolic: simScores.metabolic - scores.metabolic,
      activity: simScores.activity - scores.activity,
      nutrition: simScores.nutrition - scores.nutrition,
      composite: simScores.composite - scores.composite,
    },
    sliderDeltas: {
      weightKg: input.weightDeltaKg,
      exerciseMinutes: input.exerciseDeltaMinutes,
      dietPoints: input.dietDeltaPoints,
      sleepHours: input.sleepDeltaHours ?? 0,
    },
    isModified: Object.values(input).some((value) => value !== 0),
  };
}

function ScoreRing({ score, inverted = false }: { score: number; inverted?: boolean }) {
  const radius = 47;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamp(score, 0, 100) / 100) * circumference;
  return (
    <div className={`relative score-ring-large h-44 w-44 shrink-0 ${inverted ? "text-white" : "text-black"}`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke={inverted ? "#3d3d3d" : "#e7e7e5"} strokeWidth="8" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num score-ring-value text-5xl font-semibold">{score}</span>
        <span className={`eyebrow mt-1 ${inverted ? "text-neutral-400" : "text-neutral-500"}`}>Twin score</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, score, note }: { label: string; value: string; unit: string; score: number; note: string }) {
  return (
    <div className="rounded-2xl border border-[#dededb] bg-[#fafaf8] p-4 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p data-anime-lift className="eyebrow">{label}</p>
          <p className="num mt-2 text-2xl font-semibold">{value}<span className="ml-1 text-xs font-medium tracking-normal text-neutral-500">{unit}</span></p>
        </div>
        <span className="num text-sm font-semibold">{score}</span>
      </div>
      <div className="metric-bar mt-4"><span style={{ width: `${score}%` }} /></div>
      <p className="mt-2 text-xs text-neutral-500">{note}</p>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-col justify-between gap-5 border-b border-[#d9d9d6] pb-7 md:flex-row md:items-end">
      <div>
        <p data-anime-lift className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-[-0.06em] text-black md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">{description}</p>
      </div>
      {action}
    </header>
  );
}

function TrendChart({ entries }: { entries: TwinEntry[] }) {
  const width = 760;
  const height = 220;
  const points = entries.map((entry, index) => {
    const x = entries.length === 1 ? width / 2 : 32 + (index / (entries.length - 1)) * (width - 64);
    const y = height - 30 - ((entry.fastingGlucoseMgDl - 80) / 60) * (height - 60);
    return { x, y: clamp(y, 20, height - 35), entry };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  return (
    <div data-anime-panel className="panel overflow-hidden p-5 md:p-7">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <div><p data-anime-lift className="eyebrow">Biometric trajectory</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">Glucose trend</h2></div>
        <div className="flex items-center gap-3 text-xs text-neutral-500"><span className="h-2 w-2 rounded-full bg-black" />Fasting glucose / mg/dL</div>
      </div>
      <div className="mt-7 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[620px] w-full" role="img" aria-label="Fasting glucose trend chart">
          <defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0a0a0a" stopOpacity=".12" /><stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" /></linearGradient></defs>
          {[0, 1, 2, 3].map((line) => { const y = 24 + line * 52; return <line key={line} x1="32" x2={width - 32} y1={y} y2={y} className="chart-grid" />; })}
          <path d={`${path} L ${points.at(-1)?.x ?? width - 32} ${height - 30} L ${points[0]?.x ?? 32} ${height - 30} Z`} className="chart-area" />
          <path d={path} className="chart-line" />
          {points.map(({ x, y, entry }) => <g key={entry.id}><circle cx={x} cy={y} r="5" fill="#fff" stroke="#0a0a0a" strokeWidth="2" /><text x={x} y={height - 8} textAnchor="middle" className="fill-neutral-500 text-[10px]">{new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</text></g>)}
        </svg>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, unit, min, max, step = 1 }: { label: string; value: number; onChange: (value: number) => void; unit: string; min?: number; max?: number; step?: number }) {
  return <label className="block"><span data-anime-lift className="eyebrow">{label}</span><div className="mt-2 flex items-center gap-2"><input className="input-clean num text-lg font-semibold" type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /><span className="text-xs font-semibold uppercase tracking-[.14em] text-neutral-400">{unit}</span></div></label>;
}

function DashboardView({ latest, scores, entries, onLog, onDelete, onOpen }: { latest: TwinEntry; scores: TwinScores; entries: TwinEntry[]; onLog: (entry: TwinEntry) => void; onDelete: (id: string) => void; onOpen: (tab: Tab) => void }) {
  const [selectedOrgan, setSelectedOrgan] = useState<OrganId>("all");
  const [form, setForm] = useState({ weightKg: latest.weightKg, hba1cPercent: latest.hba1cPercent, fastingGlucoseMgDl: latest.fastingGlucoseMgDl, sleepHours: latest.sleepHours, exerciseMinutesPerWeek: latest.exerciseMinutesPerWeek, dietQuality: latest.dietQuality });
  const weakest = scores.nutrition <= scores.activity && scores.nutrition <= scores.metabolic ? "Nutrition" : scores.activity <= scores.metabolic ? "Activity" : "Metabolic";
  return <div className="space-y-7">
    <PageHeader eyebrow="01 / overview" title="Your body, in context." description="A focused readout of the signals shaping your Digital Twin today." action={<button className="button button-dark rounded-full px-5 py-3 text-xs font-semibold" onClick={() => onOpen("digital_twin")}>Open twin lab <span className="ml-2">&rarr;</span></button>} />
    <section className="grid gap-5 xl:grid-cols-[.95fr_1.55fr]">
      <div data-anime-panel className="panel-dark motion-rise p-6 md:p-8"><div className="flex items-start justify-between gap-6"><div><p data-anime-lift className="eyebrow text-neutral-400">Current readout</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em]">Stable, with room to improve.</h2></div><span className="rounded-full border border-neutral-700 px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-neutral-400">Live</span></div><div className="mt-9 flex flex-col items-center gap-6 sm:flex-row"><ScoreRing score={scores.composite} inverted /><div><p data-anime-lift className="eyebrow text-neutral-500">Highest leverage</p><p className="mt-2 text-3xl font-semibold tracking-[-0.06em]">{weakest}</p><p className="mt-3 max-w-xs text-sm leading-6 text-neutral-400">{explainScores(latest, scores)}</p></div></div><div className="mt-8 grid grid-cols-3 gap-3 border-t border-neutral-800 pt-5"><div><p data-anime-lift className="eyebrow text-neutral-500">Glucose</p><p className="num mt-2 text-lg font-semibold">{latest.fastingGlucoseMgDl}</p></div><div><p data-anime-lift className="eyebrow text-neutral-500">HbA1c</p><p className="num mt-2 text-lg font-semibold">{latest.hba1cPercent}%</p></div><div><p data-anime-lift className="eyebrow text-neutral-500">Sleep</p><p className="num mt-2 text-lg font-semibold">{latest.sleepHours}h</p></div></div></div>
      <div data-anime-panel className="panel relative min-h-[420px] overflow-hidden bg-[#f8f8f5] p-4 md:p-6"><div className="absolute left-6 top-6 z-10"><p data-anime-lift className="eyebrow">Interactive twin</p><p className="mt-2 text-sm font-semibold">Organ systems / live state</p></div><div className="absolute right-6 top-6 z-10 flex gap-2"><button className="button button-light rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em]" onClick={() => setSelectedOrgan("all")}>All</button><button className="button button-light rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em]" onClick={() => setSelectedOrgan("pancreas")}>Focus pancreas</button></div><ThreeDigitalTwinCanvas score={scores.composite} className="h-[390px] w-full" cameraPreset="front" selectedOrgan={selectedOrgan} /><div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2">{ORGAN_ITEMS.slice(0, 3).map((organ) => <button key={organ.id} className={`button rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em] ${selectedOrgan === organ.id ? "border-black bg-black text-white" : "border-[#dededb] bg-white text-neutral-600"}`} onClick={() => setSelectedOrgan(organ.id)}>{organ.label}</button>)}</div></div>
    </section>
    <section className="grid gap-5 md:grid-cols-3"><MetricCard label="Metabolic" value={`${scores.metabolic}`} unit="/100" score={scores.metabolic} note="HbA1c + fasting glucose" /><MetricCard label="Activity" value={`${scores.activity}`} unit="/100" score={scores.activity} note="Exercise + sleep balance" /><MetricCard label="Nutrition" value={`${scores.nutrition}`} unit="/100" score={scores.nutrition} note="Self-rated diet quality" /></section>
    <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]"><div data-anime-panel className="panel p-6 md:p-7"><div className="flex items-end justify-between gap-4"><div><p data-anime-lift className="eyebrow">Daily log</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">Update your baseline</h2></div><span className="text-xs text-neutral-500">Latest entry / today</span></div><form className="mt-7 grid gap-5 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); onLog({ id: makeId(), timestamp: Date.now(), ...form }); }}><InputField label="Fasting glucose" value={form.fastingGlucoseMgDl} onChange={(value) => setForm({ ...form, fastingGlucoseMgDl: value })} unit="mg/dL" min={40} max={400} /><InputField label="Weight" value={form.weightKg} onChange={(value) => setForm({ ...form, weightKg: value })} unit="kg" min={30} max={250} step={.1} /><InputField label="HbA1c" value={form.hba1cPercent} onChange={(value) => setForm({ ...form, hba1cPercent: value })} unit="%" min={3} max={20} step={.1} /><InputField label="Sleep" value={form.sleepHours} onChange={(value) => setForm({ ...form, sleepHours: value })} unit="hrs" min={0} max={16} step={.5} /><InputField label="Exercise" value={form.exerciseMinutesPerWeek} onChange={(value) => setForm({ ...form, exerciseMinutesPerWeek: value })} unit="min/wk" min={0} max={1000} /><label className="block"><span data-anime-lift className="eyebrow">Diet quality</span><div className="mt-4 flex items-center gap-4"><input className="slider" type="range" min={1} max={5} step={1} value={form.dietQuality} onChange={(event) => setForm({ ...form, dietQuality: Number(event.target.value) })} /><span className="num w-8 text-right text-lg font-semibold">{form.dietQuality}<span className="text-xs text-neutral-400">/5</span></span></div></label><button className="button button-dark mt-2 rounded-xl px-4 py-3 text-sm font-semibold sm:col-span-2" type="submit">Save daily log <span className="ml-2">&rarr;</span></button></form></div><div data-anime-panel className="panel-dark p-6 md:p-7"><div className="flex items-center justify-between"><div><p data-anime-lift className="eyebrow text-neutral-500">Coach signal</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">One useful next step.</h2></div><span className="text-2xl text-neutral-500">&rarr;</span></div><p className="mt-10 text-2xl font-semibold leading-tight tracking-[-0.05em]">Your {weakest.toLowerCase()} score has the most room to move.</p><p className="mt-5 text-sm leading-6 text-neutral-400">Ask the Coach to translate your current metrics into a small, realistic change. Every answer is grounded in your logged data.</p><button className="button mt-8 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-white hover:border-neutral-400" onClick={() => onOpen("ai_coach")}>Ask the AI Coach <span className="ml-2">&rarr;</span></button></div></section>
    <TrendChart entries={entries} />
    <section data-anime-panel className="panel p-6 md:p-7"><div className="flex items-center justify-between"><div><p data-anime-lift className="eyebrow">Recent telemetry</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">Your logbook</h2></div><span className="text-xs text-neutral-500">{entries.length} records</span></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-[#e5e5e2] text-[10px] font-bold uppercase tracking-[.16em] text-neutral-400"><th className="pb-3">Date</th><th className="pb-3">Glucose</th><th className="pb-3">HbA1c</th><th className="pb-3">Exercise</th><th className="pb-3">Score</th><th className="pb-3 text-right">Action</th></tr></thead><tbody>{[...entries].reverse().map((entry) => <tr key={entry.id} className="border-b border-[#eeeeeb] last:border-0"><td className="py-4 font-medium">{new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</td><td className="num py-4">{entry.fastingGlucoseMgDl} <span className="text-xs text-neutral-400">mg/dL</span></td><td className="num py-4">{entry.hba1cPercent}%</td><td className="num py-4">{entry.exerciseMinutesPerWeek} <span className="text-xs text-neutral-400">min/wk</span></td><td className="num py-4 font-semibold">{computeScores(entry).composite}</td><td className="py-4 text-right"><button className="text-xs font-semibold text-neutral-400 transition-colors hover:text-black" onClick={() => onDelete(entry.id)} disabled={entries.length <= 1}>Remove</button></td></tr>)}</tbody></table></div></section>
  </div>;
}

function TwinLabView({ latest, scores }: { latest: TwinEntry; scores: TwinScores }) {
  return <OrganTwinLab latest={latest} scores={scores} />;
}

function TimelineView({ entries, latest }: { entries: TwinEntry[]; latest: TwinEntry }) {
  const previous = entries.length > 1 ? entries[entries.length - 2] : latest;
  const glucoseDelta = latest.fastingGlucoseMgDl - previous.fastingGlucoseMgDl;
  const exerciseDelta = latest.exerciseMinutesPerWeek - previous.exerciseMinutesPerWeek;
  return <div className="space-y-7"><PageHeader eyebrow="03 / trajectory" title="Momentum is a metric, too." description="Follow the direction of your glucose, activity, sleep, and Twin score over time." action={<div className="flex gap-2">{["7D", "30D", "90D"].map((range, index) => <button key={range} className={`button rounded-full border px-4 py-2 text-xs font-semibold ${index === 1 ? "border-black bg-black text-white" : "border-[#d8d8d5] bg-white text-neutral-600"}`}>{range}</button>)}</div>} /><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Avg glucose" value={`${Math.round(entries.reduce((sum, entry) => sum + entry.fastingGlucoseMgDl, 0) / entries.length)}`} unit="mg/dL" score={clamp(100 - Math.abs(glucoseDelta) * 2, 0, 100)} note={`${formatDelta(glucoseDelta, 0)} vs previous`} /><MetricCard label="HbA1c" value={`${latest.hba1cPercent}`} unit="%" score={computeScores(latest).metabolic} note="Estimated from latest entry" /><MetricCard label="Exercise" value={`${Math.round(latest.exerciseMinutesPerWeek / 7)}`} unit="min/day" score={computeScores(latest).activity} note={`${formatDelta(exerciseDelta, 0)} min/week change`} /><MetricCard label="Sleep" value={`${latest.sleepHours}`} unit="hrs/night" score={computeScores(latest).activity} note="Target band: 7â€“9 hours" /></section><TrendChart entries={entries} /><section data-anime-panel className="panel p-6 md:p-7"><div className="flex items-center justify-between"><div><p data-anime-lift className="eyebrow">Log history</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">Telemetry logbook</h2></div><span className="text-xs text-neutral-500">{entries.length} total logs</span></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b border-[#e5e5e2] text-[10px] font-bold uppercase tracking-[.16em] text-neutral-400"><th className="pb-3">Date</th><th className="pb-3">Fasting glucose</th><th className="pb-3">HbA1c</th><th className="pb-3">Exercise</th><th className="pb-3">Sleep</th><th className="pb-3">Twin</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id} className="border-b border-[#eeeeeb] last:border-0"><td className="py-4 font-medium">{new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</td><td className="num py-4">{entry.fastingGlucoseMgDl} mg/dL</td><td className="num py-4">{entry.hba1cPercent}%</td><td className="num py-4">{entry.exerciseMinutesPerWeek} min/wk</td><td className="num py-4">{entry.sleepHours} hrs</td><td className="num py-4 font-semibold">{computeScores(entry).composite}</td></tr>)}</tbody></table></div></section></div>;
}

function SimulatorView({ latest, scores, input, onChange }: { latest: TwinEntry; scores: TwinScores; input: SimulationInput; onChange: (input: SimulationInput) => void }) {
  const simulation = useMemo(() => buildSimulationData(latest, scores, input), [latest, scores, input]);
  const sliders: Array<{ label: string; key: keyof SimulationInput; min: number; max: number; step: number; unit: string }> = [{ label: "Weight change", key: "weightDeltaKg", min: -10, max: 10, step: .5, unit: "kg" }, { label: "Exercise boost", key: "exerciseDeltaMinutes", min: -120, max: 240, step: 15, unit: "min/wk" }, { label: "Diet quality", key: "dietDeltaPoints", min: -2, max: 2, step: 1, unit: "pts" }, { label: "Sleep duration", key: "sleepDeltaHours", min: -2, max: 3, step: .5, unit: "hrs" }];
  return <div className="space-y-7"><PageHeader eyebrow="04 / scenario lab" title="Test a healthier future." description="Make a hypothetical change and see how the deterministic Twin model responds. This is a planning tool, not a clinical prediction." action={<button className="button button-light rounded-full px-4 py-2 text-xs font-semibold" onClick={() => onChange({ weightDeltaKg: 0, exerciseDeltaMinutes: 0, dietDeltaPoints: 0, sleepDeltaHours: 0 })}>Reset scenario</button>} /><div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><section data-anime-panel className="panel p-6 md:p-7"><div><p data-anime-lift className="eyebrow">Quick scenarios</p><div className="mt-4 grid gap-3">{PRESETS.map((preset) => <button key={preset.label} className="button button-light flex items-center justify-between rounded-2xl p-4 text-left" onClick={() => onChange(preset.input)}><span><span className="block text-sm font-semibold">{preset.label}</span><span className="mt-1 block text-xs text-neutral-500">{preset.note}</span></span><span className="text-lg">&rarr;</span></button>)}</div></div><div className="mt-9 border-t border-[#e5e5e2] pt-7"><p data-anime-lift className="eyebrow">Tune the model</p><div className="mt-6 space-y-7">{sliders.map((slider) => { const value = Number(input[slider.key] ?? 0); return <label key={slider.key} className="block"><div className="flex items-center justify-between gap-4"><span className="text-sm font-semibold">{slider.label}</span><span className="num text-sm font-semibold">{formatDelta(value)} <span className="text-xs font-normal text-neutral-400">{slider.unit}</span></span></div><input className="slider mt-4" type="range" min={slider.min} max={slider.max} step={slider.step} value={value} onChange={(event) => onChange({ ...input, [slider.key]: Number(event.target.value) })} /></label>; })}</div></div></section><section data-anime-panel className="panel-dark p-6 md:p-7"><div className="flex items-end justify-between gap-4"><div><p data-anime-lift className="eyebrow text-neutral-500">Projected impact</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Baseline <span className="text-neutral-500">&rarr;</span> scenario</h2></div><span className={`num text-lg font-semibold ${simulation.deltas.composite >= 0 ? "text-white" : "text-neutral-400"}`}>{formatDelta(simulation.deltas.composite)} pts</span></div><div className="mt-10 flex flex-col items-center justify-center gap-8 rounded-2xl border border-neutral-800 bg-[#171717] p-8 sm:flex-row"><ScoreRing score={scores.composite} inverted /><span className="text-4xl text-neutral-500">&rarr;</span><ScoreRing score={simulation.simScores.composite} inverted /></div><div className="mt-7 grid gap-3 sm:grid-cols-3">{([["Metabolic", scores.metabolic, simulation.simScores.metabolic], ["Activity", scores.activity, simulation.simScores.activity], ["Nutrition", scores.nutrition, simulation.simScores.nutrition]] as const).map(([label, baseline, projected]) => <div key={label} className="rounded-2xl border border-neutral-800 p-4"><p data-anime-lift className="eyebrow text-neutral-500">{label}</p><p className="num mt-3 text-xl font-semibold">{baseline} <span className="text-neutral-600">&rarr;</span> {projected}</p><p className="num mt-2 text-xs text-neutral-400">{formatDelta(projected - baseline)} pts</p></div>)}</div><div className="mt-7 rounded-2xl border border-neutral-800 p-5"><p data-anime-lift className="eyebrow text-neutral-500">Estimated HbA1c</p><div className="mt-3 flex items-end justify-between gap-3"><p className="num text-3xl font-semibold">{latest.hba1cPercent}% <span className="text-neutral-600">&rarr;</span> {simulation.simulatedEntry.hba1cPercent.toFixed(2)}%</p><span className="num text-sm text-neutral-400">{formatDelta(simulation.simulatedEntry.hba1cPercent - latest.hba1cPercent, 2)}</span></div></div><p className="mt-6 text-xs leading-5 text-neutral-500">The model uses transparent heuristics to illustrate direction, not to diagnose or predict an individual clinical outcome.</p></section></div></div>;
}

function CoachView({ latest, scores, simulation }: { latest: TwinEntry; scores: TwinScores; simulation: SimulationChangeData }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: "Iâ€™m ready to read your latest Twin signals. Ask about your glucose, activity, sleep, nutrition, or an active scenario." }]);
  const [loading, setLoading] = useState(false);
  async function askCoach(value: string) {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    setQuestion("");
    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setLoading(true);
    try {
      const response = await fetch("/api/coach", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: trimmed, entry: latest, scores, simulation }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The coach could not respond right now.");
      setMessages((current) => [...current, { role: "assistant", text: result.answer || result.message || "I could not generate a response." }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", text: error instanceof Error ? error.message : "The coach could not respond right now." }]);
    } finally { setLoading(false); }
  }
  return <div className="space-y-7"><PageHeader eyebrow="05 / coach" title="A quieter kind of guidance." description="Ask questions in plain language. The Coach uses your own logged metrics and Twin scores as context." action={<span className="rounded-full border border-[#d8d8d5] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-neutral-500">Educational only</span>} /><div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><section data-anime-panel className="panel flex min-h-[650px] flex-col p-5 md:p-7"><div className="flex items-center justify-between border-b border-[#e5e5e2] pb-5"><div><p data-anime-lift className="eyebrow">Twin intelligence</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">Ask the Coach</h2></div><span className="flex items-center gap-2 text-xs text-neutral-500"><span className={`h-2 w-2 rounded-full bg-black ${loading ? "animate-pulse" : ""}`} />{loading ? "Thinking" : "Ready"}</span></div><div className="scroll-clean flex-1 space-y-4 overflow-y-auto py-6">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-black text-white" : "border border-[#e5e5e2] bg-[#fafaf8] text-neutral-700"}`}>{message.text}</div></div>)}{loading && <div className="flex justify-start"><div className="rounded-2xl border border-[#e5e5e2] bg-[#fafaf8] px-4 py-3 text-sm text-neutral-400">Reading your signalsâ€¦</div></div>}</div><div className="flex flex-wrap gap-2 border-t border-[#e5e5e2] pt-5">{QUESTIONS.map((prompt) => <button key={prompt} className="button button-light rounded-full px-3 py-2 text-xs font-semibold" onClick={() => void askCoach(prompt)}>{prompt}</button>)}</div><form className="mt-4 flex gap-2" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void askCoach(question); }}><input className="input-clean" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about your Twinâ€¦" /><button className="button button-dark rounded-xl px-5 text-sm font-semibold" type="submit">Send</button></form></section><aside className="space-y-5"><div data-anime-panel className="panel-dark p-6"><p data-anime-lift className="eyebrow text-neutral-500">Context window</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">What the Coach can see.</h2><div className="mt-7 space-y-4">{[["Fasting glucose", `${latest.fastingGlucoseMgDl} mg/dL`], ["HbA1c", `${latest.hba1cPercent}%`], ["Exercise", `${latest.exerciseMinutesPerWeek} min/wk`], ["Twin score", `${scores.composite}/100`]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-neutral-800 pb-3 text-sm"><span className="text-neutral-400">{label}</span><span className="num font-semibold">{value}</span></div>)}</div></div><div data-anime-panel className="panel p-6"><p data-anime-lift className="eyebrow">Safety note</p><p className="mt-4 text-sm leading-6 text-neutral-600">This is an educational reflection layer, not a doctor or an emergency service. Use it to prepare better questions for your care team.</p></div></aside></div></div>;
}

export default function Home() {
  const { activeTab, setActiveTab } = useNav();
  const [hydrated, setHydrated] = useState(false);
  const [entries, setEntries] = useState<TwinEntry[]>(DEFAULT_ENTRIES);
  const [simulationInput, setSimulationInput] = useState<SimulationInput>({ weightDeltaKg: 0, exerciseDeltaMinutes: 0, dietDeltaPoints: 0, sleepDeltaHours: 0 });
  useEffect(() => { setEntries(loadEntries()); setHydrated(true); }, []);
  const activeEntries = entries.length ? entries : DEFAULT_ENTRIES;
  const latest = activeEntries[activeEntries.length - 1];
  const scores = computeScores(latest);
  const simulation = useMemo(() => buildSimulationData(latest, scores, simulationInput), [latest, scores, simulationInput]);
  const tab = activeTab === "twin" ? "digital_twin" : activeTab === "aicoach" ? "ai_coach" : activeTab;
  function addEntry(entry: TwinEntry) { setEntries(saveEntry(entry)); }
  function removeEntry(id: string) { setEntries(deleteEntry(id)); }
  return <div className="min-h-screen bg-[#f4f4f1] text-black"><div className="mx-auto flex min-h-screen max-w-[1600px]"><aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col border-r border-[#dededb] bg-[#f4f4f1] p-6 lg:flex"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">DX</div><div><p className="text-sm font-bold tracking-[-0.03em]">DiabetX</p><p data-anime-lift className="eyebrow mt-1">Digital twin OS</p></div></div><div className="mt-14"><p data-anime-lift className="eyebrow mb-4">Workspace</p><nav className="space-y-1">{NAV_ITEMS.map((item) => <button key={item.id} className={`nav-item flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold ${tab === item.id ? "nav-item-active" : "text-neutral-500"}`} onClick={() => setActiveTab(item.id)}><span>{item.label}</span><span className={`text-[10px] font-bold tracking-[.14em] ${tab === item.id ? "text-neutral-400" : "text-neutral-300"}`}>{item.kicker}</span></button>)}</nav></div><div className="mt-auto rounded-2xl border border-[#dededb] bg-white p-4"><div className="flex items-center justify-between"><p data-anime-lift className="eyebrow">Engine</p><span className="h-2 w-2 rounded-full bg-black" /></div><p className="mt-3 text-sm font-semibold">Local signals active</p><p className="mt-2 text-xs leading-5 text-neutral-500">Data stays in this browser until you choose to ask the Coach.</p></div></aside><div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#dededb] bg-[#f4f4f1]/90 px-4 py-4 backdrop-blur-md md:px-8 lg:hidden"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-[10px] font-bold text-white">DX</div><span className="text-sm font-bold">DiabetX</span></div><span data-anime-lift className="eyebrow">{NAV_ITEMS.find((item) => item.id === tab)?.label}</span></header><main className="mx-auto max-w-[1240px] px-4 py-7 md:px-8 md:py-10"><AnimeMotionScope motionKey={`${tab}-${latest.id}`}>{!hydrated ? <div className="flex min-h-[60vh] items-center justify-center"><div className="text-center"><div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-black" /><p data-anime-lift className="eyebrow mt-4">Initializing twin</p></div></div> : tab === "dashboard" ? <DashboardView latest={latest} scores={scores} entries={activeEntries} onLog={addEntry} onDelete={removeEntry} onOpen={setActiveTab} /> : tab === "digital_twin" ? <TwinLabView latest={latest} scores={scores} /> : tab === "timeline" ? <TimelineView entries={activeEntries} latest={latest} /> : tab === "simulator" ? <SimulatorView latest={latest} scores={scores} input={simulationInput} onChange={setSimulationInput} /> : tab === "connected_care" ? <McpWorkspaceView latest={latest} entries={activeEntries} /> : <CoachView latest={latest} scores={scores} simulation={simulation} />}</AnimeMotionScope></main><footer className="mx-auto flex max-w-[1240px] flex-col gap-2 border-t border-[#dededb] px-4 py-8 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between md:px-8"><span>DiabetX / Digital Twin v3.0</span><span>Educational self-management interface Â· Not medical advice</span></footer></div></div><div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full border border-[#d2d2ce] bg-white/95 p-1 shadow-lg backdrop-blur lg:hidden">{NAV_ITEMS.map((item) => <button key={item.id} className={`rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em] ${tab === item.id ? "bg-black text-white" : "text-neutral-500"}`} onClick={() => setActiveTab(item.id)}>{item.kicker}</button>)}</div></div>;
}





