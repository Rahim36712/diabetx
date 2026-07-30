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
    <div className="space-y-6 animate-card font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
            Timeline Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-200 font-medium">
            Patient Biometric Overview & Trajectory
          </p>
        </div>

        {/* Timeframe Filter Toggle */}
        <div className="flex items-center gap-1.5 bg-[#060A07] p-1.5 rounded-xl border border-white/15 self-start md:self-auto">
          {(["7D", "14D", "30D", "90D"] as DateFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                dateFilter === filter
                  ? "bg-lime-400/20 text-lime-300 border border-lime-400/40 shadow-lg shadow-lime-500/10"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
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
        <div className="glass-card rounded-2xl p-5 border border-white/15 bg-[#060A07]/90 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-lime-400/20 border border-lime-400/40 flex items-center justify-center text-lime-400 shadow-md">
              <span className="material-symbols-outlined text-2xl">water_drop</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-300 block font-semibold">
                Glucose (Average)
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-display font-extrabold text-white">
                  {stats.avgGlucose}
                </span>
                <span className="text-xs font-mono text-slate-300 font-bold">mg/dL</span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-lime-300 font-bold px-2 py-0.5 rounded-full bg-lime-400/20 border border-lime-400/40">
            {stats.glucoseTrend}
          </span>
        </div>

        {/* HbA1c */}
        <div className="glass-card rounded-2xl p-5 border border-white/15 bg-[#060A07]/90 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-lime-400/20 border border-lime-400/40 flex items-center justify-center text-lime-300 shadow-md">
              <span className="material-symbols-outlined text-2xl">monitor_heart</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-300 block font-semibold">
                HbA1c Level
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-display font-extrabold text-white">
                  {stats.hba1c}%
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-lime-300 font-bold px-2 py-0.5 rounded-full bg-lime-400/20 border border-lime-400/40">
            {stats.hba1cTrend}
          </span>
        </div>

        {/* Exercise */}
        <div className="glass-card rounded-2xl p-5 border border-white/15 bg-[#060A07]/90 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-2xl">directions_run</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-300 block font-semibold">
                Daily Exercise
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-display font-extrabold text-white">
                  {stats.avgExercise}
                </span>
                <span className="text-xs font-mono text-slate-300 font-bold">min/day</span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-lime-300 font-bold px-2 py-0.5 rounded-full bg-lime-400/20 border border-lime-400/40">
            {stats.exerciseTrend}
          </span>
        </div>

        {/* Sleep */}
        <div className="glass-card rounded-2xl p-5 border border-white/15 bg-[#060A07]/90 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-2xl">bedtime</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-300 block font-semibold">
                Sleep Duration
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-display font-extrabold text-white">
                  {stats.avgSleep}
                </span>
                <span className="text-xs font-mono text-slate-300 font-bold">hrs/night</span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-white font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
            {stats.sleepTrend}
          </span>
        </div>
      </div>

      {/* Main Dual Y-Axis Spline Chart Card */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/15 space-y-6 bg-[#060A07]/90 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
          <div>
            <h3 className="font-display font-bold text-xl text-white">
              Biometric Trajectory Chart
            </h3>
            <p className="text-xs text-slate-200 font-medium mt-0.5">
              Glucose (mg/dL) vs Exercise/Sleep duration over time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-2 text-lime-300 font-extrabold">
              <span className="w-3 h-3 rounded-full bg-lime-400 shadow-sm" />
              Glucose (mg/dL)
            </span>
            <span className="flex items-center gap-2 text-white font-extrabold">
              <span className="w-3 h-3 rounded-full bg-white border border-slate-400 shadow-sm" />
              Exercise (min/day)
            </span>
          </div>
        </div>

        {/* Recharts Render */}
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="4 4" />
            <XAxis
              dataKey="date"
              stroke="#E2E8F0"
              fontSize={12}
              fontWeight={600}
              tickLine={false}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.15)" }}
            />
            <YAxis
              yAxisId="left"
              stroke="#A3E635"
              fontSize={12}
              fontWeight={600}
              domain={[70, 160]}
              tickLine={false}
              axisLine={{ stroke: "rgba(163, 230, 53, 0.3)" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#FFFFFF"
              fontSize={12}
              fontWeight={600}
              domain={[0, 120]}
              tickLine={false}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.3)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(6, 10, 7, 0.95)",
                borderColor: "rgba(163, 230, 53, 0.4)",
                borderRadius: "12px",
                color: "#FFFFFF",
                fontSize: "12px",
                fontFamily: "Comfortaa, cursive, sans-serif",
                boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="glucose"
              name="Glucose (mg/dL)"
              stroke="#A3E635"
              strokeWidth={3.5}
              dot={{ fill: "#A3E635", r: 5, strokeWidth: 2, stroke: "#060A07" }}
              activeDot={{ r: 7, fill: "#BEF264", stroke: "#FFFFFF", strokeWidth: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="exercise"
              name="Exercise (min/day)"
              stroke="#FFFFFF"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: "#FFFFFF", r: 4, strokeWidth: 2, stroke: "#060A07" }}
              activeDot={{ r: 6, fill: "#F8FAFC", stroke: "#A3E635", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* History Table */}
      <div className="glass-card rounded-3xl p-6 border border-white/15 space-y-4 bg-[#060A07]/90 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <h3 className="font-display font-bold text-lg text-white">Log History Logbook</h3>
          <span className="text-xs font-mono font-bold text-lime-300">
            {filteredEntries.length} Total Logs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/15 text-slate-300 uppercase tracking-wider font-extrabold">
                <th className="pb-3 px-2">Date</th>
                <th className="pb-3 px-2">Fasting Glucose</th>
                <th className="pb-3 px-2">HbA1c</th>
                <th className="pb-3 px-2">Exercise</th>
                <th className="pb-3 px-2">Sleep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-white">
              {filteredEntries.map((e) => (
                <tr key={e.id} className="hover:bg-lime-400/10 transition-colors">
                  <td className="py-3 px-2 text-slate-300 font-bold">
                    {new Date(e.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-2 font-bold text-lime-300">{e.fastingGlucoseMgDl} mg/dL</td>
                  <td className="py-3 px-2 font-bold text-white">{e.hba1cPercent.toFixed(1)}%</td>
                  <td className="py-3 px-2 font-semibold text-slate-200">{e.exerciseMinutesPerWeek} min/wk</td>
                  <td className="py-3 px-2 font-semibold text-slate-200">{e.sleepHours.toFixed(1)} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
