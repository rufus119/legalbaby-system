"use client";

import { AnimatePresence, motion } from "framer-motion";
import { DailyReport } from "@/lib/types";
import { DailyPlaylistCard } from "@/components/cards/daily-playlist-card";

type DailySectionProps = {
  reports: DailyReport[];
  dates: string[];
  selectedDate: string;
  onDateChange: (value: string) => void;
  onOpen: (report: DailyReport) => void;
};

export function DailySection({ reports, dates, selectedDate, onDateChange, onOpen }: DailySectionProps) {
  return (
    <section className="section-frame p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Daily Section</p>
          <h2 className="mt-2 font-display text-3xl text-text-primary">Charts</h2>
        </div>

        <div className="rounded-xl border border-white/5 bg-surface/70 px-3 py-2">
          <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-text-secondary">Date</p>
          <select
            value={selectedDate}
            onChange={(event) => onDateChange(event.target.value)}
            className="w-full bg-transparent text-sm text-text-primary outline-none"
          >
            {dates.map((date) => (
              <option key={date} value={date} className="bg-surface">
                {date}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <DailyPlaylistCard key={`${report.playlistName}-${report.date}`} report={report} onOpen={() => onOpen(report)} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
