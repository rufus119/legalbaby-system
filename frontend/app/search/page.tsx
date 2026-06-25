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
  const [scope, setScope] = useState<"all" | "daily" | "weekly">("all");
  const [match, setMatch] = useState<"contains" | "startsWith">("contains");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [daily, setDaily] = useState<DailyReport[]>([]);
  const [weekly, setWeekly] = useState<WeeklyReport[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedMode = params.get("mode");
    if (requestedMode && ["song", "artist", "playlist", "country", "genre"].includes(requestedMode)) {
      setMode(requestedMode);
    }
    const storedRecent = localStorage.getItem("lb_recent_searches");
    if (storedRecent) {
      try {
        const parsed = JSON.parse(storedRecent) as string[];
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 8));
        }
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lb_recent_searches", JSON.stringify(recentSearches.slice(0, 8)));
  }, [recentSearches]);

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
    () => {
      const normalized = query.trim().toLowerCase();
      return pool.filter((item) => {
        if (item.type !== mode) return false;
        if (scope === "daily" && item.type === "genre") return false;
        if (scope === "weekly" && item.type !== "genre") return false;

        const text = `${item.label} ${item.subtitle}`.toLowerCase();
        if (!normalized) return true;

        return match === "startsWith" ? text.startsWith(normalized) : text.includes(normalized);
      });
    },
    [match, mode, pool, query, scope]
  );

  const updatedAt = toLocalString(status?.lastDailyRun || status?.lastWeeklyRun);

  function saveCurrentSearch() {
    const normalized = query.trim();
    if (!normalized) return;
    const token = `${mode}:${scope}:${match}:${normalized}`;
    setRecentSearches((prev) => [token, ...prev.filter((item) => item !== token)].slice(0, 8));
  }

  function applyRecentSearch(token: string) {
    const [nextMode, nextScope, nextMatch, ...rest] = token.split(":");
    const nextQuery = rest.join(":");
    if (["song", "artist", "playlist", "country", "genre"].includes(nextMode)) {
      setMode(nextMode);
    }
    if (["all", "daily", "weekly"].includes(nextScope)) {
      setScope(nextScope as "all" | "daily" | "weekly");
    }
    if (["contains", "startsWith"].includes(nextMatch)) {
      setMatch(nextMatch as "contains" | "startsWith");
    }
    setQuery(nextQuery);
  }

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

        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-4">
          <select
            value={scope}
            onChange={(event) => setScope(event.target.value as "all" | "daily" | "weekly")}
            className="rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm"
          >
            <option value="all">All Sources</option>
            <option value="daily">Daily Only</option>
            <option value="weekly">Weekly Only</option>
          </select>

          <select
            value={match}
            onChange={(event) => setMatch(event.target.value as "contains" | "startsWith")}
            className="rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm"
          >
            <option value="contains">Contains</option>
            <option value="startsWith">Starts With</option>
          </select>

          <button onClick={saveCurrentSearch} className="rounded-xl bg-primary/20 px-3 py-2 text-sm text-primary">
            Save Search
          </button>

          <button
            onClick={() => {
              setQuery("");
              setScope("all");
              setMatch("contains");
            }}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm"
          >
            Clear Filters
          </button>
        </div>

        {recentSearches.length ? (
          <div className="mt-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-text-secondary">Recent Searches</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item) => (
                <button
                  key={item}
                  onClick={() => applyRecentSearch(item)}
                  className="rounded-lg bg-surface px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}
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
