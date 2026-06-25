"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDaily, getDates, getStatus, getWeekly } from "@/lib/api";
import { DailyReport, WeeklyReport } from "@/lib/types";
import { AnimationProvider } from "@/components/animations/animation-provider";
import { FloatingNavbar } from "@/components/layout/floating-navbar";
import { BackgroundAmbience } from "@/components/layout/background-ambience";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { HeroSection } from "@/components/dashboard/hero-section";
import { LoadingShell } from "@/components/dashboard/loading-shell";
import { ReportDetailModal } from "@/components/dashboard/report-detail-modal";
import { summarizeTracks } from "@/components/dashboard/format";

const DailySection = dynamic(
  () => import("@/components/dashboard/daily-section").then((module) => module.DailySection),
  { loading: () => <div className="section-frame h-72 animate-pulse" /> }
);

const WeeklySection = dynamic(
  () => import("@/components/dashboard/weekly-section").then((module) => module.WeeklySection),
  { loading: () => <div className="section-frame h-72 animate-pulse" /> }
);

export function DashboardExperience() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [dailyDates, setDailyDates] = useState<string[]>([]);
  const [weeklyDates, setWeeklyDates] = useState<string[]>([]);
  const [selectedDailyDate, setSelectedDailyDate] = useState("");
  const [selectedWeeklyDate, setSelectedWeeklyDate] = useState("");
  const [playlistCount, setPlaylistCount] = useState(11);
  const [selectedReport, setSelectedReport] = useState<DailyReport | WeeklyReport | null>(null);
  const [selectedType, setSelectedType] = useState<"daily" | "weekly" | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [dateOptions, statusData] = await Promise.all([getDates(), getStatus()]);
        if (!mounted) return;

        const nextDailyDate = dateOptions.daily[0] || "";
        const nextWeeklyDate = dateOptions.weekly[0] || "";

        setDailyDates(dateOptions.daily || []);
        setWeeklyDates(dateOptions.weekly || []);
        setSelectedDailyDate(nextDailyDate);
        setSelectedWeeklyDate(nextWeeklyDate);
        setPlaylistCount(statusData.playlistCount || 11);

        const [daily, weekly] = await Promise.all([
          getDaily(nextDailyDate || undefined),
          getWeekly(nextWeeklyDate || undefined),
        ]);

        if (!mounted) return;
        setDailyReports(daily);
        setWeeklyReports(weekly);
      } catch (error) {
        if (!mounted) return;
        setMessage(error instanceof Error ? error.message : "Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

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

  const tracksCount = useMemo(() => summarizeTracks(dailyReports, weeklyReports), [dailyReports, weeklyReports]);

  return (
    <ThemeProvider>
      <AnimationProvider>
        <div className="relative min-h-screen pb-14">
          <div className="noise-overlay" />
          <BackgroundAmbience />

          <FloatingNavbar />

          <main className="relative z-10 mx-auto mt-4 flex w-full max-w-dashboard flex-col gap-6 px-4 sm:mt-6 sm:px-6 lg:gap-7">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <HeroSection playlistCount={playlistCount} tracksCount={tracksCount} />
            </motion.div>

            {loading ? (
              <LoadingShell />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedDailyDate}-${selectedWeeklyDate}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38 }}
                  className="space-y-6"
                >
                  <DailySection
                    reports={dailyReports}
                    dates={dailyDates}
                    selectedDate={selectedDailyDate}
                    onDateChange={setSelectedDailyDate}
                    onOpen={(report) => {
                      setSelectedReport(report);
                      setSelectedType("daily");
                    }}
                  />

                  <WeeklySection
                    reports={weeklyReports}
                    dates={weeklyDates}
                    selectedDate={selectedWeeklyDate}
                    onDateChange={setSelectedWeeklyDate}
                    onOpen={(report) => {
                      setSelectedReport(report);
                      setSelectedType("weekly");
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            )}

            {message ? (
              <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{message}</p>
            ) : null}
          </main>

          <ReportDetailModal
            report={selectedReport}
            type={selectedType}
            onClose={() => {
              setSelectedReport(null);
              setSelectedType(null);
            }}
          />
        </div>
      </AnimationProvider>
    </ThemeProvider>
  );
}
