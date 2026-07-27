"use client";

import React, { useState } from "react";
import type { TwinEntry, TwinScores, SimulationChangeData } from "@/lib/types";
import ThreeDigitalTwinCanvas from "@/components/ThreeDigitalTwinCanvas";
import ScoreRing from "@/components/ScoreRing";

interface DigitalTwinViewProps {
  latest: TwinEntry;
  scores: TwinScores;
  simulationData?: SimulationChangeData | null;
}

type OrganKey = "all" | "pancreas" | "vascular" | "metabolic";
type CameraPreset = "front" | "focus" | "top" | "orbit";

export default function DigitalTwinView({
  latest,
  scores,
  simulationData,
}: DigitalTwinViewProps) {
  const [selectedOrgan, setSelectedOrgan] = useState<OrganKey>("all");
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("front");

  const isSim = Boolean(simulationData && simulationData.isModified);
  const activeScores = isSim && simulationData ? simulationData.simScores : scores;
  const activeEntry = isSim && simulationData ? simulationData.simulatedEntry : latest;

  // Organ system calculations
  const pancreasHealth = Math.min(
    100,
    Math.max(
      20,
      100 - (activeEntry.hba1cPercent - 5.0) * 12 - (activeEntry.fastingGlucoseMgDl - 90) * 0.4
    )
  );

  const vascularHealth = Math.min(
    100,
    Math.max(
      25,
      activeScores.activity * 0.5 + activeScores.metabolic * 0.5
    )
  );

  const metabolicHealth = activeScores.metabolic;

  const organData = {
    pancreas: {
      name: "Pancreatic B-Cell System",
      icon: "monitor_heart",
      score: Math.round(pancreasHealth),
      status: pancreasHealth >= 80 ? "OPTIMAL" : pancreasHealth >= 60 ? "MODERATE" : "STRESSED",
      color: pancreasHealth >= 80 ? "text-lime-400" : pancreasHealth >= 60 ? "text-amber-400" : "text-rose-400",
      borderColor: pancreasHealth >= 80 ? "border-lime-500/30" : pancreasHealth >= 60 ? "border-amber-500/30" : "border-rose-500/30",
      bg: pancreasHealth >= 80 ? "bg-lime-500/10" : pancreasHealth >= 60 ? "bg-amber-500/10" : "bg-rose-500/10",
      metrics: [
        { label: "Insulin Sensitivity Index", value: `${(100 - activeEntry.fastingGlucoseMgDl * 0.4).toFixed(1)}%` },
        { label: "Glycemic Excursion Shift", value: `${activeEntry.fastingGlucoseMgDl} mg/dL` },
        { label: "HbA1c Glycation Baseline", value: `${activeEntry.hba1cPercent.toFixed(1)}%` },
        { label: "Beta-Cell Stress Level", value: pancreasHealth >= 75 ? "Low" : "Elevated" },
      ],
      desc: "Monitors beta-cell insulin secretion dynamics and systemic glucose regulatory stability.",
    },
    vascular: {
      name: "Vascular & Endothelial System",
      icon: "vital_signs",
      score: Math.round(vascularHealth),
      status: vascularHealth >= 80 ? "ROBUST" : vascularHealth >= 60 ? "STABLE" : "ATTENTION REQUIRED",
      color: vascularHealth >= 80 ? "text-lime-300" : vascularHealth >= 60 ? "text-emerald-400" : "text-orange-400",
      borderColor: vascularHealth >= 80 ? "border-lime-400/30" : vascularHealth >= 60 ? "border-emerald-500/30" : "border-orange-500/30",
      bg: vascularHealth >= 80 ? "bg-lime-400/10" : vascularHealth >= 60 ? "bg-emerald-500/10" : "bg-orange-500/10",
      metrics: [
        { label: "Microvascular Integrity", value: `${Math.round(vascularHealth)}%` },
        { label: "Exercise Vasodilation", value: `${activeEntry.exerciseMinutesPerWeek} min/wk` },
        { label: "Nocturnal Recovery Index", value: `${activeEntry.sleepHours} hrs` },
        { label: "Shear Stress Resilience", value: "Normal Range" },
      ],
      desc: "Tracks microvascular circulation efficiency, arterial wall shear stress, and endothelial response.",
    },
    metabolic: {
      name: "Metabolic Core & Mitochondria",
      icon: "bolt",
      score: Math.round(metabolicHealth),
      status: metabolicHealth >= 80 ? "HIGH EFFICIENCY" : metabolicHealth >= 60 ? "BALANCED" : "SLUGGISH",
      color: metabolicHealth >= 80 ? "text-emerald-400" : metabolicHealth >= 60 ? "text-lime-400" : "text-pink-400",
      borderColor: metabolicHealth >= 80 ? "border-emerald-500/30" : metabolicHealth >= 60 ? "border-lime-500/30" : "border-pink-500/30",
      bg: metabolicHealth >= 80 ? "bg-emerald-500/10" : metabolicHealth >= 60 ? "bg-lime-500/10" : "bg-pink-500/10",
      metrics: [
        { label: "Basal ATP Synthesis Rate", value: `${Math.round(metabolicHealth * 12)} kcal/h` },
        { label: "Dietary Quality Rating", value: `${activeEntry.dietQuality}/5 Rating` },
        { label: "Body Weight Telemetry", value: `${activeEntry.weightKg} kg` },
        { label: "Glycogen Storage Buffer", value: `${(metabolicHealth * 0.95).toFixed(0)}%` },
      ],
      desc: "Evaluates mitochondrial bioenergetics, basal substrate oxidation, and glucose storage utilization.",
    },
  };

  return (
    <div className="space-y-6 animate-card font-sans">
      {/* Header Bar */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-lime-400 animate-ping" />
            <h2 className="font-display text-xl font-bold text-white">
              Interactive 3D Digital Twin Viewport
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Real-time cyber-physiological mesh visualization & organ telemetry breakdown.
          </p>
        </div>

        {/* Camera View Controls */}
        <div className="flex items-center gap-2 bg-[#060B08]/80 p-1.5 rounded-xl border border-white/10">
          <span className="text-[10px] font-mono font-bold text-slate-400 px-2 uppercase tracking-wider hidden sm:inline">
            Camera Mode:
          </span>
          {(["front", "focus", "top", "orbit"] as CameraPreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => setCameraPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                cameraPreset === preset
                  ? "bg-lime-500/20 text-lime-300 border border-lime-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Canvas Viewport with Hotspots & Telemetry Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 8 Cols: Expanded 3D Canvas */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 border border-white/10 relative flex flex-col justify-between overflow-hidden min-h-[480px]">
          <div className="ambient-glow-lime" />
          <div className="ambient-glow-emerald" />

          {/* Top Canvas Bar: Organ Hotspot Selector Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Organ Hotspots:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedOrgan("all")}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedOrgan === "all"
                      ? "bg-lime-400 text-[#060B08] shadow-md shadow-lime-500/30 font-extrabold"
                      : "bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  All Systems
                </button>
                <button
                  onClick={() => setSelectedOrgan("pancreas")}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedOrgan === "pancreas"
                      ? "bg-lime-500 text-[#060B08] shadow-md shadow-lime-500/30 font-extrabold"
                      : "bg-white/5 text-slate-300 hover:text-lime-400"
                  }`}
                >
                  Pancreas
                </button>
                <button
                  onClick={() => setSelectedOrgan("vascular")}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedOrgan === "vascular"
                      ? "bg-lime-300 text-[#060B08] shadow-md shadow-lime-300/30 font-extrabold"
                      : "bg-white/5 text-slate-300 hover:text-lime-300"
                  }`}
                >
                  Vascular
                </button>
                <button
                  onClick={() => setSelectedOrgan("metabolic")}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedOrgan === "metabolic"
                      ? "bg-emerald-500 text-[#060B08] shadow-md shadow-emerald-500/30 font-extrabold"
                      : "bg-white/5 text-slate-300 hover:text-emerald-400"
                  }`}
                >
                  Metabolic Core
                </button>
              </div>
            </div>

            {isSim && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-lime-500/15 border border-lime-500/30 text-lime-300 animate-pulse">
                ⚡ SIMULATION TELEMETRY ACTIVE
              </span>
            )}
          </div>

          {/* Center Expanded 3D Canvas */}
          <div className="my-4 relative flex-1 flex items-center justify-center">
            <ThreeDigitalTwinCanvas
              score={activeScores.composite}
              className="w-full h-96 transition-all duration-500"
            />

            {/* Interactive Visual Hotspot Markers over silhouette */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-around items-center py-12">
              <div
                onClick={() => setSelectedOrgan("pancreas")}
                className={`pointer-events-auto cursor-pointer px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold transition-all duration-300 shadow-lg ${
                  selectedOrgan === "pancreas"
                    ? "bg-lime-400 text-[#060B08] border-lime-300 scale-110"
                    : "bg-[#060B08]/80 text-lime-400 border-lime-500/40 hover:scale-105"
                }`}
              >
                ● Pancreatic Node ({organData.pancreas.score})
              </div>

              <div
                onClick={() => setSelectedOrgan("vascular")}
                className={`pointer-events-auto cursor-pointer px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold transition-all duration-300 shadow-lg ${
                  selectedOrgan === "vascular"
                    ? "bg-lime-300 text-[#060B08] border-lime-200 scale-110"
                    : "bg-[#060B08]/80 text-lime-300 border-lime-400/40 hover:scale-105"
                }`}
              >
                ● Vascular Mesh ({organData.vascular.score})
              </div>

              <div
                onClick={() => setSelectedOrgan("metabolic")}
                className={`pointer-events-auto cursor-pointer px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold transition-all duration-300 shadow-lg ${
                  selectedOrgan === "metabolic"
                    ? "bg-emerald-400 text-[#060B08] border-emerald-300 scale-110"
                    : "bg-[#060B08]/80 text-emerald-400 border-emerald-500/40 hover:scale-105"
                }`}
              >
                ● Metabolic Core ({organData.metabolic.score})
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Readout Strip */}
          <div className="bg-[#060B08]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 z-10">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Composite Score
              </span>
              <span className="text-xl font-display font-extrabold text-lime-400">
                {activeScores.composite} <span className="text-xs text-slate-400 font-mono">/100</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Fasting Glucose
              </span>
              <span className="text-xl font-display font-extrabold text-white">
                {activeEntry.fastingGlucoseMgDl} <span className="text-xs text-slate-400 font-mono">mg/dL</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                HbA1c Level
              </span>
              <span className="text-xl font-display font-extrabold text-lime-300">
                {activeEntry.hba1cPercent.toFixed(1)} <span className="text-xs text-slate-400 font-mono">%</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Physical Load
              </span>
              <span className="text-xl font-display font-extrabold text-emerald-400">
                {activeEntry.exerciseMinutesPerWeek} <span className="text-xs text-slate-400 font-mono">min/wk</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Health Ring & Active Organ Diagnostics */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center space-y-4 text-center">
            <ScoreRing score={activeScores.composite} label="Twin Stability Index" size={180} />
            <p className="text-xs font-medium text-slate-300 leading-relaxed max-w-xs">
              {selectedOrgan === "all"
                ? "All physiological subsystems are integrated into your real-time 3D cyber silhouette."
                : organData[selectedOrgan].desc}
            </p>
          </div>

          {/* Dynamic Organ System Detail Card */}
          {selectedOrgan !== "all" ? (
            <OrganDetailCard organ={organData[selectedOrgan]} />
          ) : (
            <div className="space-y-3">
              <OrganSummaryTile organ={organData.pancreas} onSelect={() => setSelectedOrgan("pancreas")} />
              <OrganSummaryTile organ={organData.vascular} onSelect={() => setSelectedOrgan("vascular")} />
              <OrganSummaryTile organ={organData.metabolic} onSelect={() => setSelectedOrgan("metabolic")} />
            </div>
          )}
        </div>
      </div>

      {/* Full Organ System Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {(Object.keys(organData) as Array<keyof typeof organData>).map((key) => {
          const item = organData[key];
          const isSelected = selectedOrgan === key;
          return (
            <div
              key={key}
              onClick={() => setSelectedOrgan(key)}
              className={`glass-card rounded-2xl p-5 border transition-all duration-300 cursor-pointer space-y-4 ${
                isSelected
                  ? "border-lime-400 bg-lime-500/10 shadow-2xl scale-[1.02]"
                  : "border-white/10 hover:border-lime-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} border ${item.borderColor} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${item.color} text-xl`}>
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-white">{item.name}</h3>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${item.bg} ${item.color} ${item.borderColor}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <span className="font-display text-2xl font-extrabold text-white">
                  {item.score}
                </span>
              </div>

              <div className="space-y-2 border-t border-white/10 pt-3">
                {item.metrics.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{m.label}</span>
                    <span className="font-bold text-slate-200">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrganDetailCard({ organ }: { organ: any }) {
  return (
    <div className={`glass-card rounded-2xl p-5 border ${organ.borderColor} space-y-4 font-sans`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`material-symbols-outlined ${organ.color} text-xl`}>{organ.icon}</span>
          <h3 className="font-display font-bold text-sm text-white">{organ.name}</h3>
        </div>
        <span className={`text-xs font-mono font-bold ${organ.color}`}>{organ.score} / 100</span>
      </div>
      <p className="text-xs text-slate-300 font-medium leading-relaxed">{organ.desc}</p>
      <div className="space-y-2 border-t border-white/10 pt-3">
        {organ.metrics.map((m: any, i: number) => (
          <div key={i} className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">{m.label}</span>
            <span className="font-bold text-slate-200">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrganSummaryTile({ organ, onSelect }: { organ: any; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className="glass-card rounded-xl p-3.5 border border-white/10 hover:border-lime-400/40 transition-all cursor-pointer flex items-center justify-between font-sans"
    >
      <div className="flex items-center gap-3">
        <span className={`material-symbols-outlined ${organ.color} text-lg`}>{organ.icon}</span>
        <div>
          <h4 className="font-display text-xs font-bold text-slate-200">{organ.name}</h4>
          <span className="text-[10px] font-mono text-slate-400">{organ.status}</span>
        </div>
      </div>
      <span className="font-display text-lg font-bold text-white">{organ.score}</span>
    </div>
  );
}
