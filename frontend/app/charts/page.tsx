"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { AlertFeed } from "@/components/dashboard/alert-feed";
import { getDaily, getDates, getStatus } from "@/lib/api";
import { DashboardStatus, DailyReport } from "@/lib/types";
import { countryFromPlaylist, getSystemStatus, toLocalString } from "@/lib/dashboard-helpers";
import { buildInsights } from "@/lib/insights-engine";

function scoreMomentum(report: DailyReport) {
  return report.summary.newEntries * 2 + report.summary.movements - report.summary.removals;
}

export default function ChartsPage() {
  const [status, setStatus] = useState<DashboardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState<DailyReport[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [dateOptions, statusData] = await Promise.all([getDates(), getStatus()]);
        if (!mounted) return;
        const initial = dateOptions.daily[0] || "";
        setDates(dateOptions.daily);
        setSelectedDate(initial);
        setStatus(statusData);

        const daily = await getDaily(initial || undefined);
        if (!mounted) return;
        setReports(daily);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    getDaily(selectedDate).then(setReports);
  }, [selectedDate]);

  const countries = useMemo(
    () => ["All", ...Array.from(new Set(reports.map((report) => countryFromPlaylist(report.playlistName))))],
    [reports]
  );

  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => selectedCountry === "All" || countryFromPlaylist(report.playlistName) === selectedCountry)
      .filter((report) => report.playlistName.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => scoreMomentum(b) - scoreMomentum(a));
  }, [reports, search, selectedCountry]);

  const topMovers = useMemo(
    () => filteredReports.flatMap((report) => report.movements || []).slice(0, 12),
    [filteredReports]
  );

  const newEntries = useMemo(
    () => filteredReports.flatMap((report) => report.newEntries || []).slice(0, 12),
    [filteredReports]
  );

  const removedTracks = useMemo(
    () => filteredReports.flatMap((report) => report.removals || []).slice(0, 12),
    [filteredReports]
  );

  const updatedAt = toLocalString(status?.lastDailyRun || status?.lastWeeklyRun);
  const insightData = buildInsights(filteredReports, []);

  return (
    <PageContainer updatedAt={updatedAt} systemStatus={getSystemStatus(status)} alerts={insightData.alerts}>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="rounded-xl border border-white/10 bg-card px-3 py-2 text-sm"
        >
          {dates.map((date) => (
            <option key={date} value={date} className="bg-card">
              {date}
            </option>
          ))}
        </select>

        <select
          value={selectedCountry}
          onChange={(event) => setSelectedCountry(event.target.value)}
          className="rounded-xl border border-white/10 bg-card px-3 py-2 text-sm"
        >
          {countries.map((country) => (
            <option key={country} value={country} className="bg-card">
              {country}
            </option>
          ))}
        </select>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search playlist"
          className="w-full max-w-xs rounded-xl border border-white/10 bg-card px-3 py-2 text-sm outline-none"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-4">
          <Card className="p-5">
            <h2 className="font-display text-2xl">Trend Graphs</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {filteredReports.slice(0, 6).map((report) => {
                const values = [report.summary.newEntries, report.summary.movements, report.summary.removals];
                const max = Math.max(...values, 1);
                return (
                  <div key={report.playlistName} className="rounded-xl border border-white/10 bg-surface p-3">
                    <p className="mb-2 text-sm text-text-secondary">{report.playlistName}</p>
                    <svg viewBox="0 0 90 30" className="h-10 w-full">
                      <polyline
                        fill="none"
                        stroke="#FF9D45"
                        strokeWidth="2"
                        points={values
                          .map((value, index) => `${index * 40 + 5},${28 - (value / max) * 24}`)
                          .join(" ")}
                      />
                    </svg>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="p-5">
              <h3 className="font-display text-xl">Top Movers</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {topMovers.length ? (
                  topMovers.map((track, index) => (
                    <li key={`${track.name}-${index}`} className="rounded-lg bg-surface px-3 py-2">
                      {track.name} ({track.from} → {track.to})
                    </li>
                  ))
                ) : (
                  <li className="text-text-secondary">No movement data for this filter.</li>
                )}
              </ul>
            </Card>

            <Card className="p-5">
              <h3 className="font-display text-xl">New Entries</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {newEntries.length ? (
                  newEntries.map((track, index) => (
                    <li key={`${track.name}-${index}`} className="rounded-lg bg-surface px-3 py-2">
                      #{track.position} {track.name} - {track.artist}
                    </li>
                  ))
                ) : (
                  <li className="text-text-secondary">No additions for this filter.</li>
                )}
              </ul>
            </Card>

            <Card className="p-5">
              <h3 className="font-display text-xl">Removed Tracks</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {removedTracks.length ? (
                  removedTracks.map((track, index) => (
                    <li key={`${track.name}-${index}`} className="rounded-lg bg-surface px-3 py-2">
                      {track.name} - {track.artist}
                    </li>
                  ))
                ) : (
                  <li className="text-text-secondary">No removals for this filter.</li>
                )}
              </ul>
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="font-display text-xl">Momentum Ranking</h3>
            <ol className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {filteredReports.map((report) => (
                <li key={report.playlistName} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
                  <span>{report.playlistName}</span>
                  <span className="text-primary">{scoreMomentum(report)}</span>
                </li>
              ))}
            </ol>
          </Card>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-display text-xl">AI Recommendations</h3>
              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <RecommendationColumn
                  title="Recommended Additions"
                  items={insightData.allInsights.flatMap((item) => item.recommendedAdditions).slice(0, 8).map((item) => `${item.name} - ${item.artist}`)}
                />
                <RecommendationColumn
                  title="Recommended Removals"
                  items={insightData.allInsights.flatMap((item) => item.recommendedRemovals).slice(0, 8).map((item) => `${item.name} - ${item.artist}`)}
                />
                <RecommendationColumn
                  title="Songs To Watch"
                  items={insightData.allInsights.flatMap((item) => item.songsToWatch).slice(0, 8).map((item) => `${item.name} - ${item.artist}`)}
                />
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-display text-xl">Playlist Health Score</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {insightData.allHealth.length ? (
                  insightData.allHealth.map((health) => (
                    <li key={health.playlistName} className="rounded-lg bg-surface px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span>{health.playlistName}</span>
                        <span className="text-primary">{health.score}</span>
                      </div>
                      <p className="text-xs text-text-secondary">{health.status}</p>
                    </li>
                  ))
                ) : (
                  <li className="text-text-secondary">No health score data.</li>
                )}
              </ul>
            </Card>
          </div>

          <AlertFeed alerts={insightData.alerts} title="Charts Alerts" />
        </motion.div>
      )}
    </PageContainer>
  );
}

function RecommendationColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg bg-surface p-3">
      <p className="text-sm text-text-secondary">{title}</p>
      <ul className="mt-2 space-y-1 text-sm">
        {items.length ? (
          items.map((item) => (
            <li key={item} className="rounded bg-background/40 px-2 py-1">
              {item}
            </li>
          ))
        ) : (
          <li className="text-text-secondary">No recommendations.</li>
        )}
      </ul>
    </div>
  );
}
