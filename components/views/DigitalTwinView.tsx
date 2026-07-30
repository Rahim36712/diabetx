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
      status: pancreasHealth >= 80 ? "OPTIMAL" : pancreasHealth >= 60 ? "MODERATE" : "ATTENTION REQUIRED",
      color: "text-lime-300",
      borderColor: "border-lime-400/40",
      bg: "bg-lime-400/20",
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
      color: "text-lime-400",
      borderColor: "border-lime-400/40",
      bg: "bg-lime-400/20",
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
      color: "text-white",
      borderColor: "border-white/30",
      bg: "bg-white/15",
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
      <div className="glass-card rounded-2xl p-6 border border-white/15 flex flex-wrap items-center justify-between gap-4 bg-[#060A07]/90">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-lime-400 animate-ping" />
            <h2 className="font-display text-xl font-bold text-white">
              Interactive 3D Digital Twin Viewport
            </h2>
          </div>
          <p className="text-xs text-slate-200 font-medium">
            Real-time cyber-physiological mesh visualization & organ telemetry breakdown.
          </p>
        </div>

        {/* Camera View Controls */}
        <div className="flex items-center gap-2 bg-[#060A07]/95 p-1.5 rounded-xl border border-white/15">
          <span className="text-[10px] font-mono font-extrabold text-slate-300 px-2 uppercase tracking-wider hidden sm:inline">
            Camera Mode:
          </span>
          {(["front", "focus", "top", "orbit"] as CameraPreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => setCameraPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                cameraPreset === preset
                  ? "bg-lime-400/20 text-lime-300 border border-lime-400/40 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
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
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 border border-white/15 relative flex flex-col justify-between overflow-hidden min-h-[480px] bg-[#060A07]/90">
          <div className="ambient-glow-lime" />

          {/* Top Canvas Toolbar */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-[#060A07]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-lime-400/40">
              <span className="material-symbols-outlined text-lime-400 text-sm">boy</span>
              <span className="text-xs font-mono font-bold text-lime-300">
                CYBERNETIC SILHOUETTE MESH
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedOrgan("all")}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer ${
                  selectedOrgan === "all"
                    ? "bg-lime-400/20 text-lime-300 border-lime-400/40"
                    : "bg-[#060A07]/80 text-slate-300 border-white/15 hover:text-white"
                }`}
              >
                All Systems
              </button>
              <button
                onClick={() => setSelectedOrgan("pancreas")}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer ${
                  selectedOrgan === "pancreas"
                    ? "bg-lime-400/20 text-lime-300 border-lime-400/40"
                    : "bg-[#060A07]/80 text-slate-300 border-white/15 hover:text-white"
                }`}
              >
                Pancreas
              </button>
              <button
                onClick={() => setSelectedOrgan("vascular")}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer ${
                  selectedOrgan === "vascular"
                    ? "bg-lime-400/20 text-lime-300 border-lime-400/40"
                    : "bg-[#060A07]/80 text-slate-300 border-white/15 hover:text-white"
                }`}
              >
                Vascular
              </button>
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="w-full flex-1 flex items-center justify-center my-4">
            <ThreeDigitalTwinCanvas score={activeScores.composite} className="w-full h-96" />
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 z-10 pt-2 border-t border-white/15">
            <div className="bg-[#060A07]/90 p-3 rounded-xl border border-white/15 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-300 font-semibold">Glucose Node</span>
              <span className="text-xs font-mono font-bold text-white">
                {activeEntry.fastingGlucoseMgDl} mg/dL
              </span>
            </div>
            <div className="bg-[#060A07]/90 p-3 rounded-xl border border-white/15 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-300 font-semibold">HbA1c Node</span>
              <span className="text-xs font-mono font-bold text-white">
                {activeEntry.hba1cPercent.toFixed(1)}%
              </span>
            </div>
            <div className="bg-[#060A07]/90 p-3 rounded-xl border border-white/15 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-300 font-semibold">Activity Index</span>
              <span className="text-xs font-mono font-bold text-lime-300">
                {activeScores.activity}/100
              </span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Organ System Breakdown */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="glass-card rounded-3xl p-6 border border-white/15 space-y-5 bg-[#060A07]/90">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <h3 className="font-display font-bold text-white">Organ Systems</h3>
              <span className="text-xs font-mono font-bold text-lime-300">Live Diagnostics</span>
            </div>

            {/* Organ Card 1: Pancreas */}
            <div
              onClick={() => setSelectedOrgan("pancreas")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                selectedOrgan === "pancreas"
                  ? "bg-lime-400/15 border-lime-400/40 shadow-lg"
                  : "bg-[#060A07]/80 border-white/15 hover:border-white/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-lime-400/20 text-lime-300 border border-lime-400/40">
                    <span className="material-symbols-outlined text-lg">monitor_heart</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">Pancreatic B-Cells</h4>
                    <span className="text-[10px] font-mono text-slate-300">Insulin Release</span>
                  </div>
                </div>
                <span className="text-xl font-display font-extrabold text-white">
                  {organData.pancreas.score}%
                </span>
              </div>
              <p className="text-[11px] text-slate-200 leading-tight">
                {organData.pancreas.desc}
              </p>
            </div>

            {/* Organ Card 2: Vascular */}
            <div
              onClick={() => setSelectedOrgan("vascular")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                selectedOrgan === "vascular"
                  ? "bg-lime-400/15 border-lime-400/40 shadow-lg"
                  : "bg-[#060A07]/80 border-white/15 hover:border-white/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-lime-400/20 text-lime-300 border border-lime-400/40">
                    <span className="material-symbols-outlined text-lg">vital_signs</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">Vascular System</h4>
                    <span className="text-[10px] font-mono text-slate-300">Endothelial Flow</span>
                  </div>
                </div>
                <span className="text-xl font-display font-extrabold text-white">
                  {organData.vascular.score}%
                </span>
              </div>
              <p className="text-[11px] text-slate-200 leading-tight">
                {organData.vascular.desc}
              </p>
            </div>

            {/* Organ Card 3: Metabolic */}
            <div
              onClick={() => setSelectedOrgan("metabolic")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                selectedOrgan === "metabolic"
                  ? "bg-lime-400/15 border-lime-400/40 shadow-lg"
                  : "bg-[#060A07]/80 border-white/15 hover:border-white/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/20 text-white border border-white/30">
                    <span className="material-symbols-outlined text-lg">bolt</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">Metabolic Core</h4>
                    <span className="text-[10px] font-mono text-slate-300">Mitochondria</span>
                  </div>
                </div>
                <span className="text-xl font-display font-extrabold text-white">
                  {organData.metabolic.score}%
                </span>
              </div>
              <p className="text-[11px] text-slate-200 leading-tight">
                {organData.metabolic.desc}
              </p>
            </div>
          </div>

          {/* Quick Score Ring Card */}
          <div className="glass-card rounded-3xl p-5 border border-white/15 bg-[#060A07]/90 flex items-center justify-around">
            <ScoreRing score={activeScores.composite} size={150} />
          </div>
        </div>
      </div>
    </div>
  );
}
