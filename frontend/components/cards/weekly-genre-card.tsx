"use client";

import { motion } from "framer-motion";
import { Flame, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { WeeklyReport } from "@/lib/types";

type WeeklyGenreCardProps = {
  report: WeeklyReport;
  index: number;
  onOpen: () => void;
};

export function WeeklyGenreCard({ report, index, onOpen }: WeeklyGenreCardProps) {
  const metrics = [
    { label: "Top Entries", value: report.summary.newHotSongs, icon: Flame },
    { label: "Momentum", value: report.summary.positionChanges, icon: TrendingUp },
    { label: "Drops", value: report.summary.removedSongs, icon: TrendingDown },
    { label: "Movers", value: report.summary.positionChanges + report.summary.newHotSongs, icon: Zap },
  ];

  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      whileHover={{ x: 4 }}
      className="group relative w-full overflow-hidden rounded-xl2 border border-white/5 bg-gradient-to-r from-card to-surface px-5 py-5 text-left transition-all duration-300 hover:border-secondary/40 hover:shadow-glow"
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-secondary to-primary" />
      <div className="ml-2">
        <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">{report.week}</p>
        <h3 className="mt-2 font-display text-2xl text-text-primary">{report.playlistName}</h3>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
                <div className="flex items-center justify-between text-text-secondary">
                  <p className="text-[11px] uppercase tracking-[0.14em]">{metric.label}</p>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <p className="mt-1.5 font-display text-xl text-text-primary">{metric.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.button>
  );
}
