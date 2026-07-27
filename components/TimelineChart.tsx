"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { TwinEntry } from "@/lib/types";
import { computeScores } from "@/lib/twin";

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#131826]/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-3.5 shadow-2xl space-y-2 text-xs">
        <div className="font-mono text-[11px] font-bold text-slate-300 border-b border-white/10 pb-1 flex items-center justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">Health Log</span>
        </div>
        {payload.map((item: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}:
            </span>
            <span className="font-bold text-slate-100">
              {item.value} {item.name === "HbA1c" ? "%" : item.name === "Glucose" ? "mg/dL" : "pts"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function TimelineChart({ entries }: { entries: TwinEntry[] }) {
  if (entries.length < 2) {
    return (
      <div className="glass-card bg-[#0A0E1A]/80 backdrop-blur-xl rounded-2xl p-6 text-xs text-slate-400 font-medium flex flex-col items-center justify-center h-full min-h-[240px] text-center space-y-3 border border-white/10">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <span className="material-symbols-outlined text-2xl">show_chart</span>
        </div>
        <div className="space-y-1 max-w-sm">
          <h4 className="font-display text-sm font-bold text-slate-200">Historical Health Trend</h4>
          <p className="text-slate-400 leading-relaxed">
            Log at least two entries to unlock interactive glucose, HbA1c, and digital twin score trajectory charting.
          </p>
        </div>
      </div>
    );
  }

  const data = entries.map((e) => ({
    date: new Date(e.timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    twinScore: computeScores(e).composite,
    hba1c: e.hba1cPercent,
    glucose: e.fastingGlucoseMgDl,
  }));

  return (
    <div className="glass-card bg-[#0A0E1A]/80 backdrop-blur-xl rounded-2xl p-6 space-y-4 border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <span className="material-symbols-outlined text-lg">timeline</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-100">Historical Health Trajectory</h3>
            <p className="text-[11px] font-mono text-slate-400">Digital Twin Score vs. HbA1c %</p>
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
          {entries.length} Records
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />
          <XAxis
            dataKey="date"
            stroke="#94A3B8"
            fontSize={11}
            fontWeight={500}
            tickLine={false}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
          />
          <YAxis
            yAxisId="left"
            stroke="#22D3EE"
            fontSize={11}
            fontWeight={500}
            domain={[0, 100]}
            tickLine={false}
            axisLine={{ stroke: "rgba(34, 211, 238, 0.2)" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#8B5CF6"
            fontSize={11}
            fontWeight={500}
            domain={[4, 12]}
            tickLine={false}
            axisLine={{ stroke: "rgba(139, 92, 246, 0.2)" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="twinScore"
            stroke="#22D3EE"
            name="Twin Score"
            strokeWidth={3}
            dot={{ fill: "#22D3EE", r: 4, strokeWidth: 2, stroke: "#0A0E1A" }}
            activeDot={{ r: 6, fill: "#38BDF8", stroke: "#FFFFFF", strokeWidth: 2 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="hba1c"
            stroke="#8B5CF6"
            name="HbA1c"
            strokeWidth={2.5}
            strokeDasharray="4 4"
            dot={{ fill: "#8B5CF6", r: 3, strokeWidth: 2, stroke: "#0A0E1A" }}
            activeDot={{ r: 5, fill: "#A78BFA", stroke: "#FFFFFF", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend Footer */}
      <div className="flex items-center justify-center gap-6 text-xs font-mono pt-1 text-slate-400 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 bg-[#22D3EE] rounded-full" />
          <span>Twin Composite Score (0-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-[#8B5CF6] border-b border-dashed border-[#8B5CF6]" />
          <span>HbA1c (%)</span>
        </div>
      </div>
    </div>
  );
}
