import type { TwinScores } from "@/lib/types";

interface CardProps {
  label: string;
  score: number;
  metricsHint: string;
  targetRange: string;
  icon: string;
  colorClass: string;
  bgClass: string;
  badgeClass: string;
  barGradient: string;
}

function SubCard({
  label,
  score,
  metricsHint,
  targetRange,
  icon,
  colorClass,
  bgClass,
  badgeClass,
  barGradient,
}: CardProps) {
  const statusBadge =
    score >= 80 ? "OPTIMAL" : score >= 60 ? "GOOD" : "NEEDS FOCUS";

  return (
    <div className="glass-card p-4 rounded-2xl flex flex-col justify-between space-y-3.5 border border-slate-200 hover:border-lime-500/50 transition-all duration-300 shadow-md hover:shadow-xl group relative overflow-hidden font-sans min-w-0 bg-white">
      {/* Top row: Icon box + Score Number */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className={`p-2.5 rounded-xl ${bgClass} flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105`}>
          <span className={`material-symbols-outlined ${colorClass} text-xl`}>{icon}</span>
        </div>

        <div className="text-right shrink-0">
          <span className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 block tracking-tight leading-none">
            {score}
          </span>
        </div>
      </div>

      {/* Middle row: Label Title & Sub-metrics */}
      <div className="space-y-0.5 min-w-0">
        <h3 className="font-display font-bold text-sm text-slate-900 truncate">{label}</h3>
        <span className="text-[11px] font-mono text-slate-500 block truncate">{metricsHint}</span>
      </div>

      {/* Target range & Status Pill */}
      <div className="flex flex-wrap items-center justify-between gap-1 text-xs pt-1 border-t border-slate-100">
        <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-extrabold uppercase border ${badgeClass} shrink-0`}>
          {statusBadge}
        </span>
        <span className="font-mono text-[10px] text-slate-500 font-semibold truncate">
          {targetRange}
        </span>
      </div>

      {/* Progress Bar (h-1.5) */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
        <div
          className={`h-full rounded-full ${barGradient} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

export default function ScoreCards({ scores }: { scores: TwinScores }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
      <SubCard
        label="Metabolic"
        score={scores.metabolic}
        metricsHint="HbA1c & Glucose"
        targetRange="80–100 Target"
        icon="monitor_heart"
        colorClass="text-lime-700"
        bgClass="bg-lime-500/15 border-lime-500/30"
        badgeClass="bg-lime-500/15 text-lime-800 border-lime-500/30"
        barGradient="bg-gradient-to-r from-lime-500 to-emerald-500"
      />
      <SubCard
        label="Activity"
        score={scores.activity}
        metricsHint="Exercise & Sleep"
        targetRange="70–100 Target"
        icon="bolt"
        colorClass="text-lime-600"
        bgClass="bg-lime-400/15 border-lime-400/30"
        badgeClass="bg-amber-500/15 text-amber-800 border-amber-500/30"
        barGradient="bg-gradient-to-r from-lime-400 to-teal-500"
      />
      <SubCard
        label="Nutrition"
        score={scores.nutrition}
        metricsHint="Diet Quality"
        targetRange="75–100 Target"
        icon="restaurant"
        colorClass="text-emerald-700"
        bgClass="bg-emerald-500/15 border-emerald-500/30"
        badgeClass="bg-emerald-500/15 text-emerald-800 border-emerald-500/30"
        barGradient="bg-gradient-to-r from-emerald-500 to-lime-500"
      />
    </div>
  );
}
