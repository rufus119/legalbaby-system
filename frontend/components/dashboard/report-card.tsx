"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DailyReport, WeeklyReport } from "@/lib/types";

type Report = DailyReport | WeeklyReport;

type ReportCardProps = {
  report: Report;
  type: "daily" | "weekly";
  onSelect: () => void;
  index: number;
};

function sparklineNumbers(r: Report) {
  if (r.type === "daily") {
    return [r.summary.newEntries, r.summary.movements, r.summary.removals, r.summary.totalTracks / 10];
  }
  return [r.summary.newHotSongs, r.summary.positionChanges, r.summary.removedSongs, r.summary.totalTracks / 5];
}

function Sparkline({ values }: { values: number[] }) {
  const width = 120;
  const height = 36;
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - (v / max) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="opacity-80">
      <polyline fill="none" stroke="#FF8E3C" strokeWidth="2" points={points} />
    </svg>
  );
}

export function ReportCard({ report, type, onSelect, index }: ReportCardProps) {
  const dailyReport = report as DailyReport;
  const weeklyReport = report as WeeklyReport;
  const added = type === "daily" ? dailyReport.summary.newEntries : weeklyReport.summary.newHotSongs;
  const removed = type === "daily" ? dailyReport.summary.removals : weeklyReport.summary.removedSongs;
  const moved = type === "daily" ? dailyReport.summary.movements : weeklyReport.summary.positionChanges;
  const score = Math.max(0, added * 2 + moved - removed);
  const direction = score > 20 ? "up" : score > 8 ? "mid" : "down";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03, duration: 0.26 }}
      onClick={onSelect}
      className="cursor-pointer"
    >
      <Card className="group h-full rounded-xl2 border border-slate-800/70 p-4 md:p-5 md:hover:shadow-lift">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="hidden text-sm text-text-secondary md:block">{type === "daily" ? (report as DailyReport).date : (report as WeeklyReport).week}</p>
            <h3 className="mt-0 text-xl font-semibold text-text-primary md:mt-1 md:text-xl">{report.playlistName}</h3>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat label="Added" value={added} tone="good" />
          <Stat label="Removed" value={removed} tone="bad" />
          <Stat label="Moved" value={moved} tone="neutral" />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Change Score</p>
            <div className="flex items-center gap-1 text-lg font-semibold">
              {direction === "up" && <ArrowUpRight size={16} className="text-primary" />}
              {direction === "mid" && <TrendingUp size={16} className="text-secondary" />}
              {direction === "down" && <ArrowDownRight size={16} className="text-rose-400" />}
              <span>{score}</span>
            </div>
          </div>
          <div className="hidden md:block">
            <Sparkline values={sparklineNumbers(report)} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "good" | "bad" | "neutral" }) {
  const icon = tone === "good" ? <ArrowUpRight size={14} /> : tone === "bad" ? <Minus size={14} /> : <TrendingUp size={14} />;
  const color = tone === "good" ? "text-primary" : tone === "bad" ? "text-rose-400" : "text-secondary";

  return (
    <div className="rounded-2xl bg-slate-900/70 px-3 py-3">
      <p className="text-xs text-text-secondary">{label}</p>
      <div className={`mt-1 flex items-center gap-1 text-lg font-semibold ${color}`}>
        {icon}
        {value}
      </div>
    </div>
  );
}
