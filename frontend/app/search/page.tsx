"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { getDaily, getDates, getStatus, getWeekly } from "@/lib/api";
import { DashboardStatus, DailyReport, WeeklyReport } from "@/lib/types";
import { countryFromPlaylist, getSystemStatus, toLocalString } from "@/lib/dashboard-helpers";

type SearchItem = {
  type: "song" | "artist" | "playlist" | "country" | "genre";
  label: string;
  subtitle: string;
};

export default function SearchPage() {
  const [status, setStatus] = useState<DashboardStatus | null>(null);
  const [mode, setMode] = useState("song");
  const [query, setQuery] = useState("");
  const [daily, setDaily] = useState<DailyReport[]>([]);
  const [weekly, setWeekly] = useState<WeeklyReport[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedMode = params.get("mode");
    if (requestedMode && ["song", "artist", "playlist", "country", "genre"].includes(requestedMode)) {
      setMode(requestedMode);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [dates, statusData] = await Promise.all([getDates(), getStatus()]);
      if (!mounted) return;
      setStatus(statusData);
      const [dailyReports, weeklyReports] = await Promise.all([
        getDaily(dates.daily[0] || undefined),
        getWeekly(dates.weekly[0] || undefined),
      ]);
      if (!mounted) return;
      setDaily(dailyReports);
      setWeekly(weeklyReports);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const pool = useMemo(() => {
    const songs: SearchItem[] = daily.flatMap((report) =>
      (report.newEntries || []).map((track) => ({
        type: "song",
        label: track.name,
        subtitle: `${track.artist} • ${report.playlistName}`,
      }))
    );

    const artists: SearchItem[] = daily.flatMap((report) =>
      (report.newEntries || []).map((track) => ({
        type: "artist",
        label: track.artist,
        subtitle: `${track.name} • ${report.playlistName}`,
      }))
    );

    const playlists: SearchItem[] = daily.map((report) => ({
      type: "playlist",
      label: report.playlistName,
      subtitle: `${report.summary.newEntries} new • ${report.summary.movements} moved`,
    }));

    const countries: SearchItem[] = daily.map((report) => ({
      type: "country",
      label: countryFromPlaylist(report.playlistName),
      subtitle: report.playlistName,
    }));

    const genres: SearchItem[] = weekly.map((report) => ({
      type: "genre",
      label: report.playlistName,
      subtitle: `${report.summary.newHotSongs} additions • ${report.summary.removedSongs} removals`,
    }));

    return [...songs, ...artists, ...playlists, ...countries, ...genres];
  }, [daily, weekly]);

  const filtered = useMemo(
    () =>
      pool.filter((item) => item.type === mode && `${item.label} ${item.subtitle}`.toLowerCase().includes(query.toLowerCase())),
    [mode, pool, query]
  );

  const updatedAt = toLocalString(status?.lastDailyRun || status?.lastWeeklyRun);

  return (
    <PageContainer updatedAt={updatedAt} systemStatus={getSystemStatus(status)}>
      <Card className="p-5">
        <h2 className="font-display text-2xl">Search Intelligence</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["song", "artist", "playlist", "country", "genre"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setMode(option)}
              className={`rounded-xl px-3 py-2 text-sm ${mode === option ? "bg-primary/20 text-primary" : "bg-surface text-text-secondary"}`}
            >
              {option}
            </button>
          ))}
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search by ${mode}`}
          className="mt-3 w-full rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm"
        />
      </Card>

      <Card className="mt-4 p-4">
        <p className="text-sm text-text-secondary">{filtered.length} results</p>
        <ul className="mt-3 space-y-2">
          {filtered.slice(0, 80).map((item, index) => (
            <li key={`${item.label}-${index}`} className="rounded-lg bg-surface px-3 py-2">
              <p className="text-sm text-text-primary">{item.label}</p>
              <p className="text-xs text-text-secondary">{item.subtitle}</p>
            </li>
          ))}
        </ul>
      </Card>
    </PageContainer>
  );
}
