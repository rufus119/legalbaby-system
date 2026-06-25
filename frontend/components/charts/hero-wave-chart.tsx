"use client";

import { motion } from "framer-motion";

const dataA = [14, 28, 22, 42, 36, 54, 48, 72, 62, 84, 74, 96];
const dataB = [8, 22, 18, 36, 30, 44, 38, 58, 52, 66, 60, 78];

function toPath(points: number[], height: number) {
  const step = 100 / (points.length - 1);
  const mapped = points.map((point, index) => {
    const x = index * step;
    const y = height - point;
    return `${x},${y}`;
  });
  return `M ${mapped.join(" L ")}`;
}

export function HeroWaveChart() {
  return (
    <div className="relative overflow-hidden rounded-xl3 border border-white/10 bg-gradient-to-br from-surface/85 via-card/85 to-surface/65 p-5 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,142,60,0.18),transparent_45%)]" />
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Live Momentum</p>
        <p className="mt-2 font-display text-2xl text-text-primary">+27.4%</p>
        <p className="text-sm text-text-secondary">Across top charted playlists</p>
      </div>

      <svg viewBox="0 0 100 100" className="relative mt-6 h-44 w-full sm:h-52">
        <defs>
          <linearGradient id="line-a" x1="0" y1="0" x2="100" y2="0">
            <stop offset="0%" stopColor="#FF8E3C" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FF6A00" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="line-b" x1="0" y1="0" x2="100" y2="0">
            <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FF8E3C" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <motion.path
          d={toPath(dataB, 96)}
          fill="none"
          stroke="url(#line-b)"
          strokeWidth="2.2"
          strokeLinecap="round"
          initial={{ pathLength: 0.1, opacity: 0.2 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.3, ease: "easeOut" }}
        />

        <motion.path
          d={toPath(dataA, 96)}
          fill="none"
          stroke="url(#line-a)"
          strokeWidth="3.2"
          strokeLinecap="round"
          initial={{ pathLength: 0.08, opacity: 0.2 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.1 }}
        />
      </svg>
    </div>
  );
}
