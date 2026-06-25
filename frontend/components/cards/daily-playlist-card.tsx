"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { DailyReport } from "@/lib/types";
import { countryFromPlaylist } from "@/components/dashboard/format";

type DailyPlaylistCardProps = {
  report: DailyReport;
  onOpen: () => void;
};

function trendIcon(type: "up" | "down" | "flat") {
  if (type === "up") return <ArrowUpRight className="h-4 w-4 text-success" />;
  if (type === "down") return <ArrowDownRight className="h-4 w-4 text-danger" />;
  return <ArrowRight className="h-4 w-4 text-text-secondary" />;
}

export function DailyPlaylistCard({ report, onOpen }: DailyPlaylistCardProps) {
  const tiles = [
    { label: "Added", value: report.summary.newEntries, trend: "up" as const },
    { label: "Removed", value: report.summary.removals, trend: report.summary.removals > 0 ? ("down" as const) : ("flat" as const) },
    { label: "Moved", value: report.summary.movements, trend: report.summary.movements > 0 ? ("up" as const) : ("flat" as const) },
  ];

  return (
    <motion.button
      layout
      onClick={onOpen}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      className="group rounded-xl2 border border-white/5 bg-gradient-to-br from-card via-card to-surface/90 p-5 text-left shadow-card transition-all duration-300 hover:border-primary/35 hover:shadow-glow"
    >
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.17em] text-text-secondary">{report.date}</p>
          <h3 className="mt-2 font-display text-xl text-text-primary">{report.playlistName}</h3>
        </div>
        <span className="text-2xl">{countryFromPlaylist(report.playlistName)}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between text-text-secondary">
              <p className="text-[11px] uppercase tracking-[0.15em]">{tile.label}</p>
              {trendIcon(tile.trend)}
            </div>
            <p className="mt-2 font-display text-2xl text-text-primary">{tile.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs uppercase tracking-[0.15em] text-text-secondary transition-colors group-hover:text-secondary">
        Open details
      </p>
    </motion.button>
  );
}
