"use client";

import { useEffect, useState } from "react";
import type { TwinEntry, SimulationChangeData } from "@/lib/types";
import { loadEntries, saveEntry, deleteEntry, DEFAULT_ENTRIES } from "@/lib/storage";
import { computeScores } from "@/lib/twin";
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

  // Active entries and score calculations (falling back to baseline if needed)
  const activeEntries = entries.length > 0 ? entries : DEFAULT_ENTRIES;
  const latest = activeEntries[activeEntries.length - 1];
  const scores = computeScores(latest);

  return (
    <main className="md:ml-64 min-h-screen px-4 md:px-10 py-8 flex-1 space-y-8 max-w-6xl mx-auto font-sans">
      {!hydrated ? (
        <div className="flex items-center justify-center py-24 text-lime-400 text-sm font-bold gap-3 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping" />
          Initializing Digital Twin Engine...
        </div>
      ) : (
        <>
          {(activeTab === "dashboard" || !activeTab) && (
            <DashboardView
              entries={activeEntries}
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
              entries={activeEntries}
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
