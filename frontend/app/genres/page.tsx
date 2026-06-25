"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { AlertFeed } from "@/components/dashboard/alert-feed";
import { getDates, getStatus, getWeekly } from "@/lib/api";
import { DashboardStatus, WeeklyReport } from "@/lib/types";
import { getSystemStatus, toLocalString } from "@/lib/dashboard-helpers";
import { buildInsights } from "@/lib/insights-engine";

function confidence(report: WeeklyReport) {
  const base = report.summary.newHotSongs + report.summary.positionChanges;
  const penalty = report.summary.removedSongs;
  return Math.max(0, Math.min(100, Math.round((base / Math.max(report.summary.totalTracks, 1)) * 120 - penalty)));
}

export default function GenresPage() {
  const [status, setStatus] = useState<DashboardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [minConfidence, setMinConfidence] = useState(0);
  const [query, setQuery] = useState("");
  const [reports, setReports] = useState<WeeklyReport[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [dateOptions, statusData] = await Promise.all([getDates(), getStatus()]);
        if (!mounted) return;
        const initial = dateOptions.weekly[0] || "";
        setDates(dateOptions.weekly);
        setSelectedDate(initial);
        setStatus(statusData);
        const weekly = await getWeekly(initial || undefined);
        if (!mounted) return;
        setReports(weekly);
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
    getWeekly(selectedDate).then(setReports);
  }, [selectedDate]);

  const filtered = useMemo(
    () =>
      reports.filter(
        (report) =>
          confidence(report) >= minConfidence && report.playlistName.toLowerCase().includes(query.toLowerCase())
      ),
    [minConfidence, query, reports]
  );

  const updatedAt = toLocalString(status?.lastWeeklyRun || status?.lastDailyRun);
  const insightData = buildInsights([], filtered);

  return (
    <PageContainer updatedAt={updatedAt} systemStatus={getSystemStatus(status)}>
      <div className="mb-5 flex flex-wrap gap-3">
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

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter genres"
          className="w-full max-w-xs rounded-xl border border-white/10 bg-card px-3 py-2 text-sm"
        />

        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-card px-3 py-2 text-sm">
          Confidence {minConfidence}
          <input
            type="range"
            min={0}
            max={100}
            value={minConfidence}
            onChange={(event) => setMinConfidence(Number(event.target.value))}
          />
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((report) => (
              <Card key={report.playlistName} className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase text-text-secondary">Weekly Update</p>
                    <h2 className="font-display text-2xl">{report.playlistName}</h2>
                  </div>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">{confidence(report)}%</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Stat label="Additions" value={report.summary.newHotSongs} />
                  <Stat label="Removals" value={report.summary.removedSongs} />
                  <Stat label="Track Suggestions" value={(report.hotNewSongs || []).length} />
                  <Stat label="Confidence Score" value={confidence(report)} />
                </div>

                <ul className="mt-4 space-y-2 text-sm">
                  {(report.hotNewSongs || []).slice(0, 4).map((track, index) => (
                    <li key={`${track.name}-${index}`} className="rounded-lg bg-surface px-3 py-2">
                      #{track.position} {track.name} - {track.artist}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <div className="hidden grid-cols-1 gap-4 xl:grid-cols-2 md:grid">
            <Card className="p-5">
              <h3 className="font-display text-xl">AI Recommendations</h3>
              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <RecommendationColumn
                  title="Additions"
                  items={insightData.allInsights.flatMap((item) => item.recommendedAdditions).slice(0, 8).map((item) => `${item.name} - ${item.artist}`)}
                />
                <RecommendationColumn
                  title="Removals"
                  items={insightData.allInsights.flatMap((item) => item.recommendedRemovals).slice(0, 8).map((item) => `${item.name} - ${item.artist}`)}
                />
                <RecommendationColumn
                  title="Watch"
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
                  <li className="text-text-secondary">No health metrics yet.</li>
                )}
              </ul>
            </Card>
          </div>

          <div className="hidden md:block">
            <AlertFeed alerts={insightData.alerts} title="Genre Alerts" />
          </div>
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
          items.map((item, index) => (
            <li key={`${item}-${index}`} className="rounded bg-background/40 px-2 py-1">
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-surface px-3 py-2">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="font-display text-xl">{value}</p>
    </div>
  );
}
