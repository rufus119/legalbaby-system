"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeroPanel } from "@/components/dashboard/hero-panel";
import { TopNav } from "@/components/dashboard/top-nav";
import { ReportGrid } from "@/components/dashboard/report-grid";
import { DetailDrawer } from "@/components/dashboard/detail-drawer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDaily, getDates, getStatus, getWeekly } from "@/lib/api";
import { DashboardStatus, DailyReport, DetailSelection, WeeklyReport } from "@/lib/types";
import { countCountries, countTracks, downloadJson, getSystemStatus, toLocalString } from "@/lib/dashboard-helpers";

export function DashboardShell() {
  const router = useRouter();
  const [status, setStatus] = useState<DashboardStatus | null>(null);
  const [dailyDates, setDailyDates] = useState<string[]>([]);
  const [weeklyDates, setWeeklyDates] = useState<string[]>([]);
  const [selectedDailyDate, setSelectedDailyDate] = useState<string>("");
  const [selectedWeeklyDate, setSelectedWeeklyDate] = useState<string>("");
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [selection, setSelection] = useState<DetailSelection>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");

  const systemStatus = getSystemStatus(status);

  const refreshAll = useCallback(async () => {
    const [dateOptions, statusData] = await Promise.all([getDates(), getStatus()]);
    const nextDailyDate = selectedDailyDate || dateOptions.daily[0] || "";
    const nextWeeklyDate = selectedWeeklyDate || dateOptions.weekly[0] || "";

    setDailyDates(dateOptions.daily || []);
    setWeeklyDates(dateOptions.weekly || []);
    setSelectedDailyDate(nextDailyDate);
    setSelectedWeeklyDate(nextWeeklyDate);
    setStatus(statusData);

    const [daily, weekly] = await Promise.all([
      getDaily(nextDailyDate || undefined),
      getWeekly(nextWeeklyDate || undefined),
    ]);

    setDailyReports(daily);
    setWeeklyReports(weekly);
  }, [selectedDailyDate, selectedWeeklyDate]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        await refreshAll();
      } catch (error) {
        if (mounted) {
          setMessage(error instanceof Error ? error.message : "Failed to load dashboard");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refreshAll]);

  useEffect(() => {
    if (!selectedDailyDate) return;
    getDaily(selectedDailyDate)
      .then(setDailyReports)
      .catch((error) => setMessage(error.message));
  }, [selectedDailyDate]);

  useEffect(() => {
    if (!selectedWeeklyDate) return;
    getWeekly(selectedWeeklyDate)
      .then(setWeeklyReports)
      .catch((error) => setMessage(error.message));
  }, [selectedWeeklyDate]);

  const openFirstDaily = () => {
    if (!dailyReports.length) return;
    setSelection({ kind: "daily", report: dailyReports[0] });
  };

  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary" size="sm" onClick={() => refreshAll()}>
        Refresh Data
      </Button>
      <Button variant="secondary" size="sm" onClick={openFirstDaily} disabled={!dailyReports.length}>
        Open Top Report
      </Button>
      <Button variant="secondary" size="sm" onClick={() => router.push("/search?mode=playlist")}>
        Search Playlist
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => downloadJson(`daily-report-${selectedDailyDate || "latest"}.json`, dailyReports)}
        disabled={!dailyReports.length}
      >
        Export Report
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => router.push(`/compare?dateA=${encodeURIComponent(selectedDailyDate)}&dateB=${encodeURIComponent(dailyDates[1] || selectedDailyDate)}`)}
        disabled={!selectedDailyDate}
      >
        Compare Dates
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen pb-12">
      <TopNav
        updatedAt={toLocalString(status?.lastDailyRun || status?.lastWeeklyRun)}
        systemStatus={systemStatus}
      />
      <main className="mx-auto flex w-full max-w-dashboard flex-col gap-4 px-4 pt-4 md:gap-6 md:px-6 md:pt-8 lg:px-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
          <HeroPanel
            countriesMonitored={countCountries(dailyReports)}
            playlistsActive={status?.playlistCount || dailyReports.length || 0}
            tracksTracked={countTracks(dailyReports, weeklyReports)}
            latestSnapshot={toLocalString(status?.lastDailyRun || status?.lastWeeklyRun)}
          />
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-56" />
            ))}
          </div>
        ) : (
          <>
            <ReportGrid
              title="Daily Top 100"
              type="daily"
              reports={dailyReports}
              onSelect={(r) => setSelection({ kind: "daily", report: r as DailyReport })}
              controls={
                <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                  <select
                    value={selectedDailyDate}
                    onChange={(e) => setSelectedDailyDate(e.target.value)}
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                  >
                    {dailyDates.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {controls}
                </div>
              }
            />

            <ReportGrid
              title="Weekly Genre Intelligence"
              type="weekly"
              reports={weeklyReports}
              onSelect={(r) => setSelection({ kind: "weekly", report: r as WeeklyReport })}
              controls={
                <select
                  value={selectedWeeklyDate}
                  onChange={(e) => setSelectedWeeklyDate(e.target.value)}
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                >
                  {weeklyDates.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              }
            />
          </>
        )}

        {message ? <p className="text-sm text-text-secondary">{message}</p> : null}
      </main>

      <DetailDrawer selection={selection} onClose={() => setSelection(null)} />
      <BottomNav />
    </div>
  );
}
