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
import { computeScores } from "@/lib/twin";

interface TimelineViewProps {
  entries: TwinEntry[];
  latest: TwinEntry;
}

type DateFilter = "7D" | "30D" | "90D" | "1Y" | "ALL";
type MetricKey = "glucose" | "twinScore" | "hba1c" | "weight" | "sleep";

export default function TimelineView({ entries, latest }: TimelineViewProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [activeMetrics, setActiveMetrics] = useState<Record<MetricKey, boolean>>({
    glucose: true,
    twinScore: true,
    hba1c: true,
    weight: false,
    sleep: false,
  });

  const toggleMetric = (key: MetricKey) => {
    setActiveMetrics((prev) => {
      // Ensure at least one metric remains active
      const count = Object.values(prev).filter(Boolean).length;
      if (prev[key] && count === 1) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  // Filter entries by selected date range
  const filteredEntries = useMemo(() => {
    if (entries.length === 0) return [];
    if (dateFilter === "ALL") return entries;

    const now = Date.now();
    const daysMap: Record<DateFilter, number> = {
      "7D": 7,
      "30D": 30,
      "90D": 90,
      "1Y": 365,
      ALL: Infinity,
    };
    const cutoff = now - daysMap[dateFilter] * 24 * 60 * 60 * 1000;
    const res = entries.filter((e) => e.timestamp >= cutoff);
    return res.length > 0 ? res : entries; // Fallback to all if empty filter
  }, [entries, dateFilter]);

  // Compute compliance and statistical summary cards
  const stats = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        compliancePct: 0,
        avgGlucose: 0,
        inTargetPct: 0,
        hba1cDelta: 0,
        peakScore: 0,
      };
    }

    const first = filteredEntries[0];
    const last = filteredEntries[filteredEntries.length - 1];

    const scoresList = filteredEntries.map((e) => computeScores(e).composite);
    const peakScore = Math.max(...scoresList);

    const glucoses = filteredEntries.map((e) => e.fastingGlucoseMgDl);
    const avgGlucose = Math.round(glucoses.reduce((a, b) => a + b, 0) / glucoses.length);

    // Target range: 70 - 130 mg/dL
    const inTargetCount = glucoses.filter((g) => g >= 70 && g <= 130).length;
    const inTargetPct = Math.round((inTargetCount / glucoses.length) * 100);

    const hba1cDelta = last.hba1cPercent - first.hba1cPercent;

    // Days span between first and last entry
    const daysSpan = Math.max(
      1,
      Math.ceil((last.timestamp - first.timestamp) / (1000 * 60 * 60 * 24))
    );
    const compliancePct = Math.min(
      100,
      Math.round((filteredEntries.length / Math.max(1, daysSpan)) * 100)
    );

    return {
      compliancePct,
      avgGlucose,
      inTargetPct,
      hba1cDelta,
      peakScore,
    };
  }, [filteredEntries]);

  // Map entries to chart data
  const chartData = useMemo(() => {
    return filteredEntries.map((e) => ({
      date: new Date(e.timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      twinScore: computeScores(e).composite,
      hba1c: e.hba1cPercent,
      glucose: e.fastingGlucoseMgDl,
      weight: e.weightKg,
      sleep: e.sleepHours,
    }));
  }, [filteredEntries]);

  return (
    <div className="space-y-6 animate-card">
      {/* Header Bar & Range Filter */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-cyan-400 text-2xl">
              analytics
            </span>
            <h2 className="font-display text-xl font-bold text-slate-100">
              Full-Width Historical Trends & Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Multi-metric physiological trajectory mapping with compliance statistics.
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-[#0A0E1A]/80 p-1.5 rounded-xl border border-white/10">
          <span className="text-[10px] font-mono font-bold text-slate-400 px-2 uppercase tracking-wider hidden sm:inline">
            Range:
          </span>
          {(["7D", "30D", "90D", "1Y", "ALL"] as DateFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                dateFilter === filter
                  ? "bg-cyan-500 text-[#0A0E1A] shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Compliance Statistics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Log Compliance"
          value={`${stats.compliancePct}%`}
          subtext={`${filteredEntries.length} entries recorded`}
          icon="verified"
          color="text-emerald-400"
          bg="bg-emerald-500/10 border-emerald-500/30"
        />
        <StatCard
          label="Avg Fasting Glucose"
          value={`${stats.avgGlucose} mg/dL`}
          subtext={`${stats.inTargetPct}% in target range`}
          icon="monitoring"
          color="text-cyan-400"
          bg="bg-cyan-500/10 border-cyan-500/30"
        />
        <StatCard
          label="HbA1c Trajectory"
          value={`${latest.hba1cPercent.toFixed(1)}%`}
          subtext={
            stats.hba1cDelta === 0
              ? "Stable trend"
              : `${stats.hba1cDelta < 0 ? "Improved by " : "+ "}${Math.abs(
                  stats.hba1cDelta
                ).toFixed(1)}%`
          }
          icon="vital_signs"
          color="text-violet-400"
          bg="bg-violet-500/10 border-violet-500/30"
        />
        <StatCard
          label="Peak Twin Score"
          value={`${stats.peakScore}`}
          subtext="Highest index achieved"
          icon="trophy"
          color="text-amber-400"
          bg="bg-amber-500/10 border-amber-500/30"
        />
      </div>

      {/* Main Graph Card with Metric Toggles */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="ambient-glow-cyan" />

        {/* Metric Toggles Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-slate-100 text-base">
              Multi-Metric Trajectory Graph
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Toggle parameters to compare physiological correlations over time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <MetricToggleButton
              label="Glucose (mg/dL)"
              active={activeMetrics.glucose}
              color="border-cyan-400 text-cyan-400 bg-cyan-500/10"
              onClick={() => toggleMetric("glucose")}
            />
            <MetricToggleButton
              label="Twin Score (0-100)"
              active={activeMetrics.twinScore}
              color="border-emerald-400 text-emerald-400 bg-emerald-500/10"
              onClick={() => toggleMetric("twinScore")}
            />
            <MetricToggleButton
              label="HbA1c (%)"
              active={activeMetrics.hba1c}
              color="border-violet-400 text-violet-400 bg-violet-500/10"
              onClick={() => toggleMetric("hba1c")}
            />
            <MetricToggleButton
              label="Weight (kg)"
              active={activeMetrics.weight}
              color="border-amber-400 text-amber-400 bg-amber-500/10"
              onClick={() => toggleMetric("weight")}
            />
            <MetricToggleButton
              label="Sleep (hrs)"
              active={activeMetrics.sleep}
              color="border-indigo-400 text-indigo-400 bg-indigo-500/10"
              onClick={() => toggleMetric("sleep")}
            />
          </div>
        </div>

        {/* Chart Viewport */}
        {chartData.length < 1 ? (
          <div className="py-20 text-center text-slate-400 text-xs font-mono">
            No entries found for the selected time filter.
          </div>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />
                <XAxis
                  dataKey="date"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#22D3EE"
                  fontSize={11}
                  domain={[0, "auto"]}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(34, 211, 238, 0.2)" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#8B5CF6"
                  fontSize={11}
                  domain={[0, "auto"]}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(139, 92, 246, 0.2)" }}
                />
                <Tooltip content={<TimelineCustomTooltip />} />

                {activeMetrics.glucose && (
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
                )}

                {activeMetrics.twinScore && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="twinScore"
                    name="Twin Score"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: "#10B981", r: 4, stroke: "#0A0E1A", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#34D399" }}
                  />
                )}

                {activeMetrics.hba1c && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="hba1c"
                    name="HbA1c"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: "#8B5CF6", r: 3, stroke: "#0A0E1A", strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: "#A78BFA" }}
                  />
                )}

                {activeMetrics.weight && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="weight"
                    name="Weight"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: "#F59E0B", r: 3, stroke: "#0A0E1A", strokeWidth: 2 }}
                  />
                )}

                {activeMetrics.sleep && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sleep"
                    name="Sleep"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={{ fill: "#6366F1", r: 3, stroke: "#0A0E1A", strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between space-x-3 shadow-lg">
      <div className="space-y-1">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
          {label}
        </span>
        <span className="text-2xl font-display font-extrabold text-slate-100 block">
          {value}
        </span>
        <span className="text-[11px] font-mono text-slate-400 block">{subtext}</span>
      </div>
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <span className={`material-symbols-outlined ${color} text-xl`}>{icon}</span>
      </div>
    </div>
  );
}

function MetricToggleButton({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer ${
        active ? color : "border-white/10 text-slate-500 bg-white/5 hover:text-slate-300"
      }`}
    >
      {active ? "✓ " : "+ "}
      {label}
    </button>
  );
}

function TimelineCustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#131826]/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-3.5 shadow-2xl space-y-2 text-xs">
        <div className="font-mono text-[11px] font-bold text-slate-300 border-b border-white/10 pb-1 flex items-center justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
            Telemetry Snapshot
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
                : item.name === "Weight"
                ? "kg"
                : item.name === "Sleep"
                ? "hrs"
                : "pts"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
