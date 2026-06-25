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
    <section className="rounded-xl3 bg-card/80 p-6 shadow-soft lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[28px] font-semibold tracking-tight">{title}</h2>
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
