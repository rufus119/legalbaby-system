"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { getDaily, getDates, getStatus } from "@/lib/api";
import { DashboardStatus, DailyReport } from "@/lib/types";
import { downloadJson, getSystemStatus, toLocalString } from "@/lib/dashboard-helpers";

type TrackRef = {
  key: string;
  name: string;
  artist: string;
  position?: number;
};

function normalize(reports: DailyReport[]) {
  const map = new Map<string, TrackRef>();
  reports.forEach((report) => {
    (report.topTracks || []).forEach((track) => {
      map.set(`${track.name.toLowerCase()}|${track.artist.toLowerCase()}`, {
        key: `${track.name}|${track.artist}`,
        name: track.name,
        artist: track.artist,
        position: track.position,
      });
    });
    (report.newEntries || []).forEach((track) => {
      map.set(`${track.name.toLowerCase()}|${track.artist.toLowerCase()}`, {
        key: `${track.name}|${track.artist}`,
        name: track.name,
        artist: track.artist,
        position: track.position,
      });
    });
  });
  return map;
}

export default function ComparePage() {
  const [status, setStatus] = useState<DashboardStatus | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [dateA, setDateA] = useState("");
  const [dateB, setDateB] = useState("");
  const [reportsA, setReportsA] = useState<DailyReport[]>([]);
  const [reportsB, setReportsB] = useState<DailyReport[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [dateOptions, statusData] = await Promise.all([getDates(), getStatus()]);
      if (!mounted) return;
      const params = new URLSearchParams(window.location.search);
      const first = params.get("dateA") || dateOptions.daily[0] || "";
      const second = params.get("dateB") || dateOptions.daily[1] || dateOptions.daily[0] || "";
      setDates(dateOptions.daily);
      setDateA(first);
      setDateB(second);
      setStatus(statusData);
      const [a, b] = await Promise.all([getDaily(first || undefined), getDaily(second || undefined)]);
      if (!mounted) return;
      setReportsA(a);
      setReportsB(b);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!dateA) return;
    getDaily(dateA).then(setReportsA);
  }, [dateA]);

  useEffect(() => {
    if (!dateB) return;
    getDaily(dateB).then(setReportsB);
  }, [dateB]);

  const computed = useMemo(() => {
    const a = normalize(reportsA);
    const b = normalize(reportsB);

    const added = Array.from(b.keys()).filter((key) => !a.has(key)).map((key) => b.get(key)!);
    const removed = Array.from(a.keys()).filter((key) => !b.has(key)).map((key) => a.get(key)!);
    const moved = Array.from(b.keys())
      .filter((key) => a.has(key) && a.get(key)?.position !== b.get(key)?.position)
      .map((key) => ({
        ...b.get(key)!,
        from: a.get(key)?.position,
        to: b.get(key)?.position,
      }));

    return { added, removed, moved };
  }, [reportsA, reportsB]);

  const updatedAt = toLocalString(status?.lastDailyRun || status?.lastWeeklyRun);

  return (
    <PageContainer updatedAt={updatedAt} systemStatus={getSystemStatus(status)}>
      <Card className="p-5">
        <h2 className="font-display text-2xl">Compare Dates</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select value={dateA} onChange={(event) => setDateA(event.target.value)} className="rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm">
            {dates.map((date) => (
              <option key={`a-${date}`} value={date} className="bg-card">
                {date}
              </option>
            ))}
          </select>
          <span className="text-text-secondary">vs</span>
          <select value={dateB} onChange={(event) => setDateB(event.target.value)} className="rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm">
            {dates.map((date) => (
              <option key={`b-${date}`} value={date} className="bg-card">
                {date}
              </option>
            ))}
          </select>
          <button onClick={() => window.print()} className="rounded-xl bg-primary/15 px-3 py-2 text-sm text-primary">
            Export PDF
          </button>
          <button onClick={() => downloadJson(`compare-${dateA}-vs-${dateB}.json`, computed)} className="rounded-xl bg-white/10 px-3 py-2 text-sm">
            Export JSON
          </button>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SummaryCard label="New" value={computed.added.length} />
        <SummaryCard label="Removed" value={computed.removed.length} />
        <SummaryCard label="Moved" value={computed.moved.length} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ListCard title="New" rows={computed.added.map((track) => `${track.name} - ${track.artist}`)} />
        <ListCard title="Removed" rows={computed.removed.map((track) => `${track.name} - ${track.artist}`)} />
        <ListCard title="Moved" rows={computed.moved.map((track) => `${track.name} (${track.from}→${track.to})`)} />
      </div>
    </PageContainer>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase text-text-secondary">{label}</p>
      <p className="font-display text-3xl text-primary">{value}</p>
    </Card>
  );
}

function ListCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <Card className="p-4">
      <h3 className="font-display text-xl">{title}</h3>
      <ul className="mt-3 max-h-72 space-y-2 overflow-auto text-sm">
        {rows.length ? (
          rows.slice(0, 80).map((row) => (
            <li key={row} className="rounded-lg bg-surface px-3 py-2">
              {row}
            </li>
          ))
        ) : (
          <li className="text-text-secondary">No changes found.</li>
        )}
      </ul>
    </Card>
  );
}
