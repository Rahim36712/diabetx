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
      desc: "Monitors beta-cell insulin secretion dynamics and systemic glucose regulatory stability.",
    },
    vascular: {
      name: "Vascular & Endothelial System",
      icon: "vital_signs",
      score: Math.round(vascularHealth),
      status: vascularHealth >= 80 ? "ROBUST" : vascularHealth >= 60 ? "STABLE" : "ATTENTION REQUIRED",
      desc: "Tracks microvascular circulation efficiency, arterial wall shear stress, and endothelial response.",
    },
    metabolic: {
      name: "Metabolic Core & Mitochondria",
      icon: "bolt",
      score: Math.round(metabolicHealth),
      status: metabolicHealth >= 80 ? "HIGH EFFICIENCY" : metabolicHealth >= 60 ? "BALANCED" : "SLUGGISH",
      desc: "Evaluates mitochondrial bioenergetics, basal substrate oxidation, and glucose storage utilization.",
    },
  };

  return (
    <div className="space-y-6 animate-card font-sans">
      {/* Header Bar */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-white shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-lime-500 animate-ping" />
            <h2 className="font-display text-xl font-bold text-slate-900">
              Interactive 3D Digital Twin Viewport
            </h2>
          </div>
          <p className="text-xs text-slate-600 font-bold">
            Real-time cyber-physiological mesh visualization & organ telemetry breakdown.
          </p>
        </div>

        {/* Camera View Controls */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-mono font-extrabold text-slate-500 px-2 uppercase tracking-wider hidden sm:inline">
            Camera Mode:
          </span>
          {(["front", "focus", "top", "orbit"] as CameraPreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setCameraPreset(preset);
                if (preset === "focus") setSelectedOrgan("pancreas");
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-extrabold capitalize transition-all cursor-pointer ${
                cameraPreset === preset
                  ? "bg-lime-500/20 text-lime-800 border border-lime-500/40 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
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
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 border border-slate-200 relative flex flex-col justify-between overflow-hidden min-h-[480px] bg-white shadow-xl">
          <div className="ambient-glow-lime" />

          {/* Top Canvas Toolbar */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-lime-500/40 shadow-sm">
              <span className="material-symbols-outlined text-lime-600 text-sm">boy</span>
              <span className="text-xs font-mono font-bold text-lime-800">
                CYBERNETIC SILHOUETTE MESH
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedOrgan("all");
                  setCameraPreset("front");
                }}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer ${
                  selectedOrgan === "all"
                    ? "bg-lime-500/20 text-lime-800 border-lime-500/40 shadow-sm"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900"
                }`}
              >
                All Systems
              </button>
              <button
                onClick={() => {
                  setSelectedOrgan("pancreas");
                  setCameraPreset("focus");
                }}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer ${
                  selectedOrgan === "pancreas"
                    ? "bg-lime-500/20 text-lime-800 border-lime-500/40 shadow-sm"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900"
                }`}
              >
                Pancreas
              </button>
              <button
                onClick={() => {
                  setSelectedOrgan("vascular");
                  setCameraPreset("orbit");
                }}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer ${
                  selectedOrgan === "vascular"
                    ? "bg-lime-500/20 text-lime-800 border-lime-500/40 shadow-sm"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900"
                }`}
              >
                Vascular
              </button>
            </div>
          </div>

          {/* 3D Canvas with animated camera and organ props */}
          <div className="w-full flex-1 flex items-center justify-center my-4">
            <ThreeDigitalTwinCanvas
              score={activeScores.composite}
              cameraPreset={cameraPreset}
              selectedOrgan={selectedOrgan}
              className="w-full h-96"
            />
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 z-10 pt-2 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-600 font-bold">Glucose Node</span>
              <span className="text-xs font-mono font-extrabold text-slate-900">
                {activeEntry.fastingGlucoseMgDl} mg/dL
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-600 font-bold">HbA1c Node</span>
              <span className="text-xs font-mono font-extrabold text-slate-900">
                {activeEntry.hba1cPercent.toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-600 font-bold">Activity Index</span>
              <span className="text-xs font-mono font-extrabold text-lime-700">
                {activeScores.activity}/100
              </span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Organ System Breakdown */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="glass-card rounded-3xl p-6 border border-slate-200 space-y-4 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-slate-900">Organ Systems</h3>
              <span className="text-xs font-mono font-extrabold text-lime-800">Live Diagnostics</span>
            </div>

            {/* Organ Card 1: Pancreas */}
            <div
              onClick={() => {
                setSelectedOrgan("pancreas");
                setCameraPreset("focus");
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                selectedOrgan === "pancreas"
                  ? "bg-lime-500/15 border-lime-500/40 shadow-md"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-lime-500/20 text-lime-700 border border-lime-500/40">
                    <span className="material-symbols-outlined text-lg">monitor_heart</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900">Pancreatic B-Cells</h4>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">Insulin Release</span>
                  </div>
                </div>
                <span className="text-xl font-display font-extrabold text-slate-900">
                  {organData.pancreas.score}%
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight font-medium">
                {organData.pancreas.desc}
              </p>
            </div>

            {/* Organ Card 2: Vascular */}
            <div
              onClick={() => {
                setSelectedOrgan("vascular");
                setCameraPreset("orbit");
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                selectedOrgan === "vascular"
                  ? "bg-lime-500/15 border-lime-500/40 shadow-md"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-lime-500/20 text-lime-700 border border-lime-500/40">
                    <span className="material-symbols-outlined text-lg">vital_signs</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900">Vascular System</h4>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">Endothelial Flow</span>
                  </div>
                </div>
                <span className="text-xl font-display font-extrabold text-slate-900">
                  {organData.vascular.score}%
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight font-medium">
                {organData.vascular.desc}
              </p>
            </div>

            {/* Organ Card 3: Metabolic */}
            <div
              onClick={() => {
                setSelectedOrgan("metabolic");
                setCameraPreset("front");
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                selectedOrgan === "metabolic"
                  ? "bg-lime-500/15 border-lime-500/40 shadow-md"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-200 text-slate-800 border border-slate-300">
                    <span className="material-symbols-outlined text-lg">bolt</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900">Metabolic Core</h4>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">Mitochondria</span>
                  </div>
                </div>
                <span className="text-xl font-display font-extrabold text-slate-900">
                  {organData.metabolic.score}%
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight font-medium">
                {organData.metabolic.desc}
              </p>
            </div>
          </div>

          {/* Quick Score Ring Card */}
          <div className="glass-card rounded-3xl p-5 border border-slate-200 bg-white shadow-xl flex items-center justify-around">
            <ScoreRing score={activeScores.composite} size={150} />
          </div>
        </div>
      </div>
    </div>
  );
}
