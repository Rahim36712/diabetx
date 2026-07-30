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
    <div className="glass-card p-4 rounded-2xl flex flex-col justify-between space-y-3.5 border border-white/15 hover:border-lime-400/50 transition-all duration-300 shadow-xl group relative overflow-hidden font-sans min-w-0">
      {/* Top row: Icon box + Score Number (Strictly separated to prevent overlap) */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className={`p-2.5 rounded-xl ${bgClass} flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105`}>
          <span className={`material-symbols-outlined ${colorClass} text-xl`}>{icon}</span>
        </div>

        <div className="text-right shrink-0">
          <span className="font-display text-2xl md:text-3xl font-extrabold text-white block tracking-tight leading-none">
            {score}
          </span>
        </div>
      </div>

      {/* Middle row: Label Title & Sub-metrics (Full line width, zero overlap) */}
      <div className="space-y-0.5 min-w-0">
        <h3 className="font-display font-bold text-sm text-white truncate">{label}</h3>
        <span className="text-[11px] font-mono text-slate-300 block truncate">{metricsHint}</span>
      </div>

      {/* Target range & Status Pill */}
      <div className="flex flex-wrap items-center justify-between gap-1 text-xs pt-1 border-t border-white/10">
        <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-extrabold uppercase border ${badgeClass} shrink-0`}>
          {statusBadge}
        </span>
        <span className="font-mono text-[10px] text-slate-300 font-semibold truncate">
          {targetRange}
        </span>
      </div>

      {/* Progress Bar (h-1.5) */}
      <div className="w-full bg-[#060B08] h-1.5 rounded-full overflow-hidden border border-white/10">
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
        colorClass="text-lime-400"
        bgClass="bg-lime-500/20 border-lime-500/40"
        badgeClass="bg-lime-400/20 text-lime-300 border-lime-400/40"
        barGradient="bg-gradient-to-r from-lime-500 to-emerald-400"
      />
      <SubCard
        label="Activity"
        score={scores.activity}
        metricsHint="Exercise & Sleep"
        targetRange="70–100 Target"
        icon="bolt"
        colorClass="text-lime-300"
        bgClass="bg-lime-400/20 border-lime-400/40"
        badgeClass="bg-amber-400/20 text-amber-300 border-amber-400/40"
        barGradient="bg-gradient-to-r from-lime-400 to-teal-400"
      />
      <SubCard
        label="Nutrition"
        score={scores.nutrition}
        metricsHint="Diet Quality"
        targetRange="75–100 Target"
        icon="restaurant"
        colorClass="text-emerald-400"
        bgClass="bg-emerald-500/20 border-emerald-500/40"
        badgeClass="bg-emerald-400/20 text-emerald-300 border-emerald-400/40"
        barGradient="bg-gradient-to-r from-emerald-500 to-lime-400"
      />
    </div>
  );
}
