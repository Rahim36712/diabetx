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
    <div className="glass-card rounded-2xl p-6 space-y-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#22D3EE]">history</span>
          <h3 className="font-display font-bold text-[#dee2f6]">Logged Entries</h3>
        </div>
        <span className="font-mono text-xs font-semibold text-[#94a3b8]">{entries.length} recorded</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
        {reversed.map((entry) => {
          const score = computeScores(entry).composite;
          return (
            <div
              key={entry.id}
              className="flex items-center justify-between bg-[#0A0E1A]/80 border border-white/10 rounded-xl px-4 py-3 hover:border-[#22D3EE]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#94a3b8]">
                  {new Date(entry.timestamp).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <div className="text-xs text-[#dee2f6] font-medium hidden sm:flex gap-3">
                  <span>{entry.fastingGlucoseMgDl} mg/dL</span>
                  <span>{entry.hba1cPercent}% A1c</span>
                  <span>{entry.exerciseMinutesPerWeek} min/wk</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-display text-xs font-bold px-2.5 py-1 rounded-full bg-[#22D3EE]/15 border border-[#22D3EE]/30 text-[#22D3EE]">
                  Score: {score}
                </span>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="p-1 rounded-lg hover:bg-red-500/15 text-[#94a3b8] hover:text-red-400 transition-colors"
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
