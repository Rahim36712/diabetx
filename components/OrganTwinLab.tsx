"use client";

import { useMemo, useState } from "react";
import ThreeDigitalTwinCanvas, { type OrganId, type PhysiologyLayer } from "@/components/ThreeDigitalTwinCanvas";
import { getOrganMetrics, getSystemMetrics, organMetricFor, ORGAN_ORDER, type OrganKey } from "@/lib/organMetrics";
import { computeScores } from "@/lib/twin";
import type { TwinEntry, TwinScores } from "@/lib/types";

const LAYERS: Array<{ id: PhysiologyLayer; label: string; note: string }> = [
  { id: "anatomy", label: "Anatomy", note: "Organ locations and relative state" },
  { id: "blood_flow", label: "Flow", note: "Circulation and vascular pathway" },
  { id: "metabolic_load", label: "Load", note: "Modelled glucose and fuel demand" },
  { id: "signaling", label: "Signals", note: "Pancreatic response and recovery context" },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatDelta(value: number, unit: string) {
  return `${value > 0 ? "+" : ""}${value}${unit}`;
}

function statusLabel(score: number) {
  if (score >= 76) return "Steady";
  if (score >= 58) return "Watch";
  return "Strained";
}

export default function OrganTwinLab({ latest, scores }: { latest: TwinEntry; scores: TwinScores }) {
  const [camera, setCamera] = useState<"front" | "focus" | "top" | "orbit">("front");
  const [selectedOrgan, setSelectedOrgan] = useState<OrganId>("pancreas");
  const [layer, setLayer] = useState<PhysiologyLayer>("anatomy");
  const [controls, setControls] = useState({ glucose: 0, activity: 0, sleep: 0 });
  const scenarioEntry = useMemo(() => ({
    ...latest,
    fastingGlucoseMgDl: clamp(latest.fastingGlucoseMgDl + controls.glucose, 55, 300),
    exerciseMinutesPerWeek: clamp(latest.exerciseMinutesPerWeek + controls.activity, 0, 420),
    sleepHours: clamp(latest.sleepHours + controls.sleep, 3, 12),
  }), [latest, controls]);
  const scenarioScores = useMemo(() => computeScores(scenarioEntry), [scenarioEntry]);
  const organMetrics = useMemo(() => getOrganMetrics(scenarioEntry, scenarioScores), [scenarioEntry, scenarioScores]);
  const systemMetrics = useMemo(() => getSystemMetrics(scenarioEntry, scenarioScores), [scenarioEntry, scenarioScores]);
  const activeOrgan = organMetricFor(organMetrics, selectedOrgan);
  const organScores = Object.fromEntries(organMetrics.map((item) => [item.id, item.modelScore])) as Partial<Record<OrganKey, number>>;
  const scenarioActive = Object.values(controls).some((value) => value !== 0);

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-5 border-b border-[#d9d9d6] pb-7 md:flex-row md:items-end">
        <div>
          <p data-anime-lift className="eyebrow">02 / twin lab</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-[-0.06em] text-black md:text-5xl">Run a system-level simulation.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">Select an organ, switch a physiological layer, and test small input shifts against this educational model.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#d8d8d5] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-neutral-500"><span className="h-2 w-2 rounded-full bg-black" />{scenarioActive ? "Scenario active" : "Baseline active"}</div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div data-anime-panel className="panel twin-stage overflow-hidden bg-[#f8f8f5] p-5 md:p-7">
          <div className="flex flex-col gap-4 border-b border-[#e5e5e2] pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div><p data-anime-lift className="eyebrow">Interactive physiology model</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">{activeOrgan.label} / {activeOrgan.shortLabel}</h2></div>
            <div className="flex flex-wrap gap-2">{(["front", "focus", "top", "orbit"] as const).map((mode) => <button key={mode} className={`button rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em] ${camera === mode ? "border-black bg-black text-white" : "border-[#dededb] bg-white text-neutral-600"}`} onClick={() => setCamera(mode)}>{mode}</button>)}</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{LAYERS.map((item) => <button key={item.id} className={`button rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em] ${layer === item.id ? "border-black bg-black text-white" : "border-[#dededb] bg-white text-neutral-600"}`} onClick={() => setLayer(item.id)}>{item.label}</button>)}</div>
          <ThreeDigitalTwinCanvas score={scenarioScores.composite} className="h-[465px] w-full" cameraPreset={camera} selectedOrgan={selectedOrgan} layer={layer} organScores={organScores} onOrganSelect={setSelectedOrgan} />
          <div className="mt-1 flex flex-wrap gap-2 pb-1">{ORGAN_ORDER.map((id) => { const organ = organMetrics.find((item) => item.id === id)!; return <button key={id} className={`button rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em] ${selectedOrgan === id ? "border-black bg-black text-white" : "border-[#dededb] bg-white text-neutral-600"}`} onClick={() => setSelectedOrgan(id)}>{organ.label} <span className="ml-1 opacity-60">{organ.modelScore}</span></button>; })}</div>
        </div>

        <aside className="space-y-5">
          <div data-anime-panel className="panel-dark p-6">
            <p data-anime-lift className="eyebrow text-neutral-500">Selected organ</p>
            <div className="mt-3 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-semibold tracking-[-0.05em]">{activeOrgan.label}</h2><p className="mt-2 max-w-xs text-sm leading-6 text-neutral-400">{activeOrgan.description}</p></div><div className="rounded-2xl border border-neutral-700 px-3 py-2 text-right"><p className="num text-2xl font-semibold">{activeOrgan.modelScore}</p><p data-anime-lift className="eyebrow text-neutral-500">{statusLabel(activeOrgan.modelScore)}</p></div></div>
            <div className="mt-7 space-y-4">{activeOrgan.metrics.map((metric) => <div key={metric.label}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{metric.label}</p><p className="mt-1 text-xs text-neutral-500">{metric.note}</p></div><p className="num text-sm font-semibold">{metric.value}<span className="ml-1 text-[10px] text-neutral-500">{metric.unit}</span></p></div><div className="metric-bar metric-bar-inverse mt-2"><span style={{ width: `${metric.quality}%` }} /></div></div>)}</div>
          </div>
          <div data-anime-panel className="panel p-6"><p data-anime-lift className="eyebrow">Layer briefing</p><h3 className="mt-3 text-lg font-semibold tracking-[-0.04em]">{LAYERS.find((item) => item.id === layer)?.label}</h3><p className="mt-2 text-sm leading-6 text-neutral-500">{LAYERS.find((item) => item.id === layer)?.note}. Click the model or the organ chips to focus the visual.</p></div>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.78fr_1.22fr]">
        <div data-anime-panel className="panel p-6 md:p-7"><div className="flex items-end justify-between gap-4"><div><p data-anime-lift className="eyebrow">What-if controls</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">Stress-test the twin</h2></div><button className="button button-light rounded-full px-3 py-2 text-xs font-semibold" onClick={() => setControls({ glucose: 0, activity: 0, sleep: 0 })}>Reset</button></div><div className="mt-7 space-y-7">{([
          { key: "glucose", label: "Glucose load", min: -35, max: 55, step: 5, unit: " mg/dL" },
          { key: "activity", label: "Movement reserve", min: -90, max: 180, step: 15, unit: " min/wk" },
          { key: "sleep", label: "Recovery window", min: -2, max: 3, step: .5, unit: " hrs" },
        ] as const).map((control) => <label key={control.key} className="block"><div className="flex items-center justify-between gap-4"><span className="text-sm font-semibold">{control.label}</span><span className="num text-sm font-semibold">{formatDelta(controls[control.key], control.unit)}</span></div><input className="slider mt-4" type="range" min={control.min} max={control.max} step={control.step} value={controls[control.key]} onChange={(event) => setControls({ ...controls, [control.key]: Number(event.target.value) })} /></label>)}</div><p className="mt-7 rounded-xl bg-[#f5f5f3] p-4 text-xs leading-5 text-neutral-500">These controls adjust a local educational scenario only. They do not change your saved log or estimate medical outcomes.</p></div>
        <div data-anime-panel className="panel p-6 md:p-7"><div className="flex items-end justify-between gap-4"><div><p data-anime-lift className="eyebrow">System telemetry</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">Physiology dashboard</h2></div><span className="num text-sm font-semibold">Twin {scenarioScores.composite}/100</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{systemMetrics.map((metric) => <div key={metric.id} className="rounded-2xl border border-[#e5e5e2] bg-[#fafaf8] p-4"><p data-anime-lift className="eyebrow">{metric.label}</p><p className="num mt-3 text-2xl font-semibold">{metric.value}<span className="ml-1 text-xs font-medium tracking-normal text-neutral-400">{metric.unit}</span></p><div className="metric-bar mt-4"><span style={{ width: `${metric.quality}%` }} /></div><p className="mt-2 text-xs text-neutral-500">{metric.note}</p></div>)}</div><div className="mt-5 rounded-2xl border border-[#e5e5e2] p-5"><p data-anime-lift className="eyebrow">Scenario delta</p><div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">{[["Twin", scores.composite, scenarioScores.composite], ["Metabolic", scores.metabolic, scenarioScores.metabolic], ["Activity", scores.activity, scenarioScores.activity], ["Glucose", latest.fastingGlucoseMgDl, scenarioEntry.fastingGlucoseMgDl]].map(([label, baseline, projected]) => <div key={String(label)}><p className="text-xs text-neutral-500">{label}</p><p className="num mt-1 text-lg font-semibold">{baseline} <span className="text-neutral-300">&rarr;</span> {projected}</p></div>)}</div></div></div>
      </section>

      <p className="mx-auto max-w-4xl text-center text-xs leading-5 text-neutral-500">All organ labels and physiological readouts are transparent educational model outputs derived from the logged glucose, HbA1c, sleep, activity, and diet inputs. They are not measured biometrics, clinical imaging, or medical diagnoses.</p>
    </div>
  );
}



