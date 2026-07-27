"use client";

import React, { useState, useMemo } from "react";
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

interface TimelineViewProps {
  entries: TwinEntry[];
  latest: TwinEntry;
}

type DateFilter = "7D" | "14D" | "30D" | "90D";

export default function TimelineView({ entries, latest }: TimelineViewProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>("30D");

  // Filter entries by selected date range
  const filteredEntries = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    if (dateFilter === "30D") return entries;

    const daysMap: Record<DateFilter, number> = {
      "7D": 7,
      "14D": 14,
      "30D": 30,
      "90D": 90,
    };
    const cutoff = Date.now() - daysMap[dateFilter] * 24 * 60 * 60 * 1000;
    const res = entries.filter((e) => e.timestamp >= cutoff);
    return res.length > 0 ? res : entries;
  }, [entries, dateFilter]);

  // Compute averages for top 4 summary cards
  const stats = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        avgGlucose: latest?.fastingGlucoseMgDl ?? 114,
        glucoseTrend: "-3.5%",
        hba1c: latest?.hba1cPercent ?? 6.8,
        hba1cTrend: "+0.2%",
        avgExercise: latest?.exerciseMinutesPerWeek ? Math.round(latest.exerciseMinutesPerWeek / 7) : 48,
        exerciseTrend: "+12%",
        avgSleep: latest?.sleepHours ?? 7.1,
        sleepTrend: "-1.1%",
      };
    }

    const glucoses = filteredEntries.map((e) => e.fastingGlucoseMgDl);
    const avgGlucose = Math.round(glucoses.reduce((a, b) => a + b, 0) / glucoses.length);

    const hba1cs = filteredEntries.map((e) => e.hba1cPercent);
    const avgHba1c = (hba1cs.reduce((a, b) => a + b, 0) / hba1cs.length).toFixed(1);

    const exercises = filteredEntries.map((e) => Math.round(e.exerciseMinutesPerWeek / 7));
    const avgExercise = Math.round(exercises.reduce((a, b) => a + b, 0) / exercises.length);

    const sleeps = filteredEntries.map((e) => e.sleepHours);
    const avgSleep = (sleeps.reduce((a, b) => a + b, 0) / sleeps.length).toFixed(1);

    return {
      avgGlucose,
      glucoseTrend: "-3.5%",
      hba1c: Number(avgHba1c),
      hba1cTrend: "+0.2%",
      avgExercise,
      exerciseTrend: "+12%",
      avgSleep: Number(avgSleep),
      sleepTrend: "-1.1%",
    };
  }, [filteredEntries, latest]);

  // Generate chart data with smooth curves
  const chartData = useMemo(() => {
    if (filteredEntries.length === 0) return [];
    
    return filteredEntries.map((e) => {
      const dateStr = new Date(e.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return {
        date: dateStr,
        glucose: e.fastingGlucoseMgDl,
        hba1c: Number(e.hba1cPercent.toFixed(1)),
        exercise: Math.round(e.exerciseMinutesPerWeek / 7),
        sleep: Number(e.sleepHours.toFixed(1)),
      };
    });
  }, [filteredEntries]);

  return (
    <div className="space-y-6 animate-card">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
            Timeline Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium">
            Patient Overview | 30 Days (Oct 1 - Oct 30, 2023)
          </p>
        </div>

        {/* Timeframe Filter Toggle */}
        <div className="flex items-center gap-1.5 bg-[#0D1322] p-1.5 rounded-xl border border-white/10 self-start md:self-auto">
          {(["7D", "14D", "30D", "90D"] as DateFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                dateFilter === filter
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Glucose */}
        <div className="glass-card rounded-2xl p-5 border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-[#0A0E1A] flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10">
              <span className="material-symbols-outlined text-2xl">water_drop</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block font-medium">
                Glucose (Average)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-slate-100">
                  {stats.avgGlucose} <span className="text-xs font-normal text-slate-400">mg/dL</span>
                </span>
                <span className="text-[11px] font-mono font-semibold text-cyan-400 flex items-center">
                  ↘ {stats.glucoseTrend}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* HbA1c */}
        <div className="glass-card rounded-2xl p-5 border border-purple-500/20 bg-gradient-to-br from-purple-950/20 to-[#0A0E1A] flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md shadow-purple-500/10">
              <span className="material-symbols-outlined text-2xl">vital_signs</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block font-medium">
                HbA1c (Estimated)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-slate-100">
                  {stats.hba1c}%
                </span>
                <span className="text-[11px] font-mono font-semibold text-purple-400 flex items-center">
                  ↗ {stats.hba1cTrend}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise */}
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-[#0A0E1A] flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10">
              <span className="material-symbols-outlined text-2xl">directions_run</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block font-medium">
                Exercise (Avg/Day)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-slate-100">
                  {stats.avgExercise} <span className="text-xs font-normal text-slate-400">Min</span>
                </span>
                <span className="text-[11px] font-mono font-semibold text-emerald-400 flex items-center">
                  ↗ {stats.exerciseTrend}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sleep */}
        <div className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-[#0A0E1A] flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
              <span className="material-symbols-outlined text-2xl">bedtime</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block font-medium">
                Sleep (Avg/Night)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-slate-100">
                  {stats.avgSleep} <span className="text-xs font-normal text-slate-400">Hr</span>
                </span>
                <span className="text-[11px] font-mono font-semibold text-amber-400 flex items-center">
                  ↘ {stats.sleepTrend}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual-Axis Health Trends Chart Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-6 shadow-2xl relative overflow-hidden bg-[#0A0E1A]/90">
        {/* Header and Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display font-bold text-slate-100 text-lg">
              Health Trends Over 30 Days
            </h3>
          </div>

          {/* Color-coded legend dots */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-semibold">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              Glucose
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
              HbA1c
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              Exercise
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
              Sleep
            </span>
          </div>
        </div>

        {/* Recharts Dual Y-Axis Spline Chart */}
        <div className="w-full h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748B"
                fontSize={11}
                domain={[70, 170]}
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                label={{
                  value: "Glucose (mg/dL)",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fill: "#64748B", fontSize: 11 },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#64748B"
                fontSize={11}
                domain={[0, 100]}
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                label={{
                  value: "Minutes / Hours",
                  angle: 90,
                  position: "insideRight",
                  style: { textAnchor: "middle", fill: "#64748B", fontSize: 11 },
                }}
              />
              <Tooltip content={<TimelineCustomTooltip />} />

              {/* Glowing Monotone Splines */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="glucose"
                name="Glucose"
                stroke="#22D3EE"
                strokeWidth={2.5}
                dot={{ fill: "#22D3EE", r: 4, stroke: "#0A0E1A", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#38BDF8" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="hba1c"
                name="HbA1c"
                stroke="#C084FC"
                strokeWidth={2.5}
                dot={{ fill: "#C084FC", r: 4, stroke: "#0A0E1A", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#E9D5FF" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="exercise"
                name="Exercise"
                stroke="#34D399"
                strokeWidth={2.5}
                dot={{ fill: "#34D399", r: 4, stroke: "#0A0E1A", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#6EE7B7" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sleep"
                name="Sleep"
                stroke="#FBBF24"
                strokeWidth={2.5}
                dot={{ fill: "#FBBF24", r: 4, stroke: "#0A0E1A", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#FDE68A" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline History Table */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
        <h3 className="font-display font-bold text-slate-100 text-base">
          Timeline History Table
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Glucose ↕</th>
                <th className="pb-3 font-semibold">HbA1c ↕</th>
                <th className="pb-3 font-semibold">Exercise ↕</th>
                <th className="pb-3 font-semibold">Sleep ↕</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEntries.map((e) => {
                const dateStr = new Date(e.timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                return (
                  <tr key={e.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 text-slate-300 flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-500 text-sm">
                        calendar_today
                      </span>
                      {dateStr}
                    </td>
                    <td className="py-3 text-cyan-400 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        💧 {e.fastingGlucoseMgDl} mg/dL
                      </span>
                    </td>
                    <td className="py-3 text-purple-400 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        🩺 {e.hba1cPercent}%
                      </span>
                    </td>
                    <td className="py-3 text-emerald-400 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        🏃 {Math.round(e.exerciseMinutesPerWeek / 7)} min/day
                      </span>
                    </td>
                    <td className="py-3 text-amber-400 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        🌙 {e.sleepHours} hrs
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TimelineCustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0E1A]/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-3.5 shadow-2xl space-y-2 text-xs">
        <div className="font-mono text-[11px] font-bold text-slate-300 border-b border-white/10 pb-1 flex items-center justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
            Snapshot
          </span>
        </div>
        {payload.map((item: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}:
            </span>
            <span className="font-bold text-slate-100">
              {item.value}{" "}
              {item.name === "HbA1c"
                ? "%"
                : item.name === "Glucose"
                ? "mg/dL"
                : item.name === "Exercise"
                ? "min"
                : "hrs"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
