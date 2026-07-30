"use client";

import type { TwinEntry } from "@/lib/types";
import { computeScores } from "@/lib/twin";

export default function EntryHistory({
  entries,
  onDelete,
}: {
  entries: TwinEntry[];
  onDelete: (id: string) => void;
}) {
  if (entries.length === 0) return null;
  const reversed = [...entries].reverse();

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4 border border-white/15 font-sans bg-[#060A07]/90">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-lime-400/20 border border-lime-400/40 flex items-center justify-center text-lime-400">
            <span className="material-symbols-outlined text-lg">history</span>
          </div>
          <h3 className="font-display font-bold text-white">Logged Telemetry History</h3>
        </div>
        <span className="font-mono text-xs font-bold text-slate-200">{entries.length} Records</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
        {reversed.map((entry) => {
          const score = computeScores(entry).composite;
          return (
            <div
              key={entry.id}
              className="flex items-center justify-between bg-[#060A07]/95 border border-white/15 rounded-xl px-4 py-3 hover:border-lime-400/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-300">
                  {new Date(entry.timestamp).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <div className="text-xs text-white font-semibold hidden sm:flex gap-3">
                  <span>{entry.fastingGlucoseMgDl} mg/dL</span>
                  <span>{entry.hba1cPercent}% A1c</span>
                  <span>{entry.exerciseMinutesPerWeek} min/wk</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-display text-xs font-bold px-2.5 py-1 rounded-full bg-lime-400/20 border border-lime-400/40 text-lime-300">
                  Score: {score}
                </span>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="p-1 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Delete log"
                  aria-label="Delete entry"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
