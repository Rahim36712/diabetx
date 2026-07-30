"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { TwinEntry, TwinScores, SimulationChangeData } from "@/lib/types";
import { explainScores } from "@/lib/twin";

interface ChatTurn {
  question: string;
  answer: string;
  isSimulated?: boolean;
}

interface AiCoachProps {
  entry: TwinEntry;
  scores: TwinScores;
  simulation?: SimulationChangeData | null;
}

export default function AiCoach({
  entry,
  scores,
  simulation,
}: AiCoachProps) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const isSimActive = Boolean(simulation && simulation.isModified);

  // Auto scroll down whenever history or loading changes
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [history, loading, isSimActive]);

  // Compute dynamic suggestion chips based on simulation state
  const suggestions = useMemo(() => {
    if (isSimActive && simulation) {
      const { deltas, sliderDeltas, simulatedEntry } = simulation;
      const chips: string[] = [];

      if (sliderDeltas.exerciseMinutes !== 0) {
        const gainStr = deltas.composite >= 0 ? `+${deltas.composite.toFixed(0)}` : deltas.composite.toFixed(0);
        chips.push(`Analyze my ${gainStr} score gain from exercise`);
      } else {
        chips.push(`Analyze my projected composite score of ${simulation.simScores.composite}`);
      }

      chips.push("What diet tweaks balance weight change?");

      if (sliderDeltas.exerciseMinutes > 0) {
        chips.push(`How does +${sliderDeltas.exerciseMinutes} min activity impact HbA1c?`);
      } else {
        chips.push(`How does this scenario impact my projected HbA1c of ${simulatedEntry.hba1cPercent.toFixed(1)}%?`);
      }

      const metDeltaStr = deltas.metabolic >= 0 ? `+${deltas.metabolic.toFixed(0)}` : deltas.metabolic.toFixed(0);
      chips.push(`Explain why my Metabolic score shifted by ${metDeltaStr} points`);

      return chips;
    }

    return [
      scores.metabolic < 70 ? "Why is my metabolic score low?" : "How to improve metabolic score?",
      `Is my sleep of ${entry.sleepHours}h affecting my glucose?`,
      `What exercise routine optimizes my HbA1c of ${entry.hba1cPercent}%?`,
      "What lifestyle change gives the highest Twin score boost?",
    ];
  }, [isSimActive, simulation, entry, scores]);

  async function ask(q: string) {
    if (!q.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: q,
          entry,
          scores,
          simulation: isSimActive ? simulation : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setHistory((h) => [
        ...h,
        { question: q, answer: data.answer, isSimulated: isSimActive },
      ]);
      setQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card rounded-3xl flex flex-col h-full overflow-hidden border border-white/15 shadow-2xl relative bg-[#060A07]/90 backdrop-blur-xl font-sans">
      {/* Hero AI Insight Glass Banner */}
      <div className="p-5 border-b border-white/15 bg-gradient-to-r from-[#0E150F]/90 via-[#141F16]/80 to-[#0E150F]/90 relative overflow-hidden">
        <div className="ambient-glow-lime" />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-lime-500/30 shrink-0">
              <span className="material-symbols-outlined text-[#060A07] text-[22px] font-bold">
                auto_awesome
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-white">
                  Diabet<span className="text-lime-400">X</span> AI Coach
                </h2>
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-lime-400/20 border border-lime-400/40 text-lime-300 uppercase tracking-wider">
                  Twin Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium mt-0.5 leading-tight">
                {isSimActive && simulation ? (
                  <span className="text-lime-300 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                    Simulated scenario: Score {scores.composite} → {simulation.simScores.composite} ({simulation.deltas.composite >= 0 ? "+" : ""}{simulation.deltas.composite.toFixed(1)} pts) | Est. HbA1c: {simulation.simulatedEntry.hba1cPercent.toFixed(1)}%
                  </span>
                ) : (
                  explainScores(entry, scores)
                )}
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-lime-400 text-lg opacity-80 shrink-0">
            vital_signs
          </span>
        </div>

        {/* What-If Simulation Mode Prominent Indicator Badge */}
        {isSimActive && simulation && (
          <div className="mt-4 p-3 rounded-xl bg-lime-400/15 border border-lime-400/35 flex flex-wrap items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-lime-300">
              <span className="material-symbols-outlined text-lime-400 text-sm animate-spin" style={{ animationDuration: "6s" }}>
                tune
              </span>
              <span className="uppercase tracking-wider">What-If Simulation Active</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded-md bg-[#060A07]/90 border border-white/15 text-white font-bold">
                Weight: {simulation.sliderDeltas.weightKg >= 0 ? "+" : ""}{simulation.sliderDeltas.weightKg}kg
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#060A07]/90 border border-white/15 text-white font-bold">
                Exercise: {simulation.sliderDeltas.exerciseMinutes >= 0 ? "+" : ""}{simulation.sliderDeltas.exerciseMinutes}m/wk
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#060A07]/90 border border-white/15 text-white font-bold">
                Diet: {simulation.sliderDeltas.dietPoints >= 0 ? "+" : ""}{simulation.sliderDeltas.dietPoints}pt
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#060A07]/90 border border-white/15 text-white font-bold">
                Sleep: {simulation.sliderDeltas.sleepHours >= 0 ? "+" : ""}{simulation.sliderDeltas.sleepHours}h
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chat History Container */}
      <div ref={chatScrollRef} className="chat-scroll flex-1 p-5 overflow-y-auto space-y-4 max-h-[380px] min-h-[260px]">
        {history.length === 0 ? (
          <div className="flex items-start gap-3 bg-[#060A07]/90 p-4 rounded-2xl border border-white/15 text-xs text-slate-200 shadow-md">
            <span className="material-symbols-outlined text-lime-400 shrink-0 mt-0.5">info</span>
            <div className="space-y-1">
              <p className="font-bold text-white">
                Welcome to your personal Digital Twin AI Health Coach.
              </p>
              <p className="leading-relaxed text-slate-200">
                Ask questions about your logged health metrics (HbA1c, glucose, sleep, exercise) or run What-If simulations to project lifestyle impact. All responses are grounded in your mathematical Twin Scores.
              </p>
            </div>
          </div>
        ) : (
          history.map((turn, i) => (
            <div key={i} className="space-y-3">
              {/* User message - Off-White / Crisp White badge */}
              <div className="flex gap-3 flex-row-reverse max-w-[88%] ml-auto">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 border border-white/30 shadow-sm font-bold">
                  <span className="material-symbols-outlined text-sm">person</span>
                </div>
                <div className="bg-white/15 border border-white/25 text-white p-3.5 rounded-2xl rounded-tr-none text-xs leading-relaxed font-semibold shadow-md">
                  {turn.question}
                </div>
              </div>
              {/* AI message - Lime Green & White badge */}
              <div className="flex gap-3 max-w-[88%]">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-[#060A07] shrink-0 font-bold shadow-md shadow-lime-500/20">
                  <span className="material-symbols-outlined text-sm font-bold">auto_awesome</span>
                </div>
                <div className="space-y-1">
                  <div className="bg-[#0E150F]/95 border border-lime-400/30 text-white p-4 rounded-2xl rounded-tl-none text-xs leading-relaxed font-medium shadow-md shadow-lime-500/10 whitespace-pre-wrap">
                    {turn.answer}
                  </div>
                  {turn.isSimulated && (
                    <span className="text-[10px] font-mono text-lime-300 font-bold px-2 block">
                      ⚡ Evaluated under What-If Simulation context
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-[#060A07] shrink-0 shadow-md">
              <span className="material-symbols-outlined text-sm font-bold animate-pulse">auto_awesome</span>
            </div>
            <div className="bg-[#0E150F]/95 border border-lime-400/35 p-3.5 rounded-2xl rounded-tl-none text-xs text-lime-300 flex items-center gap-2 font-mono font-extrabold">
              <span className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-lime-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
              <span>AI Coach is analyzing telemetry & scenario metrics...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs text-lime-200 p-3.5 rounded-xl bg-lime-400/15 border border-lime-400/40 flex items-center gap-2">
            <span className="material-symbols-outlined text-lime-300 text-sm">warning</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Chat Controls & Input */}
      <div className="p-4 bg-[#060A07]/95 border-t border-white/15 space-y-3">
        {/* Quick Action Prompt Suggestion Chips - Crisp White / Lime */}
        <div className="flex gap-2 overflow-x-auto chat-scroll pb-1">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              disabled={loading}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 hover:border-lime-400/60 hover:bg-lime-400/15 text-xs font-mono font-bold text-slate-100 hover:text-lime-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-lime-400 text-xs">auto_awesome</span>
              <span>{s}</span>
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
          className="flex gap-2 relative"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              isSimActive
                ? "Ask about this What-If simulation scenario..."
                : "Ask about your glucose, HbA1c, or Twin score..."
            }
            className="input pr-12 text-xs font-semibold text-white placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 gradient-bg rounded-xl flex items-center justify-center text-[#060A07] disabled:opacity-40 active:scale-95 transition-all shadow-md hover:shadow-lime-500/30 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm font-bold">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
