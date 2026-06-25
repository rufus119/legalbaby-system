import { DashboardStatus, DailyReport, WeeklyReport } from "@/lib/types";

export function getSystemStatus(status: DashboardStatus | null): "Live" | "Updating" | "Scheduled" | "Offline" {
  if (!status) return "Offline";
  if (status.runningDaily || status.runningWeekly || status.resetting) return "Updating";
  if (status.status.toLowerCase() === "healthy") return "Live";
  if (status.nextDailyRun || status.nextWeeklyRun) return "Scheduled";
  return "Offline";
}

export function countryFromPlaylist(name: string) {
  const key = name.toLowerCase();
  if (key.includes("nigeria")) return "Nigeria";
  if (key.includes("ghana")) return "Ghana";
  if (key.includes("uk")) return "UK";
  if (key.includes("us")) return "US";
  if (key.includes("global")) return "Global";
  return "Other";
}

export function countCountries(reports: DailyReport[]) {
  return new Set(reports.map((report) => countryFromPlaylist(report.playlistName))).size;
}

export function countTracks(dailyReports: DailyReport[], weeklyReports: WeeklyReport[]) {
  const daily = dailyReports.reduce((sum, report) => sum + report.summary.totalTracks, 0);
  const weekly = weeklyReports.reduce((sum, report) => sum + report.summary.totalTracks, 0);
  return daily + weekly;
}

export function downloadJson(fileName: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function toLocalString(iso: string | null | undefined) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString();
}
