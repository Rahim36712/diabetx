"use client";

import React from "react";
import type { TwinEntry, TwinScores, SimulationChangeData } from "@/lib/types";
import { explainScores } from "@/lib/twin";
import ScoreCards from "@/components/ScoreCards";
import ScoreRing from "@/components/ScoreRing";
import EntryForm from "@/components/EntryForm";
import EntryHistory from "@/components/EntryHistory";
import AiCoach from "@/components/AiCoach";
import ThreeDigitalTwinCanvas from "@/components/ThreeDigitalTwinCanvas";
import TimelineChart from "@/components/TimelineChart";
import SimulationPanel from "@/components/SimulationPanel";

interface DashboardViewProps {
  entries: TwinEntry[];
  latest: TwinEntry;
  scores: TwinScores;
  onNewEntry: (entry: TwinEntry) => void;
  onDeleteEntry: (id: string) => void;
  simulationData: SimulationChangeData | null;
  onSimulationChange: (simData: SimulationChangeData) => void;
}

export default function DashboardView({
  entries,
  latest,
  scores,
  onNewEntry,
  onDeleteEntry,
  simulationData,
  onSimulationChange,
}: DashboardViewProps) {
  return (
    <div className="space-y-8 animate-card font-sans">
      {/* TOP HERO SECTION: Composite Score Ring + Interactive 3D Twin Canvas */}
      <section className="glass-card rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-slate-200 relative overflow-hidden bg-white shadow-xl">
        <div className="ambient-glow-lime" />

        {/* Left: Score Ring & Quick Summary */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6">
          <ScoreRing score={scores.composite} />
          <div className="space-y-2.5 text-center max-w-sm">
            <div className="inline-flex items-center gap-2 bg-lime-500/15 px-3.5 py-1 rounded-full border border-lime-500/30">
              <span className="material-symbols-filled text-lime-600 text-sm">
                verified
              </span>
              <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-lime-800">
                Twin Health Index
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-700 font-bold leading-relaxed">
              {explainScores(latest, scores)}
            </p>
          </div>
        </div>

        {/* Right: Interactive 3D Twin Canvas & Sub-Score Cards */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 relative shadow-inner">
            <ThreeDigitalTwinCanvas score={scores.composite} className="w-full h-72" />
          </div>
          <ScoreCards scores={scores} />
        </div>
      </section>

      {/* Main Grid: Entry Logger & AI Coach */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-5">
          <EntryForm onSubmit={onNewEntry} defaults={latest} />
        </div>
        <div className="md:col-span-7">
          <AiCoach entry={latest} scores={scores} simulation={simulationData} />
        </div>
      </div>

      {/* Secondary Grid: Historical Trajectory & What-If Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-7">
          <TimelineChart entries={entries} />
        </div>
        <div className="md:col-span-5">
          <SimulationPanel baseEntry={latest} onSimulationChange={onSimulationChange} />
        </div>
      </div>

      {/* Entry Log History */}
      <EntryHistory entries={entries} onDelete={onDeleteEntry} />
    </div>
  );
}
