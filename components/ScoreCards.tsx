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
    <div className="glass-card p-4 md:p-5 rounded-2xl flex flex-col justify-between space-y-4 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 shadow-xl group relative overflow-hidden">
      {/* Top row: Icon badge + Status badge + Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl ${bgClass} flex items-center justify-center border transition-transform group-hover:scale-105`}>
            <span className={`material-symbols-outlined ${colorClass} text-xl`}>{icon}</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-100">{label}</h3>
            <span className="text-[11px] font-mono text-slate-400 block">{metricsHint}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="font-display text-2xl md:text-3xl font-extrabold text-slate-100 block tracking-tight">
            {score}
          </span>
        </div>
      </div>

      {/* Target range & Status Pill */}
      <div className="flex items-center justify-between text-xs pt-1">
        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${badgeClass}`}>
          {statusBadge}
        </span>
        <span className="font-mono text-[11px] text-slate-400 font-medium">
          {targetRange}
        </span>
      </div>

      {/* Progress Bar (h-1.5) */}
      <div className="w-full bg-[#0A0E1A] h-1.5 rounded-full overflow-hidden border border-white/5">
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
      <SubCard
        label="Metabolic"
        score={scores.metabolic}
        metricsHint="HbA1c & Glucose"
        targetRange="80–100 Target"
        icon="monitor_heart"
        colorClass="text-emerald-400"
        bgClass="bg-emerald-500/15 border-emerald-500/30"
        badgeClass="bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        barGradient="bg-gradient-to-r from-emerald-500 to-cyan-400"
      />
      <SubCard
        label="Activity"
        score={scores.activity}
        metricsHint="Exercise & Sleep"
        targetRange="70–100 Target"
        icon="bolt"
        colorClass="text-cyan-400"
        bgClass="bg-cyan-500/15 border-cyan-500/30"
        badgeClass="bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
        barGradient="bg-gradient-to-r from-cyan-400 to-indigo-500"
      />
      <SubCard
        label="Nutrition"
        score={scores.nutrition}
        metricsHint="Diet Quality"
        targetRange="75–100 Target"
        icon="restaurant"
        colorClass="text-violet-400"
        bgClass="bg-violet-500/15 border-violet-500/30"
        badgeClass="bg-violet-500/15 text-violet-400 border-violet-500/30"
        barGradient="bg-gradient-to-r from-violet-500 to-fuchsia-500"
      />
    </div>
  );
}
