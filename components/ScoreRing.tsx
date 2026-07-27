"use client";

interface ScoreRingProps {
  score: number;
  label?: string;
  size?: number;
}

export default function ScoreRing({
  score,
  label = "Twin Composite Score",
  size = 220,
}: ScoreRingProps) {
  const stroke = 9;
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.159
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Status Badge Logic
  let statusText = "OPTIMAL";
  let badgeColor = "bg-lime-500/15 text-lime-400 border-lime-500/30";
  let statusDesc = "Optimal Health Alignment";

  if (clampedScore < 60) {
    statusText = "AT RISK";
    badgeColor = "bg-rose-500/15 text-rose-400 border-rose-500/30";
    statusDesc = "Requires Lifestyle Adjustment";
  } else if (clampedScore < 80) {
    statusText = "GOOD";
    badgeColor = "bg-lime-500/15 text-lime-300 border-lime-500/30";
    statusDesc = "Good Baseline Stability";
  }

  return (
    <div className="relative flex flex-col items-center justify-center font-sans">
      {/* Outer ambient pulse glow */}
      <div className="absolute w-64 h-64 bg-gradient-to-tr from-lime-500/20 via-emerald-500/15 to-transparent rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="scoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A3E635" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter id="ringGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background track circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={stroke}
          />

          {/* Foreground animated progress circle */}
          <circle
            className="ring-glow score-path-transition transition-[stroke-dashoffset] duration-1000 ease-out"
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="url(#scoreRingGradient)"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#ringGlowFilter)"
          />
        </svg>

        {/* Central Composite Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            {Math.round(clampedScore)}
          </span>

          <span
            className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase border ${badgeColor} shadow-sm`}
          >
            {statusText}
          </span>

          <span className="font-mono text-[10px] text-lime-400 font-semibold tracking-wider uppercase mt-1">
            {label}
          </span>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-300 font-medium text-center">
        {statusDesc}
      </p>
    </div>
  );
}
