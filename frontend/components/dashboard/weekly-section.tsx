"use client";

import { WeeklyReport } from "@/lib/types";
import { WeeklyGenreCard } from "@/components/cards/weekly-genre-card";

type WeeklySectionProps = {
  reports: WeeklyReport[];
  dates: string[];
  selectedDate: string;
  onDateChange: (value: string) => void;
  onOpen: (report: WeeklyReport) => void;
};

export function WeeklySection({ reports, dates, selectedDate, onDateChange, onOpen }: WeeklySectionProps) {
  return (
    <section className="section-frame p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Weekly Section</p>
          <h2 className="mt-2 font-display text-3xl text-text-primary">Genres Timeline</h2>
        </div>

        <div className="rounded-xl border border-white/5 bg-surface/70 px-3 py-2">
          <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-text-secondary">Week</p>
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

      <div className="relative space-y-4 pl-4 before:absolute before:bottom-1 before:left-1 before:top-1 before:w-px before:bg-gradient-to-b before:from-secondary before:via-primary before:to-transparent">
        {reports.map((report, index) => (
          <div key={`${report.playlistName}-${report.week}`} className="relative">
            <span className="absolute -left-[19px] top-7 h-3 w-3 rounded-full border border-secondary/40 bg-background" />
            <WeeklyGenreCard report={report} index={index} onOpen={() => onOpen(report)} />
          </div>
        ))}
      </div>
    </section>
  );
}
