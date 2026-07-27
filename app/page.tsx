"use client";

import { useEffect, useState } from "react";
import type { TwinEntry, SimulationChangeData } from "@/lib/types";
import { loadEntries, saveEntry, deleteEntry } from "@/lib/storage";
import { computeScores } from "@/lib/twin";
import EntryForm from "@/components/EntryForm";
import ThreeDigitalTwinCanvas from "@/components/ThreeDigitalTwinCanvas";
import { useNav } from "@/context/NavContext";

import DashboardView from "@/components/views/DashboardView";
import DigitalTwinView from "@/components/views/DigitalTwinView";
import TimelineView from "@/components/views/TimelineView";
import SimulatorView from "@/components/views/SimulatorView";
import AiCoachView from "@/components/views/AiCoachView";

export default function Home() {
  const [entries, setEntries] = useState<TwinEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { activeTab } = useNav();
  const [simulationData, setSimulationData] = useState<SimulationChangeData | null>(null);

  useEffect(() => {
    setEntries(loadEntries());
    setHydrated(true);
  }, []);

  function handleNewEntry(entry: TwinEntry) {
    setEntries(saveEntry(entry));
  }

  function handleDelete(id: string) {
    setEntries(deleteEntry(id));
  }

  const latest = entries[entries.length - 1];
  const scores = latest ? computeScores(latest) : null;

  return (
    <main className="md:ml-64 min-h-screen px-4 md:px-10 py-8 flex-1 space-y-8 max-w-6xl mx-auto">
      {!hydrated ? (
        <div className="flex items-center justify-center py-24 text-cyan-400 text-sm font-semibold gap-3 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          Initializing Digital Twin Baseline...
        </div>
      ) : !latest || !scores ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6">
          <div className="md:col-span-6">
            <EntryForm onSubmit={handleNewEntry} />
          </div>
          <div className="md:col-span-6 glass-card rounded-3xl p-8 space-y-6 border border-white/10 relative overflow-hidden">
            <div className="ambient-glow-cyan" />
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-[#0A0E1A] shadow-lg shadow-cyan-500/25">
              <span className="material-symbols-filled text-[#0A0E1A] text-2xl font-bold">
                monitoring
              </span>
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-[#dee2f6]">
                Welcome to DiabetX AI
              </h2>
              <p className="text-sm text-[#dee2f6]/80 leading-relaxed font-medium">
                Log your blood glucose, HbA1c, weight, sleep, and exercise metrics to calculate your 0–100 Digital Twin Score and render your personal 3D cyber silhouette.
              </p>
            </div>
            <ThreeDigitalTwinCanvas score={85} className="w-full h-64" />
          </div>
        </div>
      ) : (
        <>
          {(activeTab === "dashboard" || !activeTab) && (
            <DashboardView
              entries={entries}
              latest={latest}
              scores={scores}
              onNewEntry={handleNewEntry}
              onDeleteEntry={handleDelete}
              simulationData={simulationData}
              onSimulationChange={setSimulationData}
            />
          )}

          {(activeTab === "digital_twin" || activeTab === "twin") && (
            <DigitalTwinView
              latest={latest}
              scores={scores}
              simulationData={simulationData}
            />
          )}

          {activeTab === "timeline" && (
            <TimelineView
              entries={entries}
              latest={latest}
            />
          )}

          {activeTab === "simulator" && (
            <SimulatorView
              baseEntry={latest}
              simulationData={simulationData}
              onSimulationChange={setSimulationData}
            />
          )}

          {(activeTab === "ai_coach" || activeTab === "aicoach") && (
            <AiCoachView
              entry={latest}
              scores={scores}
              simulation={simulationData}
            />
          )}
        </>
      )}
    </main>
  );
}
