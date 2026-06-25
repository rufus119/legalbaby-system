"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { getDaily, getDates, getStatus, getWeekly } from "@/lib/api";
import { DashboardStatus } from "@/lib/types";
import { downloadJson, getSystemStatus, toLocalString } from "@/lib/dashboard-helpers";

export default function SettingsPage() {
  const [status, setStatus] = useState<DashboardStatus | null>(null);
  const [themeMode, setThemeMode] = useState<"default" | "contrast">("default");
  const [notifyDaily, setNotifyDaily] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(true);

  useEffect(() => {
    getStatus().then(setStatus);
    const storedTheme = (localStorage.getItem("lb_theme") as "default" | "contrast" | null) || "default";
    const storedDaily = localStorage.getItem("lb_notify_daily");
    const storedWeekly = localStorage.getItem("lb_notify_weekly");
    setThemeMode(storedTheme);
    setNotifyDaily(storedDaily !== "false");
    setNotifyWeekly(storedWeekly !== "false");
  }, []);

  useEffect(() => {
    localStorage.setItem("lb_theme", themeMode);
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem("lb_notify_daily", String(notifyDaily));
  }, [notifyDaily]);

  useEffect(() => {
    localStorage.setItem("lb_notify_weekly", String(notifyWeekly));
  }, [notifyWeekly]);

  const updatedAt = toLocalString(status?.lastDailyRun || status?.lastWeeklyRun);

  async function exportDaily() {
    const dates = await getDates();
    const date = dates.daily[0];
    const report = await getDaily(date);
    downloadJson(`daily-${date}.json`, report);
  }

  async function exportWeekly() {
    const dates = await getDates();
    const date = dates.weekly[0];
    const report = await getWeekly(date);
    downloadJson(`weekly-${date}.json`, report);
  }

  return (
    <PageContainer updatedAt={updatedAt} systemStatus={getSystemStatus(status)}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card id="profile" className="p-5">
          <h2 className="font-display text-2xl">Theme</h2>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setThemeMode("default")}
              className={`rounded-xl px-3 py-2 text-sm ${themeMode === "default" ? "bg-primary/20 text-primary" : "bg-surface"}`}
            >
              Default
            </button>
            <button
              onClick={() => setThemeMode("contrast")}
              className={`rounded-xl px-3 py-2 text-sm ${themeMode === "contrast" ? "bg-primary/20 text-primary" : "bg-surface"}`}
            >
              Contrast
            </button>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-2xl">Notifications</h2>
          <label className="mt-3 flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
            Daily alerts
            <input type="checkbox" checked={notifyDaily} onChange={(event) => setNotifyDaily(event.target.checked)} />
          </label>
          <label className="mt-2 flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
            Weekly alerts
            <input type="checkbox" checked={notifyWeekly} onChange={(event) => setNotifyWeekly(event.target.checked)} />
          </label>
        </Card>

        <Card id="exports" className="p-5">
          <h2 className="font-display text-2xl">Export Options</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={exportDaily} className="rounded-xl bg-primary/20 px-3 py-2 text-sm text-primary">
              Export Daily JSON
            </button>
            <button onClick={exportWeekly} className="rounded-xl bg-secondary/20 px-3 py-2 text-sm text-secondary">
              Export Weekly JSON
            </button>
            <button onClick={() => window.print()} className="rounded-xl bg-white/10 px-3 py-2 text-sm">
              Export PDF
            </button>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-2xl">API Status</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="rounded-lg bg-surface px-3 py-2">State: {status?.status || "unknown"}</li>
            <li className="rounded-lg bg-surface px-3 py-2">Daily Reports: {status?.dailyReports || 0}</li>
            <li className="rounded-lg bg-surface px-3 py-2">Weekly Reports: {status?.weeklyReports || 0}</li>
            <li className="rounded-lg bg-surface px-3 py-2">Next Daily: {toLocalString(status?.nextDailyRun)}</li>
            <li className="rounded-lg bg-surface px-3 py-2">Next Weekly: {toLocalString(status?.nextWeeklyRun)}</li>
          </ul>
        </Card>
      </div>
    </PageContainer>
  );
}
