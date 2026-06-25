"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { getDaily, getDates, getStatus, getWeekly } from "@/lib/api";
import { DashboardStatus, DailyReport, WeeklyReport } from "@/lib/types";
import { downloadJson, getSystemStatus, toLocalString } from "@/lib/dashboard-helpers";

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

  const visibleDates = dailyDates.slice(0, 6);
  const currentDate = visibleDates[index] || "";
  const currentReports = heatmapData[currentDate] || [];

  const updatedAt = toLocalString(status?.lastDailyRun || status?.lastWeeklyRun);

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
        </div>
      )}
    </PageContainer>
  );
}
