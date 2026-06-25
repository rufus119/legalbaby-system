"use client";

import { ReportCard } from "@/components/dashboard/report-card";
import { DailyReport, WeeklyReport } from "@/lib/types";

type ReportGridProps = {
  title: string;
  type: "daily" | "weekly";
  reports: Array<DailyReport | WeeklyReport>;
  onSelect: (report: DailyReport | WeeklyReport) => void;
  controls?: React.ReactNode;
};

export function ReportGrid({ title, type, reports, onSelect, controls }: ReportGridProps) {
  return (
    <section className="mobile-content-visibility rounded-xl3 bg-card/80 p-4 shadow-soft md:p-6 lg:p-8">
      <div className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4">
        <h2 className="text-2xl font-semibold tracking-tight md:text-[28px]">{title}</h2>
        {controls}
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-slate-700 p-10 text-center text-text-secondary">
          No reports for this date.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report, idx) => (
            <ReportCard
              key={`${report.playlistName}-${report.timestamp}-${idx}`}
              report={report as DailyReport & WeeklyReport}
              type={type}
              index={idx}
              onSelect={() => onSelect(report)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
