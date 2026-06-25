"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { AlertFeed } from "@/components/dashboard/alert-feed";
import { getDaily, getDates, getStatus, getWeekly } from "@/lib/api";
import { DashboardStatus, DailyReport, WeeklyReport } from "@/lib/types";
import { downloadJson, getSystemStatus, toLocalString } from "@/lib/dashboard-helpers";
import { buildInsights } from "@/lib/insights-engine";

export default function TimelinePage() {
  const router = useRouter();
  const [status, setStatus] = useState<DashboardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyDates, setDailyDates] = useState<string[]>([]);
  const [weeklyDates, setWeeklyDates] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [heatmapData, setHeatmapData] = useState<Record<string, DailyReport[]>>({});
  const [weeklySummary, setWeeklySummary] = useState<WeeklyReport[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [dates, statusData] = await Promise.all([getDates(), getStatus()]);
        if (!mounted) return;
        setDailyDates(dates.daily);
        setWeeklyDates(dates.weekly);
        setStatus(statusData);

        const recent = dates.daily.slice(0, 6);
        const snapshots = await Promise.all(recent.map((date) => getDaily(date)));
        if (!mounted) return;
        const map: Record<string, DailyReport[]> = {};
        recent.forEach((date, idx) => {
          map[date] = snapshots[idx];
        });
        setHeatmapData(map);

        if (dates.weekly[0]) {
          const weekly = await getWeekly(dates.weekly[0]);
          if (!mounted) return;
          setWeeklySummary(weekly);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!playing || dailyDates.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % Math.min(dailyDates.length, 6));
    }, 900);
    return () => clearInterval(timer);
  }, [dailyDates.length, playing]);

  const visibleDates = useMemo(() => dailyDates.slice(0, 6), [dailyDates]);
  const currentDate = visibleDates[index] || "";
  const currentReports = useMemo(() => heatmapData[currentDate] || [], [currentDate, heatmapData]);

  const updatedAt = toLocalString(status?.lastDailyRun || status?.lastWeeklyRun);
  const currentInsights = buildInsights(currentReports, weeklySummary);

  const risingTracks = useMemo(() => {
    return currentReports
      .flatMap((report) => report.movements || [])
      .map((track) => ({
        name: track.name,
        climb: Number(track.from) - Number(track.to),
      }))
      .filter((track) => Number.isFinite(track.climb) && track.climb > 0)
      .sort((a, b) => b.climb - a.climb)
      .slice(0, 8);
  }, [currentReports]);

  const fallingTracks = useMemo(() => {
    return currentReports
      .flatMap((report) => report.movements || [])
      .map((track) => ({
        name: track.name,
        drop: Number(track.to) - Number(track.from),
      }))
      .filter((track) => Number.isFinite(track.drop) && track.drop > 0)
      .sort((a, b) => b.drop - a.drop)
      .slice(0, 8);
  }, [currentReports]);

  const heatRows = useMemo(() => {
    const playlists = Array.from(new Set(Object.values(heatmapData).flatMap((reports) => reports.map((report) => report.playlistName))));
    return playlists.slice(0, 8).map((playlist) => ({
      playlist,
      values: visibleDates.map((date) => {
        const report = (heatmapData[date] || []).find((item) => item.playlistName === playlist);
        return report ? report.summary.newEntries + report.summary.movements : 0;
      }),
    }));
  }, [heatmapData, visibleDates]);

  return (
    <PageContainer updatedAt={updatedAt} systemStatus={getSystemStatus(status)}>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl">Historical Snapshots</h2>
              <button onClick={() => setPlaying((value) => !value)} className="rounded-xl bg-primary/15 px-3 py-2 text-sm text-primary">
                {playing ? "Pause Timeline" : "Playback Timeline"}
              </button>
              <button
                onClick={() =>
                  router.push(`/compare?dateA=${encodeURIComponent(visibleDates[0] || "")}&dateB=${encodeURIComponent(visibleDates[Math.min(1, visibleDates.length - 1)] || "")}`)
                }
                className="rounded-xl bg-secondary/20 px-3 py-2 text-sm text-secondary"
              >
                Compare Dates
              </button>
              <button onClick={() => downloadJson(`timeline-${currentDate || "snapshot"}.json`, currentReports)} className="rounded-xl bg-white/10 px-3 py-2 text-sm">
                Export Snapshot
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {visibleDates.map((date, i) => (
                <button
                  key={date}
                  onClick={() => setIndex(i)}
                  className={`rounded-lg px-3 py-2 text-sm ${i === index ? "bg-primary/20 text-primary" : "bg-surface text-text-secondary"}`}
                >
                  {date}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-xl">Change Heatmap</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-text-secondary">
                    <th className="pb-2 pr-4">Playlist</th>
                    {visibleDates.map((date) => (
                      <th key={date} className="pb-2 pr-2">{date.slice(5)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatRows.map((row) => (
                    <tr key={row.playlist}>
                      <td className="py-2 pr-4">{row.playlist}</td>
                      {row.values.map((value, idx) => (
                        <td key={`${row.playlist}-${idx}`} className="pr-2">
                          <span
                            className="inline-flex h-7 w-7 items-center justify-center rounded text-xs"
                            style={{ backgroundColor: `rgba(255,106,0,${Math.min(0.9, 0.15 + value / 20)})` }}
                          >
                            {value}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-xl">Weekly Summaries</h3>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {weeklySummary.map((report) => (
                <li key={report.playlistName} className="rounded-lg bg-surface px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>{report.playlistName}</span>
                    <span className="text-secondary">{report.summary.newHotSongs} new</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <div className="hidden grid-cols-1 gap-4 xl:grid-cols-2 md:grid">
            <Card className="p-5">
              <h3 className="font-display text-xl">Timeline Intelligence</h3>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <InsightList
                  title="Biggest Gainers"
                  items={risingTracks.map((track) => `${track.name} (+${track.climb})`)}
                  empty="No gainers for this snapshot."
                />
                <InsightList
                  title="Biggest Fallers"
                  items={fallingTracks.map((track) => `${track.name} (-${track.drop})`)}
                  empty="No fallers for this snapshot."
                />
                <InsightList
                  title="Most Consistent"
                  items={currentInsights.allInsights
                    .sort((a, b) => b.consistencyScore - a.consistencyScore)
                    .slice(0, 8)
                    .map((item) => `${item.playlistName} (${item.consistencyScore})`)}
                  empty="No consistency metrics yet."
                />
                <InsightList
                  title="Cross-Playlist Trends"
                  items={currentInsights.allInsights
                    .sort((a, b) => b.crossPlaylistPresence - a.crossPlaylistPresence)
                    .slice(0, 8)
                    .map((item) => `${item.playlistName} (${item.crossPlaylistPresence})`)}
                  empty="No trend signals yet."
                />
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-display text-xl">Playlist Health</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {currentInsights.allHealth.length ? (
                  currentInsights.allHealth.map((health) => (
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

          <div className="hidden md:block">
            <AlertFeed alerts={currentInsights.alerts} title="Timeline Alerts" />
          </div>
        </div>
      )}
    </PageContainer>
  );
}

function InsightList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
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
          <li className="text-text-secondary">{empty}</li>
        )}
      </ul>
    </div>
  );
}
